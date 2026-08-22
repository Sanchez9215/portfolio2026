"use client";

import { useEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";

// Prototype 02 is the revised Overview (the screen built before the legacy v1
// reconstruction), embedded live with no publisher logos and no utilization tags.
// Each hotspot is one of the "Decision" cards — what changed in response to the
// Prototype 01 findings — spotlighting where that decision landed on the revised
// screen. Over-Assignment is intentionally dropped (no on-screen surface for it).
// `targetIds` point at `data-hotspot` ids added inside OverviewScreen; two hotspots
// (Expiring Licenses, Inactivity Threshold) share the License Utilization card.
const HOTSPOTS: Hotspot[] = [
  {
    id: "geographic-filtering",
    title: "Geographic Filtering",
    label: "Decision",
    body: "Removed to avoid surfacing misleading data without the proper legal and technical foundation in place.",
    placement: "below-left",
  },
  {
    id: "licensing-model-breakdown",
    title: "Licensing Model Breakdown",
    label: "Decision",
    body: "Redesigned the License Overview card to break down total spend by licensing model, and elevated its placement in the hierarchy to reflect its value as a primary signal for portfolio decisions.",
    // Header + first 3 rows only, not the whole table — mirrors the
    // stage-level-alerting cap below. widthFromSelector hugs the card's own
    // left/right edges instead of the rows', which can render wider than the
    // card (table's own horizontal scroll) and push the cutout off-screen.
    targetSelectors: [
      '[data-hotspot="licensing-model-breakdown"] > div:first-child, [data-hotspot="licensing-model-breakdown"] tbody tr:nth-child(-n+3)',
    ],
    widthFromSelector: '[data-hotspot="licensing-model-breakdown"]',
    placement: "below-left",
  },
  {
    id: "expiring-licenses",
    title: "Expiring Licenses",
    label: "Decision",
    body: "Removed expiring license insight and reframed it to be based on contract-level data. Renewal data would be found within the Renewal stage tab and eventually within Software Profiles.",
    targetIds: ["license-utilization-card"],
  },
  {
    id: "inactivity-threshold",
    title: "Inactivity Threshold",
    label: "Decision",
    body: "Adjusted default to 90 days as the baseline until title-level configurability could be introduced. Educational tooltips later surfaced this information so users understood how inactivity was being measured.",
    // Hugs the forced-open Inactive tooltip panel's top edge instead of the
    // card's top — unioned with the Inactive/Unassigned legend rows (same
    // "inactivity-threshold-tooltip" id) so it still reaches the card's bottom.
    // document-scoped because the tooltip panel is portaled to document.body.
    portalTargetIds: ["inactivity-threshold-tooltip"],
    // The tooltip panel isn't in-canvas (portaled), so it has no position for
    // LiveEmbed to pan to — pan to the whole card instead, which gives enough
    // headroom above the row for the panel (which pops upward) to stay in frame.
    panTargetIds: ["license-utilization-card"],
  },
  {
    id: "compliance-granularity",
    title: "Compliance Granularity",
    label: "Decision",
    body: "Replaced status-based groupings with non-compliance type, surfacing shadow IT, version and edition mismatch, and duplicate assignments as the primary signals.",
    placement: "left-top",
  },
  {
    id: "lifecycle-stages",
    title: "Lifecycle Stages",
    label: "Decision",
    body: "Refined the stage set in close collaboration with our CPO to accurately reflect the operational language and pain points of enterprise IT organizations.",
    placement: "below-left",
  },
  {
    id: "stage-level-alerting",
    title: "Stage-Level Alerting",
    label: "Decision",
    body: "Deprioritized for the current phase and flagged as a strategic opportunity for a later release.",
    // Header + first 5 rows only, not the whole table. widthFromSelector hugs
    // the card's own left/right edges — see licensing-model-breakdown above.
    targetSelectors: [
      '[data-hotspot="stage-level-alerting"] > p, [data-hotspot="stage-level-alerting"] tbody tr:nth-child(-n+5)',
    ],
    widthFromSelector: '[data-hotspot="stage-level-alerting"]',
    placement: "below-left",
  },
];

const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

interface OverviewPrototype2HotspotsProps {
  /** Renders the static live embed only, skipping the scroll-pin/hotspot-overlay
   *  walkthrough entirely — for placements (e.g. side-by-side with Prototype 1)
   *  that aren't ready for the interactive sequence yet. */
  disableHotspots?: boolean;
}

export default function OverviewPrototype2Hotspots({ disableHotspots = false }: OverviewPrototype2HotspotsProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  // Empty beat list makes the hook no-op (no ScrollTrigger/pin created) — see
  // useScrollHotspotSequence's own early return on slotCount === 0.
  const { activeIndex, settled } = useScrollHotspotSequence(pinRef, disableHotspots ? [] : SUB_BEATS_LIST);
  const active = !disableHotspots && activeIndex !== null ? HOTSPOTS[activeIndex] : null;

  // Fills the space below the nav, minus ImgCard's own chrome (caption + padding),
  // measured directly — same approach as the Prototype 01 embed. Not needed
  // when there's no pin.
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  useEffect(() => {
    if (disableHotspots) return;
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
  }, [disableHotspots]);

  const panTargetIds = active ? active.panTargetIds ?? active.targetIds ?? [active.id] : null;

  return (
    <div ref={pinRef}>
      <ImgCard caption="Overview Prototype 02">
        <div ref={embedWrapperRef} style={{ position: "relative" }}>
          <LiveEmbed
            nativeWidth={1440}
            viewportHeight={disableHotspots ? undefined : (viewportHeight ?? undefined)}
            panTargetIds={disableHotspots ? null : panTargetIds}
            disableCanvasTransition
          >
            <OverviewScreen
              showLogos={false}
              showUtilizationTags={false}
              showScrollFade={false}
              showOpportunity={false}
              forceInactiveTooltip={active?.id === "inactivity-threshold"}
              lockTableScroll
            />
          </LiveEmbed>
          {!disableHotspots && (
            <HotspotOverlay
              containerRef={embedWrapperRef}
              active={active}
              settled={settled}
              nativeWidth={1440}
            />
          )}
        </div>
      </ImgCard>
    </div>
  );
}
