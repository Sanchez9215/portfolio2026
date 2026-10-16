"use client";

import { useLayoutEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import AllSoftwareLegacy from "@/design-systems/xops/legacy/AllSoftwareLegacy";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";
import styles from "./OverviewPrototype1QuestionsMap.module.css";

// Static, all-at-once "Issues Identified" tooltips over the full-view
// All Software embed (header, toolbar, table — sidebar hidden, horizontal scroll enabled) — same ImgCard shell and connector style as
// AllSoftwarePrototype1Map, role-agnostic (no pills). Titles/bodies carried
// over verbatim from AllSoftwareDirectionIssuesHotspots' HotspotOverlay copy;
// targets are the same structural selectors. `[class*="tableWrapper"]` because
// AllSoftwareLegacy's CSS Module classnames are hashed at build time.
// Placement is a blind pass — tune in-browser.
const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };

const HOTSPOTS: AnnotationHotspotData[] = [
  {
    ...NO_INSIGHT,
    targetId: "product-identification",
    // Comma-free: bounds ONE cutout across all 3 headers.
    targetSelectors: ["th:nth-child(-n+3)"],
    attachLeft: true,
    placeAbove: true,
    title: "Product Identification",
    body: "Without strong visual cues or clear identifiers, users had to pause and interpret instead of immediately recognizing the product they were reviewing.",
  },
  {
    ...NO_INSIGHT,
    targetId: "disconnected-metrics",
    // Columns 5-8 bounded into one cutout.
    targetSelectors: ["th:nth-child(n+5):nth-child(-n+8)"],
    flip: true,
    placeAbove: true,
    title: "Disconnected Metrics",
    body: "Too many numbers, not enough meaning. Metrics shown without relationship context failed to guide decisions or communicate value.",
  },
  {
    ...NO_INSIGHT,
    targetId: "renewal",
    targetSelectors: ["th:nth-child(9)"],
    flip: true,
    flipVertical: true,
    placeBelow: true,
    title: "Renewal",
    body: "A date alone doesn't reveal whether something is approaching, at risk, or past due, forcing users to interpret urgency mentally.",
  },
  {
    ...NO_INSIGHT,
    targetId: "system-wide-scaling",
    // Every header cell + the first 5 rows' cells (all 9 columns) — cell edges
    // rather than the tr's own rect, so every column is inside the cutout.
    targetSelectors: ["thead th", "tbody tr:nth-child(-n+5) td"],
    attachLeft: true,
    flipVertical: true,
    placeBelow: true,
    title: "System Wide Scaling",
    body: "As software data evolved to support additional personas, tables would eventually overflow pushing key information into horizontal scroll. This was already visible in other lifecycle views and needed a scalable fix.",
  },
];

// For now the connectors/tooltips are hidden: every hotspot becomes a
// cutout-only spotlight, and the four notes sit in one row directly above the
// table instead (see IssueNotes) — flip to true to restore the connectors.
const SHOW_CONNECTORS = false;
const NOTES_OFFSET = 32;

const VISIBLE_HOTSPOTS: AnnotationHotspotData[] = SHOW_CONNECTORS
  ? HOTSPOTS
  : HOTSPOTS.map((h) => ({ ...h, cutoutOnly: true }));

// Title + body of each hotspot as a plain row of columns across the table's
// width, 32px above it, at the tooltips' own level (above the dim overlay) —
// same text styles and layer as the Overview's StageNotes.
function IssueNotes({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement>;
}) {
  const [box, setBox] = useState<{
    left: number;
    bottom: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const table = container.querySelector<HTMLElement>(
        '[class*="tableWrapper"]',
      );
      if (!table) return;
      const c = container.getBoundingClientRect();
      const r = table.getBoundingClientRect();
      setBox({
        left: r.left - c.left,
        bottom: c.bottom - r.top + NOTES_OFFSET,
        width: r.width,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef]);

  if (!box) return null;
  return (
    <div
      className={styles.stageNotes}
      style={{ left: box.left, bottom: box.bottom, width: box.width }}
    >
      {HOTSPOTS.map((h) => (
        <div
          key={h.targetId}
          className={styles.stageNote}
          style={{ flex: "1 1 0", minWidth: 0 }}
        >
          <p className={styles.stageNoteTitle}>{h.title}</p>
          <p className={styles.stageNoteBody}>{h.body}</p>
        </div>
      ))}
    </div>
  );
}

export default function AllSoftwareIssuesMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <ImgCard variant="embed" allowOverflow>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={1440} disableCanvasTransition>
          <AllSoftwareLegacy disableVerticalScroll hideSidebar />
        </LiveEmbed>
        <AnnotationConnectorHotspot
          containerRef={embedWrapperRef}
          nativeWidth={1440}
          hotspots={VISIBLE_HOTSPOTS}
        />
        {!SHOW_CONNECTORS && <IssueNotes containerRef={embedWrapperRef} />}
      </div>
    </ImgCard>
  );
}
