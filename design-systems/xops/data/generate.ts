// Seeded, deterministic generator — the "recipe" that expands into the five source
// tables. Same (seed, employeeCount) → byte-identical dataset every run. Commit the
// recipe, not the ~50K rows it produces. Org size is the single knob.

import type {
  Dataset,
  OrgConfig,
  OrgDepartment,
  OrgCostCenter,
  OrgRegion,
  HrRow,
  ProcurementRow,
  EvaluationRow,
  PublisherAssignmentRow,
  IdentityActivityRow,
  OpenSourceRow,
  DiscoveryRow,
  ProductCatalogEntry,
  LifecycleStage,
  WorkerStatus,
} from "./types";
import { PRODUCT_CATALOG } from "./catalog";

// Fixed "as of" date so activity windows, renewals, and tenure are all deterministic.
export const AS_OF = new Date("2026-01-15T00:00:00Z");
const COMPANY_DOMAIN = "vantageglobal.com";

// Discovery-scan freshness window for compliance (complianceMetrics.ts) — matches the
// 60-day figure already used elsewhere in the app (Usage card's inactivity threshold),
// kept as one named constant so both stay in sync if it ever changes.
export const DISCOVERY_FRESHNESS_DAYS = 60;

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) + typed helpers
// ---------------------------------------------------------------------------

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  float: (min: number, max: number) => number;
  pick: <T>(arr: readonly T[]) => T;
  chance: (p: number) => boolean;
  shuffle: <T>(arr: readonly T[]) => T[];
  weighted: <T>(items: { value: T; weight: number }[]) => T;
}

function createRng(seed: number): Rng {
  const rand = mulberry32(seed);
  const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  return {
    next: rand,
    int,
    float: (min, max) => rand() * (max - min) + min,
    pick: <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)],
    chance: (p) => rand() < p,
    shuffle: <T,>(arr: readonly T[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    weighted: <T,>(items: { value: T; weight: number }[]) => {
      const total = items.reduce((s, i) => s + i.weight, 0);
      let r = rand() * total;
      for (const it of items) {
        r -= it.weight;
        if (r <= 0) return it.value;
      }
      return items[items.length - 1].value;
    },
  };
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY_MS);
const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setUTCMonth(x.getUTCMonth() + n);
  return x;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthsBetween = (a: Date, b: Date) =>
  (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());

// ---------------------------------------------------------------------------
// Static reference pools
// ---------------------------------------------------------------------------

const DEPARTMENTS: { id: string; name: string; parent: string; weight: number; icTitle: string }[] = [
  { id: "eng", name: "Engineering", parent: "Technology", weight: 22, icTitle: "Software Engineer" },
  { id: "product", name: "Product", parent: "Technology", weight: 5, icTitle: "Product Manager" },
  { id: "design", name: "Design", parent: "Technology", weight: 3, icTitle: "Product Designer" },
  { id: "it", name: "IT", parent: "Technology", weight: 5, icTitle: "IT Systems Administrator" },
  { id: "security", name: "Security", parent: "Technology", weight: 3, icTitle: "Security Engineer" },
  { id: "data", name: "Data & Analytics", parent: "Technology", weight: 4, icTitle: "Data Analyst" },
  { id: "sales", name: "Sales", parent: "Go-To-Market", weight: 16, icTitle: "Account Executive" },
  { id: "marketing", name: "Marketing", parent: "Go-To-Market", weight: 6, icTitle: "Marketing Specialist" },
  { id: "cs", name: "Customer Success", parent: "Go-To-Market", weight: 6, icTitle: "Customer Success Manager" },
  { id: "support", name: "Customer Support", parent: "Go-To-Market", weight: 8, icTitle: "Support Specialist" },
  { id: "finance", name: "Finance", parent: "Corporate", weight: 5, icTitle: "Financial Analyst" },
  { id: "hr", name: "People", parent: "Corporate", weight: 3, icTitle: "People Partner" },
  { id: "legal", name: "Legal", parent: "Corporate", weight: 2, icTitle: "Corporate Counsel" },
  { id: "ops", name: "Operations", parent: "Corporate", weight: 6, icTitle: "Operations Analyst" },
  { id: "procurement", name: "Procurement", parent: "Corporate", weight: 2, icTitle: "Procurement Specialist" },
  { id: "exec", name: "Executive", parent: "Corporate", weight: 1, icTitle: "Chief of Staff" },
];

const REGIONS: { code: string; name: string; weight: number; country: string; cities: string[] }[] = [
  { code: "NA", name: "North America", weight: 50, country: "US", cities: ["Austin", "Seattle", "Denver", "Chicago", "Boston", "Toronto", "San Francisco", "New York", "Atlanta", "Vancouver"] },
  { code: "EMEA", name: "EMEA", weight: 25, country: "GB", cities: ["London", "Dublin", "Berlin", "Amsterdam", "Paris", "Madrid", "Stockholm", "Warsaw", "Munich", "Lisbon"] },
  { code: "APAC", name: "APAC", weight: 18, country: "SG", cities: ["Singapore", "Sydney", "Tokyo", "Bangalore", "Melbourne", "Seoul", "Hong Kong", "Manila"] },
  { code: "LATAM", name: "LATAM", weight: 7, country: "BR", cities: ["Sao Paulo", "Mexico City", "Bogota", "Buenos Aires", "Santiago"] },
];

const MANAGEMENT_LEVELS: { value: string; weight: number }[] = [
  { value: "IC", weight: 78 },
  { value: "Manager", weight: 14 },
  { value: "Director", weight: 6 },
  { value: "VP", weight: 2 },
];

// Curated cost-center master data, one entry per real financial sub-unit within a
// department — mirrors how a real controlling module (e.g. SAP KOSTL/KTEXT) stores a
// mnemonic code and a human-authored description as sibling fields, not one derived
// from the other. Count per department varies (1-3) same as real orgs.
const COST_CENTERS: Record<string, { code: string; name: string }[]> = {
  eng: [
    { code: "CC-ENG-CORE-PLAT", name: "Core Platform Engineering" },
    { code: "CC-ENG-INFRA-CLOUD", name: "Cloud Infrastructure & DevOps" },
    { code: "CC-ENG-QA-RELIABILITY", name: "Quality Engineering & Site Reliability" },
  ],
  product: [
    { code: "CC-PROD-STRATEGY", name: "Product Strategy & Roadmap Planning" },
    { code: "CC-PROD-ANALYTICS", name: "Product Analytics & Experimentation" },
  ],
  design: [
    { code: "CC-DESIGN-OPS", name: "Product Design Operations & Prototyping Systems" },
    { code: "CC-DESIGN-RESEARCH", name: "User Research Labs & Participant Compensation" },
  ],
  it: [
    { code: "CC-IT-HELPDESK", name: "Internal Employee IT Support & Hardware Procurement" },
    { code: "CC-IT-INFRA-AWS", name: "Cloud Infrastructure & AWS Web Hosting" },
  ],
  security: [
    { code: "CC-SEC-CYBER-OPS", name: "Cybersecurity Operations & Data Protection Systems" },
    { code: "CC-SEC-GRC", name: "Governance, Risk & Compliance Programs" },
  ],
  data: [
    { code: "CC-DATA-PLATFORM", name: "Data Platform & Warehouse Engineering" },
    { code: "CC-DATA-SCIENCE", name: "Data Science & Applied Machine Learning" },
  ],
  sales: [
    { code: "CC-SALES-ENABLEMENT", name: "Sales Training, Onboarding & Material Production" },
    { code: "CC-SALES-FIELD-NA", name: "Field Sales Operations (North America)" },
    { code: "CC-SALES-FIELD-INTL", name: "Field Sales Operations (International)" },
  ],
  marketing: [
    { code: "CC-MKTG-BRAND-GLOBAL", name: "Global Brand Strategy & Creative Agencies" },
    { code: "CC-MKTG-EVENTS-CONF", name: "Corporate Events, Trade Shows & Conferences" },
    { code: "CC-MKTG-DEMAND-GEN", name: "Demand Generation & Paid Media" },
  ],
  cs: [
    { code: "CC-CS-ONBOARDING", name: "Customer Onboarding & Implementation" },
    { code: "CC-CS-RENEWALS", name: "Renewals & Account Expansion" },
  ],
  support: [
    { code: "CC-SUPPORT-TIER1", name: "Frontline Support Operations" },
    { code: "CC-SUPPORT-TOOLING", name: "Support Tooling & Knowledge Base" },
  ],
  finance: [
    { code: "CC-FIN-INTERNAL-AUDIT", name: "Internal Audit, Compliance & Tax Risk Management" },
    { code: "CC-FIN-FPA", name: "Financial Planning & Analysis" },
  ],
  hr: [
    { code: "CC-HR-US-REC", name: "Corporate Recruiting & Talent Acquisition (US)" },
    { code: "CC-HR-BENEFITS", name: "Employee Benefits Administration & Insurance" },
  ],
  legal: [
    { code: "CC-LEGAL-IP-PATENTS", name: "Intellectual Property & Patent Law Protection" },
    { code: "CC-LEGAL-CONTRACTS", name: "Commercial Contracts & Vendor Agreements" },
  ],
  ops: [
    { code: "CC-OPS-FAC-HQ", name: "Corporate Headquarters Facilities & Maintenance" },
    { code: "CC-OPS-BIZOPS", name: "Business Operations & Process Improvement" },
  ],
  procurement: [
    { code: "CC-PROC-VENDOR-MGMT", name: "Vendor Management & Sourcing" },
    { code: "CC-PROC-SOFTWARE", name: "Software Asset & License Procurement" },
  ],
  exec: [{ code: "CC-EXEC-CORP-TRAVEL", name: "Executive Leadership & Corporate Travel Expenses" }],
};

const RESELLERS = ["CDW", "SHI International", "Insight Enterprises", "Zones", "Connection", "SoftwareOne", "Direct"];
const PAYMENT_TERMS = ["Net 30", "Net 45", "Net 60"];
const EVENT_TYPES = ["user.authentication.sso", "user.session.start", "app.oauth2.token.grant", "user.authentication.verify"];

const FIRST_NAMES = ["Aaliyah","Aaron","Adrian","Ahmed","Aiden","Alan","Alejandro","Alexis","Alice","Amara","Amelia","Amir","Ana","Andre","Angela","Anika","Anthony","Aria","Arjun","Ashley","Aurora","Ava","Benjamin","Bianca","Blake","Brandon","Brianna","Caleb","Camila","Carlos","Carmen","Caroline","Chen","Chloe","Chris","Claire","Cole","Daniel","Daria","David","Delphine","Diego","Dmitri","Elena","Eli","Elias","Elise","Emily","Emma","Eric","Esther","Ethan","Ezra","Fatima","Felix","Fiona","Gabriel","Grace","Hannah","Hassan","Henry","Hina","Ibrahim","Imani","Isaac","Isabella","Ivan","Jack","Jade","Jamal","James","Jasmine","Javier","Jenna","Jesse","Jia","Joel","Jonah","Jordan","Jose","Julia","Kai","Kaiya","Karan","Katherine","Kenji","Kiara","Lars","Laura","Leah","Leo","Liam","Lily","Lucas","Luna","Maya","Mateo","Mei","Micah","Mohammed","Nadia","Naomi","Natalie","Nathan","Nina","Noah","Nora","Olivia","Omar","Oscar","Priya","Quinn","Rachel","Rafael","Ravi","Rebecca","Riya","Robert","Rosa","Ruth","Ryan","Sadie","Samuel","Sara","Sean","Sofia","Sophia","Tara","Theo","Thomas","Tomas","Uma","Victor","Violet","Wei","William","Wren","Xavier","Yara","Yusuf","Zain","Zara","Zoe"];

const LAST_NAMES = ["Abbott","Acosta","Adams","Aguilar","Ali","Andersen","Bailey","Baker","Banerjee","Barnes","Bautista","Bennett","Bishop","Brooks","Bryant","Cabrera","Campbell","Carter","Castillo","Chan","Chen","Cho","Clark","Cohen","Cole","Collins","Cook","Cooper","Cruz","Dalton","Davis","Delgado","Diaz","Dixon","Dubois","Duncan","Edwards","Ellis","Ferguson","Fischer","Fleming","Flores","Foster","Fujimoto","Gallagher","Garcia","Gill","Goldberg","Gomez","Grant","Griffin","Gupta","Hansen","Harris","Hayashi","Hernandez","Holloway","Hoffman","Huang","Ibrahim","Iyer","Jackson","Jensen","Johnson","Kaur","Keller","Khan","Kim","Klein","Kobayashi","Kowalski","Lam","Lambert","Larsen","Lee","Lopez","Lowe","Maddox","Mahmoud","Malik","Marshall","Martin","Martinez","Mbeki","McCarthy","Mehta","Mendez","Meyer","Miller","Mitchell","Mora","Morales","Murphy","Nakamura","Nguyen","Nielsen","Novak","OBrien","Okafor","Oliveira","Olsen","Ortiz","Osei","Palmer","Park","Patel","Pereira","Perry","Peterson","Pham","Phillips","Powell","Price","Ramirez","Reddy","Reyes","Reynolds","Rivera","Roberts","Robinson","Rossi","Russo","Saito","Salazar","Santos","Schneider","Schwartz","Sharma","Silva","Simmons","Singh","Smith","Snyder","Soto","Stewart","Sullivan","Suzuki","Tanaka","Taylor","Thompson","Torres","Tran","Turner","Vargas","Vasquez","Wagner","Walsh","Wang","Ward","Watanabe","Watson","Weber","Webb","Williams","Wilson","Wong","Wright","Yamamoto","Yang","Yoon","Young","Zhang","Zhao","Zimmerman"];

// Deterministic Primary/Secondary owner pair for a product. No owner source table exists
// yet, so owners are derived from the SKU: same product → same two names every run, drawn
// from the same roster pools the HR generator uses. FNV-1a hashes the SKU into the PRNG seed.
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function ownersForSku(sku: string): { primary: string; secondary: string } {
  const rng = createRng(hashString(sku));
  const name = () => `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
  const primary = name();
  let secondary = name();
  while (secondary === primary) secondary = name();
  return { primary, secondary };
}

// Known reseller email domains; "Direct" (no reseller, purchased straight from publisher)
// falls back to a slugified version of the publisher name.
const RESELLER_DOMAINS: Record<string, string> = {
  CDW: "cdw.com",
  "SHI International": "shi.com",
  "Insight Enterprises": "insight.com",
  Zones: "zones.com",
  Connection: "connection.com",
  SoftwareOne: "softwareone.com",
};

const VENDOR_CONTACT_ROLES = ["Account Manager", "Customer Success Manager", "Renewal Specialist"];

function slugifyDomain(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";
}

// Deterministic vendor/account contact for a product's contract — no vendor-contact
// source table exists yet, so this is derived from the SKU the same way ownersForSku()
// derives internal owners: same product → same contact every run.
export function vendorContactForSku(
  sku: string,
  reseller: string,
  publisher: string,
): { name: string; role: string; email: string } {
  const rng = createRng(hashString(sku + "|vendor"));
  const first = rng.pick(FIRST_NAMES);
  const last = rng.pick(LAST_NAMES);
  const domain = reseller === "Direct" ? slugifyDomain(publisher) : RESELLER_DOMAINS[reseller] ?? slugifyDomain(reseller);
  return {
    name: `${first} ${last}`,
    role: rng.pick(VENDOR_CONTACT_ROLES),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
  };
}

// Assignment reach as a fraction of the relevant population (affinity depts if set, else org).
const REACH: Record<ProductCatalogEntry["adoption"], [number, number]> = {
  universal: [0.8, 0.98],
  broad: [0.45, 0.75],
  departmental: [0.35, 0.65],
  niche: [0.1, 0.3],
};

const STAGE_WEIGHTS: { value: LifecycleStage; weight: number }[] = [
  { value: "operational", weight: 58 },
  { value: "renewal", weight: 18 },
  { value: "rollout", weight: 12 },
  { value: "evaluation", weight: 12 },
];

// Consumption products can't be "in evaluation" (no license request), so they draw
// from the purchased stages only.
const STAGE_WEIGHTS_PURCHASED: { value: Exclude<LifecycleStage, "evaluation">; weight: number }[] = [
  { value: "operational", weight: 64 },
  { value: "renewal", weight: 22 },
  { value: "rollout", weight: 14 },
];

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

function buildConfig(): { config: OrgConfig; costCentersByDept: Record<string, string[]> } {
  const regions: OrgRegion[] = REGIONS.map((r) => ({ code: r.code, name: r.name }));
  const departments: OrgDepartment[] = DEPARTMENTS.map((d) => ({
    departmentId: d.id,
    departmentName: d.name,
    parentOrg: d.parent,
  }));

  const costCenters: OrgCostCenter[] = [];
  const costCentersByDept: Record<string, string[]> = {};
  for (const d of DEPARTMENTS) {
    costCentersByDept[d.id] = [];
    for (const cc of COST_CENTERS[d.id] ?? []) {
      costCenters.push({ code: cc.code, name: cc.name, departmentId: d.id });
      costCentersByDept[d.id].push(cc.code);
    }
  }
  return { config: { regions, departments, costCenters }, costCentersByDept };
}

function buildEmployees(
  rng: Rng,
  count: number,
  costCentersByDept: Record<string, string[]>,
): HrRow[] {
  const deptChoices = DEPARTMENTS.map((d) => ({ value: d, weight: d.weight }));
  const regionChoices = REGIONS.map((r) => ({ value: r, weight: r.weight }));
  const usedNames = new Set<string>();
  const usedEmails = new Set<string>();
  const employees: HrRow[] = [];

  for (let i = 0; i < count; i++) {
    // Unique full name
    let first = rng.pick(FIRST_NAMES);
    let last = rng.pick(LAST_NAMES);
    let guard = 0;
    while (usedNames.has(`${first} ${last}`) && guard++ < 50) {
      first = rng.pick(FIRST_NAMES);
      last = rng.pick(LAST_NAMES);
    }
    usedNames.add(`${first} ${last}`);

    // Unique email
    const base = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "");
    let email = `${base}@${COMPANY_DOMAIN}`;
    let n = 1;
    while (usedEmails.has(email)) email = `${base}${++n}@${COMPANY_DOMAIN}`;
    usedEmails.add(email);

    const dept = rng.weighted(deptChoices);
    const region = rng.weighted(regionChoices);
    const level = rng.weighted(MANAGEMENT_LEVELS);
    const jobTitle =
      level === "IC" ? dept.icTitle : level === "Manager" ? `${dept.name} Manager` : `${level}, ${dept.name}`;

    const hireDate = addDays(AS_OF, -rng.int(30, 2920)); // up to ~8 years tenure
    const terminated = rng.chance(0.06);
    let terminationDate: string | null = null;
    if (terminated) {
      const span = Math.max(1, Math.floor((AS_OF.getTime() - hireDate.getTime()) / DAY_MS));
      terminationDate = iso(addDays(hireDate, rng.int(Math.min(90, span), span)));
    }

    employees.push({
      employeeId: `E-${String(10000 + i)}`,
      email,
      firstName: first,
      lastName: last,
      workerName: `${first} ${last}`,
      department: dept.id,
      costCenter: rng.pick(costCentersByDept[dept.id]),
      location: rng.pick(region.cities),
      region: region.code,
      jobTitle,
      managementLevel: level,
      workerStatus: (terminated ? "Terminated" : "Active") as WorkerStatus,
      hireDate: iso(hireDate),
      terminationDate,
    });
  }
  return employees;
}

function contractWindow(rng: Rng, stage: Exclude<LifecycleStage, "evaluation">): {
  effective: Date;
  expiration: Date;
  termMonths: number;
} {
  let effective: Date;
  let expiration: Date;
  if (stage === "rollout") {
    effective = addDays(AS_OF, -rng.int(15, 180));
    const termMonths = rng.pick([12, 24, 36]);
    expiration = addMonths(effective, termMonths);
    return { effective, expiration, termMonths };
  }
  if (stage === "renewal") {
    effective = addMonths(AS_OF, -rng.int(10, 34));
    // Most renewal-stage contracts are still ahead of their end date; a subset (~28%)
    // have already lapsed — expired but still in active use, the real case that drives
    // compliance's Expired-and-active state (complianceMetrics.ts).
    expiration = rng.chance(0.42) ? addDays(AS_OF, -rng.int(15, 160)) : addDays(AS_OF, rng.int(5, 180));
  } else {
    // operational
    effective = addMonths(AS_OF, -rng.int(7, 28));
    expiration = addDays(AS_OF, rng.int(181, 900));
  }
  const termMonths = Math.max(12, Math.round(monthsBetween(effective, expiration) / 12) * 12);
  return { effective, expiration, termMonths };
}

function buildContractsAndUsage(
  rng: Rng,
  employees: HrRow[],
  shadowOnlySkus: Set<string>,
): {
  procurement: ProcurementRow[];
  evaluation: EvaluationRow[];
  openSource: OpenSourceRow[];
  publisher: PublisherAssignmentRow[];
  identity: IdentityActivityRow[];
} {
  const procurement: ProcurementRow[] = [];
  const evaluation: EvaluationRow[] = [];
  const openSource: OpenSourceRow[] = [];
  const publisher: PublisherAssignmentRow[] = [];
  const identity: IdentityActivityRow[] = [];

  const employeesByDept: Record<string, HrRow[]> = {};
  for (const e of employees) (employeesByDept[e.department] ??= []).push(e);

  let contractSeq = 100;
  let poSeq = 100000;
  let reqSeq = 100;

  for (const product of PRODUCT_CATALOG) {
    // Shadow IT — no procurement, no evaluation request, no admin-console assignment;
    // IT/procurement has zero record of this title at all. Handled entirely by
    // buildShadowIt() below instead of the normal pipeline.
    if (shadowOnlySkus.has(product.sku)) continue;

    // Population the product draws from, and its reach into that population.
    const pool =
      product.affinity && product.affinity.length > 0
        ? product.affinity.flatMap((d) => employeesByDept[d] ?? [])
        : employees;
    const [lo, hi] = REACH[product.adoption];
    const target = Math.max(1, Math.round(pool.length * rng.float(lo, hi)));
    const unitPrice = Math.round(rng.float(product.priceMin, product.priceMax));

    // ----- Open source: tracked by adoption (Component / Version / Users) — no contract, no seats -----
    if (product.licenseModel === "open-source") {
      openSource.push({
        sku: product.sku,
        name: product.name,
        publisher: product.publisher,
        version: `${rng.int(1, 12)}.${rng.int(0, 20)}`,
        users: target,
      });
      continue;
    }

    const seatBased = product.licenseModel === "enterprise" || product.licenseModel === "perpetual";
    // Consumption is usage-billed — it never sits in an "evaluation" (license-request) state.
    const stage = seatBased ? rng.weighted(STAGE_WEIGHTS) : rng.weighted(STAGE_WEIGHTS_PURCHASED);

    // ----- In Evaluation: request only, no contract, no assignments -----
    if (stage === "evaluation") {
      evaluation.push({
        requestId: `REQ-2025-${String(reqSeq++).padStart(4, "0")}`,
        productName: product.name,
        productSku: product.sku,
        publisher: product.publisher,
        edition: product.edition,
        licensesRequested: target,
        estimatedAnnualCost: target * unitPrice,
        requestedDate: iso(addDays(AS_OF, -rng.int(5, 120))),
      });
      continue;
    }

    const { effective, expiration, termMonths } = contractWindow(rng, stage);

    // ----- Consumption: usage-billed spend row — cost is visible, but no seats/assignments/utilization -----
    if (!seatBased) {
      const annualCost = rng.int(120_000, 2_400_000);
      procurement.push({
        contractId: `CW-2024-${String(contractSeq++).padStart(4, "0")}`,
        poNumber: `PO-${poSeq++}`,
        supplierName: rng.pick(RESELLERS),
        productName: product.name,
        productSku: product.sku,
        publisher: product.publisher,
        commodity: product.category,
        licenseModel: product.licenseModel,
        quantity: 0,
        unitPrice: 0,
        annualCost,
        acquisitionCost: undefined,
        annualMaintenance: undefined,
        currency: "USD",
        contractEffectiveDate: iso(effective),
        contractExpirationDate: iso(expiration),
        contractTermMonths: termMonths,
        totalContractValue: Math.round(annualCost * (termMonths / 12)),
        paymentTerms: rng.pick(PAYMENT_TERMS),
        noticePeriodDeadline: iso(addDays(expiration, -rng.int(30, 90))),
        autoRenew: rng.chance(0.5) ? "Automatic" : "Manual",
      });
      continue;
    }

    // ----- Seat-based (enterprise / perpetual): contract + assignments + activity -----
    const assignedCount = Math.min(target, pool.length);

    // Over-Assigned generator (SaaS only): a subset of SaaS titles simulate self-service
    // assignment / true-up lag — admins assign ahead of the next purchasing cycle, so
    // entitled quantity ends up below what's actually assigned. On-prem titles always
    // keep purchased ≥ assigned; their overage shows up as Over-Deployed installs instead
    // (buildDiscovery below), never as Over-Assigned. Already-lapsed contracts are
    // excluded — severity ordering (Expired-and-active > Over-Assigned) would reclassify
    // them anyway, so applying both here would just be wasted generation, not a real
    // dual-violation title (that combination is real but rare — not manufactured here).
    const overAssignRng = createRng(hashString(product.sku + "|overassign"));
    const overAssigned = product.deliveryModel === "saas" && expiration >= AS_OF && overAssignRng.chance(0.17);
    // Both branches draw from overAssignRng (never the shared `rng`) so toggling which
    // titles are over-assigned can never perturb any other product's shared-stream draws
    // downstream — the instability that made this generator hard to tune independently.
    const quantity = overAssigned
      ? Math.max(1, Math.round(assignedCount * overAssignRng.float(0.55, 0.78)))
      : Math.ceil(assignedCount / overAssignRng.float(0.8, 0.95)); // purchased ≥ assigned

    const isPerpetual = product.licenseModel === "perpetual";
    const acquisitionCost = isPerpetual ? quantity * unitPrice : undefined;
    const annualMaintenance = isPerpetual ? Math.round((acquisitionCost as number) * rng.float(0.18, 0.22)) : undefined;
    const annualCost = isPerpetual ? (annualMaintenance as number) : quantity * unitPrice;
    const totalContractValue = Math.round(annualCost * (termMonths / 12)) + (acquisitionCost ?? 0);

    procurement.push({
      contractId: `CW-2024-${String(contractSeq++).padStart(4, "0")}`,
      poNumber: `PO-${poSeq++}`,
      supplierName: rng.pick(RESELLERS),
      productName: product.name,
      productSku: product.sku,
      publisher: product.publisher,
      commodity: product.category,
      licenseModel: product.licenseModel,
      quantity,
      unitPrice,
      annualCost,
      acquisitionCost,
      annualMaintenance,
      currency: "USD",
      contractEffectiveDate: iso(effective),
      contractExpirationDate: iso(expiration),
      contractTermMonths: termMonths,
      totalContractValue,
      paymentTerms: rng.pick(PAYMENT_TERMS),
      noticePeriodDeadline: iso(addDays(expiration, -rng.int(30, 90))),
      autoRenew: rng.chance(0.5) ? "Automatic" : "Manual",
    });

    // Assign to a random subset — affinity employees first, then spill to the rest.
    const affinitySet = new Set(product.affinity ?? []);
    const affinityFirst = rng.shuffle(pool);
    const rest = affinitySet.size > 0 ? rng.shuffle(employees.filter((e) => !affinitySet.has(e.department))) : [];
    const ordered = [...affinityFirst, ...rest];
    const assignees = ordered.slice(0, assignedCount);

    // Per-product baseline utilization → varied, realistic active/inactive split.
    const activeProb = rng.float(0.5, 0.95);

    for (const emp of assignees) {
      const assignedAt = addDays(effective, rng.int(0, Math.max(1, Math.floor((AS_OF.getTime() - effective.getTime()) / DAY_MS))));
      publisher.push({
        userPrincipalName: emp.email,
        skuPartNumber: product.sku,
        servicePlanName: product.edition,
        assignmentStatus: rng.chance(0.97) ? "Assigned" : "Enabled",
        assignedDateTime: iso(assignedAt),
        usageLocation: REGIONS.find((r) => r.code === emp.region)?.country ?? "US",
      });

      const active = emp.workerStatus === "Terminated" ? rng.chance(0.05) : rng.chance(activeProb);
      let lastActivityAt: string | null;
      if (active) {
        lastActivityAt = iso(addDays(AS_OF, -rng.int(1, 89)));
      } else if (rng.chance(0.15)) {
        lastActivityAt = null; // never signed in
      } else {
        lastActivityAt = iso(addDays(AS_OF, -rng.int(91, 500)));
      }
      // Already-lapsed SaaS contracts: guarantee most active users' last login lands
      // after the contract's own expiration date, not just "fresh" — this is what
      // actually drives Expired-and-active volume for SaaS (only a handful of contracts
      // ever lapse, so each needs real weight, not just natural activity-date overlap).
      // Uses its own hashed RNG (not the shared stream) so it can never perturb which
      // OTHER products land in which lifecycle stage — that instability is what made this
      // whole tuning pass chase phantom effects for a while.
      if (product.deliveryModel === "saas" && expiration < AS_OF && active) {
        const lapseRng = createRng(hashString(product.sku + "|" + emp.email + "|lapseactivity"));
        if (lapseRng.chance(0.65)) {
          const floor = expiration > addDays(AS_OF, -89) ? expiration : addDays(AS_OF, -89);
          const span = Math.max(1, Math.floor((AS_OF.getTime() - floor.getTime()) / DAY_MS));
          lastActivityAt = iso(addDays(floor, lapseRng.int(1, span)));
        }
      }
      identity.push({
        userEmail: emp.email,
        targetApp: product.sku,
        lastEventType: rng.pick(EVENT_TYPES),
        lastActivityAt,
        outcome: rng.chance(0.98) ? "SUCCESS" : "FAILURE",
      });
    }
  }

  return { procurement, evaluation, openSource, publisher, identity };
}

// Discovery scan — the "consumed" side of compliance (installed instances), generated
// independently of assignments so it can legitimately diverge from entitled quantity
// (real agent inventory never lines up perfectly with license records).
function buildDiscovery(
  rng: Rng,
  procurement: ProcurementRow[],
  publisher: PublisherAssignmentRow[],
): DiscoveryRow[] {
  const discovery: DiscoveryRow[] = [];
  let deviceSeq = 100000;
  const nextDeviceId = () => `DEV-${String(deviceSeq++)}`;

  const assignmentsBySku = new Map<string, PublisherAssignmentRow[]>();
  for (const a of publisher) {
    let list = assignmentsBySku.get(a.skuPartNumber);
    if (!list) assignmentsBySku.set(a.skuPartNumber, (list = []));
    list.push(a);
  }

  const deliveryModelBySku = new Map(PRODUCT_CATALOG.map((c) => [c.sku, c.deliveryModel]));

  // A scan is "fresh" inside the window, "stale" outside it — both are generated so the
  // freshness filter in complianceMetrics.ts has real stale rows to exclude, not a no-op.
  const scanDate = (fresh: boolean) =>
    iso(
      fresh
        ? addDays(AS_OF, -rng.int(0, DISCOVERY_FRESHNESS_DAYS - 5))
        : addDays(AS_OF, -rng.int(DISCOVERY_FRESHNESS_DAYS + 20, 420)),
    );

  for (const proc of procurement) {
    if (proc.quantity <= 0) continue; // consumption products: no seats, nothing to discover
    // SaaS titles have no separate install layer — assignment IS the provisioning event.
    // There's nothing for an endpoint agent to discover, so no discovery rows exist at
    // all (not "Not Assessed" — that's reserved for on-prem titles missing coverage).
    if (deliveryModelBySku.get(proc.productSku) !== "on-prem") continue;

    // Deterministic per-product install profile, keyed off the SKU (same pattern as
    // ownersForSku) — same product is over-deployed / uncovered the same way every run.
    const productRng = createRng(hashString(proc.productSku + "|discovery"));

    // Agent never rolled out to this tool — zero discovery coverage at all. Distinct from
    // Under-Deployed (some coverage, just less than entitled): this title can't be
    // assessed for compliance one way or the other (complianceMetrics.ts's "Not Assessed").
    if (productRng.chance(0.12)) continue;

    const assignments = assignmentsBySku.get(proc.productSku) ?? [];
    // Scaled to assignment size (not a flat count) so it registers as a real overage
    // against the product's own purchase headroom, whether the product has 20 seats or
    // 2,000. Already-lapsed contracts are excluded — severity ordering (Expired-and-
    // active > Over-Deployed) would reclassify them anyway, so this would just be wasted
    // generation, not a real dual-violation title.
    const alreadyLapsed = new Date(proc.contractExpirationDate) < AS_OF;
    // Capped, not purely population-scaled — a large-population title (thousands of
    // assignees) would otherwise dominate this bucket on its own.
    const shadowDeviceCount = !alreadyLapsed && productRng.chance(0.28)
      ? Math.min(Math.max(3, Math.round(assignments.length * productRng.float(1.9, 3.6))), 550)
      : 0;

    for (const a of assignments) {
      const deviceCount = rng.chance(0.12) ? 2 : 1; // some users run the software on 2 devices
      for (let i = 0; i < deviceCount; i++) {
        discovery.push({
          deviceId: nextDeviceId(),
          assignedUserEmail: a.userPrincipalName,
          productSku: proc.productSku,
          installedVersion: `${rng.int(1, 24)}.${rng.int(0, 9)}`,
          installDate: a.assignedDateTime,
          lastScanDate: scanDate(rng.chance(0.82)),
        });
      }
    }

    // Unmanaged/shadow installs — software running on devices with no assigned owner on
    // record. Preserved as its own signal (assignedUserEmail: null) rather than dropped;
    // pushes a subset of products over their entitled quantity, same as a real fleet.
    for (let i = 0; i < shadowDeviceCount; i++) {
      discovery.push({
        deviceId: nextDeviceId(),
        assignedUserEmail: null,
        productSku: proc.productSku,
        installedVersion: `${productRng.int(1, 24)}.${productRng.int(0, 9)}`,
        installDate: iso(addDays(AS_OF, -productRng.int(10, 300))),
        lastScanDate: scanDate(productRng.chance(0.9)),
      });
    }

    // Already-lapsed contracts get their own dedicated post-expiration volume — devices
    // still checking in well after the contract ended. This is what actually drives
    // Expired-and-active's magnitude; the assignment-based installs above are already
    // capped by (and mostly predate) the lapse, so they alone under-represent it.
    if (alreadyLapsed && assignments.length > 0) {
      // Flat range, not scaled by assignments.length — a large-population title (thousands
      // of assignees) would otherwise dominate this bucket on its own.
      const extraCount = Math.min(assignments.length * 8, productRng.int(460, 850));
      // Scan window: fresh (within the freshness window) AND after the contract's own
      // expiration date — the two constraints combined, not just "fresh" alone, since a
      // recently-lapsed contract's freshness window can start before its expiration date.
      const expirationDate = new Date(proc.contractExpirationDate);
      const freshFloor = addDays(AS_OF, -(DISCOVERY_FRESHNESS_DAYS - 5));
      const scanFloor = expirationDate > freshFloor ? expirationDate : freshFloor;
      const scanSpanDays = Math.max(1, Math.floor((AS_OF.getTime() - scanFloor.getTime()) / DAY_MS));
      for (let i = 0; i < extraCount; i++) {
        discovery.push({
          deviceId: nextDeviceId(),
          assignedUserEmail: productRng.pick(assignments).userPrincipalName,
          productSku: proc.productSku,
          installedVersion: `${productRng.int(1, 24)}.${productRng.int(0, 9)}`,
          installDate: iso(addDays(expirationDate, productRng.int(5, 40))),
          lastScanDate: iso(addDays(scanFloor, productRng.int(0, scanSpanDays))),
        });
      }
    }
  }

  return discovery;
}

// Shadow IT — software in active use with no procurement/entitlement record at all,
// regardless of delivery model or lifecycle stage: IT/procurement has zero record of it.
// shadowOnlySkus never enters buildContractsAndUsage's normal pipeline (no procurement,
// no evaluation, no admin-console assignment) — this is their only footprint anywhere in
// the dataset, sourced by whichever signal a real org would actually catch it with:
//   on-prem — a downloaded/copied installer, caught by endpoint discovery.
//   saas    — a self-service team/individual signup, caught only via login activity
//             (the SSO/CASB-style signal), never via `publisher` (official provisioning).
function buildShadowIt(employees: HrRow[], shadowOnlySkus: Set<string>): { discovery: DiscoveryRow[]; identity: IdentityActivityRow[] } {
  const discovery: DiscoveryRow[] = [];
  const identity: IdentityActivityRow[] = [];
  let deviceSeq = 900000;
  const nextDeviceId = () => `DEV-${String(deviceSeq++)}`;

  const scanDate = (productRng: Rng, fresh: boolean) =>
    iso(
      fresh
        ? addDays(AS_OF, -productRng.int(0, DISCOVERY_FRESHNESS_DAYS - 5))
        : addDays(AS_OF, -productRng.int(DISCOVERY_FRESHNESS_DAYS + 20, 420)),
    );

  for (const product of PRODUCT_CATALOG) {
    if (!shadowOnlySkus.has(product.sku)) continue;
    const productRng = createRng(hashString(product.sku + "|shadowit"));

    if (product.deliveryModel === "on-prem") {
      const count = productRng.int(85, 175);
      for (let i = 0; i < count; i++) {
        discovery.push({
          deviceId: nextDeviceId(),
          assignedUserEmail: productRng.chance(0.6) ? productRng.pick(employees).email : null,
          productSku: product.sku,
          installedVersion: `${productRng.int(1, 24)}.${productRng.int(0, 9)}`,
          installDate: iso(addDays(AS_OF, -productRng.int(5, 300))),
          lastScanDate: scanDate(productRng, productRng.chance(0.8)),
        });
      }
    } else {
      const count = productRng.int(80, 160);
      for (const emp of productRng.shuffle(employees).slice(0, count)) {
        identity.push({
          userEmail: emp.email,
          targetApp: product.sku,
          lastEventType: "user.authentication.sso",
          lastActivityAt: iso(addDays(AS_OF, -productRng.int(1, DISCOVERY_FRESHNESS_DAYS - 5))),
          outcome: "SUCCESS",
        });
      }
    }
  }

  return { discovery, identity };
}

// Deterministic ~10% of seat-based catalog products get zero footprint in the normal
// pipeline — handled entirely by buildShadowIt instead. Computed once, off the catalog
// alone, so it can gate buildContractsAndUsage before that function ever runs.
function computeShadowOnlySkus(): Set<string> {
  const shadowOnly = new Set<string>();
  for (const product of PRODUCT_CATALOG) {
    if (product.licenseModel !== "enterprise" && product.licenseModel !== "perpetual") continue;
    if (createRng(hashString(product.sku + "|shadowonly")).chance(0.038)) shadowOnly.add(product.sku);
  }
  return shadowOnly;
}

export interface GenerateOptions {
  seed?: number;
  employeeCount?: number;
}

export function buildDataset(options: GenerateOptions = {}): Dataset {
  const seed = options.seed ?? 20260115;
  const employeeCount = options.employeeCount ?? 3000;
  const rng = createRng(seed);

  const shadowOnlySkus = computeShadowOnlySkus();

  const { config, costCentersByDept } = buildConfig();
  const hr = buildEmployees(rng, employeeCount, costCentersByDept);
  const { procurement, evaluation, openSource, publisher, identity } = buildContractsAndUsage(rng, hr, shadowOnlySkus);
  const discovery = buildDiscovery(rng, procurement, publisher);
  const shadowIt = buildShadowIt(hr, shadowOnlySkus);

  return {
    generatedAt: iso(AS_OF),
    seed,
    employeeCount,
    config,
    catalog: PRODUCT_CATALOG,
    procurement,
    evaluation,
    openSource,
    hr,
    publisher,
    identity: identity.concat(shadowIt.identity),
    discovery: discovery.concat(shadowIt.discovery),
  };
}

// Memoized default dataset — computed once per JS context.
let _dataset: Dataset | null = null;
export function getDataset(): Dataset {
  return (_dataset ??= buildDataset());
}
