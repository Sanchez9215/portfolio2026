"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import { SoftwareProfileLegacy } from "@/design-systems/xops/legacy/SoftwareProfileLegacy";
import { TooltipProps } from "@/design-systems/xops/components/Tooltip";
import { getDataset } from "@/design-systems/xops/data/generate";
import { productSummary } from "@/design-systems/xops/data/metrics";
import { lifecycleEvents } from "@/design-systems/xops/data/lifecycle";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";

// Same shared status-tooltip copy used on the legacy All Software profile
// (see AllSoftwareLegacy.tsx) — duplicated here since this embed mounts
// SoftwareProfileLegacy standalone, not through AllSoftwareLegacy's SidePanel.
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

// Hotspot copy carried over verbatim from the (now removed) Profile Prototype 01
// Assumption/Finding cards in page.tsx. Targets are real `data-hotspot` ids added
// directly to SoftwareProfileLegacy.tsx.
const WALKTHROUGH_HOTSPOTS: Hotspot[] = [
  {
    id: "product-identity",
    title: "Product Identity",
    body: "Aside from providing product identification at a glance, publisher logos strengthen the overall product polish and visual clarity of the platform.",
    placement: "below-left",
  },
  {
    id: "ownership",
    title: "Ownership",
    body: "Ownership fields established a clear chain of custody, maintaining consistency with ownership patterns used across other asset profiles.",
    placement: "below-left",
  },
  {
    id: "purchased-licenses",
    title: "Purchased Licenses",
    body: "Presents entitlement scale and contract spend upfront as baseline context, helping stakeholders understand investment size before reviewing usage performance.",
    placement: "below-left",
  },
  {
    id: "utilization-summary",
    title: "Utilization Summary",
    body: "Prioritized as the first actionable data type as it immediately reveals waste, enabling quick identification of reclaim opportunities without deep system dependency.",
    placement: "below-left",
  },
  {
    id: "cost-impact",
    title: "Underutilized License Cost",
    body: "Translates unused licenses into financial impact to drive fast, data-backed renewal and optimization decisions.",
    placement: "below-left",
  },
];

export type SoftwareProfileLegacyHotspotsProps = {
  /** Defaults to the structural walkthrough copy above — SoftwareProfileIssuesHotspots
   *  passes the "Issues Identified" copy instead, reusing this same embed/data/chrome. */
  hotspots?: Hotspot[];
  caption?: string;
  tone?: "default" | "issue";
};

export default function SoftwareProfileLegacyHotspots({
  hotspots = WALKTHROUGH_HOTSPOTS,
  caption = "Profile Prototype 01",
  tone = "default",
}: SoftwareProfileLegacyHotspotsProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const subBeatsList = useMemo(() => hotspots.map((h) => h.subBeats ?? 1), [hotspots]);
  const { activeIndex, settled } = useScrollHotspotSequence(pinRef, subBeatsList);
  const active = activeIndex !== null ? hotspots[activeIndex] : null;

  const ds = useMemo(() => getDataset(), []);
  const row = useMemo(() => productSummary(ds, "ZOOM-ONE"), [ds]);
  const events = useMemo(() => lifecycleEvents(ds, "ZOOM-ONE"), [ds]);

  // Fills the space below the nav, minus ImgCard's own chrome (caption + padding),
  // measured directly — same approach as the Overview/All Software embeds.
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

  // Pans the canvas so the active hotspot's own target stays centered in the
  // fixed viewport window — without this, targets below the fold (e.g. the
  // Underutilized License Cost row) just get clipped instead of scrolled into view.
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
            {/* SoftwareProfileLegacy is a side-panel body, not a freestanding screen — this
                reproduces SidePanel.module.css's `.panel` visual chrome (padding/bg/border/
                radius/shadow) around it, minus the fixed-position/drag/transform parts that
                only apply to the live overlay panel. */}
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
              />
            </div>
          </LiveEmbed>
          <HotspotOverlay
            containerRef={embedWrapperRef}
            active={active}
            settled={settled}
            tone={tone}
          />
        </div>
      </ImgCard>
    </div>
  );
}
