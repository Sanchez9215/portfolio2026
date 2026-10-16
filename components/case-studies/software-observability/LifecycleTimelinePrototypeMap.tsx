"use client";

import { useMemo, useRef } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import { LifecycleTimeline } from "@/design-systems/xops/components/LifecycleTimeline";
import { getDataset } from "@/design-systems/xops/data/generate";
import { lifecycleEvents } from "@/design-systems/xops/data/lifecycle";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";

// Static, all-at-once tooltips over the Lifecycle Timeline — same connector
// style as the Overview/All Software/Profile maps, but role-agnostic (it's a
// log, not tied to the category questions): no role pills, titles and bodies
// carried over verbatim from LifecycleTimelineHotspots' HotspotOverlay copy.
// Targets are structural selectors (shared DS component, no data-hotspot ids).
// Placement is a blind pass — tune in-browser.
const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };

const HOTSPOTS: AnnotationHotspotData[] = [
  {
    ...NO_INSIGHT,
    targetId: "event-search",
    // The bordered search row (icon + input), not the bare input.
    targetSelectors: ['div:has(> input[placeholder="Search Events"])'],
    flip: true,
    title: "Event Search",
    body: "Enables users to instantly locate specific lifecycle events without manually scrolling through long timelines.",
  },
  {
    ...NO_INSIGHT,
    targetId: "event-filtering",
    targetSelectors: ['[aria-label="Filter events by type"]'],
    flip: true,
    flipVertical: true,
    title: "Event Filtering by Type",
    body: "Reduces noise by allowing teams to focus only on events relevant to their role or task.",
  },
  {
    ...NO_INSIGHT,
    targetId: "timeline-navigation",
    targetSelectors: ['nav[aria-label="Jump to period"]'],
    title: "Timeline Navigation",
    body: "Built for enterprise customers managing multi-year subscription histories, enabling effortless navigation across extensive event timelines.",
  },
  {
    ...NO_INSIGHT,
    targetId: "milestone-events",
    // Only the first 5 events (newest-first DOM order) — not the full log.
    targetSelectors: ["[data-event-id]:nth-of-type(-n+5)"],
    flip: true,
    flipVertical: true,
    title: "Milestone Based Events",
    body: "Milestone events reduce noise and surface lifecycle moments that provide operational insights. I proposed introducing custom configuration in a future iteration so enterprises could define milestone triggers that reflect their unique workflows and performance measures.",
  },
];

export default function LifecycleTimelinePrototypeMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  const ds = useMemo(() => getDataset(), []);
  const events = useMemo(() => lifecycleEvents(ds, "ZOOM-ONE"), [ds]);

  return (
    <ImgCard variant="embed" allowOverflow>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={580} disableCanvasTransition>
          {/* LifecycleTimeline is normally a Lifecycle-tab body inside
              SoftwareProfileLegacy's SidePanel — reproduces that panel's
              chrome around it, as in LifecycleTimelineHotspots. */}
          <div
            style={{
              display: "flex",
              padding: "var(--xops-spacing-16)",
              backgroundColor: "var(--xops-white)",
              border: "var(--xops-border-width-1) solid var(--xops-border-divider)",
              borderRadius: "var(--xops-radius-12)",
              boxShadow: "var(--xops-elevation-1-left)",
            }}
          >
            <LifecycleTimeline events={events} />
          </div>
        </LiveEmbed>
        <AnnotationConnectorHotspot
          containerRef={embedWrapperRef}
          nativeWidth={580}
          hotspots={HOTSPOTS}
        />
      </div>
  </ImgCard>
);
}
