// Lifecycle events — the timeline's data seam. Each event is source-tagged (which upstream
// system it would come from: procurement / hr / publisher / identity / config) so a real
// implementation can plug in per-source event streams later with no UI change. For now the
// events are deterministic-synthetic per SKU: a fixed milestone sequence anchored to the
// product's REAL contract-effective date, with descriptions referencing its real license
// counts. Same product → same events every render.

import type { Dataset } from "./types";
import { productSummary } from "./metrics";
import { formatCount } from "../lib/format";

export type LifecycleEventStage =
  | "procurement"
  | "license-management"
  | "installation"
  | "security"
  | "support";

// Which upstream system the event originates from — the "easily plugged in" seam.
export type LifecycleEventSource = "procurement" | "hr" | "publisher" | "identity" | "config";

export type LifecycleEvent = {
  id: string;
  date: string; // ISO
  stage: LifecycleEventStage;
  source: LifecycleEventSource;
  title: string;
  description: string;
};

const DAY_MS = 86_400_000;

// Ordered oldest → newest; `offset` is days after the contract-effective date. `describe`
// receives the product's real counts so the copy reads true even while the events are synthetic.
type EventTemplate = {
  offset: number;
  stage: LifecycleEventStage;
  source: LifecycleEventSource;
  title: string;
  describe: (counts: { purchased: string; assigned: string; active: string }) => string;
};

const TEMPLATES: EventTemplate[] = [
  { offset: 0, stage: "procurement", source: "procurement", title: "Purchase Request Submitted", describe: (c) => `Request submitted for ${c.purchased} software licenses.` },
  { offset: 2, stage: "procurement", source: "procurement", title: "Purchase Request Approved", describe: (c) => `Finance approved the purchase budget for ${c.purchased} licenses.` },
  { offset: 4, stage: "procurement", source: "procurement", title: "Contract Signed & Order Placed", describe: (c) => `Software contract finalized for ${c.purchased} licenses.` },
  { offset: 6, stage: "support", source: "procurement", title: "Support Contract Activated", describe: () => `Enterprise support enabled under the vendor contract.` },
  { offset: 8, stage: "security", source: "identity", title: "Security Risk Assessment Completed", describe: () => `Initial security review confirmed compliance with internal policies.` },
  { offset: 11, stage: "license-management", source: "publisher", title: "First Licenses Assigned", describe: (c) => `First batch of licenses assigned from ${c.purchased} purchased.` },
  { offset: 14, stage: "security", source: "config", title: "Security Policy Enforced", describe: () => `MFA and SSO authentication enforced for all users.` },
  { offset: 28, stage: "license-management", source: "publisher", title: "Monthly License Assignment Summary", describe: (c) => `${c.assigned} licenses assigned to date.` },
  { offset: 32, stage: "installation", source: "publisher", title: "Monthly Installation Summary", describe: (c) => `${c.active} employees have the software installed.` },
  { offset: 37, stage: "security", source: "identity", title: "Compliance Audit Triggered", describe: (c) => `License-usage review initiated for ${c.purchased} purchased licenses.` },
  { offset: 42, stage: "security", source: "identity", title: "Security Patch Released", describe: () => `Vendor released a critical security patch.` },
  { offset: 56, stage: "installation", source: "publisher", title: "Monthly Installation Report", describe: (c) => `${c.active} installations completed of ${c.assigned} assigned licenses.` },
];

// The timeline's events for one product. Deterministic; newest first.
export function lifecycleEvents(ds: Dataset, sku: string): LifecycleEvent[] {
  const summary = productSummary(ds, sku);
  if (!summary) return [];
  const anchor = new Date(summary.contractEffectiveDate).getTime();
  const counts = {
    purchased: formatCount(summary.purchased),
    assigned: formatCount(summary.assigned),
    active: formatCount(summary.active),
  };

  return TEMPLATES.map((t, i) => ({
    id: `${sku}-evt-${i}`,
    date: new Date(anchor + t.offset * DAY_MS).toISOString(),
    stage: t.stage,
    source: t.source,
    title: t.title,
    description: t.describe(counts),
  })).sort((a, b) => b.date.localeCompare(a.date));
}
