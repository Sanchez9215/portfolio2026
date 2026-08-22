"use client";

import { useMemo, useRef } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import { LifecycleTimeline } from "@/design-systems/xops/components/LifecycleTimeline";
import { getDataset } from "@/design-systems/xops/data/generate";
import { lifecycleEvents } from "@/design-systems/xops/data/lifecycle";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";
import styles from "./LifecycleTimelineHotspots.module.css";

// Copy carried over verbatim from the (now removed) before/after CardColumns in
// section.final-lifecycle-timeline. LifecycleTimeline is a shared, final DS component
// (not legacy-scoped) — left untouched, same as AllSoftwareLegacy's Table columns —
// targets are structural CSS selectors instead of data-hotspot ids.
const HOTSPOTS: Hotspot[] = [
  {
    id: "event-search",
    title: "Event Search",
    body: "Enables users to instantly locate specific lifecycle events without manually scrolling through long timelines.",
    // Targets the bordered search row (icon + input), not just the bare input —
    // the input itself has no border/padding, so its rect alone under-hugs the field.
    targetSelectors: ['div:has(> input[placeholder="Search Events"])'],
    placement: "below-left",
  },
  {
    id: "event-filtering",
    title: "Event Filtering by Type",
    body: "Reduces noise by allowing teams to focus only on events relevant to their role or task.",
    targetSelectors: ['[aria-label="Filter events by type"]'],
    placement: "below-left",
  },
  {
    id: "timeline-navigation",
    title: "Timeline Navigation",
    body: "Built for enterprise customers managing multi-year subscription histories, enabling effortless navigation across extensive event timelines.",
    targetSelectors: ['nav[aria-label="Jump to period"]'],
    placement: "left-top",
  },
  {
    id: "milestone-events",
    title: "Milestone Based Events",
    body: "Milestone events reduce noise and surface lifecycle moments that provide operational insights. I proposed introducing custom configuration in a future iteration so enterprises could define milestone triggers that reflect their unique workflows and performance measures.",
    // Only the first 5 events (newest-first DOM order) — not the full log.
    targetSelectors: ["[data-event-id]:nth-of-type(-n+5)"],
    placement: "below-left",
  },
];

const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

export default function LifecycleTimelineHotspots() {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const { activeIndex, settled } = useScrollHotspotSequence(pinRef, SUB_BEATS_LIST);
  const active = activeIndex !== null ? HOTSPOTS[activeIndex] : null;

  const ds = useMemo(() => getDataset(), []);
  const events = useMemo(() => lifecycleEvents(ds, "ZOOM-ONE"), [ds]);

  // No viewportHeight/pan here — unlike Software Profile and All Software, this
  // card hugs the timeline panel's own natural width and height instead of
  // stretching full-bleed to fill the viewport (the pinned scroll-hotspot
  // runway itself doesn't depend on the pinned element's own height, see
  // useScrollHotspotSequence).
  return (
    <div ref={pinRef} className={styles.centerRow}>
      <ImgCard caption="Lifecycle Timeline">
        <div ref={embedWrapperRef} className={styles.embedWrapper}>
          <LiveEmbed nativeWidth={580} disableCanvasTransition>
            {/* LifecycleTimeline is normally a Lifecycle-tab body inside SoftwareProfileLegacy's
                SidePanel — this reproduces that panel's visual chrome around it, same technique
                as SoftwareProfileLegacyHotspots. */}
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
          <HotspotOverlay
            containerRef={embedWrapperRef}
            active={active}
            settled={settled}
            nativeWidth={580}
          />
        </div>
      </ImgCard>
    </div>
  );
}
