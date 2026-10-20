"use client";

import { useMemo, useRef, useState } from "react";
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
import { QUESTION_LABELS } from "./SoftwareSystemMap";
import PrototypeTabs from "@/components/PrototypeTabs";
import EmbedSwitch from "./EmbedSwitch";
import SoftwareProfileIssuesMap from "./SoftwareProfileIssuesMap";
import SoftwareProfileFinalMap from "./SoftwareProfileFinalMap";
import styles from "./OverviewPrototype1QuestionsMap.module.css";

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
// Second tab row under the embed: picks which embed sits below it.
const DESIGN_TABS = ["Issues Identified", "Final Design"];
const hs = (id: string) => `[data-hotspot="${id}"]`;

// One tooltip set per question, same order as QUESTION_LABELS (own, cost,
// used, compliant). Bodies are the original Profile Prototype 01 design-intent
// copy where one applies (trimmed to the part that answers the question when
// an original is shared); bodies with no original are new draft copy.
// Placement is a blind pass — tooltips alternate left (flip) / right so they
// don't collide; tune in-browser.
const QUESTION_HOTSPOTS: AnnotationHotspotData[][] = [
  // What do we own?
  [
    {
      ...NO_INSIGHT,
      targetId: "purchased-licenses",
      flip: true,
      flipVertical: true,
      title: "How many licenses do we hold for this title?",
      role: "SAM",
      body: "Presents entitlement scale upfront as baseline context before usage performance is reviewed.",
    },
    {
      ...NO_INSIGHT,
      targetId: "product-identity",
      flipVertical: true,
      title: "What is this title, and who makes it?",
      role: ["SAM", "IT OPS"],
      body: "Aside from providing product identification at a glance, publisher logos strengthen the overall product polish and visual clarity of the platform.",
    },
    {
      ...NO_INSIGHT,
      targetId: "ownership",
      flip: true,
      title: "Who is accountable for it?",
      role: "IT OPS",
      body: "Ownership fields established a clear chain of custody, maintaining consistency with ownership patterns used across other asset profiles.",
    },
  ],
  // What does it cost?
  [
    {
      ...NO_INSIGHT,
      targetId: "total-annual-spend",
      flipVertical: true,
      title: "What is the annual commitment?",
      role: "FINANCIAL SPECIALIST",
      body: "Presents contract spend upfront as baseline context, helping stakeholders understand investment size before reviewing usage performance.",
    },
    {
      // Own tooltip + cutout — not adjacent to Cost per License (the
      // utilization bar sits between), so it can't share that tooltip's cutout.
      ...NO_INSIGHT,
      targetId: "cost-per-active-license",
      flip: true,
      flipVertical: true,
      title: "What do we pay for each license that's actually used?",
      role: "FINANCIAL SPECIALIST",
      body: "Spreads annual spend across active licenses only.",
    },
    {
      ...NO_INSIGHT,
      targetId: "cost-per-license",
      flip: true,
      title: "What does each license cost us?",
      role: "FINANCIAL SPECIALIST",
      body: "Cost per License and Cost per Active License sit side by side, so the gap between what we pay and what we get is visible.",
    },
    {
      ...NO_INSIGHT,
      targetId: "cost-impact",
      title: "What are we paying for licenses nobody uses?",
      role: ["FINANCIAL SPECIALIST", "IT OPS"],
      body: "Translates unused licenses into financial impact to drive fast, data-backed renewal and optimization decisions.",
    },
  ],
  // How is it used?
  [
    {
      ...NO_INSIGHT,
      targetId: "assigned-vs-unassigned",
      targetSelectors: [hs("legend-assigned"), hs("legend-unassigned")],
      flip: true,
      title: "How many licenses are assigned vs. unassigned?",
      role: ["SAM", "IT OPS"],
      body: "The Assigned and Unassigned legend shows each as a share of purchased licenses.",
    },
    {
      ...NO_INSIGHT,
      targetId: "utilization-summary",
      // Bar + the four legend rows only — the `.breakdown` wrapper shares this
      // data-hotspot id but also contains the cost tiles, which must stay dimmed.
      targetSelectors: [
        `${hs("utilization-summary")}:not([class])`,
        hs("legend-active"),
        hs("legend-assigned"),
        hs("legend-inactive"),
        hs("legend-unassigned"),
      ],
      title: "Are the licenses we assigned actually being used?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "Prioritized as the first actionable data type as it immediately reveals waste, enabling quick identification of reclaim opportunities without deep system dependency.",
    },
    {
      ...NO_INSIGHT,
      targetId: "idle-seats",
      targetSelectors: [hs("legend-inactive"), hs("legend-unassigned")],
      flip: true,
      flipVertical: true,
      title: "Which seats are idle and can be reclaimed?",
      role: ["SAM", "IT OPS"],
      body: "Enables quick identification of reclaim opportunities without deep system dependency.",
    },
  ],
  // Are we compliant?
  [
    {
      // Separate cutout for the Assigned row — a union with Purchased Licenses
      // would also light up the spend/cost rows between them.
      ...NO_INSIGHT,
      targetId: "legend-assigned",
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "purchased-licenses",
      title: "Do we hold enough licenses for what's deployed?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "Purchased vs. Assigned puts entitlement and deployment on one card. Assigned above Purchased would flag over-deployment.",
    },
  ],
];

export default function SoftwareProfilePrototype1Map() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [designIndex, setDesignIndex] = useState(0); // Issues Identified first

  const ds = useMemo(() => getDataset(), []);
  const row = useMemo(() => productSummary(ds, "ZOOM-ONE"), [ds]);
  const events = useMemo(() => lifecycleEvents(ds, "ZOOM-ONE"), [ds]);

  if (!row) return null;

  const hotspots =
    questionIndex === null ? [] : QUESTION_HOTSPOTS[questionIndex];

  return (
    <>
      <PrototypeTabs
        items={QUESTION_LABELS}
        value={questionIndex}
        onChange={setQuestionIndex}
        className={styles.tabsRow}
        data-question-row
      />
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
                border:
                  "var(--xops-border-width-1) solid var(--xops-border-divider)",
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
          {hotspots.length > 0 && (
            <AnnotationConnectorHotspot
              containerRef={embedWrapperRef}
              nativeWidth={580}
              hotspots={hotspots}
              accentColor="var(--color-grey-700)"
            />
          )}
        </div>
      </ImgCard>
      <PrototypeTabs
        items={DESIGN_TABS}
        value={designIndex}
        onChange={(next) => next !== null && setDesignIndex(next)}
        deselectable={false}
        className={styles.tabsRowBelow}
      />
      <EmbedSwitch
        index={designIndex}
        layers={[
          <SoftwareProfileIssuesMap key="issues" />,
          <SoftwareProfileFinalMap
            key="final"
            hotspots={[]}
            hideDistribution
          />,
        ]}
        data-profile-design-embed
      />
    </>
  );
}
