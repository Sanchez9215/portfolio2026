// The product priorities, one per ring / mountain callout, in order: the seven
// MVP items first, then the post-MVP ones. level = fraction of the terrain's
// max height the item sits at (summit highest). opacity: MVP items 1, the rest
// fade step by step. Copy is a first draft from the final designs.
export type PriorityItem = { title: string; body: string; level: number; opacity: number };

export const PRIORITY_ITEMS: PriorityItem[] = [
  { title: "SaaS only", level: 0.88, opacity: 1, body: "Cloud subscriptions hold most of the spend, so Phase 1 starts there." },
  { title: "Underused license cost", level: 0.8, opacity: 1, body: "Seat price × inactive licenses puts a dollar figure on what can be reclaimed." },
  { title: "Utilization status", level: 0.72, opacity: 1, body: "Inactive, unassigned and active licenses become clear status tags." },
  { title: "Inactive distribution", level: 0.64, opacity: 1, body: "Waste by department and cost center, down to the people holding the licenses." },
  { title: "Offboarding reclaim", level: 0.57, opacity: 1, body: "Licenses still assigned to former employees are the quickest wins." },
  { title: "Renewal context", level: 0.5, opacity: 1, body: "Renewal date and countdown show when a decision is due." },
  { title: "Over-assignment", level: 0.43, opacity: 1, body: "Compliance narrowed to the one risk the data could show: more assigned than owned." },
  { title: "Contract terms", level: 0.37, opacity: 0.7, body: "Commitments, minimums and termination clauses need contract data we didn't have yet." },
  { title: "Geographic filtering", level: 0.31, opacity: 0.5, body: "Filtering by region and location shows where licenses and spend sit across the organization." },
  { title: "Server and device footprint", level: 0.26, opacity: 0.35, body: "Installed software across servers and devices waits on integration work." },
  { title: "Other license models", level: 0.21, opacity: 0.2, body: "Open source, perpetual, consumption-based and the rest follow once SaaS is solid." },
];

