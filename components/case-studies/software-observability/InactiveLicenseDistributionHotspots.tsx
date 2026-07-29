import { Hotspot } from "@/components/HotspotOverlay";
import SoftwareProfileFinalHotspots from "./SoftwareProfileFinalHotspots";

// Variation of SoftwareProfileFinalHotspots for section.inactive-license-distribution —
// reuses that component's embed/data/tooltip wiring wholesale, swapping in copy ported
// verbatim from the (now removed) section.distribution-overview / .inactive-by-departments /
// .inactive-by-costCenter before/after CardColumn cards. Four distinct DOM targets carry
// all 9 cards (several cards describe the same underlying control from the department vs.
// cost-center framing the original static content used — the live component doesn't have a
// separate view per grouping, just one View By toggle switching data, so those cards share
// a target). From "Count Breakdown" onward the sequence scripts the View By dropdown over
// to "cost-center" to match that framing, same technique as AllSoftwareDirectionIssuesHotspots'
// scrolledRight beat.
const HOTSPOTS: Hotspot[] = [
  {
    id: "view-by-toggle",
    title: "Operational vs Budget Ownership",
    body: "Compare department and cost center perspectives to understand where inactivity occurs and who controls the spend.",
    placement: "below-left",
  },
  {
    id: "department-breakdown-chart",
    title: "Top Contributors Focus",
    body: "Surfaces the departments or cost centers responsible for the largest share of inactivity, prioritizing action where it delivers the highest return.",
    placement: "below-left",
  },
  {
    id: "metric-toggle",
    title: "Metric Selection",
    body: "Lets teams move instantly from scope to impact, switching between volume and dollars without changing context or losing focus.",
    placement: "below-left",
  },
  {
    id: "department-breakdown-chart",
    title: "Employee Drill-Down",
    body: "Transforms aggregated insight into action by exposing the exact users behind inactive licenses, enabling targeted reclamation and clean handoffs.",
    placement: "below-left",
  },
  {
    id: "terminated-breakdown-chart",
    title: "Licenses Assigned to Former Employees",
    body: "Licenses assigned to former employees surface the most immediate, low-risk reclamation opportunities and expose gaps between HR, IT, and Finance offboarding workflows.",
    placement: "below-left",
  },
  {
    id: "metric-toggle",
    title: "Cost Breakdown",
    body: "Converts inactive license volume into annualized dollar impact using unit pricing, helping leaders prioritize action based on financial exposure and budget ownership rather than raw counts.",
    placement: "below-left",
  },
  {
    id: "department-breakdown-chart",
    title: "Count Breakdown",
    body: "Surfaces where inactive licenses concentrate by budget owner, revealing which cost centers are driving the largest volume of unused access.",
    placement: "below-left",
  },
  {
    id: "metric-toggle",
    title: "Cost Breakdown",
    body: "Converts inactive license volume into annualized dollar impact, allowing teams to prioritize reclamation by financial exposure rather than raw count.",
    placement: "below-left",
  },
  {
    id: "department-breakdown-chart",
    title: "Employee Drilldown",
    body: "Turns cost center insights into action by exposing the exact employees holding inactive licenses, enabling fast reclamation and clean operational follow-through.",
    placement: "below-left",
  },
];

// "Count Breakdown" (index 6) is the first card written from the cost-center framing —
// the dropdown scripts over to "cost-center" starting here.
const COST_CENTER_FROM_INDEX = 6;

export default function InactiveLicenseDistributionHotspots() {
  return (
    <SoftwareProfileFinalHotspots
      hotspots={HOTSPOTS}
      caption="Final Software Profile Design — Inactive License Distribution"
      costCenterFromIndex={COST_CENTER_FROM_INDEX}
    />
  );
}
