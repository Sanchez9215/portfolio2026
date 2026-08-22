"use client";

import { useEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import AllSoftwareLegacy from "@/design-systems/xops/legacy/AllSoftwareLegacy";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";

// Variation of AllSoftwareLegacyHotspots for section.direction-issue-annotations
// ("All Software: Issues Identified") — same live-embed + structural targetSelectors
// approach, ported from the old static before/after CardColumn copy. No separate
// category tag (source cards had none — see Hotspot.label being optional).
// `[class*="tableWrapper"]` (not `.tableWrapper`) — AllSoftwareLegacy's CSS Module
// classnames are hashed at build time (e.g. `tableWrapper__Hr8Dr`), confirmed against
// the actual .next build output, so exact class selectors would never match.
const HOTSPOTS: Hotspot[] = [
  {
    id: "product-identification",
    title: "Product Identification",
    body: "Without strong visual cues or clear identifiers, users had to pause and interpret instead of immediately recognizing the product they were reviewing.",
    // One comma-combined selector (not three separate entries) so it bounds into ONE
    // cutout spanning all 3 headers, not three independent ones.
    targetSelectors: ["th:nth-child(-n+3)"],
    placement: "below-left",
  },
  {
    id: "system-wide-scaling",
    title: "System Wide Scaling",
    body: "As software data evolved to support additional personas, tables would eventually overflow pushing key information into horizontal scroll. This was already visible in other lifecycle views and needed a scalable fix.",
    // Header + first 5 rows only (not the full table height) — width still overridden
    // to the wrapper's own edges since a tr's rendered width can exceed the visible
    // (horizontally-scrolled) wrapper.
    targetSelectors: ["thead tr, tbody tr:nth-child(-n+5)"],
    widthFromSelector: '[class*="tableWrapper"]',
    placement: "below-left",
  },
  {
    id: "renewal",
    title: "Renewal",
    body: "A date alone doesn't reveal whether something is approaching, at risk, or past due, forcing users to interpret urgency mentally.",
    targetSelectors: ["th:nth-child(9)"],
    placement: "left-top",
    // 2 beats: (0) table auto-scrolls right to reveal the Renewal column, overlay
    // hidden; (1) normal highlight + tooltip, table already scrolled into place.
    // Same pattern as AllSoftwareLegacyHotspots' Utilization Rate beat.
    subBeats: 2,
  },
  {
    id: "disconnected-metrics",
    title: "Disconnected Metrics",
    body: "Too many numbers, not enough meaning. Metrics shown without relationship context failed to guide decisions or communicate value.",
    // One comma-free selector bounding columns 5-8 into a single stretched cutout,
    // not four independent ones.
    targetSelectors: ["th:nth-child(n+5):nth-child(-n+8)"],
    placement: "below-left",
  },
];

const RENEWAL_INDEX = HOTSPOTS.findIndex((h) => h.id === "renewal");
const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

export default function AllSoftwareDirectionIssuesHotspots() {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const { activeIndex, subBeatIndex, settled } = useScrollHotspotSequence(pinRef, SUB_BEATS_LIST);
  const active = activeIndex !== null ? HOTSPOTS[activeIndex] : null;

  // Renewal's beat 0 auto-scrolls the table right (scripted, not user-driven) before
  // its own tooltip shows (beat 1) — the column sits past the fold otherwise. Once
  // scrolled, it stays scrolled for Disconnected Metrics too — same pattern as
  // AllSoftwareLegacyHotspots' Utilization Rate beat.
  const isRenewalEntry = activeIndex === RENEWAL_INDEX;
  const scrolledRight = activeIndex !== null && activeIndex >= RENEWAL_INDEX;
  const overlayActive = isRenewalEntry && subBeatIndex === 0 ? null : active;

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

  return (
    <div ref={pinRef}>
      <ImgCard caption="All Software Prototype — Issues Identified">
        <div ref={embedWrapperRef} style={{ position: "relative" }}>
          <LiveEmbed nativeWidth={1440} viewportHeight={viewportHeight ?? undefined} disableCanvasTransition>
            <AllSoftwareLegacy
              disableVerticalScroll
              disableHorizontalScroll
              scrollToX={scrolledRight ? "end" : "start"}
            />
          </LiveEmbed>
          <HotspotOverlay
            containerRef={embedWrapperRef}
            active={overlayActive}
            settled={settled}
            tone="issue"
            nativeWidth={1440}
          />
        </div>
      </ImgCard>
    </div>
  );
}
