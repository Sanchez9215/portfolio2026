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

// Fragment (not a wrapper div) so both columns stay direct children of the
// Section's CSS grid, same as OverviewPrototypeSection.
export default function InactiveLicenseDistributionMap() {
  // Height of the By Department embed's card, so the drill-down below it can
  // match it exactly.
  const topRef = useRef<HTMLDivElement>(null);
  const [topHeight, setTopHeight] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const measure = () => setTopHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className={pageStyles.inactiveLicenseDistributionLeft}>
        <div ref={topRef}>
          <LazyMount>
            <SoftwareProfileFinalMap
              hotspots={DEPARTMENT_HOTSPOTS}
              caption="By Department"
              initialViewBy="top-departments"
              distributionOnly
              notesSide="left"
            />
          </LazyMount>
        </div>
        {/* Live employee drill-down, directly below By Department in the same
            column. */}
        <div style={{ position: "relative" }}>
          <LazyMount>
            <EmployeeDrillDownEmbed totalHeight={topHeight} />
          </LazyMount>
          <HotspotNotesColumn side="left" notes={EMPLOYEE_DRILL_DOWN_NOTES} />
        </div>
      </div>
      <div className={pageStyles.inactiveLicenseDistributionRight}>
        <LazyMount>
          <SoftwareProfileFinalMap
            hotspots={COST_CENTER_HOTSPOTS}
            caption="By Cost Center"
            initialViewBy="cost-center"
            distributionOnly
            notesSide="right"
          />
        </LazyMount>
      </div>
    </>
  );
}
