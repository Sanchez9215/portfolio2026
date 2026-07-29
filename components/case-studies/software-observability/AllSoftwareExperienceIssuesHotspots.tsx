"use client";

import { useEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import AllSoftwareLegacy from "@/design-systems/xops/legacy/AllSoftwareLegacy";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";

// Variation of AllSoftwareLegacyHotspots for section.experience-issue-annotations
// ("Not Ready for Scale") — same live-embed + structural targetSelectors approach,
// ported from the old static before/after CardColumn copy. Data Overload was
// dropped (already covered by System Wide Scaling in AllSoftwareDirectionIssuesHotspots).
// `[class*="..."]` (not exact classnames) — AllSoftwareLegacy's CSS Module classnames
// are hashed at build time (e.g. `tableWrapper__Hr8Dr`), confirmed against the actual
// .next build output, so exact class selectors would never match.
const HOTSPOTS: Hotspot[] = [
  {
    id: "asset-count-badge",
    title: "Asset Count Badge",
    body: "The count badge was heavy visually, pulling focus away from primary content and adding weight to already dense views.",
    targetSelectors: ['[class*="pageHeader"] h2 + span'],
  },
  {
    id: "region-filters",
    title: "Region Filters",
    body: "Region filters shared the same styling as primary and secondary buttons despite serving a different role.",
    targetSelectors: ['[class*="regionGroup"] [role="radiogroup"]'],
  },
  {
    id: "table-headers",
    title: "Table Headers",
    body: "Table headers used a filled style that added unnecessary density and signaled a legacy pattern.",
    // Width overridden to the wrapper's own edges — the th row's own rendered width
    // spans all 9 columns (including ones off-screen from horizontal scroll), not
    // just what's visible. Same technique as the Row Heights hotspot below.
    targetSelectors: ['[class*="tableWrapper"] table thead tr th'],
    widthFromSelector: '[class*="tableWrapper"]',
    placement: "below-left",
  },
  {
    id: "row-heights",
    title: "Row Heights",
    body: "Tight rows cause entries and columns to blend together, forcing users to work harder to scan and interpret large volumes of data.",
    // First 7 rows only, not the whole table — width still overridden to the
    // wrapper's own edges since a tr's rendered width is narrower than the card.
    targetSelectors: ['[class*="tableWrapper"] table tbody tr:nth-child(-n+7)'],
    widthFromSelector: '[class*="tableWrapper"]',
    placement: "below-left",
  },
];

const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

export default function AllSoftwareExperienceIssuesHotspots() {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const { activeIndex, settled } = useScrollHotspotSequence(pinRef, SUB_BEATS_LIST);
  const active = activeIndex !== null ? HOTSPOTS[activeIndex] : null;

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
      <ImgCard variant="card" caption="All Software Prototype — Experience Issues">
        <div ref={embedWrapperRef} style={{ position: "relative" }}>
          <LiveEmbed nativeWidth={1440} viewportHeight={viewportHeight ?? undefined}>
            <AllSoftwareLegacy disableVerticalScroll disableHorizontalScroll />
          </LiveEmbed>
          <HotspotOverlay
            containerRef={embedWrapperRef}
            active={active}
            settled={settled}
            tone="issue"
          />
        </div>
      </ImgCard>
    </div>
  );
}
