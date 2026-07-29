import { Hotspot } from "@/components/HotspotOverlay";
import SoftwareProfileLegacyHotspots from "./SoftwareProfileLegacyHotspots";

// Variation of SoftwareProfileLegacyHotspots for section.profile-issue-annotations
// ("Software Profiles: Issues Identified") — reuses that component's embed, data,
// and tooltip wiring wholesale, swapping in issue-toned hotspot copy ported
// verbatim from the (now removed) before/after CardColumn cards. Targets reuse
// SoftwareProfileLegacy's existing `data-hotspot` ids except "mixed-metrics",
// newly added to the summaryCard's outer div for this experience. "No Renewal
// Context" has no dedicated element to point at — the legacy profile never
// surfaces a renewal date anywhere — so it targets the sticky header, the
// equivalent zone where the final design later adds it.
const HOTSPOTS: Hotspot[] = [
  {
    id: "product-identity",
    title: "No Renewal Context",
    body: "No renewal date or renewal urgency indicator, leaving teams without essential context for timing reclamation efforts or planning negotiations.",
    placement: "below-left",
  },
  {
    id: "ownership",
    title: "Primary & Secondary Owner",
    body: "The header gives prominent space to show operational contacts whose roles rarely influence strategic renewal or licensing decisions.",
    placement: "below-left",
  },
  {
    id: "purchased-licenses",
    title: "Purchased Licenses",
    body: "Presented in isolation, leaving users to mentally link it to the Assigned, Active, Inactive, and Unassigned figures beneath it.",
    placement: "below-left",
  },
  {
    id: "mixed-metrics",
    title: "Mixed Metrics",
    body: "Mixing cost, volume, and utilization metrics in the same block disrupts the flow of information, forcing users to piece together related data on their own.",
    placement: "below-left",
  },
  {
    id: "cost-impact",
    title: "Low Visibility of Underutilized Cost",
    body: "Educational tooltips help clarify status definitions and calculation logic in context, improving transparency and decision speed by reducing ambiguity.",
    placement: "below-left",
  },
];

export default function SoftwareProfileIssuesHotspots() {
  return (
    <SoftwareProfileLegacyHotspots
      hotspots={HOTSPOTS}
      caption="Profile Prototype 01 — Issues Identified"
      tone="issue"
    />
  );
}
