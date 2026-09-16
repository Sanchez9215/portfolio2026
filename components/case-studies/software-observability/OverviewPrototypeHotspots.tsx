"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
// import HoverRevealOverlay from "@/components/HoverRevealOverlay"; — disabled for now,
// trying the AnnotationConnectorHotspot style instead (see below).
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";
import OverviewLegacy from "@/design-systems/xops/legacy/OverviewLegacy";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import { PlayerState, TimelineMilestone } from "./Timeline";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";
import pageStyles from "@/app/work/software-observability/software-observability.module.css";

// Hotspot copy: final Assumption/Insight lines from the user (see
// .claude/projects/software-observability/PLAN.md, "Hotspot Annotation System").
// Over-Assignment is intentionally skipped.
const HOTSPOTS: Hotspot[] = [
  {
    id: "geographic-filtering",
    title: "Region & Org Structure Filters",
    label: "Assumption",
    body: "When operational events point to a specific region or org unit, filters let stakeholders focus on the software and vendors driving exposure.",
    insight:
      "Compliance and usage terms vary by region. Without a legal foundation, regional data can mislead teams.",
    placement: "right-top",
  },
  {
    id: "licensing-model-breakdown",
    title: "Licensing Model Breakdown",
    label: "Assumption",
    body: "Commercial vs. Open Source licenses would provide stakeholders with an informative split of their portfolio due to clear distinction in cost and compliance.",
    insight:
      "Enterprise software relies on multi-year contracts. Analyzing risk required key licensing models I had missed (enterprise agreements, subscriptions, perpetual, and consumption-based terms).",
  },
  {
    id: "expiring-licenses",
    title: "Expiring Licenses",
    label: "Assumption",
    body: "License expirations were a primary signal for upcoming renewals needs.",
    insight:
      "Individual license expiration is irrelevant. Contract end-dates and true-up window tracking provide the real value.",
  },
  {
    id: "inactivity-threshold",
    title: "Inactivity Threshold",
    label: "Assumption",
    body: "Thresholds vary across software types. I set 60 days as the default middle ground to start the discussion.",
    insight:
      "A consistent baseline mattered more than precision per title at this phase, which could come later through configurability.",
    placement: "below-left",
  },
  {
    id: "compliance-granularity",
    title: "Compliance Granularity",
    label: "Assumption",
    body: "Broke compliance down into a set of basic states thinking a ratio view at this level would be a valuable health indicator.",
    insight:
      "Compliance was more complex than basic status label. Operators needed specific root conditions to direct action.",
  },
  {
    id: "stage-level-alerting",
    title: "Stage-Level Alerting",
    label: "Assumption",
    body: "Proposed stage-level alerts as a proactive layer to the dashboard, helping catch software stuck at a stage or trending toward an issue before it became one.",
    insight:
      "The direction resonated strongly with leadership, building on our core differentiator to deliver a system of intelligence.",
    targetIds: ["alert-button", "stage-level-alerting-rows"],
    // Left side of the alert button, top-aligned, sharp corner pointing right at it.
    placement: "left-top",
    // 2 beats, scrubbed as 2 slots: (0) highlight the alert button + flagged rows,
    // (1) open the alert detail modal — stays open, unchanged, until the pin
    // releases and the whole section scrolls away (see overlayActive below).
    subBeats: 2,
  },
  {
    id: "lifecycle-stage-terms",
    title: "Lifecycle Stages",
    label: "Assumption",
    body: "Proposed a set of stages that reflected an industry standard, general enough to apply across different organizations.",
    insight:
      "There wasn't an industry standard. Stage sets varied widely across tools and organizations.",
    placement: "below-left",
  },
];

const ALERTING_INDEX = HOTSPOTS.findIndex(
  (h) => h.id === "stage-level-alerting",
);
const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

// Card-by-card player: flat duration per card, regardless of content length.
const CARD_DURATION_MS = 3000;
// How long the embed holds on Prototype 02 with no tooltip after switching,
// before Decisions cards start.
const SWITCH_HOLD_MS = 3000;

// AnnotationConnectorHotspot data, derived once from HOTSPOTS above (module-level,
// so it's a stable reference — an inline .map() in the render would recreate the
// array every render and re-trigger the component's measurement effect constantly).
// stage-level-alerting has two targetIds (button + rows); this simplified connector
// only supports one target per hotspot, so it uses the first (the button).
const REAL_ANNOTATION_HOTSPOTS: AnnotationHotspotData[] = HOTSPOTS.map(
  (h) => ({
    // Stage-Level Alerting points at the alert modal itself instead of the
    // alert button, matching the scroll sequence's own beat-1 retargeting once
    // the modal is open. The modal portals into the same embed container this
    // component already queries (see AlertsPanel's boundsRef), so no special
    // cross-container lookup is needed here.
    targetId:
      h.id === "stage-level-alerting"
        ? "alert-modal"
        : (h.targetIds?.[0] ?? h.id),
    title: h.title,
    label: h.label ?? "",
    body: h.body,
    insightLabel: "Insight",
    insight: h.insight ?? "",
    // Geographic Filtering, Expiring Licenses, Lifecycle Stage Terms,
    // Inactivity Threshold, and Compliance Granularity (the pie-chart card)
    // flipped to the opposite (top-left) corner per user request.
    flip:
      h.id === "geographic-filtering" ||
      h.id === "expiring-licenses" ||
      h.id === "lifecycle-stage-terms" ||
      h.id === "inactivity-threshold" ||
      h.id === "compliance-granularity",
    // Licensing Model Breakdown and Expiring Licenses share one spotlight
    // cutout (the whole License Overview card) while keeping their own
    // individual connector anchors.
    spotlightId:
      h.id === "licensing-model-breakdown" || h.id === "expiring-licenses"
        ? "license-overview"
        : h.id === "inactivity-threshold"
          ? "usage-overview"
          : h.id === "lifecycle-stage-terms"
            ? "lifecycle-stage-scope"
            : undefined,
    // No inset padding, and radius matches the card's own --xops-radius-12
    // (design-systems/xops/legacy/OverviewLegacy.module.css's .panel /
    // Card.module.css's .card — same token, same 12px value). Stage-Level
    // Alerting (the modal) also gets no inset padding per user request.
    spotlightPadding:
      h.id === "licensing-model-breakdown" ||
      h.id === "inactivity-threshold" ||
      h.id === "lifecycle-stage-terms" ||
      h.id === "compliance-granularity" ||
      h.id === "stage-level-alerting"
        ? 0
        : undefined,
    spotlightRadius:
      h.id === "licensing-model-breakdown" ||
      h.id === "inactivity-threshold" ||
      h.id === "lifecycle-stage-terms" ||
      h.id === "compliance-granularity"
        ? 12
        : undefined,
    // Cutout spans the whole card down through only the first 5 table rows —
    // capped by the 5th row's live bottom edge, not the card's real full height
    // (see AnnotationConnectorHotspot's spotlightBottomSelector).
    spotlightBottomSelector:
      h.id === "lifecycle-stage-terms"
        ? "table tbody tr:nth-child(5)"
        : undefined,
  }));

// Card-by-card player groups hotspots that share a spotlight (e.g. Licensing
// Model Breakdown + Expiring Licenses both point at the License Overview
// card) into a single step, showing all of that group's tooltips at once —
// generalized off spotlightId/targetId rather than hardcoded to License
// Overview specifically, so any other current or future shared-card group
// gets the same treatment automatically. Built below, once every hotspot
// group (including Usage/Spend/Non-Compliant) has been declared.

// Cutout-only entry — spotlights the alert button itself (the trigger)
// alongside stage-level-alerting's own spotlight on the modal it opens. No
// connector/tooltip of its own; targetId defaults to its own spotlightId, so
// it's a separate cutout hole, not merged with the modal's.
const ALERT_BUTTON_ANNOTATION_HOTSPOT: AnnotationHotspotData = {
  targetId: "alert-button",
  title: "",
  label: "",
  body: "",
  insightLabel: "",
  insight: "",
  cutoutOnly: true,
};

// Two hotspots pointing at Assigned Licenses and License Utilization — share
// the Usage card's existing usage-overview spotlight cutout, same as
// inactivity-threshold above. Usage card hidden for now (see filter above);
// kept here, unrendered, data untouched.
const USAGE_ANNOTATION_HOTSPOTS: AnnotationHotspotData[] = [
  {
    targetId: "assigned-licenses",
    title: "Assigned vs. Unassigned",
    label: "Assumption",
    body: "A breakdown of purchased licenses to identify how many have been distributed vs. remaining on the shelf, helping highlight excess purchasing or slow assignment rates.",
    insightLabel: "Insight",
    insight: "",
    spotlightId: "usage-overview",
    flip: true,
  },
  {
    targetId: "license-utilization",
    title: "License Utilization",
    label: "Assumption",
    body: "Visualizes the breakdown of assigned licenses into active vs. inactive states, in the context of those left unassigned, letting operators understand the proportion of waste and reclamation opportunity at a glance.",
    insightLabel: "Insight",
    insight: "",
    spotlightId: "usage-overview",
  },
];

// Two placeholder hotspots (lorem ipsum copy, not yet real content) pointing at
// the Spend card's Total Annual Spend + Est. Renewals stats (one shared anchor,
// grouped by their existing wrapper div), and its Top Spend By Vendor table.
// Both share the Spend card's own spend-overview spotlight cutout.
const SPEND_ANNOTATION_HOTSPOTS: AnnotationHotspotData[] = [
  {
    targetId: "spend-stats",
    title: "Spend & Renewal",
    label: "Assumption",
    body: "Total spend baseline alongside estimated renewal amount in next 90 days gives stakeholders enough time to act and negotiate.",
    insightLabel: "Insight",
    insight: "",
    spotlightId: "spend-overview",
    // No inset padding, radius matches the card's own --xops-radius-12, same
    // convention as License Overview/Usage/Compliance.
    spotlightPadding: 0,
    spotlightRadius: 12,
  },
  {
    targetId: "top-spend-vendor",
    title: "Top 10 Vendors",
    label: "Assumption",
    body: "Reflects Chief Product Officer guidance (former Fortune 500 CIO), that a small number of vendors usually drive 60–80% of total spend. We settled on top 10.",
    insightLabel: "Insight",
    insight: "",
    spotlightId: "spend-overview",
    flip: true,
  },
];

// Placeholder hotspot (lorem ipsum copy, not yet real content) for the Top
// Non-Compliant Software card — shares no cutout with compliance-granularity
// (a separate card), so no spotlightId override needed.
const TOP_NON_COMPLIANT_ANNOTATION_HOTSPOT: AnnotationHotspotData = {
  targetId: "top-non-compliant",
  title: "Non-Compliance Concentration",
  label: "Assumption",
  body: "Showing where non-compliant instances concentrate helped stakeholders see exactly which titles were driving exposure, instead of guessing where to start.",
  insightLabel: "Insight",
  insight: "",
  spotlightPadding: 0,
  spotlightRadius: 12,
  // Attached to the card's right corner (default, unflipped) — Compliance's
  // own pie-chart card is flipped to the left, per user request.
};

// All hotspots visible at once, except stage-level-alerting (its own
// connector/tooltip targets the alert modal, hidden for now — the alert
// button's own cutout stays visible via ALERT_BUTTON_ANNOTATION_HOTSPOT) —
// data untouched, kept for reference (superseded by the card-by-card player,
// which walks REAL_ANNOTATION_HOTSPOTS one at a time instead).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ANNOTATION_HOTSPOTS: AnnotationHotspotData[] = [
  ...REAL_ANNOTATION_HOTSPOTS.filter((h) => h.targetId !== "alert-modal"),
  ALERT_BUTTON_ANNOTATION_HOTSPOT,
  ...USAGE_ANNOTATION_HOTSPOTS,
  ...SPEND_ANNOTATION_HOTSPOTS,
  TOP_NON_COMPLIANT_ANNOTATION_HOTSPOT,
];

// Groups a flat hotspot list into steps by shared spotlight (spotlightId,
// falling back to targetId) — one step per unique key, in first-appearance
// order, showing every tooltip in that group simultaneously under one
// spotlight. Shared by both CARD_GROUPS and DECISION_CARD_GROUPS below.
function groupBySpotlight(
  flat: AnnotationHotspotData[],
): AnnotationHotspotData[][] {
  const order: string[] = [];
  const groups = new Map<string, AnnotationHotspotData[]>();
  flat.forEach((h) => {
    const key = h.spotlightId ?? h.targetId;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(h);
  });
  return order.map((key) => groups.get(key)!);
}

// Card-by-card player groups hotspots that share a spotlight (e.g. Licensing
// Model Breakdown + Expiring Licenses both point at the License Overview
// card) into a single step, showing all of that group's tooltips at once —
// generalized off spotlightId/targetId rather than hardcoded to License
// Overview specifically, so any other current or future shared-card group
// gets the same treatment automatically. Usage/Spend/Non-Compliant (each
// written but previously unwired, see ANNOTATION_HOTSPOTS above) are spliced
// in here at their card's real position in the dashboard's own layout
// (License Overview / Usage / Spend row, then Compliance / Top Non-Compliant
// row — see OverviewLegacy.tsx's own "Card row 1"/"Card row 2" comments) —
// Usage's two entries land right after inactivity-threshold and merge into
// its existing usage-overview group (one spotlight, all three tooltips at
// once); Spend and Non-Compliant are brand new groups/steps.
const CARD_GROUPS: AnnotationHotspotData[][] = groupBySpotlight(
  (() => {
    const flat: AnnotationHotspotData[] = [];
    REAL_ANNOTATION_HOTSPOTS.forEach((h) => {
      flat.push(h);
      if (h.targetId === "inactivity-threshold") {
        flat.push(...USAGE_ANNOTATION_HOTSPOTS, ...SPEND_ANNOTATION_HOTSPOTS);
      }
      if (h.targetId === "compliance-granularity") {
        flat.push(TOP_NON_COMPLIANT_ANNOTATION_HOTSPOT);
      }
    });
    return flat;
  })(),
);

// Decisions phase — the 7 "Decision" hotspots from the (now-superseded, kept
// only for reference) OverviewPrototype2Hotspots.tsx, migrated to this card
// player's mechanism and its live OverviewScreen embed. Only body is used —
// there's no separate Decision "insight" pass. Placement/flip values are
// carried over as a best-guess mapping from the old Hotspot.placement values
// (left/below-left → flip: true) — not yet visually confirmed, same "blind
// pass" status as this file's other freshly-wired groups.
const DECISION_ANNOTATION_HOTSPOTS: AnnotationHotspotData[] = [
  {
    targetId: "geographic-filtering",
    title: "Geographic Filtering",
    label: "Decision",
    body: "Removed to avoid surfacing misleading data without the proper legal and technical foundation in place.",
    insightLabel: "",
    insight: "",
    flip: true,
  },
  {
    targetId: "licensing-model-breakdown",
    title: "Licensing Model Breakdown",
    label: "Decision",
    body: "Redesigned the License Overview card to break down total spend by licensing model, and elevated its placement in the hierarchy to reflect its value as a primary signal for portfolio decisions.",
    insightLabel: "",
    insight: "",
    // Header + first 3 rows only, not the whole table — widthFromSelector hugs
    // the card's own left/right edges instead of the rows', which can render
    // wider than the card (table's own horizontal scroll).
    targetSelectors: [
      '[data-hotspot="licensing-model-breakdown"] > div:first-child, [data-hotspot="licensing-model-breakdown"] tbody tr:nth-child(-n+3)',
    ],
    widthFromSelector: '[data-hotspot="licensing-model-breakdown"]',
    spotlightPadding: 0,
    spotlightRadius: 12,
    flip: true,
  },
  {
    // Shares the License Utilization card's spotlight with inactivity-threshold
    // below (per user request — one step, both tooltips at once).
    targetId: "license-utilization-card",
    title: "Expiring Licenses",
    label: "Decision",
    body: "Removed expiring license insight and reframed it to be based on contract-level data. Renewal data would be found within the Renewal stage tab and eventually within Software Profiles.",
    insightLabel: "",
    insight: "",
    spotlightId: "license-utilization-card",
    spotlightPadding: 0,
    spotlightRadius: 12,
  },
  {
    // The portaled Inactive-tooltip panel — forced open only during this
    // step (see decisionForceInactiveTooltip below), same "force external UI
    // open for this card" pattern as stage-level-alerting's alert modal.
    // documentScoped since the panel isn't a descendant of the embed
    // container; querying document-wide also picks up the legend rows that
    // share this same data-hotspot id (union, per the old system's own
    // "unioned with the Inactive/Unassigned legend rows" comment).
    targetId: "inactivity-threshold-tooltip",
    title: "Inactivity Threshold",
    label: "Decision",
    body: "Adjusted default to 90 days as the baseline until title-level configurability could be introduced. Educational tooltips later surfaced this information so users understood how inactivity was being measured.",
    insightLabel: "",
    insight: "",
    spotlightId: "license-utilization-card",
    documentScoped: true,
  },
  {
    targetId: "compliance-granularity",
    title: "Compliance Granularity",
    label: "Decision",
    body: "Replaced status-based groupings with non-compliance type, surfacing shadow IT, version and edition mismatch, and duplicate assignments as the primary signals.",
    insightLabel: "",
    insight: "",
    flip: true,
  },
  {
    targetId: "lifecycle-stages",
    title: "Lifecycle Stages",
    label: "Decision",
    body: "Refined the stage set in close collaboration with our CPO to accurately reflect the operational language and pain points of enterprise IT organizations.",
    insightLabel: "",
    insight: "",
    flip: true,
  },
  {
    targetId: "stage-level-alerting",
    title: "Stage-Level Alerting",
    label: "Decision",
    body: "Deprioritized for the current phase and flagged as a strategic opportunity for a later release.",
    insightLabel: "",
    insight: "",
    // Header + first 5 rows only, not the whole table — same widthFromSelector
    // convention as licensing-model-breakdown above.
    targetSelectors: [
      '[data-hotspot="stage-level-alerting"] > p, [data-hotspot="stage-level-alerting"] tbody tr:nth-child(-n+5)',
    ],
    widthFromSelector: '[data-hotspot="stage-level-alerting"]',
    spotlightPadding: 0,
    spotlightRadius: 12,
    flip: true,
  },
];

const DECISION_CARD_GROUPS: AnnotationHotspotData[][] = groupBySpotlight(
  DECISION_ANNOTATION_HOTSPOTS,
);

interface OverviewPrototypeHotspotsProps {
  /** Renders the static live embed only, skipping the scroll-pin/hotspot-overlay
   *  walkthrough entirely — for placements (e.g. side-by-side with Prototype 2)
   *  that aren't ready for the interactive sequence yet. */
  disableHotspots?: boolean;
  /** Fires whenever the card player's current Timeline milestone changes
   *  (see Timeline.tsx) — lets a sibling Timeline component in page.tsx track
   *  this player's phase without owning any of its state itself. */
  onMilestoneChange?: (milestone: TimelineMilestone) => void;
  /** Bumped (any change, value itself is unused) alongside jumpTarget to jump
   *  straight to that milestone — e.g. clicking one of the Timeline's rows,
   *  or its Prototype 02 thumbnail (always targets "decisions"). */
  jumpToken?: number;
  jumpTarget?: TimelineMilestone;
  /** Fires whenever countdown/exited/started (or the identity of the 3
   *  handler functions, which change every render) changes — lets the
   *  sidebar's player block (see Timeline.tsx) read and drive this
   *  component's countdown/button state without owning any of it, same
   *  onMilestoneChange-style relationship as the milestone prop above. */
  onPlayerStateChange?: (state: PlayerState) => void;
}

export default function OverviewPrototypeHotspots({
  disableHotspots = false,
  onMilestoneChange,
  jumpToken,
  jumpTarget,
  onPlayerStateChange,
}: OverviewPrototypeHotspotsProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  // Empty beat list makes the hook no-op (no ScrollTrigger/pin created) — see
  // useScrollHotspotSequence's own early return on slotCount === 0.
  const { activeIndex, subBeatIndex, settled } = useScrollHotspotSequence(
    pinRef,
    disableHotspots ? [] : SUB_BEATS_LIST,
  );
  const active =
    !disableHotspots && activeIndex !== null ? HOTSPOTS[activeIndex] : null;

  // Pre-walkthrough countdown (embed variant only) — starts once the fade-in
  // ScrollTrigger below fires (not on mount), ticks 3 → 0 once, then holds at
  // 0 until the card-by-card advance logic (not built yet) takes over. No
  // segments are filled during the countdown itself.
  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (!disableHotspots || countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [disableHotspots, countdown]);

  // Card-by-card reveal (embed variant only) — starts once the countdown
  // above hits 0. -1 = no active card (countdown still running/hasn't fired,
  // or mid-"switching" hold with nothing to spotlight yet). Four phases:
  // intent (CARD_GROUPS, body text) → insights (same CARD_GROUPS, insight
  // text) → switching (embed swaps to Prototype 02, holds, no active card) →
  // decisions (DECISION_CARD_GROUPS, on the Prototype 02 embed) — holds
  // forever once decisions' last card is reached.
  const [phase, setPhase] = useState<
    "intent" | "insights" | "switching" | "decisions"
  >("intent");
  const [cardStep, setCardStep] = useState(-1);
  // Only the very first kickoff (post pre-walkthrough countdown) — guarded to
  // "intent" specifically since cardStep is also -1 during the later
  // "switching" hold, which must NOT be reinterpreted as this same kickoff.
  useEffect(() => {
    if (disableHotspots && phase === "intent" && countdown === 0 && cardStep === -1) {
      setCardStep(0);
    }
  }, [disableHotspots, phase, countdown, cardStep]);

  // The active phase's own group list — intent/insights share CARD_GROUPS
  // (just swapping which text renders, see showInsight below); switching has
  // no cards at all.
  const currentGroups = useMemo(() => {
    if (phase === "decisions") return DECISION_CARD_GROUPS;
    if (phase === "switching") return [];
    return CARD_GROUPS;
  }, [phase]);

  // Timeline milestone — "prototype1" covers both the pre-walkthrough
  // countdown and the very start of "intent" (cardStep -1), matching the
  // Figma spec's first row (the un-annotated view before cards start);
  // "switching" maps to "prototype2" since that's the embed-swap/hold beat.
  const milestone: TimelineMilestone =
    phase === "intent" && cardStep < 0
      ? "prototype1"
      : phase === "switching"
        ? "prototype2"
        : phase;
  useEffect(() => {
    onMilestoneChange?.(milestone);
  }, [milestone, onMilestoneChange]);

  // Paused via Space (see keyboard controls below) — freezes auto-advance;
  // resuming restarts the current card's full duration rather than tracking
  // remaining time (simplification for this first pass).
  const [paused, setPaused] = useState(false);

  // Exit/Start Walkthrough (see ImgCard's embed header) — exited shows the
  // bare free-view state (no overlay/tooltips, no auto-advance). Starting
  // again restarts from the top (card 0) rather than resuming where it left
  // off, but jumps straight in — no countdown replay, since the countdown
  // is a first-visit "get ready" beat, not something to repeat every time
  // someone re-enters after exiting.
  const [exited, setExited] = useState(false);
  const handleExitWalkthrough = () => setExited(true);
  const handleStartWalkthrough = () => {
    setExited(false);
    setPhase("intent");
    setCardStep(0);
    setCountdown(null);
  };
  // Start Now — skips the rest of the countdown, jumps straight to card 0.
  // Same "jump to 0, clear countdown" mechanic as handleStartWalkthrough,
  // just without touching `exited` (this fires from within the countdown
  // phase itself, not after exiting).
  const handleStartNow = () => {
    setPhase("intent");
    setCardStep(0);
    setCountdown(null);
  };

  // Reports countdown/exited/started (+ the 3 handlers above, whose identity
  // changes every render since they're plain closures, not memoized — fine
  // here, this just means the parent's player-state object is a fresh
  // reference each time, not a stale-closure hazard) up to
  // OverviewPrototypeSection so the sidebar can render/drive them — same
  // onMilestoneChange pattern already used for the milestone prop.
  useEffect(() => {
    onPlayerStateChange?.({
      countdown,
      exited,
      started: cardStep >= 0,
      onStartNow: handleStartNow,
      onExitWalkthrough: handleExitWalkthrough,
      onStartWalkthrough: handleStartWalkthrough,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, exited, cardStep, onPlayerStateChange]);

  // Jump straight to any milestone — e.g. clicking one of the Timeline's
  // rows, or its Prototype 02 thumbnail (always targets "decisions"). Skips
  // the very first render (token's initial value shouldn't itself trigger a
  // jump); only actual token changes count, via the same "compare to
  // last-seen value" ref pattern rather than an isFirstRender flag, so a
  // caller that starts the token above 0 still works correctly.
  const lastJumpToken = useRef(jumpToken);
  useEffect(() => {
    if (
      jumpToken === undefined ||
      jumpToken === lastJumpToken.current ||
      !jumpTarget
    ) {
      return;
    }
    lastJumpToken.current = jumpToken;
    setExited(false);
    setPaused(false);
    setCountdown(null);
    // Mirrors the milestone → phase/cardStep mapping the `milestone` const
    // above derives, in reverse.
    switch (jumpTarget) {
      case "prototype1":
        setPhase("intent");
        setCardStep(-1);
        break;
      case "intent":
        setPhase("intent");
        setCardStep(0);
        break;
      case "insights":
        setPhase("insights");
        setCardStep(0);
        break;
      case "prototype2":
        setPhase("switching");
        setCardStep(-1);
        break;
      case "decisions":
        setPhase("decisions");
        setCardStep(0);
        break;
    }
  }, [jumpToken, jumpTarget]);

  // Per-card duration: flat 3s for every card, regardless of content length
  // (was 4s floor + 300ms/word — replaced per user request). Shared with
  // ImgCard's progress-segment fill below so the visual fill and the actual
  // auto-advance timer always agree. "switching" has no cards, just its own
  // fixed hold duration.
  const activeStepDurationMs = useMemo(() => {
    if (phase === "switching") return SWITCH_HOLD_MS;
    if (cardStep < 0 || cardStep >= currentGroups.length) return undefined;
    return CARD_DURATION_MS;
  }, [phase, cardStep, currentGroups.length]);

  // Advances automatically. Within a phase, steps to the next card; at the
  // last card of intent/insights, advances to the next phase instead (insights
  // resets cardStep to 0 on its own CARD_GROUPS re-walk; switching has no
  // card, just its hold). Holds forever once decisions' last card is reached.
  useEffect(() => {
    if (!disableHotspots || exited || paused || !activeStepDurationMs) return;

    if (phase === "switching") {
      const timer = setTimeout(() => {
        setPhase("decisions");
        setCardStep(0);
      }, activeStepDurationMs);
      return () => clearTimeout(timer);
    }

    if (cardStep < 0) return;
    const isLastOfPhase = cardStep >= currentGroups.length - 1;
    if (isLastOfPhase && phase === "decisions") return;

    const timer = setTimeout(() => {
      if (!isLastOfPhase) {
        setCardStep((s) => s + 1);
        return;
      }
      if (phase === "intent") {
        setPhase("insights");
        setCardStep(0);
      } else if (phase === "insights") {
        setPhase("switching");
        setCardStep(-1);
      }
    }, activeStepDurationMs);
    return () => clearTimeout(timer);
  }, [
    disableHotspots,
    exited,
    paused,
    activeStepDurationMs,
    phase,
    cardStep,
    currentGroups.length,
  ]);

  // Section-in-view gating for the keyboard controls below — Left/Right/Space
  // should only respond while this section is actually on screen, not
  // hijack those keys anywhere else on the page. threshold: 0 (any pixel
  // visible) rather than a higher bar — the header+embed block can be taller
  // than the viewport depending on screen size, so requiring e.g. 50%
  // visible could silently never fire even while it's clearly on screen.
  const [sectionInView, setSectionInView] = useState(false);
  useEffect(() => {
    if (!disableHotspots) return;
    const el = pinRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [disableHotspots]);

  // Keyboard controls: Left/Right jump between cards, crossing phase
  // boundaries the same way auto-advance does (intent's last card → insights'
  // first; insights' first card back → intent's last; etc.) — no manual
  // stepping through the "switching" hold itself, matching a video player's
  // convention of not scrubbing through a forced transition. Space
  // pauses/resumes. Global (no need to click into the embed first), gated to
  // this section being in view. No-ops before the sequence has started
  // (cardStep -1, still counting down).
  useEffect(() => {
    if (!disableHotspots || !sectionInView || exited) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (phase === "switching" || cardStep < 0) return;
        if (cardStep < currentGroups.length - 1) {
          setCardStep(cardStep + 1);
        } else if (phase === "intent") {
          setPhase("insights");
          setCardStep(0);
        } else if (phase === "insights") {
          setPhase("switching");
          setCardStep(-1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (phase === "switching" || cardStep < 0) return;
        if (cardStep > 0) {
          setCardStep(cardStep - 1);
        } else if (phase === "insights") {
          setPhase("intent");
          setCardStep(CARD_GROUPS.length - 1);
        } else if (phase === "decisions") {
          setPhase("insights");
          setCardStep(CARD_GROUPS.length - 1);
        }
      } else if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disableHotspots, sectionInView, exited, phase, cardStep, currentGroups.length]);

  // The active group's hotspots (1+ — e.g. License Overview's 2), fed
  // straight to AnnotationConnectorHotspot's existing all-at-once rendering
  // so every tooltip in the group shows simultaneously. No `key` remount on
  // step change (see render below) — AnnotationConnectorHotspot stays
  // mounted continuously so its shared spotlight scrim never disappears/
  // reappears between cards; only cutout positions and tooltip content
  // (which fades in on its own mount, see ConnectorTooltip) update.
  // Memoized so the measurement effect only re-runs when the active group
  // actually changes.
  const activeCardHotspots = useMemo(
    () => (cardStep >= 0 ? currentGroups[cardStep] : []),
    [cardStep, currentGroups],
  );
  const showInsight = phase === "insights";

  // Fade-in + countdown start, gated on scroll: fires once the "Prototype
  // Validation" display text's bottom edge passes the viewport's top edge
  // (i.e. once it's fully scrolled out of sight) — same opacity/y treatment
  // as SectionIntroduction's hero embed fade-in (1s, power2.out, y 500 → 0),
  // just ScrollTrigger-driven instead of mount-triggered since this section
  // isn't above the fold.
  useEffect(() => {
    if (!disableHotspots) return;
    const container = pinRef.current;
    const labelBlock = document.querySelector<HTMLElement>(
      `.${CSS.escape(pageStyles.prototypeValidationTextBlock)}`,
    );
    if (!container || !labelBlock) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(container, { opacity: 0, y: 500 });
        ScrollTrigger.create({
          trigger: labelBlock,
          start: "bottom top",
          once: true,
          onEnter: () => {
            // Locks page scroll for the entrance's own duration — without
            // this, a fast scroll can outrun the 1s tween and the header +
            // embed (a single non-sticky unit — see ImgCard's .embedHeader)
            // arrive out of sync with the rest of the page.
            const prevOverflow = document.documentElement.style.overflow;
            document.documentElement.style.overflow = "hidden";
            gsap.to(container, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              onComplete: () => {
                document.documentElement.style.overflow = prevOverflow;
              },
            });
            setCountdown(8);
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(container, { opacity: 1 });
        ScrollTrigger.create({
          trigger: labelBlock,
          start: "bottom top",
          once: true,
          onEnter: () => setCountdown(8),
        });
      });
    });

    return () => ctx.revert();
  }, [disableHotspots]);

  // Fills the space below the nav, minus whatever height ImgCard's own chrome
  // (caption + padding) takes up — measured directly rather than guessed, since
  // it doesn't vary with the embed's own height. Not needed when there's no pin.
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  useEffect(() => {
    if (disableHotspots) return;
    const update = () => {
      const pinEl = pinRef.current;
      const embedWrapper = embedWrapperRef.current;
      if (!pinEl || !embedWrapper) return;
      const navHeight =
        document.querySelector("nav")?.getBoundingClientRect().height ?? 0;
      const chrome = pinEl.offsetHeight - embedWrapper.offsetHeight;
      setViewportHeight(Math.max(window.innerHeight - navHeight - chrome, 200));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [disableHotspots]);

  const isAlerting = activeIndex === ALERTING_INDEX;
  // Beat 0 (highlight) shows the spotlight/tooltip on the button + rows as normal.
  // Beat 1 (modal open) re-targets the same tooltip to the modal itself — left
  // side of it, top-aligned — since the modal is portaled to document.body, not
  // a descendant of the embed container (see Hotspot.portalTargetIds). It then
  // stays open and unchanged for the rest of the pin: there's no separate
  // "closing" beat — once the pin releases, forceAlertsOpen goes back to
  // undefined and the modal closes on its own, right as the section scrolls
  // away, instead of animating shut mid-pin.
  const overlayActive: Hotspot | null =
    isAlerting && active
      ? subBeatIndex === 0
        ? active
        : {
            ...active,
            targetIds: undefined,
            targetSelectors: undefined,
            portalTargetIds: ["alert-modal"],
            placement: "left-top",
          }
      : active;
  // Modal is forced open from beat 1 onward, left under the button's own click
  // control outside this hotspot entirely.
  const scrollForceAlertsOpen = isAlerting ? subBeatIndex >= 1 : undefined;
  // Card-by-card player: single tooltip, but the card itself opens the modal
  // (per user request — no separate highlight-then-modal split like the old
  // scroll sequence) — open for exactly the stage-level-alerting card, closed
  // otherwise.
  const cardForceAlertsOpen =
    disableHotspots &&
    !!currentGroups[cardStep]?.some((h) => h.targetId === "alert-modal");
  const forceAlertsOpen = disableHotspots
    ? cardForceAlertsOpen
    : scrollForceAlertsOpen;
  // Decisions phase only — forces OverviewScreen's Inactive tooltip panel
  // open for exactly its own (shared) step, same pattern as forceAlertsOpen.
  const decisionForceInactiveTooltip =
    disableHotspots &&
    phase === "decisions" &&
    !!currentGroups[cardStep]?.some(
      (h) => h.targetId === "inactivity-threshold-tooltip",
    );
  // Pan stays on the active hotspot's own targets across all its sub-beats
  // (e.g. alerting keeps centered on the button/rows through modal open+close),
  // not just while the overlay itself is showing.
  const panTargetIds = active ? (active.targetIds ?? [active.id]) : null;
  // The embed swaps to Prototype 02 starting the "switching" hold and stays
  // there through "decisions" — intent/insights stay on Prototype 01.
  const showPrototype2 = disableHotspots && (phase === "switching" || phase === "decisions");

  return (
    <div
      ref={pinRef}
      className={disableHotspots ? pageStyles.prototypeEmbedFade : undefined}
    >
      <ImgCard
        variant={disableHotspots ? "embed" : "bare"}
        caption={showPrototype2 ? "Overview Prototype 02" : "Overview Prototype 01"}
        allowOverflow={disableHotspots}
        progressSteps={
          disableHotspots && !exited && phase !== "switching"
            ? currentGroups.length
            : undefined
        }
        activeStep={
          disableHotspots && !exited && phase !== "switching"
            ? cardStep
            : undefined
        }
        activeStepDurationMs={disableHotspots ? activeStepDurationMs : undefined}
        paused={disableHotspots ? paused : undefined}
      >
        <div ref={embedWrapperRef} style={{ position: "relative" }}>
          <LiveEmbed
            nativeWidth={1440}
            className={
              disableHotspots ? pageStyles.prototypeEmbedRounded : undefined
            }
            viewportHeight={
              disableHotspots ? undefined : (viewportHeight ?? undefined)
            }
            panTargetIds={disableHotspots ? null : panTargetIds}
            disableCanvasTransition
          >
            {showPrototype2 ? (
              <OverviewScreen
                showLogos={false}
                showUtilizationTags={false}
                showScrollFade={false}
                showOpportunity={false}
                forceInactiveTooltip={decisionForceInactiveTooltip}
                lockTableScroll
              />
            ) : (
              <OverviewLegacy
                forceAlertsOpen={forceAlertsOpen}
                alertsBoundsRef={embedWrapperRef}
                showLogos={false}
              />
            )}
          </LiveEmbed>
          {!disableHotspots && (
            <HotspotOverlay
              containerRef={embedWrapperRef}
              active={overlayActive}
              settled={settled}
              nativeWidth={1440}
            />
          )}
          {disableHotspots && !exited && activeCardHotspots.length > 0 && (
            <AnnotationConnectorHotspot
              containerRef={embedWrapperRef}
              nativeWidth={1440}
              hotspots={activeCardHotspots}
              showInsight={showInsight}
            />
          )}
        </div>
      </ImgCard>
    </div>
  );
}
