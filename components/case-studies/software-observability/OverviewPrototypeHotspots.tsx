"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
// import HoverRevealOverlay from "@/components/HoverRevealOverlay"; — disabled for now,
// trying the AnnotationConnectorHotspot style instead (see below).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";
import OverviewLegacy from "@/design-systems/xops/legacy/OverviewLegacy";
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
    id: "lifecycle-stage-terms",
    title: "Lifecycle Stages",
    label: "Assumption",
    body: "Proposed a set of stages that reflected an industry standard, general enough to apply across different organizations.",
    insight:
      "There wasn't an industry standard. Stage sets varied widely across tools and organizations.",
    placement: "below-left",
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
];

const ALERTING_INDEX = HOTSPOTS.findIndex(
  (h) => h.id === "stage-level-alerting",
);
const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

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
// data untouched, just not rendered.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ANNOTATION_HOTSPOTS: AnnotationHotspotData[] = [
  ...REAL_ANNOTATION_HOTSPOTS.filter((h) => h.targetId !== "alert-modal"),
  ALERT_BUTTON_ANNOTATION_HOTSPOT,
  ...USAGE_ANNOTATION_HOTSPOTS,
  ...SPEND_ANNOTATION_HOTSPOTS,
  TOP_NON_COMPLIANT_ANNOTATION_HOTSPOT,
];

interface OverviewPrototypeHotspotsProps {
  /** Renders the static live embed only, skipping the scroll-pin/hotspot-overlay
   *  walkthrough entirely — for placements (e.g. side-by-side with Prototype 2)
   *  that aren't ready for the interactive sequence yet. */
  disableHotspots?: boolean;
}

export default function OverviewPrototypeHotspots({
  disableHotspots = false,
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
  // ScrollTrigger below fires (not on mount), ticks 8 → 0 once, then holds at
  // 0 until the card-by-card advance logic (not built yet) takes over. No
  // segments are filled during the countdown itself.
  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (!disableHotspots || countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [disableHotspots, countdown]);

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
            gsap.to(container, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
            });
            setCountdown(8);
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(container, { opacity: 1, y: 0 });
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
  const forceAlertsOpen = isAlerting ? subBeatIndex >= 1 : undefined;
  // Pan stays on the active hotspot's own targets across all its sub-beats
  // (e.g. alerting keeps centered on the button/rows through modal open+close),
  // not just while the overlay itself is showing.
  const panTargetIds = active ? (active.targetIds ?? [active.id]) : null;

  return (
    <div
      ref={pinRef}
      className={disableHotspots ? pageStyles.prototypeEmbedFade : undefined}
    >
      <ImgCard
        variant={disableHotspots ? "embed" : "bare"}
        caption="Overview Prototype 01"
        allowOverflow={disableHotspots}
        progressSteps={disableHotspots ? HOTSPOTS.length : undefined}
        countdownSeconds={disableHotspots ? countdown : undefined}
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
            <OverviewLegacy
              forceAlertsOpen={forceAlertsOpen}
              alertsBoundsRef={embedWrapperRef}
              showLogos={false}
            />
          </LiveEmbed>
          {!disableHotspots && (
            <HotspotOverlay
              containerRef={embedWrapperRef}
              active={overlayActive}
              settled={settled}
              nativeWidth={1440}
            />
          )}
          {/* AnnotationConnectorHotspot (tooltips + shared spotlight overlay)
              hidden for now per user request — data/props untouched, not
              rendered. */}
          {/* {disableHotspots && (
            <AnnotationConnectorHotspot
              containerRef={embedWrapperRef}
              nativeWidth={1440}
              hotspots={ANNOTATION_HOTSPOTS}
            />
          )} */}
        </div>
      </ImgCard>
    </div>
  );
}
