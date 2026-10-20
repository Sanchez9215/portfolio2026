"use client";

import { useMemo, useRef } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import { SoftwareProfileLegacy } from "@/design-systems/xops/legacy/SoftwareProfileLegacy";
import { TooltipProps } from "@/design-systems/xops/components/Tooltip";
import { getDataset } from "@/design-systems/xops/data/generate";
import { productSummary } from "@/design-systems/xops/data/metrics";
import { lifecycleEvents } from "@/design-systems/xops/data/lifecycle";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";

// Same status-tooltip copy as SoftwareProfileLegacyHotspots — this embed
// mounts SoftwareProfileLegacy standalone, not through AllSoftwareLegacy's
// SidePanel.
const activeTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Active",
  description:
    "Assigned licenses that have recorded user activity within the last 90 days, showing they are delivering value.",
};
const assignedTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Assigned",
  description:
    "Purchased licenses designated to a specific employee, reserving the seat for their use.",
};
const inactiveTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Inactive",
  description:
    "Assigned licenses that have recorded zero user activity within the last 90 days, making them primary targets for cost-saving reclamation.",
};
const unassignedTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Unassigned",
  description:
    "Purchased license seats remaining in the inventory pool that are available to be distributed to users.",
};

const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };

// Static, all-at-once "Issues Identified" tooltips over the Profile embed
// (detail tabs hidden) — same connector style as SoftwareProfilePrototype1Map,
// role-agnostic (no pills). Titles/bodies carried over verbatim from
// SoftwareProfileIssuesHotspots' HotspotOverlay copy; targets are the same
// `data-hotspot` ids. "No Renewal Context" points at the sticky header (the
// profile never surfaces a renewal date). Placement is a blind pass.
const HOTSPOTS: AnnotationHotspotData[] = [
  {
    ...NO_INSIGHT,
    targetId: "product-identity",
    title: "No Renewal Context",
    body: "No renewal date or renewal urgency indicator, leaving teams without essential context for timing reclamation efforts or planning negotiations.",
  },
  {
    ...NO_INSIGHT,
    targetId: "ownership",
    flip: true,
    title: "Primary & Secondary Owner",
    body: "The header gives prominent space to show operational contacts whose roles rarely influence strategic renewal or licensing decisions.",
  },
  {
    ...NO_INSIGHT,
    targetId: "purchased-licenses",
    flip: true,
    flipVertical: true,
    title: "Purchased Licenses",
    body: "Presented in isolation, leaving users to mentally link it to the Assigned, Active, Inactive, and Unassigned figures beneath it.",
  },
  {
    ...NO_INSIGHT,
    targetId: "mixed-metrics",
    title: "Mixed Metrics",
    body: "Mixing cost, volume, and utilization metrics in the same block disrupts the flow of information, forcing users to piece together related data on their own.",
  },
  {
    ...NO_INSIGHT,
    targetId: "cost-impact",
    flipVertical: true,
    title: "Low Visibility of Underutilized Cost",
    body: "Educational tooltips help clarify status definitions and calculation logic in context, improving transparency and decision speed by reducing ambiguity.",
  },
];

export default function SoftwareProfileIssuesMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  const ds = useMemo(() => getDataset(), []);
  const row = useMemo(() => productSummary(ds, "ZOOM-ONE"), [ds]);
  const events = useMemo(() => lifecycleEvents(ds, "ZOOM-ONE"), [ds]);

  if (!row) return null;

  return (
    <ImgCard variant="embed" allowOverflow>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={580} disableCanvasTransition>
          {/* SoftwareProfileLegacy is a side-panel body — this reproduces
              SidePanel.module.css's `.panel` chrome around it, as in
              SoftwareProfileLegacyHotspots. */}
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
            <SoftwareProfileLegacy
              row={row}
              lifecycleEvents={events}
              activeTooltip={activeTooltip}
              assignedTooltip={assignedTooltip}
              inactiveTooltip={inactiveTooltip}
              unassignedTooltip={unassignedTooltip}
              showDetail={false}
            />
          </div>
        </LiveEmbed>
        <AnnotationConnectorHotspot
          cardStyle
          accentColor="var(--color-grey-700)"
          containerRef={embedWrapperRef}
          nativeWidth={580}
          hotspots={HOTSPOTS}
        />
      </div>
    </ImgCard>
  );
}
