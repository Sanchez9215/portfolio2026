// Compliance join — delivery-model-aware. Which check applies to a title depends on how
// it's provisioned (catalog.deliveryModel), not one rule applied uniformly:
//
//   saas     — assignment IS the provisioning event (publisher table). No install exists
//              to discover, so the only quantity violation is Over-Assigned (assigned >
//              entitled). Contract-lapse evidence comes from identity (a still-logging-in
//              assignee after the contract ended).
//   on-prem  — installable/copyable outside any assignment workflow (discovery table).
//              The quantity violation is Over-Deployed (discovered > entitled).
//              Contract-lapse evidence comes from discovery scans after expiration.
//
// Over-Assigned and Over-Deployed are mutually exclusive per title (deliveryModel gates
// which check is even eligible), so no tie-break is needed between them. Expired-and-
// active is orthogonal to both (a contract-date check, independent of delivery model) and
// outranks them when it co-occurs — severity ordering below.
//
// Computed the same way orgTotals/productSummaries are: never stored, always joined.
//
// Explicitly out of scope here (see .claude/projects/software-observability plan for the
// case-study narrative on these):
//   - Under-Deployed / under-assigned: real state, computed below, but it's a spend/
//     optimization signal (belongs on Usage/Utilization), not a compliance violation.
//   - Duplicate Assignments: a discovery/assignment feed data-quality issue, not a
//     licensing violation — not modeled.
//   - Terminated-user still holding a license: an access-governance finding, not a
//     quantity/contract violation — not modeled here.
//   - SaaS shadow IT (a personal/team signup outside procurement): a real thing, but
//     needs a different signal than device discovery (expense reports, CASB) — not
//     modeled. Shadow IT here is on-prem-only (a downloaded/copied installer).
//   - Metric-type compliance (per-core, per-device, concurrent/pooled) is assumed as a
//     uniform "consumed vs. entitled seat" comparison. Real licensing metrics vary by
//     vendor/product; a production engine would need per-product logic.
//   - Freshness indicator at the donut/card level: not built this round.

import type { Dataset, DiscoveryRow, ProcurementRow, PublisherAssignmentRow, IdentityActivityRow, ProductCatalogEntry, DeliveryModel } from "./types";
import { logoFor } from "./catalog";
import { AS_OF, DISCOVERY_FRESHNESS_DAYS } from "./generate";

const DAY_MS = 86_400_000;

function isFresh(lastScanDate: string): boolean {
  return AS_OF.getTime() - new Date(lastScanDate).getTime() <= DISCOVERY_FRESHNESS_DAYS * DAY_MS;
}

export type ComplianceState = "expired-active" | "over-deployed" | "over-assigned" | "unrecognized" | "under-deployed" | "in-compliance";

export interface ComplianceSummary {
  sku: string;
  name: string;
  publisher: string;
  logo: string | null;
  deliveryModel: DeliveryModel;
  unitCost: number; // procurement.unitPrice — carried for the v2 exposure-weighted ranking (see topNonCompliantTitles)
  entitled: number; // 0 for unrecognized (no procurement match)
  consumed: number; // on-prem: fresh discovery rows; saas: assigned seats (publisher)
  state: ComplianceState; // single classification for display, via severity ordering
  violationInstances: number; // deduplicated across dimensions; 0 for under-deployed/in-compliance
  compliantInstances: number; // consumed - violationInstances
}

function build(
  sku: string,
  name: string,
  publisherName: string,
  deliveryModel: DeliveryModel,
  unitCost: number,
  entitled: number,
  consumed: number,
  state: ComplianceState,
  violationInstances: number,
): ComplianceSummary {
  return {
    sku,
    name,
    publisher: publisherName,
    logo: logoFor(publisherName),
    deliveryModel,
    unitCost,
    entitled,
    consumed,
    state,
    violationInstances,
    compliantInstances: consumed - violationInstances,
  };
}

function summarizeOnPrem(proc: ProcurementRow, cat: ProductCatalogEntry, rows: DiscoveryRow[]): ComplianceSummary {
  const fresh = rows.filter((r) => isFresh(r.lastScanDate));
  const consumed = fresh.length;
  const entitled = proc.quantity;

  // No per-row "which unit is the excess" identity exists in discovery data — take the
  // most recently scanned (consumed - entitled) rows as the excess, deterministic but
  // otherwise arbitrary; only the count matters for compliance math.
  const overDeployedIds = new Set<string>();
  if (consumed > entitled) {
    for (const r of [...fresh].sort((a, b) => b.lastScanDate.localeCompare(a.lastScanDate)).slice(0, consumed - entitled)) {
      overDeployedIds.add(r.deviceId);
    }
  }
  const expiredActiveIds = new Set<string>();
  if (new Date(proc.contractExpirationDate) < AS_OF) {
    for (const r of fresh) if (r.lastScanDate > proc.contractExpirationDate) expiredActiveIds.add(r.deviceId);
  }
  const violatingIds = new Set<string>(Array.from(overDeployedIds).concat(Array.from(expiredActiveIds)));

  let state: ComplianceState;
  if (expiredActiveIds.size > 0) state = "expired-active";
  else if (overDeployedIds.size > 0) state = "over-deployed";
  else if (consumed < entitled) state = "under-deployed";
  else state = "in-compliance";

  return build(proc.productSku, proc.productName, proc.publisher, cat.deliveryModel, proc.unitPrice, entitled, consumed, state, violatingIds.size);
}

function summarizeSaas(
  proc: ProcurementRow,
  cat: ProductCatalogEntry,
  assignments: PublisherAssignmentRow[],
  lastActivityByEmail: Map<string, string | null>,
): ComplianceSummary {
  const consumed = assignments.length; // assignment IS the provisioning event — no separate install/scan to filter for freshness
  const entitled = proc.quantity;

  // Same excess-selection approach as on-prem: no per-seat "which assignment is the
  // excess" identity exists, so take the most recently assigned as the excess.
  const overAssignedIds = new Set<string>();
  if (consumed > entitled) {
    for (const a of [...assignments].sort((x, y) => y.assignedDateTime.localeCompare(x.assignedDateTime)).slice(0, consumed - entitled)) {
      overAssignedIds.add(a.userPrincipalName);
    }
  }
  const expiredActiveIds = new Set<string>();
  if (new Date(proc.contractExpirationDate) < AS_OF) {
    for (const a of assignments) {
      const lastActivity = lastActivityByEmail.get(`${a.userPrincipalName}|${proc.productSku}`);
      if (lastActivity && lastActivity > proc.contractExpirationDate) expiredActiveIds.add(a.userPrincipalName);
    }
  }
  const violatingIds = new Set<string>(Array.from(overAssignedIds).concat(Array.from(expiredActiveIds)));

  let state: ComplianceState;
  if (expiredActiveIds.size > 0) state = "expired-active";
  else if (overAssignedIds.size > 0) state = "over-assigned";
  else if (consumed < entitled) state = "under-deployed"; // unused seats — same non-violation bucket as on-prem's under-deployed
  else state = "in-compliance";

  return build(proc.productSku, proc.productName, proc.publisher, cat.deliveryModel, proc.unitPrice, entitled, consumed, state, violatingIds.size);
}

// On-prem shadow IT — a downloaded/copied installer, caught by endpoint discovery.
function summarizeShadowItOnPrem(sku: string, cat: ProductCatalogEntry | undefined, rows: DiscoveryRow[]): ComplianceSummary {
  const fresh = rows.filter((r) => isFresh(r.lastScanDate));
  const consumed = fresh.length;
  return build(sku, cat?.name ?? sku, cat?.publisher ?? "", cat?.deliveryModel ?? "on-prem", 0, 0, consumed, "unrecognized", consumed);
}

// SaaS shadow IT — a self-service team/individual signup with no admin-console
// assignment. There's no install to discover; the only evidence is login activity (the
// SSO/CASB-style signal a real org would actually catch it with).
function summarizeShadowItSaas(sku: string, cat: ProductCatalogEntry | undefined, rows: IdentityActivityRow[]): ComplianceSummary {
  const fresh = rows.filter((r) => r.lastActivityAt && isFresh(r.lastActivityAt));
  const consumed = fresh.length;
  return build(sku, cat?.name ?? sku, cat?.publisher ?? "", cat?.deliveryModel ?? "saas", 0, 0, consumed, "unrecognized", consumed);
}

export function complianceSummaries(ds: Dataset): ComplianceSummary[] {
  const catalogBySku = new Map(ds.catalog.map((c) => [c.sku, c]));

  const discoveryBySku = new Map<string, DiscoveryRow[]>();
  for (const r of ds.discovery) {
    let list = discoveryBySku.get(r.productSku);
    if (!list) discoveryBySku.set(r.productSku, (list = []));
    list.push(r);
  }

  const publisherBySku = new Map<string, PublisherAssignmentRow[]>();
  for (const a of ds.publisher) {
    let list = publisherBySku.get(a.skuPartNumber);
    if (!list) publisherBySku.set(a.skuPartNumber, (list = []));
    list.push(a);
  }

  const lastActivityByEmail = new Map<string, string | null>(); // `${email}|${sku}` → lastActivityAt
  for (const r of ds.identity) lastActivityByEmail.set(`${r.userEmail}|${r.targetApp}`, r.lastActivityAt);

  const summaries: ComplianceSummary[] = [];
  const proceduredSkus = new Set<string>();

  for (const proc of ds.procurement) {
    if (proc.quantity <= 0) continue; // consumption products: no seats, not assessable this way
    const cat = catalogBySku.get(proc.productSku);
    if (!cat) continue;
    proceduredSkus.add(proc.productSku);
    summaries.push(
      cat.deliveryModel === "saas"
        ? summarizeSaas(proc, cat, publisherBySku.get(proc.productSku) ?? [], lastActivityByEmail)
        : summarizeOnPrem(proc, cat, discoveryBySku.get(proc.productSku) ?? []),
    );
  }

  // Shadow IT (on-prem) — discovery with no procurement match at all.
  for (const [sku, rows] of Array.from(discoveryBySku)) {
    if (proceduredSkus.has(sku)) continue;
    summaries.push(summarizeShadowItOnPrem(sku, catalogBySku.get(sku), rows));
  }

  // Shadow IT (SaaS) — login activity for a SKU with no procurement match and no
  // admin-console assignment at all (a self-service signup, never officially provisioned).
  const shadowIdentityBySku = new Map<string, IdentityActivityRow[]>();
  for (const r of ds.identity) {
    if (proceduredSkus.has(r.targetApp)) continue;
    let list = shadowIdentityBySku.get(r.targetApp);
    if (!list) shadowIdentityBySku.set(r.targetApp, (list = []));
    list.push(r);
  }
  for (const [sku, rows] of Array.from(shadowIdentityBySku)) {
    summaries.push(summarizeShadowItSaas(sku, catalogBySku.get(sku), rows));
  }

  return summaries;
}

// Titles with a seat-based on-prem contract but zero discovery rows at all — the agent
// was never deployed there, so there's no basis to assess compliance one way or the
// other. SaaS titles are excluded from this population entirely: assignment data alone
// always makes them fully assessable, so "not assessed" doesn't apply to them.
export function notAssessedCount(ds: Dataset): number {
  const catalogBySku = new Map(ds.catalog.map((c) => [c.sku, c]));
  const skusWithDiscovery = new Set(ds.discovery.map((r) => r.productSku));
  return ds.procurement.filter((p) => {
    if (p.quantity <= 0) return false;
    const cat = catalogBySku.get(p.productSku);
    return cat?.deliveryModel === "on-prem" && !skusWithDiscovery.has(p.productSku);
  }).length;
}

export interface ComplianceTotals {
  totalAssessed: number; // donut denominator — on-prem's fresh discovery instances plus
  // saas's assigned seats, combined. Legitimately two different bases (installed
  // instances vs. assigned seats), and legitimately larger than seat counts elsewhere on
  // the page for the on-prem half (one license can map to multiple install events).
  compliantInstances: number;
  overDeployedInstances: number;
  overAssignedInstances: number;
  expiredActiveInstances: number;
  unrecognizedInstances: number;
  nonCompliantInstances: number; // overDeployed + overAssigned + expiredActive + unrecognized — deduplicated per-title already
  nonCompliantTitles: number; // distinct SKUs with violationInstances > 0
}

export function complianceTotals(ds: Dataset): ComplianceTotals {
  const summaries = complianceSummaries(ds);
  let totalAssessed = 0;
  let compliantInstances = 0;
  let overDeployedInstances = 0;
  let overAssignedInstances = 0;
  let expiredActiveInstances = 0;
  let unrecognizedInstances = 0;
  let nonCompliantTitles = 0;

  for (const c of summaries) {
    totalAssessed += c.consumed;
    compliantInstances += c.compliantInstances;
    if (c.violationInstances > 0) {
      nonCompliantTitles++;
      if (c.state === "expired-active") expiredActiveInstances += c.violationInstances;
      else if (c.state === "over-deployed") overDeployedInstances += c.violationInstances;
      else if (c.state === "over-assigned") overAssignedInstances += c.violationInstances;
      else if (c.state === "unrecognized") unrecognizedInstances += c.violationInstances;
    }
  }

  return {
    totalAssessed,
    compliantInstances,
    overDeployedInstances,
    overAssignedInstances,
    expiredActiveInstances,
    unrecognizedInstances,
    nonCompliantInstances: overDeployedInstances + overAssignedInstances + expiredActiveInstances + unrecognizedInstances,
    nonCompliantTitles,
  };
}

const NON_COMPLIANT_TYPE_LABEL: Record<"expired-active" | "over-deployed" | "over-assigned" | "unrecognized", string> = {
  "expired-active": "Expired & Active",
  "over-deployed": "Over-Deployed Licenses",
  "over-assigned": "Over-Assigned Seats",
  unrecognized: "Shadow IT",
};

// Declared as a `type` (not `interface`) so it satisfies the Table primitive's
// `T extends Record<string, unknown>` constraint when used as a row type (same pattern
// as ProductSummary in metrics.ts).
export type NonCompliantRow = {
  sku: string;
  software: string;
  logo: string | null;
  instances: number;
  type: string;
}

// Top N non-compliant titles, ranked by violation_instances (v1). Excludes Under-Deployed
// and Compliant entirely — this table is compliance exposure, not optimization.
//
// Planned v2: rank by estimated_exposure = violationInstances × unitCost (unitCost is
// already carried on ComplianceSummary, sourced from the same procurement.unitPrice Spend
// uses) instead of raw instance count. Deliberately not implemented this round.
export function topNonCompliantTitles(ds: Dataset, limit = 10): NonCompliantRow[] {
  return complianceSummaries(ds)
    .filter(
      (c): c is ComplianceSummary & { state: "expired-active" | "over-deployed" | "over-assigned" | "unrecognized" } =>
        c.state === "expired-active" || c.state === "over-deployed" || c.state === "over-assigned" || c.state === "unrecognized",
    )
    .sort((a, b) => b.violationInstances - a.violationInstances)
    .slice(0, limit)
    .map((c) => ({
      sku: c.sku,
      software: c.name,
      logo: c.logo,
      instances: c.violationInstances,
      type: NON_COMPLIANT_TYPE_LABEL[c.state],
    }));
}

// "At Risk" — a coarser 3-bucket rollup (Compliant / At Risk / Non-Compliant) for the
// first-prototype view only (OverviewLegacy). Not a real compliance state alongside the
// 4 above; it's titles trending toward a violation (consumed/assigned within 10% of
// entitled) but not there yet. The detailed 5-state model above is what later prototypes
// use — this is a deliberately lower-resolution display for an earlier design iteration.
export function atRiskInstances(ds: Dataset): number {
  let atRisk = 0;
  for (const c of complianceSummaries(ds)) {
    if (c.violationInstances > 0) continue; // already a confirmed violation, not "at risk"
    if (c.entitled > 0 && c.consumed / c.entitled >= 0.9) atRisk += c.consumed;
  }
  return atRisk;
}
