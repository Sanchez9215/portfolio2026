"use client";

import { useRef } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import AllSoftwareLegacy from "@/design-systems/xops/legacy/AllSoftwareLegacy";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";

// Static, all-at-once tooltips over the table-only Prototype 01 All Software
// embed — same ImgCard shell and connector style as the Overview maps.
// title = the question the column answers, role = who asks it (a list when
// roles share it), body = the original design-intent copy. Column order
// (AllSoftwareLegacy's `columns`): 1 Software, 2 Publisher, 3 Vendor,
// 4 Category, 5 Total Spend, 6 Licenses Purchased, 7 Utilization, 8 Inactive,
// 9 Renewal. The table has no data-hotspot hooks (shared XOPS Table), so
// columns are targeted structurally via targetSelectors. One spotlight over
// the whole table is shared by every tooltip via spotlightId.
//
// Placement is a blind pass: tooltips alternate above (placeAbove) and below
// (flipVertical + placeBelow) and run left (flip), right (default) or right
// from the target's left edge (attachLeft) so neighbouring columns' tooltips
// don't overlap. Tune in-browser.
const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };
const SPOTLIGHT = "all-software-table";

const col = (...ns: number[]) =>
  ns
    .map((n) => `th:nth-child(${n}), tbody tr td:nth-child(${n})`)
    .join(", ");

const HOTSPOTS: AnnotationHotspotData[] = [
  {
    // Defines the shared cutout (whole table); no tooltip of its own.
    ...NO_INSIGHT,
    targetId: SPOTLIGHT,
    targetSelectors: ["table"],
    cutoutOnly: true,
    spotlightPadding: 0,
    spotlightRadius: 12,
    title: "",
    body: "",
  },
  {
    ...NO_INSIGHT,
    targetId: "identification-columns",
    spotlightId: SPOTLIGHT,
    targetSelectors: [col(1, 2, 3)],
    attachLeft: true,
    placeAbove: true,
    title: "What is this title, and who do we buy it from?",
    role: ["SAM", "IT OPS"],
    body: "Software name, Publisher and Vendor provide essential context for identifying what the product is, who created it, and who it was purchased through.",
  },
  {
    ...NO_INSIGHT,
    targetId: "category",
    spotlightId: SPOTLIGHT,
    targetSelectors: [col(4)],
    flip: true,
    placeAbove: true,
    title: "Are we paying for overlapping tools?",
    role: ["FINANCIAL SPECIALIST", "SAM"],
    body: "Groups software by function, letting teams compare spend and utilization across similar tools and identify redundant tools for consolidation opportunities.",
  },
  {
    ...NO_INSIGHT,
    targetId: "licenses-purchased",
    spotlightId: SPOTLIGHT,
    targetSelectors: [col(6)],
    flip: true,
    placeAbove: true,
    title: "How many licenses are we entitled to?",
    role: "SAM",
    body: "Establishes the baseline for total licenses owned to support allocation decisions, onboarding planning, and renewal negotiations.",
  },
  {
    ...NO_INSIGHT,
    targetId: "inactive",
    spotlightId: SPOTLIGHT,
    targetSelectors: [col(8)],
    flip: true,
    placeAbove: true,
    title: "Which assigned licenses are going unused?",
    role: ["IT OPS", "SAM"],
    body: "Quantifies the number of assigned licenses not being actively used (no activity in last 90 days), identifying reclamation opportunities and wasted spend.",
  },
  {
    ...NO_INSIGHT,
    targetId: "utilization-rate",
    spotlightId: SPOTLIGHT,
    targetSelectors: [col(7)],
    placeAbove: true,
    title: "How much of what we own is actually used?",
    role: ["SAM", "FINANCIAL SPECIALIST"],
    body: "Represents the percentage of licenses actively being used, allowing teams to identify reclamation opportunities, inform renewal decisions and negotiation strategy.",
  },
  {
    ...NO_INSIGHT,
    targetId: "spend-first-prioritization",
    spotlightId: SPOTLIGHT,
    targetSelectors: [col(5)],
    flip: true,
    flipVertical: true,
    placeBelow: true,
    title: "Where does our spend concentrate?",
    role: "FINANCIAL SPECIALIST",
    body: "The table is sorted by total spend to surface the highest financial exposure, helping teams focus effort where savings potential is greatest.",
  },
  {
    ...NO_INSIGHT,
    targetId: "total-spend",
    spotlightId: SPOTLIGHT,
    targetSelectors: [col(5)],
    attachLeft: true,
    flipVertical: true,
    placeBelow: true,
    title: "What are we paying for each title?",
    role: "FINANCIAL SPECIALIST",
    body: "Quantifies what the organization is paying for each title, establishing the financial baseline every other signal gets measured against.",
  },
  {
    ...NO_INSIGHT,
    targetId: "renewal",
    spotlightId: SPOTLIGHT,
    targetSelectors: [col(9)],
    flip: true,
    flipVertical: true,
    placeBelow: true,
    title: "What is coming up for renewal?",
    role: ["FINANCIAL SPECIALIST", "SAM"],
    body: "Provides urgency context for renewal decisions before a contract renews.",
  },
];

export default function AllSoftwarePrototype1Map() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <ImgCard variant="embed" allowOverflow>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={1440} disableCanvasTransition>
          <AllSoftwareLegacy tableOnly />
        </LiveEmbed>
        <AnnotationConnectorHotspot
          containerRef={embedWrapperRef}
          nativeWidth={1440}
          hotspots={HOTSPOTS}
        />
      </div>
    </ImgCard>
  );
}
