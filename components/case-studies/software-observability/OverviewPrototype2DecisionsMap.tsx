"use client";

import { useRef } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";

// Static, all-at-once decisions over the Overview 2 screen — the same
// elements and connector style as OverviewPrototypeHotspots.tsx's
// DECISION_ANNOTATION_HOTSPOTS, with title = the element and body = the
// decision. label/insightLabel/insight are unused but required by
// AnnotationHotspotData's shape. Stage-Level Alerting is intentionally not
// shown.
const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };

const DECISION_HOTSPOTS: AnnotationHotspotData[] = [
  {
    // Overview 2's page header sits where the filter bar used to be.
    ...NO_INSIGHT,
    targetId: "geographic-filtering",
    flip: true,
    title: "Geographic Filtering",
    body: "Removed to avoid surfacing misleading data without the proper legal and technical foundation in place.",
  },
  {
    ...NO_INSIGHT,
    targetId: "licensing-model-breakdown",
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
    flipVertical: true,
    title: "Top Spend By License Model",
    body: "Redesigned the License Overview card to break down spend by licensing model, and moved it to the top of the page. Our goal was to save money and cut waste, and how software is licensed (subscription, one-time, usage-based) determines where money goes and where it gets wasted.",
  },
  {
    // Defines the License Utilization card's cutout, shared with the
    // Inactivity Threshold tooltip below.
    ...NO_INSIGHT,
    targetId: "license-utilization-card",
    spotlightId: "license-utilization-card",
    spotlightPadding: 0,
    spotlightRadius: 12,
    flip: true,
    title: "Expiring Licenses",
    body: "Exchanged the expiring license insight for a focus on contract-level data, since contract terms (end dates, true-up windows, renewal terms) drive the major renewal and spend decisions. Renewal data would be found within the Renewal stage tab and eventually within Software Profiles.",
  },
  {
    ...NO_INSIGHT,
    targetId: "inactive-legend",
    spotlightId: "license-utilization-card",
    title: "Inactivity Threshold",
    body: "Adjusted default to 90 days as the baseline. Title-level configurability needed further investigation to confirm it was needed, which customer testing and feedback could surface.",
  },
  {
    ...NO_INSIGHT,
    targetId: "compliance-granularity",
    flip: true,
    title: "Compliance Granularity",
    body: "Replaced status-based groupings with non-compliance type, surfacing shadow IT, version and edition mismatch, and duplicate assignments as the primary signals. What data we'd receive was still unknown, so this stayed open until we had more clarity.",
  },
  {
    ...NO_INSIGHT,
    targetId: "lifecycle-stages",
    flip: true,
    title: "Lifecycle Stages",
    body: "Co-defined the stage set with our CPO into something org-agnostic that would cover core needs, knowing it would need fine tuning through future iterations.",
  },
  {
    // Just the Renewal tab (4th tab) of the lifecycle-stages FilterTabs.
    ...NO_INSIGHT,
    targetId: "lifecycle-stages",
    targetSelectors: ['[data-hotspot="lifecycle-stages"] [role="radio"]:nth-child(4)'],
    spotlightPadding: 0,
    spotlightRadius: 12,
    title: "Renewal Approach",
    body: "Added contract details at the title level, like notice deadlines and auto-renew status, to show how urgent each renewal is.",
  },
];

export default function OverviewPrototype2DecisionsMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <ImgCard variant="embed" allowOverflow>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={1440} disableCanvasTransition>
          <OverviewScreen
            showLogos={false}
            showUtilizationTags={false}
            showScrollFade={false}
            showOpportunity={false}
            lockTableScroll
            initialLifecycleStage="renewal"
          />
        </LiveEmbed>
        <AnnotationConnectorHotspot
          containerRef={embedWrapperRef}
          nativeWidth={1440}
          hotspots={DECISION_HOTSPOTS}
        />
      </div>
    </ImgCard>
  );
}
