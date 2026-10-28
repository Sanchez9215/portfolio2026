// Deterministic requests generator. Same (seed, count) → byte-identical dataset.
//
// Each request is built from a template (employee lane + one runbook per item), laid out on a
// timeline in hours since creation, then "played" up to an as-of cutoff: events at or before it
// have happened, the first unfinished event in a started lane is in progress, the rest are
// planned. A step also waits on its cross-lane trigger. Statuses are NOT stored — they're
// derived from event outcomes (requestMetrics.ts).

import { createRng } from "../generate";
import { EMPLOYEE_LANE } from "./types";
import type {
  EventActor,
  EventOutcome,
  EventSource,
  EventType,
  RequestEvent,
  RequestItemRecord,
  RequestRecord,
  RequestTemplateKey,
  RequestsDataset,
} from "./types";
import { REQUEST_TEMPLATES, type RequestTemplate } from "./runbooks";

export const REQUESTS_AS_OF = new Date("2026-01-14T14:06:00Z");

const HOUR_MS = 3_600_000;
const TRIGGER_LAG_HOURS = 0.5;
const SCRIPTED_REQUEST_ID = "REQ-232";

// Eight-item executive onboardings pinned at known ids, one per stage, so the wide graph can be checked
// in the real prototype. They draw nothing from the rng, so the rest of the dataset is unchanged.
const PINNED_REQUESTS: { id: string; employeeName: string; plan: Plan }[] = [
  { id: "REQ-901", employeeName: "Imani Brooks", plan: { templateKey: "executive-onboarding", mode: "complete", lagHours: 6 } },
  { id: "REQ-902", employeeName: "Julian Ashford", plan: { templateKey: "executive-onboarding", mode: "in-progress", frac: 0.55 } },
  { id: "REQ-903", employeeName: "Sienna Vargas", plan: { templateKey: "executive-onboarding", mode: "in-progress", frac: 0.6, exceptionRunbook: 6, exceptionResolved: false, warningRunbook: 4, warningResolved: false } },
];

type Mode = "open" | "in-progress" | "suspended" | "sla-suspended" | "complete" | "incomplete" | "canceled";

interface Plan {
  templateKey: RequestTemplateKey;
  mode: Mode;
  /** Fraction of the full timeline played (in-progress / sla-suspended / canceled). */
  frac?: number;
  /** Index into the template's runbooks. */
  exceptionRunbook?: number;
  exceptionResolved?: boolean;
  warningRunbook?: number;
  warningResolved?: boolean;
  /** Hours since creation, overriding the mode's own cutoff. */
  elapsedHours?: number;
  /** Complete / incomplete: hours past the last event, overriding the random lag. */
  lagHours?: number;
}

// Raw timeline entry (relative hours) before outcomes are decided.
interface RawEvent {
  lane: string;
  key: string;
  title: string;
  source: EventSource;
  actor: EventActor;
  type: EventType;
  at: number;
  trigger?: string;
  /** "step" always completes by cutoff; the fault kinds decide their own outcome. */
  kind: "step" | "exception-resolved" | "exception-open" | "warning-resolved" | "warning-open" | "resolution" | "frozen";
}

const pad = (n: number) => String(n).padStart(2, "0");

function buildTimeline(template: RequestTemplate, plan: Plan): { raw: RawEvent[]; items: RequestItemRecord[] } {
  const itemLane = template.runbooks.map((_, i) => `ITM-${pad(i + 1)}`);
  type Entry = { lane: string; runbookIndex: number; step: (typeof template.employeeLane)[number]; scaledAt: number };
  const entries: Entry[] = [];
  template.employeeLane.forEach((step) => entries.push({ lane: EMPLOYEE_LANE, runbookIndex: -1, step, scaledAt: step.at * template.pace }));
  template.runbooks.forEach((rb, ri) =>
    rb.steps.forEach((step) => entries.push({ lane: itemLane[ri], runbookIndex: ri, step, scaledAt: step.at * template.pace })),
  );
  entries.sort((a, b) => a.scaledAt - b.scaledAt);

  const laneDelay: Record<string, number> = {};
  const laneLast: Record<string, number> = {};
  const frozen = new Set<string>();
  const timeOf = new Map<string, number>(); // step key → relative hour (for trigger waits)
  const raw: RawEvent[] = [];

  for (const { lane, runbookIndex, step, scaledAt } of entries) {
    const triggerAt = step.trigger ? timeOf.get(step.trigger) : undefined;
    const at = Math.max(
      scaledAt + (laneDelay[lane] ?? 0),
      triggerAt !== undefined ? triggerAt + TRIGGER_LAG_HOURS : 0,
      (laneLast[lane] ?? -1) + 0.05,
    );
    const base = { lane, actor: step.actor ?? "system", type: step.type ?? "automation" } as const;
    const stepEvent = (t: number, kind: RawEvent["kind"]): RawEvent => ({
      ...base,
      key: step.key,
      title: step.title,
      source: step.source,
      at: t,
      trigger: step.trigger,
      kind,
    });
    const rb = runbookIndex >= 0 ? template.runbooks[runbookIndex] : undefined;

    if (frozen.has(lane)) {
      raw.push(stepEvent(at, "frozen"));
      timeOf.set(step.key, at);
      laneLast[lane] = at;
      continue;
    }

    if (rb && plan.warningRunbook === runbookIndex && rb.warning.atStep === step.key) {
      const resolved = plan.warningResolved ?? false;
      raw.push({
        lane,
        key: `${step.key}-warning`,
        title: rb.warning.title,
        source: rb.warning.source,
        actor: "system",
        type: "notification",
        at: at - 0.05,
        kind: resolved ? "warning-resolved" : "warning-open",
      });
      if (!resolved) {
        // Lane waits on the warning; the step itself is planned behind it.
        frozen.add(lane);
        raw.push(stepEvent(at, "frozen"));
        timeOf.set(step.key, at);
        laneLast[lane] = at;
        continue;
      }
    }

    if (rb && plan.exceptionRunbook === runbookIndex && rb.exception.atStep === step.key) {
      const resolved = plan.exceptionResolved ?? false;
      const delay = (rb.exception.resolution?.delayHours ?? 12) * template.pace;
      raw.push({
        lane,
        key: `${step.key}-exception`,
        title: rb.exception.title,
        source: rb.exception.source,
        actor: "system",
        type: "exception",
        at: at - 0.05,
        kind: resolved ? "exception-resolved" : "exception-open",
      });
      laneDelay[lane] = (laneDelay[lane] ?? 0) + delay;
      if (resolved && rb.exception.resolution) {
        raw.push({
          lane,
          key: `${step.key}-resolution`,
          title: rb.exception.resolution.title,
          source: rb.exception.source,
          actor: rb.exception.resolution.actor,
          type: rb.exception.resolution.type,
          at: at + Math.min(1, delay / 2),
          kind: "resolution",
        });
        const resolvedAt = at + delay;
        raw.push(stepEvent(resolvedAt, "step"));
        timeOf.set(step.key, resolvedAt);
        laneLast[lane] = resolvedAt;
      } else {
        frozen.add(lane);
        const plannedAt = at + delay;
        raw.push(stepEvent(plannedAt, "frozen"));
        timeOf.set(step.key, plannedAt);
        laneLast[lane] = plannedAt;
      }
      continue;
    }

    raw.push(stepEvent(at, "step"));
    timeOf.set(step.key, at);
    laneLast[lane] = at;
  }

  const items: RequestItemRecord[] = template.runbooks.map((rb, i) => ({
    id: itemLane[i],
    requestId: "",
    runbookName: rb.runbookName,
    domain: rb.domain,
  }));
  return { raw, items };
}

function playOutcomes(raw: RawEvent[], cutoff: number): Map<RawEvent, EventOutcome> {
  const ordered = [...raw].sort((a, b) => a.at - b.at);
  const outcome = new Map<RawEvent, EventOutcome>();
  const completeKeys = new Set<string>();
  const blocked = new Set<string>();

  for (const ev of ordered) {
    let o: EventOutcome = "planned";
    const triggerDone = !ev.trigger || completeKeys.has(ev.trigger);
    if (ev.kind === "exception-open") {
      o = ev.at <= cutoff ? "exception" : "planned";
      if (o === "exception") blocked.add(ev.lane);
    } else if (ev.kind === "warning-open") {
      o = ev.at <= cutoff ? "warning" : "planned";
      if (o === "warning") blocked.add(ev.lane);
    } else if (ev.kind !== "frozen" && !blocked.has(ev.lane) && ev.at <= cutoff && triggerDone) {
      o = "complete";
    }
    outcome.set(ev, o);
    if (o === "complete" && ev.kind === "step") completeKeys.add(ev.key);
  }

  // Frontier: first unfinished event in a started, unblocked lane is in progress.
  const lanes = Array.from(new Set(ordered.map((e) => e.lane)));
  for (const lane of lanes) {
    if (blocked.has(lane)) continue;
    const laneEvents = ordered.filter((e) => e.lane === lane);
    const started = laneEvents.some((e) => outcome.get(e) === "complete");
    if (!started) continue;
    const next = laneEvents.find((e) => outcome.get(e) === "planned");
    if (next) outcome.set(next, "in-progress");
  }
  return outcome;
}

const FIRST_NAMES = ["Avery", "Jordan", "Priya", "Marcus", "Elena", "Tomas", "Noor", "Kenji", "Amara", "Luca", "Sofia", "Daniel", "Mei", "Rahul", "Hannah", "Omar"];
const LAST_NAMES = ["Nguyen", "Okafor", "Brandt", "Castillo", "Haddad", "Lindqvist", "Moreau", "Patel", "Reyes", "Sato", "Thompson", "Varga", "Whitfield", "Yilmaz"];

// Deterministic (no RNG draw, so adding it doesn't shift the rest of the dataset).
function requestorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `${FIRST_NAMES[h % FIRST_NAMES.length]} ${LAST_NAMES[(h >>> 4) % LAST_NAMES.length]}`;
}

function planFor(rng: ReturnType<typeof createRng>, id: string, scripted: boolean): Plan {
  if (scripted) {
    return { templateKey: "vip-onboarding", mode: "in-progress", exceptionRunbook: 0, exceptionResolved: false, elapsedHours: 14 };
  }
  const templateKey = rng.weighted<RequestTemplateKey>([
    { value: "vip-onboarding", weight: 3 },
    { value: "remote-onboarding", weight: 4 },
    { value: "offboarding", weight: 3 },
  ]);
  const mode = rng.weighted<Mode>([
    { value: "open", weight: 8 },
    { value: "in-progress", weight: 34 },
    { value: "suspended", weight: 8 },
    { value: "sla-suspended", weight: 3 },
    { value: "complete", weight: 30 },
    { value: "incomplete", weight: 8 },
    { value: "canceled", weight: 9 },
  ]);
  const runbookCount = REQUEST_TEMPLATES[templateKey].runbooks.length;
  const plan: Plan = { templateKey, mode, frac: rng.float(0.15, 0.9) };

  // Lanes nothing else waits on (device deployment gates software; offboarding access gates reclaim).
  const standaloneRunbooks = templateKey === "offboarding" ? [2, 3] : templateKey === "vip-onboarding" ? [1, 3] : [2];
  if (mode === "suspended" || mode === "incomplete") {
    plan.exceptionRunbook = rng.pick(standaloneRunbooks);
    plan.exceptionResolved = false;
  } else if (mode === "in-progress") {
    if (rng.chance(0.25)) {
      plan.exceptionRunbook = rng.int(0, runbookCount - 1);
      plan.exceptionResolved = false;
    }
    if (rng.chance(0.3)) {
      plan.warningRunbook = rng.int(0, runbookCount - 1);
      plan.warningResolved = false;
    }
  } else if (mode === "complete" && rng.chance(0.3)) {
    if (rng.chance(0.5)) {
      plan.exceptionRunbook = rng.int(0, runbookCount - 1);
      plan.exceptionResolved = true;
    } else {
      plan.warningRunbook = rng.int(0, runbookCount - 1);
      plan.warningResolved = true;
    }
  }
  void id;
  return plan;
}

export interface RequestGenerateOptions {
  seed?: number;
  count?: number;
}

export function buildRequestsDataset(options: RequestGenerateOptions = {}): RequestsDataset {
  const seed = options.seed ?? 20260114;
  const count = options.count ?? 200;
  const rng = createRng(seed);
  const asOfMs = REQUESTS_AS_OF.getTime();

  const requests: RequestRecord[] = [];
  const events: RequestEvent[] = [];

  let nextNumber = 100;
  for (let n = 0; n < count + PINNED_REQUESTS.length; n++) {
    const pinned = PINNED_REQUESTS[n - count];
    const scripted = n === 0;
    let id: string;
    if (pinned) id = pinned.id;
    else if (scripted) id = SCRIPTED_REQUEST_ID;
    else {
      do id = `REQ-${nextNumber++}`;
      while (id === SCRIPTED_REQUEST_ID);
    }
    const plan = pinned ? pinned.plan : planFor(rng, id, scripted);
    const template = REQUEST_TEMPLATES[plan.templateKey];
    const { raw, items } = buildTimeline(template, plan);

    // Choose the cutoff (hours since creation) from the mode.
    const fullDuration = Math.max(...raw.map((e) => e.at));
    const firstItemAt = Math.min(...raw.filter((e) => e.lane !== EMPLOYEE_LANE).map((e) => e.at));
    const openFaultAt = Math.max(0, ...raw.filter((e) => e.kind === "exception-open" || e.kind === "warning-open").map((e) => e.at));
    let elapsed: number;
    if (plan.elapsedHours !== undefined) elapsed = plan.elapsedHours;
    else if (plan.mode === "open") elapsed = firstItemAt * 0.5;
    else if (plan.mode === "complete" || plan.mode === "incomplete") {
      const lag = plan.lagHours ?? (rng.chance(0.4) ? rng.float(0, 10) : rng.float(10, 240));
      elapsed = fullDuration + lag;
    } else if (plan.mode === "suspended") elapsed = fullDuration + rng.float(0, 6);
    else if (plan.mode === "canceled") elapsed = Math.max(firstItemAt, (plan.frac ?? 0.3) * 0.6 * fullDuration);
    else elapsed = Math.max((plan.frac ?? 0.5) * fullDuration, openFaultAt + 1);

    const createdMs = asOfMs - elapsed * HOUR_MS;
    const outcomes = playOutcomes(raw, elapsed);

    const closure = plan.mode === "incomplete" ? "incomplete" : plan.mode === "canceled" ? "canceled" : undefined;
    const suspended = plan.mode === "sla-suspended" ? true : undefined;
    const employeeName = pinned ? pinned.employeeName : scripted ? "Stebin Ben" : `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;

    const requestEvents = [...raw];
    if (suspended) {
      const slaEvent: RawEvent = {
        lane: EMPLOYEE_LANE,
        key: "sla-at-risk",
        title: "SLA At Risk",
        source: "itsm",
        actor: "system",
        type: "notification",
        at: Math.max(0, elapsed - 1),
        kind: "warning-open",
      };
      requestEvents.push(slaEvent);
      outcomes.set(slaEvent, "warning");
    }

    const idByKey = new Map<string, string>();
    const sorted = [...requestEvents].sort((a, b) => a.at - b.at);
    sorted.forEach((ev, i) => idByKey.set(ev.key, `${id}-E${pad(i + 1)}`));
    sorted.forEach((ev, i) => {
      const outcome = outcomes.get(ev) ?? "planned";
      events.push({
        id: `${id}-E${pad(i + 1)}`,
        requestId: id,
        lane: ev.lane,
        title: ev.title,
        at: new Date(createdMs + ev.at * HOUR_MS).toISOString(),
        source: ev.source,
        actor: ev.actor,
        type: ev.type,
        outcome,
        triggeredBy: ev.trigger ? idByKey.get(ev.trigger) : undefined,
      });
    });

    requests.push({
      id,
      templateKey: plan.templateKey,
      name: template.name,
      employeeName,
      requestorName: requestorFor(id),
      createdAt: new Date(createdMs).toISOString(),
      closure,
      suspended,
      slaTargetHours: template.slaTargetHours,
      items: items.map((item) => ({ ...item, requestId: id })),
    });
  }

  return { generatedAt: REQUESTS_AS_OF.toISOString(), seed, requests, events };
}

let _dataset: RequestsDataset | null = null;
export function getRequestsDataset(): RequestsDataset {
  return (_dataset ??= buildRequestsDataset());
}
