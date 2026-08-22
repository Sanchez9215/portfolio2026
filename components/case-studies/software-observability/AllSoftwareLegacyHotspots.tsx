"use client";

import { useEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import AllSoftwareLegacy from "@/design-systems/xops/legacy/AllSoftwareLegacy";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";

// Prototype 01's All Software table has no `data-hotspot` attribute hooks (Table.tsx
// is a shared XOPS component, left untouched) — columns are targeted structurally by
// header/body position instead, via `targetSelectors` (see HotspotOverlay.tsx). Column
// order (AllSoftwareLegacy's `columns` array): 1 Software, 2 Publisher, 3 Vendor,
// 4 Category, 5 Total Spend, 6 Licenses Purchased, 7 Utilization, 8 Inactive, 9 Renewal.
const HOTSPOTS: Hotspot[] = [
  {
    id: "spend-first-prioritization",
    title: "Spend-first Prioritization",
    body: "The table is sorted by total spend to surface the highest financial exposure, helping teams focus effort where savings potential is greatest.",
    // One comma-combined selector (not two separate targetSelectors entries) so it
    // bounds into ONE cutout — header down through the first 5 rows only.
    targetSelectors: ["th:nth-child(5), tbody tr:nth-child(-n+5) td:nth-child(5)"],
  },
  {
    id: "identification-columns",
    title: "Identification Columns",
    body: "Software name, Publisher and Vendor provide essential context for identifying what the product is, who created it, and who it was purchased through.",
    // One cutout spanning all 3 headers + their first 5 rows.
    targetSelectors: ["th:nth-child(-n+3), tbody tr:nth-child(-n+5) td:nth-child(-n+3)"],
    placement: "below-left",
  },
  {
    id: "category",
    title: "Category",
    body: "Groups software by function, letting teams compare spend and utilization across similar tools and identify redundant tools for consolidation opportunities.",
    targetSelectors: ["th:nth-child(4)"],
    placement: "left-top",
  },
  {
    id: "total-spend",
    title: "Total Spend",
    body: "Quantifies what the organization is paying for each title, establishing the financial baseline every other signal gets measured against.",
    targetSelectors: ["th:nth-child(5), tbody tr:nth-child(-n+5) td:nth-child(5)"],
  },
  {
    id: "licenses-purchased",
    title: "Licenses Purchased",
    body: "Establishes the baseline for total licenses owned to support allocation decisions, onboarding planning, and renewal negotiations.",
    targetSelectors: ["th:nth-child(6)"],
    placement: "left-top",
  },
  {
    id: "utilization-rate",
    title: "Utilization Rate",
    body: "Represents the percentage of licenses actively being used, allowing teams to identify reclamation opportunities, inform renewal decisions and negotiation strategy.",
    targetSelectors: ["th:nth-child(7)"],
    placement: "left-top",
    // 2 beats: (0) table auto-scrolls right to bring the remaining columns
    // (Utilization, Inactive, Renewal) into view, overlay hidden; (1) normal
    // highlight + tooltip on this column, table already scrolled into place.
    subBeats: 2,
  },
  {
    id: "inactive",
    title: "Inactive",
    body: "Quantifies the number of assigned licenses not being actively used (no activity in last 90 days), identifying reclamation opportunities and wasted spend.",
    targetSelectors: ["th:nth-child(8)"],
    placement: "left-top",
  },
  {
    id: "renewal",
    title: "Renewal",
    body: "Provides urgency context for renewal decisions before a contract renews.",
    targetSelectors: ["th:nth-child(9)"],
    placement: "left-top",
  },
];

const UTILIZATION_INDEX = HOTSPOTS.findIndex((h) => h.id === "utilization-rate");
const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

export default function AllSoftwareLegacyHotspots() {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const { activeIndex, subBeatIndex, settled } = useScrollHotspotSequence(pinRef, SUB_BEATS_LIST);
  const active = activeIndex !== null ? HOTSPOTS[activeIndex] : null;

  // Utilization Rate's beat 0 auto-scrolls the table right before its own tooltip
  // shows (beat 1) — the trailing columns (Utilization, Inactive, Renewal) all sit
  // past the fold otherwise. Once scrolled, it stays scrolled for Inactive/Renewal too.
  const isUtilizationEntry = activeIndex === UTILIZATION_INDEX;
  const scrolledRight = activeIndex !== null && activeIndex >= UTILIZATION_INDEX;
  const overlayActive = isUtilizationEntry && subBeatIndex === 0 ? null : active;

  // Fills the space below the nav, minus ImgCard's own chrome (caption + padding),
  // measured directly — same approach as the Overview embeds.
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
      <ImgCard caption="All Software Prototype 01">
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
            nativeWidth={1440}
          />
        </div>
      </ImgCard>
    </div>
  );
}
