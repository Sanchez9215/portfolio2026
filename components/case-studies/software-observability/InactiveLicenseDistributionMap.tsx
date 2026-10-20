"use client";

import { useLayoutEffect, useRef, useState } from "react";
import LazyMount from "@/components/LazyMount";
import EmployeeDrillDownEmbed from "./EmployeeDrillDownEmbed";
import SoftwareProfileFinalMap from "./SoftwareProfileFinalMap";
import { AnnotationHotspotData } from "./AnnotationConnectorHotspot";
import HotspotNotesColumn from "./HotspotNotesColumn";
import { HotspotNote } from "./HotspotNotesRow";
import pageStyles from "@/app/work/software-observability/software-observability.module.css";

// Two final-profile embeds side by side in the center — "By Department" on the
// left, "By Cost Center" on the right — with each one's notes stacked in a
// column on its outer edge (no connectors, so nothing overlaps), listed in the
// top-to-bottom order of their targets. Copy carried over
// verbatim from InactiveLicenseDistributionHotspots' HotspotOverlay cards:
// indexes 0-5 are the department framing, 6-8 the cost-center framing (the
// original sequence scripted View By to cost-center from index 6). Every target
// is still spotlighted.
const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };

const DEPARTMENT_HOTSPOTS: AnnotationHotspotData[] = [
  {
    ...NO_INSIGHT,
    targetId: "view-by-toggle",
    title: "Operational vs Budget Ownership",
    body: "Compare department and cost center perspectives to understand where inactivity occurs and who controls the spend.",
  },
  {
    ...NO_INSIGHT,
    targetId: "metric-toggle",
    title: "Metric Selection",
    body: "Lets teams move instantly from scope to impact, switching between volume and dollars without changing context or losing focus.",
  },
  {
    ...NO_INSIGHT,
    targetId: "department-breakdown-chart",
    title: "Top Contributors Focus",
    body: "Surfaces the departments or cost centers responsible for the largest share of inactivity, prioritizing action where it delivers the highest return.",
  },
  {
    ...NO_INSIGHT,
    targetId: "terminated-breakdown-chart",
    title: "Licenses Assigned to Former Employees",
    body: "Licenses assigned to former employees surface the most immediate, low-risk reclamation opportunities and expose gaps between HR, IT, and Finance offboarding workflows.",
  },
];

// No annotations on the cost-center side — the department notes (Top
// Contributors Focus, Metric Selection) cover the same
// controls and charts for both views.
// The drill-down note sits beside its own embed (below By Department), not in
// the By Department column.
const EMPLOYEE_DRILL_DOWN_NOTES: HotspotNote[] = [
  {
    title: "Employee Drill-Down",
    body: "Transforms aggregated insight into action by exposing the exact users behind inactive licenses, enabling targeted reclamation and clean handoffs.",
  },
];

const COST_CENTER_HOTSPOTS: AnnotationHotspotData[] = [];

// The notes/tooltips on these embeds are hidden for now (flip to true to
// restore).
const SHOW_NOTES = false;

// Fragment (not a wrapper div) so both columns stay direct children of the
// Section's CSS grid, same as OverviewPrototypeSection.
export default function InactiveLicenseDistributionMap() {
  // The three embeds share one height: the taller of By Department / By Cost
  // Center at their natural size. Measured with nothing constrained, then every
  // embed is set to it (the live views crop/pan inside). Re-measured on resize
  // and once fonts load, since both change the natural heights.
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState<number | undefined>(undefined);
  const [measuring, setMeasuring] = useState(true);

  useLayoutEffect(() => {
    if (!measuring) return;
    // Next frame: the embeds drop their previous height in their own effects
    // first, so this reads their natural heights.
    const frame = requestAnimationFrame(() => {
      const heights = [leftRef.current, rightRef.current].map(
        (el) => el?.offsetHeight ?? 0,
      );
      setRowHeight(Math.max(...heights) || undefined);
      setMeasuring(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [measuring]);

  useLayoutEffect(() => {
    const remeasure = () => setMeasuring(true);
    window.addEventListener("resize", remeasure);
    document.fonts?.ready?.then(remeasure);
    return () => window.removeEventListener("resize", remeasure);
  }, []);

  // The embeds mount lazily (LazyMount), so their natural heights can appear
  // after the first measure: when either panel's height stops matching the row
  // height, measure again.
  useLayoutEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;
    const observer = new ResizeObserver(() => {
      if (measuring) return;
      const off = [left, right].some(
        (el) => Math.abs(el.offsetHeight - (rowHeight ?? 0)) > 1,
      );
      if (off) setMeasuring(true);
    });
    observer.observe(left);
    observer.observe(right);
    return () => observer.disconnect();
  }, [measuring, rowHeight]);

  const totalHeight = measuring ? undefined : rowHeight;

  return (
    <>
      <div className={pageStyles.inactiveLicenseDistributionLeft} ref={leftRef}>
        <LazyMount>
          <SoftwareProfileFinalMap
            hotspots={SHOW_NOTES ? DEPARTMENT_HOTSPOTS : []}
            caption="By Department"
            initialViewBy="top-departments"
            distributionOnly
            notesSide="left"
            totalHeight={totalHeight}
          />
        </LazyMount>
      </div>
      <div
        className={pageStyles.inactiveLicenseDistributionRight}
        ref={rightRef}
      >
        <LazyMount>
          <SoftwareProfileFinalMap
            hotspots={SHOW_NOTES ? COST_CENTER_HOTSPOTS : []}
            caption="By Cost Center"
            initialViewBy="cost-center"
            distributionOnly
            notesSide="right"
            totalHeight={totalHeight}
          />
        </LazyMount>
      </div>
      {/* Live employee drill-down, in the same row, matched to By Department's
          height. */}
      <div
        className={pageStyles.inactiveLicenseDistributionMiddle}
        style={{ position: "relative" }}
      >
        <LazyMount>
          <EmployeeDrillDownEmbed totalHeight={totalHeight} />
        </LazyMount>
        {SHOW_NOTES && (
          <HotspotNotesColumn side="left" notes={EMPLOYEE_DRILL_DOWN_NOTES} />
        )}
      </div>
    </>
  );
}
