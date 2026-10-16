"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import {
  EmployeeBreakdownView,
  InactiveEmployeeRow,
} from "@/design-systems/xops/components/EmployeeBreakdownView";
import { getDataset } from "@/design-systems/xops/data/generate";
import {
  productSummary,
  inactiveByDepartment,
  inactiveEmployees,
} from "@/design-systems/xops/data/metrics";
import { formatCount, formatCurrency, formatPercent } from "@/design-systems/xops/lib/format";
import {
  formatDate,
  opportunityTooltip,
  inactiveLicensesMetricTooltip,
} from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";

// Live Employee Drill-Down (the real EmployeeBreakdownView, same data joins and
// audited tooltip copy as AllSoftwareScreen's side panel) for ZOOM-ONE's top
// inactive department — the screen the final profile opens from "View Inactive
// Employees". Back / Export CSV / employee links are no-ops here.
const noop = () => {};

export default function EmployeeDrillDownEmbed({
  caption = "Employee Drill-Down",
  totalHeight,
}: {
  caption?: string;
  /** Total outer height (card chrome included) to match — e.g. the embed above
   *  it. The live view crops/pans inside it; omitted = hugs its own content. */
  totalHeight?: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(undefined);

  // Chrome (caption + padding) = outer minus inner; constant whatever the
  // inner's height is, so the live view fills exactly the remainder.
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || !totalHeight) {
      setViewportHeight(undefined);
      return;
    }
    setViewportHeight(Math.max(totalHeight - (outer.offsetHeight - inner.offsetHeight), 200));
  }, [totalHeight]);

  const ds = useMemo(() => getDataset(), []);
  const row = useMemo(() => productSummary(ds, "ZOOM-ONE"), [ds]);

  const data = useMemo(() => {
    if (!row) return null;
    const departments = inactiveByDepartment(ds, row.sku);
    const top = departments[0];
    if (!top) return null;
    const total = departments.reduce((sum, d) => sum + d.count, 0);
    const rows: InactiveEmployeeRow[] = inactiveEmployees(ds, row.sku, top.unitId, "department").map(
      (e) => ({
        name: e.name,
        daysInactive: e.daysInactive,
        lastActivity: e.lastActivity ? formatDate(e.lastActivity) : "Never signed in",
        status: e.workerStatus,
      }),
    );
    return {
      unitValue: top.label,
      metricValue: formatCount(top.count, { compact: true }),
      metricPercent: formatPercent(top.count, total),
      opportunityValue: formatCurrency(top.cost, { compact: true }),
      rows,
    };
  }, [ds, row]);

  if (!data) return null;

  return (
    <div ref={outerRef}>
    <ImgCard variant="embed" caption={caption}>
      <div ref={innerRef}>
      <LiveEmbed nativeWidth={580} viewportHeight={viewportHeight} disableCanvasTransition>
        {/* Reproduces SidePanel.module.css's `.panel` chrome around the
            standalone view, as in SoftwareProfileFinalMap. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "var(--xops-spacing-16)",
            backgroundColor: "var(--xops-white)",
            border: "var(--xops-border-width-1) solid var(--xops-border-divider)",
            borderRadius: "var(--xops-radius-12)",
            boxShadow: "var(--xops-elevation-1-left)",
          }}
        >
          <EmployeeBreakdownView
            mode="inactive"
            unitLabel="Department"
            unitValue={data.unitValue}
            metricLabel="Inactive Licenses"
            metricValue={data.metricValue}
            metricPercent={data.metricPercent}
            metricTooltip={inactiveLicensesMetricTooltip}
            opportunityValue={data.opportunityValue}
            opportunityTooltip={opportunityTooltip}
            inactiveRows={data.rows}
            onBack={noop}
            onExportCsv={noop}
            onEmployeeClick={noop}
          />
        </div>
      </LiveEmbed>
      </div>
    </ImgCard>
    </div>
  );
}
