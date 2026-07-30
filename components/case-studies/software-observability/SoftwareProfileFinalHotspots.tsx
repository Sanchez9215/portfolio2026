"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import { SoftwareProfile, DepartmentBreakdown } from "@/design-systems/xops/components/SoftwareProfile";
import { getDataset } from "@/design-systems/xops/data/generate";
import {
  productSummary,
  inactiveByDepartment,
  terminatedByDepartment,
  inactiveByCostCenter,
  terminatedByCostCenter,
} from "@/design-systems/xops/data/metrics";
import { formatCount, formatCurrency, formatPercent } from "@/design-systems/xops/lib/format";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";
import {
  renewalStatus,
  renewalTooltip,
  formatRenewalDuration,
  formatDate,
  opportunityTooltip,
  assignedTooltip,
  unassignedTooltip,
  utilizationStatus,
  utilizationLabel,
  utilizationTooltip,
  activeTooltip,
  inactiveTooltip,
  distributionTooltip,
} from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";

// Live final Software Profile — same real component, same real join-and-count data
// (ZOOM-ONE row), and the same audited tooltip/status thresholds already confirmed
// and shipped in AllSoftwareScreen.tsx, reused verbatim rather than re-derived here.
// View By is genuinely functional (both department/cost-center data paths already
// exist in metrics.ts); drill-down clicks (View Inactive/Terminated Employees) are
// no-ops here since this embed doesn't mount the SidePanel's employee-breakdown view.
const DEFAULT_HOTSPOTS: Hotspot[] = [
  {
    id: "renewal",
    title: "Decision-Ready Renewal Context",
    body: "Surfaces renewal timing at the top to establish urgency and frame optimization decisions within a clear contractual timeline.",
    placement: "below-left",
  },
  {
    id: "vendor-contact",
    title: "Vendor & Account Contact",
    body: "Replaces ambiguous internal ownership with vendor and account contact, aligning the profile with how enterprise licensing decisions are actually made.",
    placement: "below-left",
  },
  {
    id: "opportunity-summary",
    title: "Opportunity-First Framing",
    body: "Leading with the opportunity banner allows teams to immediately understand savings potential before analyzing usage details.",
    placement: "below-left",
  },
  {
    id: "opportunity-breakdown",
    title: "Opportunity Breakdown",
    body: "Splits opportunity into inactive and unassigned licenses, clarifying which savings come from reclamation and which point to over-purchasing or operational inefficiencies.",
    placement: "below-left",
  },
  {
    id: "licenses-purchased",
    title: "Licenses Purchased",
    body: "Creates a single ownership snapshot. Grouping assigned, unassigned, and utilization, enables faster understanding of license distribution.",
    placement: "below-left",
  },
  {
    id: "status-tags",
    title: "Improving Time-to-Insight",
    body: "Color-coded status tags convert raw metrics into instant visual signals, helping teams quickly identify underuse, over-assignment, and risk without manual interpretation.",
    placement: "below-left",
  },
  {
    id: "utilization-status",
    title: "Utilization Status",
    body: "Simplified labels and drill-downs let teams quickly access the users holding licenses in each state, supporting faster review and targeted reclamation.",
    placement: "below-left",
  },
  {
    id: "reclaimable-total",
    title: "Explicit Reclaimable Total",
    body: "Explicitly labeling unused licenses (inactive + unassigned) removes mental math and gives teams a clear, defensible target for reclamation or contract renegotiation.",
    placement: "below-left",
  },
];

export type SoftwareProfileFinalHotspotsProps = {
  /** Defaults to the structural walkthrough copy above — InactiveLicenseDistributionHotspots
   *  passes its own copy instead, reusing this same embed/data/chrome. */
  hotspots?: Hotspot[];
  caption?: string;
  /** Once the scroll sequence reaches this hotspot index, scripts the View By dropdown
   *  to "cost-center" (from "top-departments") — not user-driven, same technique as
   *  AllSoftwareDirectionIssuesHotspots' scrolledRight beat. Omit to leave View By on
   *  the manually-clickable default (the structural walkthrough's own behavior). */
  costCenterFromIndex?: number;
};

export default function SoftwareProfileFinalHotspots({
  hotspots = DEFAULT_HOTSPOTS,
  caption = "Final Software Profile Design",
  costCenterFromIndex,
}: SoftwareProfileFinalHotspotsProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const subBeatsList = useMemo(() => hotspots.map((h) => h.subBeats ?? 1), [hotspots]);
  const { activeIndex, settled } = useScrollHotspotSequence(pinRef, subBeatsList);
  const active = activeIndex !== null ? hotspots[activeIndex] : null;

  const ds = useMemo(() => getDataset(), []);
  const row = useMemo(() => productSummary(ds, "ZOOM-ONE"), [ds]);
  const [manualViewBy, setManualViewBy] = useState("top-departments");
  const scriptedCostCenter =
    costCenterFromIndex !== undefined && activeIndex !== null && activeIndex >= costCenterFromIndex;
  const viewBy = scriptedCostCenter ? "cost-center" : manualViewBy;
  const groupBy: "department" | "costCenter" = viewBy === "cost-center" ? "costCenter" : "department";

  const departmentBreakdown: DepartmentBreakdown[] = useMemo(() => {
    if (!row) return [];
    return (groupBy === "costCenter" ? inactiveByCostCenter(ds, row.sku) : inactiveByDepartment(ds, row.sku)).map(
      (r) => ({ id: r.unitId, label: r.label, count: r.count, cost: r.cost }),
    );
  }, [ds, row, groupBy]);

  const terminatedEmployeesBreakdown: DepartmentBreakdown[] = useMemo(() => {
    if (!row) return [];
    return (groupBy === "costCenter" ? terminatedByCostCenter(ds, row.sku) : terminatedByDepartment(ds, row.sku)).map(
      (r) => ({ id: r.unitId, label: r.label, count: r.count, cost: r.cost }),
    );
  }, [ds, row, groupBy]);

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

  const panTargetIds = active ? active.targetIds ?? [active.id] : null;

  if (!row) return null;

  return (
    <div ref={pinRef}>
      <ImgCard variant="card" caption={caption}>
        <div ref={embedWrapperRef} style={{ position: "relative" }}>
          <LiveEmbed
            nativeWidth={580}
            viewportHeight={viewportHeight ?? undefined}
            panTargetIds={panTargetIds}
          >
            {/* Reproduces SidePanel.module.css's `.panel` visual chrome (padding/bg/border/
                radius/shadow) around the standalone profile body — same technique as
                SoftwareProfileLegacyHotspots, minus the fixed-position/drag/transform parts
                that only apply to the live overlay panel. */}
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
              <SoftwareProfile
                logo={row.logo ?? ""}
                name={row.name}
                fullName={row.publisher}
                vendor={row.reseller}
                vendorContactName={row.vendorContactName}
                vendorContactEmail={row.vendorContactEmail}
                description="No description available yet."
                renewalDate={formatDate(row.renewalDate)}
                renewalLabel={formatRenewalDuration(row.renewalDays)}
                renewalStatus={renewalStatus(row.renewalDays)}
                renewalTooltip={renewalTooltip}
                opportunityTotal={formatCurrency(row.opportunity)}
                opportunityTooltip={opportunityTooltip}
                inactiveWasteAmount={formatCurrency(row.inactiveWaste)}
                inactiveWastePercent={formatPercent(row.inactiveWaste, row.opportunity)}
                unassignedWasteAmount={formatCurrency(row.unassignedWaste)}
                unassignedWastePercent={formatPercent(row.unassignedWaste, row.opportunity)}
                licensesPurchasedTotal={formatCount(row.purchased, { compact: true })}
                assignedValue={formatCount(row.assigned, { compact: true })}
                assignedPercent={formatPercent(row.assigned, row.purchased)}
                assignedTooltip={assignedTooltip}
                unassignedLicensesValue={formatCount(row.unassigned, { compact: true })}
                unassignedLicensesPercent={formatPercent(row.unassigned, row.purchased)}
                unassignedTooltip={unassignedTooltip}
                utilizationRateValue={`${row.utilization}%`}
                utilizationRateLabel={utilizationLabel(row.utilization)}
                utilizationRateStatus={utilizationStatus(row.utilization)}
                utilizationTooltip={utilizationTooltip}
                activeCount={row.active}
                activeValue={formatCount(row.active, { compact: true })}
                activePercent={formatPercent(row.active, row.purchased)}
                activeTooltip={activeTooltip}
                inactiveCount={row.inactive}
                inactiveValue={formatCount(row.inactive, { compact: true })}
                inactivePercent={formatPercent(row.inactive, row.purchased)}
                inactiveTooltip={inactiveTooltip}
                licensesPurchasedCount={row.purchased}
                unusedLicensesValue={formatCount(row.inactive + row.unassigned, { compact: true })}
                unusedLicensesPercent={formatPercent(row.inactive + row.unassigned, row.purchased)}
                departmentBreakdown={departmentBreakdown}
                terminatedEmployeesBreakdown={terminatedEmployeesBreakdown}
                distributionTooltip={distributionTooltip}
                viewBy={viewBy}
                onViewByChange={setManualViewBy}
              />
            </div>
          </LiveEmbed>
          <HotspotOverlay containerRef={embedWrapperRef} active={active} settled={settled} />
        </div>
      </ImgCard>
    </div>
  );
}
