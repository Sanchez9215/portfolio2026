// XOPS source-tagged data model — the five source tables at their real-world grain.
//
// Each table mirrors what you would actually export from a real system:
//   config      → config-as-code org taxonomy (YAML/Terraform)
//   procurement → SAP Ariba contract/PO records          (one row per product contract)
//   hr          → Workday "Workers" report                (one row per employee)
//   publisher   → Microsoft 365 / Adobe admin console     (one row per employee×product)
//   identity    → Okta System Log, summarized             (one row per employee×app)
//
// Join spine: employees on `email`, products on `sku`, org on `department`.
// Every displayed metric is a join-and-count across these tables (see metrics.ts),
// never a stored value — which is what makes the modularity demo fall out of the data.

export type LicenseModel = "enterprise" | "perpetual" | "open-source" | "consumption";

export type LifecycleStage = "evaluation" | "rollout" | "operational" | "renewal";

export type WorkerStatus = "Active" | "Terminated";

export type AdoptionTier = "universal" | "broad" | "departmental" | "niche";

// ---------------------------------------------------------------------------
// config — config-as-code org taxonomy (rendered as YAML for the "show the file" view)
// ---------------------------------------------------------------------------

export interface OrgRegion {
  code: string; // "NA", "EMEA", "APAC", "LATAM"
  name: string;
}

export interface OrgDepartment {
  departmentId: string; // join key against hr.department
  departmentName: string;
  parentOrg: string; // e.g. "Technology", "Go-To-Market", "Corporate"
}

export interface OrgCostCenter {
  code: string; // "CC-1000"
  name: string;
  departmentId: string;
}

export interface OrgConfig {
  regions: OrgRegion[];
  departments: OrgDepartment[];
  costCenters: OrgCostCenter[];
}

// ---------------------------------------------------------------------------
// catalog — static, factual product list. NOT a source table: it's the seed
// content the generator draws from to produce procurement/publisher/identity rows.
// Logo resolves via PUBLISHER_LOGOS (catalog.ts); null → empty-state.
// ---------------------------------------------------------------------------

// Delivery-model-aware compliance: which check applies depends on how the software is
// provisioned, not one uniform rule across the catalog.
//   saas     — assignment IS the provisioning event (M365, Salesforce, Okta, Zoom-style
//              admin-console tools). No separate "install" exists to discover; the only
//              possible quantity violation is Over-Assigned (assigned > entitled).
//   on-prem  — installable/copyable outside any assignment workflow (imaging, shared
//              drives, self-hosted, downloadable CLIs/agents). Assignment records can be
//              clean while shadow installs exist; the check is Over-Deployed (discovered
//              instances > entitled), and requires DiscoveryRow coverage.
export type DeliveryModel = "saas" | "on-prem";

export interface ProductCatalogEntry {
  sku: string; // join key: procurement.productSku = publisher.skuPartNumber = identity.targetApp
  name: string;
  publisher: string;
  category: string; // ≈ Ariba commodity
  licenseModel: LicenseModel;
  deliveryModel: DeliveryModel;
  adoption: AdoptionTier; // drives how many employees get assigned
  edition: string; // servicePlanName flavor
  priceMin: number; // annual cost per seat (USD), low end of the band
  priceMax: number; // annual cost per seat (USD), high end of the band
  affinity?: string[]; // departmentIds this product concentrates in; omitted = spread broadly
  description?: string; // authored, one-sentence product blurb; only populated for a curated subset
}

// ---------------------------------------------------------------------------
// procurement — SAP Ariba contract / purchase order (one row per purchased product)
// ---------------------------------------------------------------------------

export interface ProcurementRow {
  contractId: string; // "CW-2024-0417" (contract workspace id)
  poNumber: string; // "PO-100482"
  supplierName: string; // reseller / channel partner (CDW, SHI, Insight, ...)
  productName: string;
  productSku: string;
  publisher: string;
  commodity: string; // ≈ category
  licenseModel: LicenseModel;
  quantity: number; // seats purchased
  unitPrice: number; // ANNUAL cost per seat — keeps all per-year math term-independent
  annualCost: number; // quantity × unitPrice (subscription); annualMaintenance (perpetual)
  acquisitionCost?: number; // perpetual: one-time up-front
  annualMaintenance?: number; // perpetual: recurring
  currency: string; // "USD"
  contractEffectiveDate: string; // ISO date — drives rollout/operational
  contractExpirationDate: string; // ISO date — drives renewal window
  contractTermMonths: number; // 12 / 24 / 36 — multi-year term
  totalContractValue: number; // annualCost × termMonths/12 — for TCV display fields only
  paymentTerms: string; // "Net 30" / "Net 45" / "Net 60"
  noticePeriodDeadline: string; // ISO date — cancel-by date ahead of expiration
  autoRenew: "Automatic" | "Manual";
}

// ---------------------------------------------------------------------------
// evaluation — pre-purchase pipeline. No contract, no assignments (nobody uses it yet).
// This is the "In Evaluation" lifecycle slice.
// ---------------------------------------------------------------------------

export interface EvaluationRow {
  requestId: string; // "REQ-2025-0088"
  productName: string;
  productSku: string;
  publisher: string;
  edition: string;
  licensesRequested: number;
  estimatedAnnualCost: number;
  requestedDate: string; // ISO date
}

// ---------------------------------------------------------------------------
// openSource — community components tracked by adoption, not per-seat licensing.
// No contract, no seat assignments (per Decision 032: Component / Version / Users).
// ---------------------------------------------------------------------------

export interface OpenSourceRow {
  sku: string;
  name: string;
  publisher: string;
  version: string;
  users: number; // count of adopters, not assigned seats
}

// ---------------------------------------------------------------------------
// hr — Workday Workers (one row per employee). Carries BOTH employeeId (its native
// key) and email (the bridge the other systems join on).
// ---------------------------------------------------------------------------

export interface HrRow {
  employeeId: string; // "E-04471"
  email: string; // userPrincipalName — join key to publisher/identity
  firstName: string;
  lastName: string;
  workerName: string;
  department: string; // departmentId — join key to config
  costCenter: string; // cost-center code
  location: string; // city
  region: string; // region code
  jobTitle: string;
  managementLevel: string; // "IC" / "Manager" / "Director" / "VP"
  workerStatus: WorkerStatus;
  hireDate: string; // ISO date
  terminationDate: string | null; // ISO date when Terminated, else null
}

// ---------------------------------------------------------------------------
// publisher — M365 / Adobe admin console license assignment (one row per employee×product)
// ---------------------------------------------------------------------------

export interface PublisherAssignmentRow {
  userPrincipalName: string; // email — join key to hr/identity
  skuPartNumber: string; // productSku — join key to procurement
  servicePlanName: string; // edition
  assignmentStatus: "Assigned" | "Enabled";
  assignedDateTime: string; // ISO date
  usageLocation: string; // ISO country flavor / region code
}

// ---------------------------------------------------------------------------
// identity — Okta System Log summarized to last activity (one row per employee×app)
// ---------------------------------------------------------------------------

export interface IdentityActivityRow {
  userEmail: string; // join key to hr/publisher
  targetApp: string; // productSku — join key to procurement/publisher
  lastEventType: string; // e.g. "user.authentication.sso"
  lastActivityAt: string | null; // ISO date; null → never signed in
  outcome: "SUCCESS" | "FAILURE";
}

// ---------------------------------------------------------------------------
// discovery — SCCM/Intune/Flexera-style agent inventory scan (one row per
// device×installed product). The "consumed" side of compliance: what's actually
// installed, independent of what was assigned/entitled. assignedUserEmail is null
// for unmanaged/shadow devices — installs with no accountable owner on record.
// ---------------------------------------------------------------------------

export interface DiscoveryRow {
  deviceId: string;
  assignedUserEmail: string | null; // join key to hr/publisher; null = unmanaged device
  productSku: string; // join key to procurement/catalog — absent match = unrecognized software
  installedVersion: string;
  installDate: string; // ISO date
  lastScanDate: string; // ISO date — agent freshness; stale scans are excluded from compliance counts
}

// ---------------------------------------------------------------------------
// The assembled dataset — the single object the whole UI reads through the seam.
// ---------------------------------------------------------------------------

export interface Dataset {
  generatedAt: string;
  seed: number;
  employeeCount: number;
  config: OrgConfig;
  catalog: ProductCatalogEntry[];
  procurement: ProcurementRow[];
  evaluation: EvaluationRow[];
  openSource: OpenSourceRow[];
  hr: HrRow[];
  publisher: PublisherAssignmentRow[];
  identity: IdentityActivityRow[];
  discovery: DiscoveryRow[];
}
