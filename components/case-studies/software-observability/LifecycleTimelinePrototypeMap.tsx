"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

// Tooltips hidden for now (flip to true to restore).
const SHOW_TOOLTIPS = false;
const NATIVE_WIDTH = 580;

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
  // The embed is one viewport tall (100vh). The content is laid out at the
  // native width and scaled down, so the panel's native height is the viewport
  // height divided by that scale — then the event log scrolls inside it.
  const [nativeHeight, setNativeHeight] = useState<number | null>(null);

  const ds = useMemo(() => getDataset(), []);
  const events = useMemo(() => lifecycleEvents(ds, "ZOOM-ONE"), [ds]);

  useEffect(() => {
    const wrapper = embedWrapperRef.current;
    if (!wrapper) return;
    const update = () => {
      const scale = wrapper.clientWidth / NATIVE_WIDTH;
      if (scale > 0) setNativeHeight(window.innerHeight / scale);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <ImgCard
      variant="embed"
      allowOverflow
      caption="Lifecycle Timeline Prototype 01"
    >
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={NATIVE_WIDTH} disableCanvasTransition>
          {/* LifecycleTimeline is normally a Lifecycle-tab body inside
              SoftwareProfileLegacy's SidePanel — reproduces that panel's
              chrome around it, as in LifecycleTimelineHotspots. */}
          <div
            style={{
              display: "flex",
              boxSizing: "border-box",
              height: nativeHeight ?? undefined,
              padding: "var(--xops-spacing-16)",
              backgroundColor: "var(--xops-white)",
              border:
                "var(--xops-border-width-1) solid var(--xops-border-divider)",
              borderRadius: "var(--xops-radius-12)",
              boxShadow: "var(--xops-elevation-1-left)",
            }}
          >
            <LifecycleTimeline events={events} />
          </div>
        </LiveEmbed>
        {SHOW_TOOLTIPS && (
          <AnnotationConnectorHotspot
            containerRef={embedWrapperRef}
            nativeWidth={580}
            hotspots={HOTSPOTS}
          />
        )}
      </div>
    </ImgCard>
  );
}
