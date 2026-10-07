// Seeded, deterministic data layer for the CMDB half-sunburst — same
// mulberry32-PRNG approach as design-systems/xops/data/generate.ts, but a
// separate, self-contained copy: this is illustrative case-study content,
// not the shared XOPS product dataset (see xops PLAN.md item #16 for that
// larger, still-unstarted effort). Same (SEED) → byte-identical CI list
// every run, so the sunburst renders identically across builds and never
// mismatches between server and client.

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
  int: (min: number, max: number) => number;
}

function createRng(seed: number): Rng {
  const rand = mulberry32(seed);
  return {
    int: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
  };
}

// Same FNV-1a string hash xops's generator uses to turn a name into a seed —
// so each Type's CI batch is deterministic on its own, independent of
// generation order.
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Taxonomy — hand-curated real CMDB structure (Category → Class → Type).
// Each Type carries the asset-tag prefix used for its generated CI ids.
// ---------------------------------------------------------------------------

interface TypeDef {
  name: string;
  prefix: string;
}

interface ClassDef {
  name: string;
  types: TypeDef[];
}

interface CategoryDef {
  name: string;
  classes: ClassDef[];
}

const TAXONOMY: CategoryDef[] = [
  {
    name: "Hardware",
    classes: [
      {
        name: "Data Center Infrastructure",
        types: [
          { name: "Server", prefix: "SRV" },
          { name: "Network Switch", prefix: "NETSW" },
          { name: "Storage Array", prefix: "STOR" },
        ],
      },
      {
        name: "End User Computing",
        types: [
          { name: "Laptop", prefix: "LAPTOP" },
          { name: "Desktop", prefix: "DESKTOP" },
          { name: "Mobile Device", prefix: "MOBILE" },
        ],
      },
    ],
  },
  {
    name: "Software",
    classes: [
      {
        name: "Business Apps",
        types: [
          { name: "SaaS", prefix: "SAASAPP" },
          { name: "On-Prem", prefix: "APP" },
        ],
      },
      {
        name: "Infrastructure Software",
        types: [
          { name: "Database Instance", prefix: "DB" },
          { name: "Middleware Service", prefix: "MW" },
        ],
      },
    ],
  },
  {
    name: "People",
    classes: [
      {
        name: "Workforce",
        types: [
          { name: "Employee", prefix: "EMP" },
          { name: "Contractor", prefix: "CTR" },
        ],
      },
    ],
  },
];

// Per-Type batch size range — varied so the outer ring's segments aren't all
// identical width, tuned so ~17 Types land the overall total at 72 CIs.
const MIN_CIS_PER_TYPE = 2;
const MAX_CIS_PER_TYPE = 6;

// ---------------------------------------------------------------------------
// Generated shape
// ---------------------------------------------------------------------------

export interface CmdbRelationship {
  label: string;
  targetId: string;
}

export interface CmdbCiRecord {
  id: string;
  relationships: CmdbRelationship[];
}

export interface CmdbType {
  name: string;
  cis: CmdbCiRecord[];
}

export interface CmdbClass {
  name: string;
  types: CmdbType[];
}

export interface CmdbCategory {
  name: string;
  classes: CmdbClass[];
}

function generateCisForType(typeName: string, prefix: string): CmdbCiRecord[] {
  const rng = createRng(hashString(typeName));
  const count = rng.int(MIN_CIS_PER_TYPE, MAX_CIS_PER_TYPE);
  const used = new Set<number>();
  const cis: CmdbCiRecord[] = [];
  for (let i = 0; i < count; i++) {
    let n = rng.int(1000, 99999);
    while (used.has(n)) n = rng.int(1000, 99999);
    used.add(n);
    cis.push({
      id: `${prefix}-${String(n).padStart(5, "0")}`,
      relationships: [],
    });
  }
  return cis;
}

// ---------------------------------------------------------------------------
// Relationships — a second pass, run after the full CI tree exists, so each
// relationship can point at a real generated id of a domain-plausible target
// Type (not a same-pass, isolated-per-Type placeholder). Rules are
// hand-curated per Type (real CMDB relationship semantics: a Server connects
// to a Network Switch, depends on Storage, is owned by whoever's accountable
// for it; an app runs on a Server and depends on its Database; a person is
// assigned their device and uses their apps) — up to 3 rules per Type, each
// resolving to one seeded-random CI from the pool of real CIs of that rule's
// target Type(s). Seeded off the CI's own id + the rule's label, so the
// assignment is stable across renders, same determinism guarantee as the
// rest of this generator.
const RELATIONSHIP_RULES: Record<
  string,
  { label: string; targetTypes: string[] }[]
> = {
  Server: [
    { label: "connects to", targetTypes: ["Network Switch"] },
    { label: "depends on", targetTypes: ["Storage Array"] },
    { label: "owned by", targetTypes: ["Employee", "Contractor"] },
  ],
  "Network Switch": [
    { label: "connects to", targetTypes: ["Server"] },
    { label: "owned by", targetTypes: ["Employee", "Contractor"] },
  ],
  "Storage Array": [
    { label: "connects to", targetTypes: ["Server"] },
    { label: "owned by", targetTypes: ["Employee", "Contractor"] },
  ],
  Laptop: [
    { label: "assigned to", targetTypes: ["Employee", "Contractor"] },
    { label: "connects to", targetTypes: ["Network Switch"] },
    { label: "uses", targetTypes: ["SaaS", "On-Prem"] },
  ],
  Desktop: [
    { label: "assigned to", targetTypes: ["Employee", "Contractor"] },
    { label: "connects to", targetTypes: ["Network Switch"] },
    { label: "uses", targetTypes: ["SaaS", "On-Prem"] },
  ],
  "Mobile Device": [
    { label: "assigned to", targetTypes: ["Employee", "Contractor"] },
    { label: "connects to", targetTypes: ["Network Switch"] },
    { label: "uses", targetTypes: ["SaaS", "On-Prem"] },
  ],
  SaaS: [
    { label: "used by", targetTypes: ["Employee", "Contractor"] },
    { label: "depends on", targetTypes: ["Middleware Service"] },
  ],
  "On-Prem": [
    { label: "runs on", targetTypes: ["Server"] },
    { label: "depends on", targetTypes: ["Database Instance"] },
  ],
  "Database Instance": [
    { label: "runs on", targetTypes: ["Server"] },
    { label: "depends on", targetTypes: ["Storage Array"] },
  ],
  "Middleware Service": [
    { label: "runs on", targetTypes: ["Server"] },
    { label: "connects to", targetTypes: ["Database Instance"] },
  ],
  Employee: [
    { label: "assigned", targetTypes: ["Laptop", "Desktop", "Mobile Device"] },
    { label: "uses", targetTypes: ["SaaS", "On-Prem"] },
  ],
  Contractor: [
    { label: "assigned", targetTypes: ["Laptop", "Desktop", "Mobile Device"] },
    { label: "uses", targetTypes: ["SaaS", "On-Prem"] },
  ],
};

// Every distinct relationship label that can ever appear, across all Types —
// so a consumer (CmdbSunburst's relationship pills) can measure every
// possible label once and size every pill to the widest, instead of each
// pill sizing to its own text and jumping width as you hover different CIs.
export const ALL_RELATIONSHIP_LABELS: string[] = Array.from(
  new Set(
    Object.values(RELATIONSHIP_RULES).flatMap((rules) =>
      rules.map((r) => r.label),
    ),
  ),
);

function assignRelationships(data: CmdbCategory[]): void {
  // Flat pool of every generated CI, keyed by its own Type name — the
  // lookup relationship rules resolve targets against.
  const byType = new Map<string, CmdbCiRecord[]>();
  for (const category of data) {
    for (const cls of category.classes) {
      for (const type of cls.types) {
        byType.set(type.name, type.cis);
      }
    }
  }

  for (const category of data) {
    for (const cls of category.classes) {
      for (const type of cls.types) {
        const rules = RELATIONSHIP_RULES[type.name] ?? [];
        for (const ci of type.cis) {
          for (const rule of rules) {
            const pool = rule.targetTypes.flatMap(
              (t) => byType.get(t) ?? [],
            );
            if (pool.length === 0) continue;
            const rng = createRng(hashString(`${ci.id}:${rule.label}`));
            const target = pool[rng.int(0, pool.length - 1)];
            ci.relationships.push({ label: rule.label, targetId: target.id });
          }
        }
      }
    }
  }
}

function buildCmdbData(): CmdbCategory[] {
  const data = TAXONOMY.map((category) => ({
    name: category.name,
    classes: category.classes.map((cls) => ({
      name: cls.name,
      types: cls.types.map((type) => ({
        name: type.name,
        cis: generateCisForType(type.name, type.prefix),
      })),
    })),
  }));
  assignRelationships(data);
  return data;
}

// Memoized — computed once per JS context, same pattern as xops's getDataset().
let _cmdbData: CmdbCategory[] | null = null;
export function getCmdbData(): CmdbCategory[] {
  return (_cmdbData ??= buildCmdbData());
}

export function totalCiCount(data: CmdbCategory[]): number {
  return data.reduce(
    (sum, category) =>
      sum +
      category.classes.reduce(
        (classSum, cls) =>
          classSum + cls.types.reduce((typeSum, type) => typeSum + type.cis.length, 0),
        0,
      ),
    0,
  );
}
