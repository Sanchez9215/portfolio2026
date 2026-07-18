// The join-and-count seam — the single "outlet" every view reads through.
// Nothing here is stored: every number is computed by joining the five source
// tables. Hide a table (the modularity toggle) and the metrics that depend on it
// simply can't be computed. All values are raw (numbers / ISO dates); formatting
// happens at render.

import type {
  Dataset,
  ProcurementRow,
  PublisherAssignmentRow,
  HrRow,
  EvaluationRow,
  LifecycleStage,
  LicenseModel,
} from "./types";
import { PRODUCT_CATALOG, logoFor } from "./catalog";
import { AS_OF } from "./generate";

const DAY_MS = 86_400_000;
const ACTIVE_WINDOW_DAYS = 90;

const daysBetween = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / DAY_MS);

function isActive(lastActivityAt: string | null): boolean {
  if (!lastActivityAt) return false;
  return AS_OF.getTime() - new Date(lastActivityAt).getTime() <= ACTIVE_WINDOW_DAYS * DAY_MS;
}

// ---------------------------------------------------------------------------
// Dataset index (memoized per dataset) — the joins, built once
// ---------------------------------------------------------------------------

interface Index {
  hrByEmail: Map<string, HrRow>;
  procBySku: Map<string, ProcurementRow>;
  assignmentsBySku: Map<string, PublisherAssignmentRow[]>;
  activityByKey: Map<string, string | null>; // `${email}|${sku}` → lastActivityAt
  editionBySku: Map<string, string>;
  deptName: Map<string, string>;
  ccName: Map<string, string>;
}

const _indexCache = new WeakMap<Dataset, Index>();

function getIndex(ds: Dataset): Index {
  const cached = _indexCache.get(ds);
  if (cached) return cached;

  const hrByEmail = new Map<string, HrRow>();
  for (const e of ds.hr) hrByEmail.set(e.email, e);

  const procBySku = new Map<string, ProcurementRow>();
  for (const p of ds.procurement) procBySku.set(p.productSku, p);

  const assignmentsBySku = new Map<string, PublisherAssignmentRow[]>();
  for (const a of ds.publisher) {
    let list = assignmentsBySku.get(a.skuPartNumber);
    if (!list) assignmentsBySku.set(a.skuPartNumber, (list = []));
    list.push(a);
  }

  const activityByKey = new Map<string, string | null>();
  for (const r of ds.identity) activityByKey.set(`${r.userEmail}|${r.targetApp}`, r.lastActivityAt);

  const editionBySku = new Map<string, string>();
  for (const c of PRODUCT_CATALOG) editionBySku.set(c.sku, c.edition);

  const deptName = new Map<string, string>();
  for (const d of ds.config.departments) deptName.set(d.departmentId, d.departmentName);

  const ccName = new Map<string, string>();
  for (const c of ds.config.costCenters) ccName.set(c.code, c.name);

  const index: Index = { hrByEmail, procBySku, assignmentsBySku, activityByKey, editionBySku, deptName, ccName };
  _indexCache.set(ds, index);
  return index;
}

// ---------------------------------------------------------------------------
// Per-product summary — the row the dashboards render
// ---------------------------------------------------------------------------

// Declared as a `type` (not `interface`) so it satisfies the Table primitive's
// `T extends Record<string, unknown>` constraint when used as a row type.
export type ProductSummary = {
  sku: string;
  name: string;
  publisher: string;
  logo: string | null;
  category: string;
  licenseModel: LicenseModel;
  seatBased: boolean; // false for consumption (usage-billed) → seat metrics don't apply, render "—"
  edition: string;
  reseller: string;
  // counts (all joined/derived, never stored)
  purchased: number;
  assigned: number;
  unassigned: number;
  active: number;
  inactive: number;
  utilization: number; // active ÷ assigned, 0–100
  // money (annualized)
  unitCost: number; // annual per-seat
  annualCost: number;
  acquisitionCost: number | null; // perpetual: one-time up-front; null otherwise
  annualMaintenance: number | null; // perpetual: recurring; null otherwise
  totalSpend: number; // = annualCost, kept for column clarity
  totalContractValue: number;
  estimatedRenewalValue: number;
  inactiveWaste: number;
  unassignedWaste: number;
  opportunity: number;
  // contract / lifecycle
  contractEffectiveDate: string;
  contractExpirationDate: string;
  contractTermMonths: number;
  monthsSincePurchase: number;
  renewalDate: string;
  renewalDays: number;
  noticePeriodDeadline: string;
  autoRenew: "Automatic" | "Manual";
  lifecycleStage: Exclude<LifecycleStage, "evaluation">;
}

function lifecycleStageOf(proc: ProcurementRow): Exclude<LifecycleStage, "evaluation"> {
  const renewalDays = daysBetween(AS_OF, new Date(proc.contractExpirationDate));
  if (renewalDays <= 180) return "renewal";
  const monthsSince = daysBetween(new Date(proc.contractEffectiveDate), AS_OF) / 30.44;
  if (monthsSince <= 6) return "rollout";
  return "operational";
}

function summarizeProduct(ds: Dataset, proc: ProcurementRow): ProductSummary {
  const idx = getIndex(ds);
  const assignments = idx.assignmentsBySku.get(proc.productSku) ?? [];
  const assigned = assignments.length;
  let active = 0;
  for (const a of assignments) {
    if (isActive(idx.activityByKey.get(`${a.userPrincipalName}|${proc.productSku}`) ?? null)) active++;
  }
  const inactive = assigned - active;
  const unassigned = Math.max(0, proc.quantity - assigned);
  const unitCost = proc.unitPrice;
  const inactiveWaste = inactive * unitCost;
  const unassignedWaste = unassigned * unitCost;

  return {
    sku: proc.productSku,
    name: proc.productName,
    publisher: proc.publisher,
    logo: logoFor(proc.publisher),
    category: proc.commodity,
    licenseModel: proc.licenseModel,
    seatBased: proc.licenseModel === "enterprise" || proc.licenseModel === "perpetual",
    edition: idx.editionBySku.get(proc.productSku) ?? "",
    reseller: proc.supplierName,
    purchased: proc.quantity,
    assigned,
    unassigned,
    active,
    inactive,
    utilization: assigned > 0 ? Math.round((active / assigned) * 100) : 0,
    unitCost,
    annualCost: proc.annualCost,
    acquisitionCost: proc.acquisitionCost ?? null,
    annualMaintenance: proc.annualMaintenance ?? null,
    totalSpend: proc.annualCost,
    totalContractValue: proc.totalContractValue,
    estimatedRenewalValue: proc.totalContractValue,
    inactiveWaste,
    unassignedWaste,
    opportunity: inactiveWaste + unassignedWaste,
    contractEffectiveDate: proc.contractEffectiveDate,
    contractExpirationDate: proc.contractExpirationDate,
    contractTermMonths: proc.contractTermMonths,
    monthsSincePurchase: Math.round((daysBetween(new Date(proc.contractEffectiveDate), AS_OF) / 30.44) * 10) / 10,
    renewalDate: proc.contractExpirationDate,
    renewalDays: daysBetween(AS_OF, new Date(proc.contractExpirationDate)),
    noticePeriodDeadline: proc.noticePeriodDeadline,
    autoRenew: proc.autoRenew,
    lifecycleStage: lifecycleStageOf(proc),
  };
}

export function productSummaries(ds: Dataset): ProductSummary[] {
  return ds.procurement.map((p) => summarizeProduct(ds, p));
}

export function productSummary(ds: Dataset, sku: string): ProductSummary | undefined {
  const proc = getIndex(ds).procBySku.get(sku);
  return proc ? summarizeProduct(ds, proc) : undefined;
}

// ---------------------------------------------------------------------------
// Org-wide rollups — the License Utilization card
// ---------------------------------------------------------------------------

export interface OrgTotals {
  totalOwned: number;
  assigned: number;
  unassigned: number;
  active: number;
  inactive: number;
}

export function orgTotals(ds: Dataset): OrgTotals {
  const totals: OrgTotals = { totalOwned: 0, assigned: 0, unassigned: 0, active: 0, inactive: 0 };
  for (const s of productSummaries(ds)) {
    if (!s.seatBased) continue; // consumption products carry spend, not seats
    totals.totalOwned += s.purchased;
    totals.assigned += s.assigned;
    totals.unassigned += s.unassigned;
    totals.active += s.active;
    totals.inactive += s.inactive;
  }
  return totals;
}

// ---------------------------------------------------------------------------
// Organizational-unit breakdowns (department / cost-center grouping)
// ---------------------------------------------------------------------------

export interface BreakdownRow {
  unitId: string; // departmentId or cost-center code, depending on which grouping was requested
  label: string;
  count: number;
  cost: number;
}

function groupByUnit(
  ds: Dataset,
  sku: string,
  unitOf: (emp: HrRow) => string,
  nameOf: (idx: Index, unitId: string) => string,
  predicate: (emp: HrRow, lastActivityAt: string | null) => boolean,
): BreakdownRow[] {
  const idx = getIndex(ds);
  const proc = idx.procBySku.get(sku);
  if (!proc) return [];
  const unitCost = proc.unitPrice;
  const counts = new Map<string, number>();
  for (const a of idx.assignmentsBySku.get(sku) ?? []) {
    const emp = idx.hrByEmail.get(a.userPrincipalName);
    if (!emp) continue;
    const last = idx.activityByKey.get(`${a.userPrincipalName}|${sku}`) ?? null;
    if (!predicate(emp, last)) continue;
    const unitId = unitOf(emp);
    counts.set(unitId, (counts.get(unitId) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([unitId, count]) => ({
      unitId,
      label: nameOf(idx, unitId),
      count,
      cost: count * unitCost,
    }))
    .sort((a, b) => b.count - a.count);
}

const byDepartment = (emp: HrRow) => emp.department;
const departmentName = (idx: Index, unitId: string) => idx.deptName.get(unitId) ?? unitId;
const byCostCenter = (emp: HrRow) => emp.costCenter;
const costCenterName = (idx: Index, unitId: string) => idx.ccName.get(unitId) ?? unitId;

// Inactive licenses (assigned, no activity in 90d) grouped by department.
export function inactiveByDepartment(ds: Dataset, sku: string): BreakdownRow[] {
  return groupByUnit(ds, sku, byDepartment, departmentName, (_emp, last) => !isActive(last));
}

// Licenses still assigned to terminated employees, grouped by department.
export function terminatedByDepartment(ds: Dataset, sku: string): BreakdownRow[] {
  return groupByUnit(ds, sku, byDepartment, departmentName, (emp) => emp.workerStatus === "Terminated");
}

// Inactive licenses (assigned, no activity in 90d) grouped by cost center.
export function inactiveByCostCenter(ds: Dataset, sku: string): BreakdownRow[] {
  return groupByUnit(ds, sku, byCostCenter, costCenterName, (_emp, last) => !isActive(last));
}

// Licenses still assigned to terminated employees, grouped by cost center.
export function terminatedByCostCenter(ds: Dataset, sku: string): BreakdownRow[] {
  return groupByUnit(ds, sku, byCostCenter, costCenterName, (emp) => emp.workerStatus === "Terminated");
}

// ---------------------------------------------------------------------------
// Employee drill-downs — the same rows, filtered (now genuinely real)
// ---------------------------------------------------------------------------

export interface InactiveEmployee {
  employeeId: string;
  name: string;
  department: string;
  daysInactive: number | null; // null → never signed in
  lastActivity: string | null;
  workerStatus: string;
}

export function inactiveEmployees(
  ds: Dataset,
  sku: string,
  unitId: string,
  groupBy: "department" | "costCenter" = "department",
): InactiveEmployee[] {
  const idx = getIndex(ds);
  const rows: InactiveEmployee[] = [];
  for (const a of idx.assignmentsBySku.get(sku) ?? []) {
    const emp = idx.hrByEmail.get(a.userPrincipalName);
    if (!emp || (groupBy === "costCenter" ? emp.costCenter : emp.department) !== unitId) continue;
    const last = idx.activityByKey.get(`${a.userPrincipalName}|${sku}`) ?? null;
    if (isActive(last)) continue;
    rows.push({
      employeeId: emp.employeeId,
      name: emp.workerName,
      department: idx.deptName.get(emp.department) ?? emp.department,
      daysInactive: last ? daysBetween(new Date(last), AS_OF) : null,
      lastActivity: last,
      workerStatus: emp.workerStatus,
    });
  }
  return rows.sort((a, b) => (b.daysInactive ?? Infinity) - (a.daysInactive ?? Infinity));
}

export interface TerminatedEmployee {
  employeeId: string;
  name: string;
  department: string;
  terminationDate: string;
  daysSinceTermination: number;
  licenseStatus: "Not Reclaimed"; // still holds the license → by definition unreclaimed
}

export function terminatedEmployees(
  ds: Dataset,
  sku: string,
  unitId: string,
  groupBy: "department" | "costCenter" = "department",
): TerminatedEmployee[] {
  const idx = getIndex(ds);
  const rows: TerminatedEmployee[] = [];
  for (const a of idx.assignmentsBySku.get(sku) ?? []) {
    const emp = idx.hrByEmail.get(a.userPrincipalName);
    if (
      !emp ||
      (groupBy === "costCenter" ? emp.costCenter : emp.department) !== unitId ||
      emp.workerStatus !== "Terminated" ||
      !emp.terminationDate
    )
      continue;
    rows.push({
      employeeId: emp.employeeId,
      name: emp.workerName,
      department: idx.deptName.get(emp.department) ?? emp.department,
      terminationDate: emp.terminationDate,
      daysSinceTermination: daysBetween(new Date(emp.terminationDate), AS_OF),
      licenseStatus: "Not Reclaimed",
    });
  }
  return rows.sort((a, b) => b.daysSinceTermination - a.daysSinceTermination);
}

// ---------------------------------------------------------------------------
// Lifecycle-stage tables
// ---------------------------------------------------------------------------

export type EvaluationSummary = {
  sku: string;
  name: string;
  publisher: string;
  logo: string | null;
  edition: string;
  licensesRequested: number;
  estimatedAnnualCost: number;
  requestedDate: string;
}

export function evaluationProducts(ds: Dataset): EvaluationSummary[] {
  return ds.evaluation.map((e: EvaluationRow) => ({
    sku: e.productSku,
    name: e.productName,
    publisher: e.publisher,
    logo: logoFor(e.publisher),
    edition: e.edition,
    licensesRequested: e.licensesRequested,
    estimatedAnnualCost: e.estimatedAnnualCost,
    requestedDate: e.requestedDate,
  }));
}

// Purchased products in a given lifecycle stage (rollout / operational / renewal).
export function lifecycleProducts(ds: Dataset, stage: Exclude<LifecycleStage, "evaluation">): ProductSummary[] {
  return productSummaries(ds).filter((s) => s.lifecycleStage === stage);
}

// ---------------------------------------------------------------------------
// Open-source components (Component / Version / Users) — no seats, no contract
// ---------------------------------------------------------------------------

export type OpenSourceSummary = {
  sku: string;
  name: string;
  publisher: string;
  logo: string | null;
  version: string;
  users: number;
}

export function openSourceProducts(ds: Dataset): OpenSourceSummary[] {
  return ds.openSource.map((o) => ({
    sku: o.sku,
    name: o.name,
    publisher: o.publisher,
    logo: logoFor(o.publisher),
    version: o.version,
    users: o.users,
  }));
}

// ---------------------------------------------------------------------------
// License-model tabs (Top Spend By License Model)
// ---------------------------------------------------------------------------

export function licenseModelProducts(ds: Dataset, model: LicenseModel): ProductSummary[] {
  return productSummaries(ds)
    .filter((s) => s.licenseModel === model)
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

export function totalAnnualSpend(ds: Dataset): number {
  return ds.procurement.reduce((sum, p) => sum + p.annualCost, 0);
}
