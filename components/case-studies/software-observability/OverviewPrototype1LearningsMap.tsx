"use client";

import { useRef } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import OverviewLegacy from "@/design-systems/xops/legacy/OverviewLegacy";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";

// Static, all-at-once learnings over the legacy Overview embed — the same
// elements and connector style as OverviewPrototypeHotspots.tsx's Prototype 1
// hotspots, showing each learning as the tooltip's body. title = the element,
// body = what the review taught. label/insightLabel/insight are unused but
// required by AnnotationHotspotData's shape. Stage-Level Alerting and
// Over-Assignment are intentionally not shown.
const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };

const LEARNING_HOTSPOTS: AnnotationHotspotData[] = [
  {
    ...NO_INSIGHT,
    targetId: "geographic-filtering",
    flip: true,
    title: "Region & Org Structure Filters",
    body: "Compliance and usage terms vary by region. Without legal expertise and full visibility into those differences, regional filtering could mislead teams.",
  },
  {
    // First hotspot sharing the License Overview cutout — defines its
    // padding/radius.
    ...NO_INSIGHT,
    targetId: "licensing-model-breakdown",
    spotlightId: "license-overview",
    spotlightPadding: 0,
    spotlightRadius: 12,
    flip: true,
    flipVertical: true,
    title: "Licensing Model Breakdown",
    body: "Cost and risk depend on how software is licensed (subscriptions, one-time purchases, usage-based terms), and I had only shown a basic Commercial vs. Open Source split.",
  },
  {
    ...NO_INSIGHT,
    targetId: "expiring-licenses",
    spotlightId: "license-overview",
    flip: true,
    flipVertical: true,
    title: "Expiring Licenses",
    body: "Individual license expirations were not accurate to how things worked. Renewal planning was driven by the multi-year contracts established (end dates, true-up windows, renewal terms).",
  },
  {
    ...NO_INSIGHT,
    targetId: "inactivity-threshold",
    spotlightId: "usage-overview",
    spotlightPadding: 0,
    spotlightRadius: 12,
    title: "Inactivity Threshold",
    body: "A consistent baseline mattered more than precision per title at this phase, which could come later through configurability.",
  },
  {
    ...NO_INSIGHT,
    // Spotlight stays on the whole Compliance card; the connector anchors at
    // its Compliant legend row.
    targetId: "compliant-legend",
    spotlightId: "compliance-granularity",
    spotlightPadding: 0,
    spotlightRadius: 12,
    flip: true,
    title: "Compliance Granularity",
    body: "Compliance was more complex than basic status label. Operators needed specific root conditions to direct action.",
  },
  {
    ...NO_INSIGHT,
    targetId: "lifecycle-stage-terms",
    spotlightId: "lifecycle-stage-scope",
    spotlightPadding: 0,
    spotlightRadius: 12,
    // Cutout runs through the table's first 5 rows only.
    spotlightBottomSelector: "table tbody tr:nth-child(5)",
    flip: true,
    title: "Lifecycle Stages",
    body: "There was no single standard for lifecycle stages. Tools and organizations each named and divided them differently, so the set needed terminology general enough to fit across organizations.",
  },
];

export default function OverviewPrototype1LearningsMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <ImgCard variant="embed" allowOverflow>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={1440} disableCanvasTransition>
          <OverviewLegacy showLogos={false} />
        </LiveEmbed>
        <AnnotationConnectorHotspot
          containerRef={embedWrapperRef}
          nativeWidth={1440}
          hotspots={LEARNING_HOTSPOTS}
        />
      </div>
    </ImgCard>
  );
}
