"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotNotesColumn from "./HotspotNotesColumn";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";
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

// Static, all-at-once tooltips over the final Software Profile — same
// connector style as SoftwareProfilePrototype1Map, role-agnostic (no pills).
// Titles/bodies carried over verbatim from SoftwareProfileFinalHotspots'
// HotspotOverlay copy; targets are the same `data-hotspot` ids in
// SoftwareProfile.tsx. Same real data and audited tooltip/status helpers as
// AllSoftwareScreen. Placement is a blind pass — tune in-browser.
const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };

export const FINAL_PROFILE_HOTSPOTS: AnnotationHotspotData[] = [
  {
    ...NO_INSIGHT,
    targetId: "renewal",
    flipVertical: true,
    title: "Decision-Ready Renewal Context",
    body: "Surfaces renewal timing at the top to establish urgency and frame optimization decisions within a clear contractual timeline.",
  },
  {
    ...NO_INSIGHT,
    targetId: "vendor-contact",
    flip: true,
    title: "Vendor & Account Contact",
    body: "Replaces ambiguous internal ownership with vendor and account contact, aligning the profile with how enterprise licensing decisions are actually made.",
  },
  {
    ...NO_INSIGHT,
    targetId: "opportunity-summary",
    flip: true,
    title: "Opportunity-First Framing",
    body: "Leading with the opportunity banner allows teams to immediately understand savings potential before analyzing usage details.",
  },
  {
    ...NO_INSIGHT,
    targetId: "opportunity-breakdown",
    flipVertical: true,
    title: "Opportunity Breakdown",
    body: "Splits opportunity into inactive and unassigned licenses, clarifying which savings come from reclamation and which point to over-purchasing or operational inefficiencies.",
  },
  {
    ...NO_INSIGHT,
    targetId: "licenses-purchased",
    flip: true,
    title: "Licenses Purchased",
    body: "Creates a single ownership snapshot. Grouping assigned, unassigned, and utilization, enables faster understanding of license distribution.",
  },
  {
    ...NO_INSIGHT,
    targetId: "status-tags",
    flipVertical: true,
    title: "Improving Time-to-Insight",
    body: "Color-coded status tags convert raw metrics into instant visual signals, helping teams quickly identify underuse, over-assignment, and risk without manual interpretation.",
  },
  {
    ...NO_INSIGHT,
    targetId: "utilization-status",
    flip: true,
    title: "Utilization Status",
    body: "Simplified labels and drill-downs let teams quickly access the users holding licenses in each state, supporting faster review and targeted reclamation.",
  },
  {
    ...NO_INSIGHT,
    targetId: "reclaimable-total",
    flipVertical: true,
    title: "Explicit Reclaimable Total",
    body: "Explicitly labeling unused licenses (inactive + unassigned) removes mental math and gives teams a clear, defensible target for reclamation or contract renegotiation.",
  },
];

export type SoftwareProfileFinalMapProps = {
  /** Defaults to the structural walkthrough tooltips above —
   *  InactiveLicenseDistributionMap passes its own sets instead, reusing this
   *  same embed/data/chrome. */
  hotspots?: AnnotationHotspotData[];
  caption?: string;
  /** Starting View By value (still user-toggleable). */
  initialViewBy?: "top-departments" | "cost-center";
  /** Shows only the Inactive License Distribution section, as if the panel
   *  were scrolled down to it. */
  distributionOnly?: boolean;
  /** Drops the Inactive License Distribution section. */
  hideDistribution?: boolean;
  /** Replaces the connector tooltips with a column of notes (one per hotspot,
   *  same order) on this side of the embed — every hotspot becomes a
   *  spotlight-only cutout. */
  notesSide?: "left" | "right";
  /** Total outer height (card chrome included) to fill — e.g. so a row of embeds
   *  share one height. The live view crops/pans inside it; omitted = hugs its
   *  own content. */
  totalHeight?: number;
};

export default function SoftwareProfileFinalMap({
  hotspots = FINAL_PROFILE_HOTSPOTS,
  caption,
  initialViewBy = "top-departments",
  distributionOnly,
  hideDistribution,
  notesSide,
  totalHeight,
}: SoftwareProfileFinalMapProps) {
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(undefined);

  // Chrome (caption + padding) = outer minus the embed wrapper; constant whatever
  // the wrapper's height is, so the live view fills exactly the remainder.
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = embedWrapperRef.current;
    if (!outer || !inner || !totalHeight) {
      setViewportHeight(undefined);
      return;
    }
    setViewportHeight(Math.max(totalHeight - (outer.offsetHeight - inner.offsetHeight), 200));
  }, [totalHeight]);

  const ds = useMemo(() => getDataset(), []);
  const row = useMemo(() => productSummary(ds, "ZOOM-ONE"), [ds]);
  // View By stays genuinely functional (both data paths exist in metrics.ts);
  // drill-down clicks are no-ops since this embed doesn't mount the SidePanel's
  // employee-breakdown view.
  const [viewBy, setViewBy] = useState<string>(initialViewBy);
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

  if (!row) return null;

  return (
    <div ref={outerRef}>
    <ImgCard variant="embed" allowOverflow caption={caption}>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={580} viewportHeight={viewportHeight} disableCanvasTransition>
          {/* Reproduces SidePanel.module.css's `.panel` chrome around the
              standalone profile body, as in SoftwareProfileFinalHotspots. */}
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
              assignedIsOverAssigned={row.excessAssigned > 0}
              excessAssignedLabel={formatCount(row.excessAssigned)}
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
              onViewByChange={setViewBy}
              distributionOnly={distributionOnly}
              hideDistribution={hideDistribution}
            />
          </div>
        </LiveEmbed>
        {/* Skipped when empty — with no cutouts the overlay would dim the whole
            embed. */}
        {hotspots.length > 0 && (
          <AnnotationConnectorHotspot
            cardStyle
            accentColor="var(--color-grey-700)"
            containerRef={embedWrapperRef}
            nativeWidth={580}
            hotspots={
              notesSide
                ? hotspots.map((h) => ({ ...h, cutoutOnly: true }))
                : hotspots
            }
          />
        )}
        {notesSide && hotspots.length > 0 && (
          <HotspotNotesColumn
            side={notesSide}
            notes={hotspots.map((h) => ({ title: h.title, body: h.body }))}
          />
        )}
      </div>
    </ImgCard>
    </div>
  );
}
