"use client";

import { useEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import OverviewLegacy from "@/design-systems/xops/legacy/OverviewLegacy";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";

// Hotspot copy: final Assumption/Insight lines from the user (see
// .claude/projects/software-observability/PLAN.md, "Hotspot Annotation System").
// Over-Assignment is intentionally skipped.
const HOTSPOTS: Hotspot[] = [
  {
    id: "geographic-filtering",
    title: "Geographic Filtering",
    label: "Assumption",
    body: "Core to XOPS's promise of global observability, I introduced regional filtering.",
    insight:
      "Compliance and usage terms vary by region. Without a legal foundation, regional data can mislead teams.",
    placement: "right-top",
  },
  {
    id: "licensing-model-breakdown",
    title: "Licensing Model Breakdown",
    label: "Assumption",
    body: "Split portfolio by Commercial vs. Open Source, assuming it was a valuable high-level view.",
    insight:
      "Enterprise software relies on multi-year contracts. Analyzing risk required key licensing models I had missed (enterprise agreements, subscriptions, perpetual, and consumption-based terms).",
  },
  {
    id: "expiring-licenses",
    title: "Expiring Licenses",
    label: "Assumption",
    body: "Highlighted license expirations as the primary signal for upcoming renewal needs.",
    insight:
      "Individual license expiration is irrelevant. Contract end-dates and true-up window tracking provide the real value.",
  },
  {
    id: "inactivity-threshold",
    title: "Inactivity Threshold",
    label: "Assumption",
    body: "Thresholds vary across software types. I set 60 days as a starting point for discussion.",
    insight:
      "A consistent baseline mattered more than precision per title at this phase, which could come later through configurability.",
    placement: "below-left",
  },
  {
    id: "compliance-granularity",
    title: "Compliance Granularity",
    label: "Assumption",
    body: "Mapped compliance risk into a defined set of high-level states: Compliant, At Risk, and Non-Compliant.",
    insight: "Compliance was more complex than basic status label. Operators needed specific root conditions to direct action.",
  },
  {
    id: "lifecycle-stage-terms",
    title: "Lifecycle Stage Terms",
    label: "Assumption",
    body: "A standard set of lifecycle stages could be reached from industry research.",
    insight: "There wasn't an industry standard. Stage sets varied widely across tools and organizations.",
    placement: "below-left",
  },
  {
    id: "stage-level-alerting",
    title: "Stage-Level Alerting",
    label: "Assumption",
    body: "Tailoring alerts to specific lifecycle stages would transform the interface from a static dashboard into a proactive guidance system.",
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

const ALERTING_INDEX = HOTSPOTS.findIndex((h) => h.id === "stage-level-alerting");
const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

export default function OverviewPrototypeHotspots() {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const { activeIndex, subBeatIndex, settled } = useScrollHotspotSequence(pinRef, SUB_BEATS_LIST);
  const active = activeIndex !== null ? HOTSPOTS[activeIndex] : null;

  // Fills the space below the nav, minus whatever height ImgCard's own chrome
  // (caption + padding) takes up — measured directly rather than guessed, since
  // it doesn't vary with the embed's own height.
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const pinEl = pinRef.current;
      const embedWrapper = embedWrapperRef.current;
      if (!pinEl || !embedWrapper) return;
      const navHeight = document.querySelector("nav")?.getBoundingClientRect().height ?? 0;
      const chrome = pinEl.offsetHeight - embedWrapper.offsetHeight;
      setViewportHeight(Math.max(window.innerHeight - navHeight - chrome, 200));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
  const panTargetIds = active ? active.targetIds ?? [active.id] : null;

  return (
    <div ref={pinRef}>
      <ImgCard variant="card" caption="Overview Prototype 01">
        <div ref={embedWrapperRef} style={{ position: "relative" }}>
          <LiveEmbed
            nativeWidth={1440}
            viewportHeight={viewportHeight ?? undefined}
            panTargetIds={panTargetIds}
            disableCanvasTransition
          >
            <OverviewLegacy forceAlertsOpen={forceAlertsOpen} alertsBoundsRef={embedWrapperRef} showLogos={false} />
          </LiveEmbed>
          <HotspotOverlay
            containerRef={embedWrapperRef}
            active={overlayActive}
            settled={settled}
          />
        </div>
      </ImgCard>
    </div>
  );
}
