"use client";

import { useLayoutEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import Label from "@/components/Label";
import LiveEmbed from "@/components/LiveEmbed";
import OverviewLegacy, {
  type StageValue,
} from "@/design-systems/xops/legacy/OverviewLegacy";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";
import { QUESTION_LABELS } from "./SoftwareSystemMap";
import styles from "./OverviewPrototype1QuestionsMap.module.css";

// One tooltip set per question (same order as QUESTION_LABELS), filled in
// role by role — SAM first, then Financial and IT Operations — as each is
// aligned. title = the question, role = the single role that asked it (shown
// as the tag pill), body = why it matters. label/insightLabel/insight are
// unused (showInsight stays false) but required by AnnotationHotspotData's
// shape. `branch` adds a second connector for questions that answer in two
// places. Tab targets are the individual lifecycle tab buttons — selecting a
// question never switches tabs.
const LIFECYCLE_TAB = (n: number) =>
  `[data-hotspot="lifecycle-stage-terms"] button:nth-of-type(${n})`;
const LICENSES_OWNED = '[data-hotspot="total-licenses-owned"]';

const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };

const QUESTION_HOTSPOTS: AnnotationHotspotData[][] = [
  // What do we own?
  [
    {
      // One spotlight over the whole License Overview card, shared by the
      // three tooltips below via spotlightId — listed first so it defines the
      // cutout.
      ...NO_INSIGHT,
      targetId: "license-overview",
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-licenses-purchased",
      spotlightId: "license-overview",
      targetSelectors: [`${LICENSES_OWNED} > :first-child`],
      flip: true,
      title: "How many licenses have we purchased?",
      role: "SAM",
      body: "Sets baseline numbers for the rest of the analysis.",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-licensing-model",
      spotlightId: "license-overview",
      // Commercial + Open Source legend rows (first two of the three).
      targetSelectors: [`${LICENSES_OWNED} > :nth-child(3) > :nth-child(-n+2)`],
      flip: true,
      flipVertical: true,
      title: "How are our licenses broken down by licensing model?",
      role: "SAM",
      body: "I needed to validate how much we needed to surface in terms of licensing models as this information could get very complex. I decided to surface a breakdown at the highest level and arrive with open questions to our review.",
    },
    {
      ...NO_INSIGHT,
      targetId: "expiring-licenses",
      spotlightId: "license-overview",
      // Attaches at the banner's bottom-right corner, tooltip down and out to
      // the right.
      flipVertical: true,
      title: "What is expiring soon?",
      role: "SAM",
      body: "My initial assumption was that licenses expired in batches based on when they were purchased, creating an operational risk if not addressed in time.",
    },
    {
      // Spotlight over the Assigned + Unassigned stat tiles — listed first so
      // it defines the shared cutout.
      ...NO_INSIGHT,
      targetId: "sam-usage-stats",
      targetSelectors: [
        '[data-hotspot="assigned-licenses"]',
        '[data-hotspot="assigned-licenses"] + *',
      ],
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-assigned-unassigned",
      spotlightId: "sam-usage-stats",
      // Connector attaches at the Unassigned stat's top-right corner (default
      // attach, no flip) — the spotlight (above) still covers both tiles.
      targetSelectors: ['[data-hotspot="assigned-licenses"] + *'],
      title: "How many licenses are assigned vs. unassigned? (Overall and Per Title)",
      role: "SAM",
      body: "Shows what's been given to employees vs. what's available, so teams don't buy more.",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-provisioning-tab",
      targetSelectors: [LIFECYCLE_TAB(2)],
      flip: true,
      flipVertical: true,
      // Exception to the shared 32px diagonal — lengthened so the tooltip
      // clears the tab row.
      placeBelow: true,
      title: "What software is being set up or assigned to users?",
      role: "SAM",
      body: "Shows purchased software stuck in set-up or assignment, to avoid duplicate purchases.",
    },
    {
      // Spotlight over Region + Cost Center + Business Unit + Department — listed first
      // so it defines the shared cutout.
      ...NO_INSIGHT,
      targetId: "sam-org-filter-fields",
      targetSelectors: [
        '[data-hotspot="geographic-filtering"] > :first-child',
        '[data-hotspot="geographic-filtering"] > :nth-child(n+3)',
      ],
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-org-filters",
      spotlightId: "sam-org-filter-fields",
      // Connector attaches at the Region field alone (1st child), tooltip to
      // its left; the spotlight covers all four filter fields.
      targetSelectors: ['[data-hotspot="geographic-filtering"] > :first-child'],
      flip: true,
      title: "Where are our licenses held across regions and org units?",
      role: "SAM",
      body: "Filters re-scope every number on the page, so SAM can check entitlements against regional and org-unit boundaries.",
    },
    // ── Financial ──
    {
      ...NO_INSIGHT,
      targetId: "fin-active-tab",
      targetSelectors: [LIFECYCLE_TAB(3)],
      title: "What software is missing a business unit owner?",
      role: "FINANCIAL SPECIALIST",
      body: "A blank B.U. Owner is software no one is accountable for. I surfaced it next to spend in the lifecycle tables so those gaps stand out.",
    },
    // ── IT Ops ──
    {
      ...NO_INSIGHT,
      targetId: "it-provisioning-tab",
      targetSelectors: [LIFECYCLE_TAB(2)],
      flip: true,
      title: "What software is in provisioning/deprovisioning?",
      role: "IT OPS",
      body: "Tracks software moving into setup or out of service, keeping IT support tickets aligned with the tool's actual lifecycle phase.",
    },
    // TODO (progress.md Deferred): "What software has been set for
    // deprovisioning?" — SAM, "Ensures licenses are reclaimed for new users
    // instead of raising spend through new purchases." No target element on
    // the dashboard yet; add once one is picked.
  ],
  // What does it cost?
  [
    {
      // One spotlight over the whole Spend panel, shared by the two SAM
      // tooltips below via spotlightId — listed first so it defines the cutout.
      ...NO_INSIGHT,
      targetId: "spend-overview",
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-annual-spend",
      spotlightId: "spend-overview",
      targetSelectors: ['[data-hotspot="spend-stats"] > :nth-child(1)'],
      flip: true,
      flipVertical: true,
      title: "How much are we spending per year?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "Total Annual Spend sets the baseline, and the vendor table shows each vendor's share of it.",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-renewal-cost",
      spotlightId: "spend-overview",
      // Anchored at the Spend card's own top-right corner, not the tile.
      targetSelectors: ['[data-hotspot="spend-overview"]'],
      title: "How much will software renewals cost us?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "Est. Renewals (90d) puts a dollar figure on what's coming up, so renewals get planned before contracts lapse.",
    },
    {
      ...NO_INSIGHT,
      targetId: "shared-vendor-concentration",
      spotlightId: "spend-overview",
      // Section label + the table right after it.
      targetSelectors: [
        '[data-hotspot="top-spend-vendor"]',
        '[data-hotspot="top-spend-vendor"] + *',
      ],
      flip: true,
      flipVertical: true,
      title: "What vendors is the majority of our annual spend concentrated with?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "The vendor table shows each vendor's share of total spend, so finance can see where spend is concentrated.",
    },
    {
      // Spotlight over Region + Cost Center + Business Unit + Department — listed first
      // so it defines the shared cutout.
      ...NO_INSIGHT,
      targetId: "fin-org-filter-fields",
      targetSelectors: [
        '[data-hotspot="geographic-filtering"] > :first-child',
        '[data-hotspot="geographic-filtering"] > :nth-child(n+3)',
      ],
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "fin-org-filters",
      spotlightId: "fin-org-filter-fields",
      // Connector attaches at the Region field alone (1st child), tooltip to
      // its left; the spotlight covers all four filter fields.
      targetSelectors: ['[data-hotspot="geographic-filtering"] > :first-child'],
      flip: true,
      title: "How much is each org unit spending on software?",
      role: "FINANCIAL SPECIALIST",
      body: "Filters re-scope every number on the page, allowing finance to attribute spend to any particular org unit.",
    },
    // ── Lifecycle stages ──
    {
      ...NO_INSIGHT,
      targetId: "fin-procurement-pipeline",
      targetSelectors: [LIFECYCLE_TAB(1)],
      flip: true,
      title: "What new spend is in the pipeline?",
      role: "FINANCIAL SPECIALIST",
      body: "Procurement lists requested software with its estimated annual cost, so finance sees spend before it's committed.",
    },
    {
      ...NO_INSIGHT,
      targetId: "shared-renewal-tab",
      targetSelectors: [LIFECYCLE_TAB(4)],
      flipVertical: true,
      title: "Which software renewals are coming up, and for how much?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "Renewal lists each product with its renewal date, days remaining and total spend, so action starts before contracts lapse.",
    },
  ],
  // How is it used?
  [
    {
      // Spotlight over the License Utilization label + donut + legend — listed
      // first so it defines the cutout shared by the two tooltips below.
      ...NO_INSIGHT,
      targetId: "sam-utilization-donut",
      targetSelectors: [
        '[data-hotspot="license-utilization"]',
        '[data-hotspot="license-utilization"] ~ *',
      ],
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      // TODO (progress.md Deferred): the "Per Title" half of this question
      // (Utilization + Inactive table columns) is on hold, not built.
      ...NO_INSIGHT,
      targetId: "sam-active-inactive-overall",
      spotlightId: "sam-utilization-donut",
      targetSelectors: ['[data-hotspot="license-utilization"] + *'],
      title: "How many assigned licenses are active vs. inactive? (Overall)",
      role: "SAM",
      body: "Splits licenses into active, inactive and unassigned, so idle spend is visible at a glance.",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-reclaimable-licenses",
      spotlightId: "sam-utilization-donut",
      targetSelectors: ['[data-hotspot="inactivity-threshold"]'],
      title: "What licenses can be reclaimed and reassigned right now?",
      role: "SAM",
      body: "Licenses not used for a specific time range would be the ones to reclaim. I set 60 days as a default to start the discussion, since thresholds vary by software type.",
    },
    // ── Financial ──
    {
      ...NO_INSIGHT,
      targetId: "fin-spend-vs-adoption",
      targetSelectors: [LIFECYCLE_TAB(3)],
      title: "What software has the biggest gap between high spend and low adoption?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "Total Spend sits next to Utilization on every active title, so over-paid, under-used software stands out.",
    },
    // ── IT Ops ──
    {
      ...NO_INSIGHT,
      targetId: "it-rollout-adoption",
      targetSelectors: [LIFECYCLE_TAB(2)],
      flip: true,
      flipVertical: true,
      title: "Is adoption of newly rolled-out software meeting target?",
      role: "IT OPS",
      body: "Provisioning shows licenses assigned against the activation threshold, so IT can see rollouts that haven't taken hold.",
    },
  ],
  // Are we compliant?
  [
    {
      // One spotlight over the whole Top 10 Non-Compliant card, shared by the
      // two table tooltips below — listed first so it defines the cutout.
      ...NO_INSIGHT,
      targetId: "top-non-compliant",
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-over-deployed",
      spotlightId: "top-non-compliant",
      // Type column (header + cells).
      targetSelectors: [
        '[data-hotspot="top-non-compliant"] th:nth-child(3)',
        '[data-hotspot="top-non-compliant"] td:nth-child(3)',
      ],
      title: "Which software has more installed instances than we have licenses for?",
      role: "SAM",
      body: "Instances next to the violation type show where installs have outrun what we've licensed.",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-audit-risk",
      spotlightId: "top-non-compliant",
      // Instances column (header + cells).
      targetSelectors: [
        '[data-hotspot="top-non-compliant"] th:nth-child(2)',
        '[data-hotspot="top-non-compliant"] td:nth-child(2)',
      ],
      flip: true,
      title: "Which software carries the most audit risk?",
      role: "SAM",
      body: "The table is ranked by instance count, so the titles most exposed in an audit come first.",
    },
    {
      // Spotlight over the whole Compliance card — listed first so it defines
      // the cutout; the tooltip below anchors at the card's left edge.
      ...NO_INSIGHT,
      targetId: "compliance-granularity",
      cutoutOnly: true,
      title: "",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-compliance-stance",
      spotlightId: "compliance-granularity",
      // Attaches at the card's top-left, tooltip running out to the left.
      targetSelectors: ['[data-hotspot="compliance-granularity"]'],
      flip: true,
      title: "What is our compliance stance overall?",
      role: "SAM",
      body: "Compliant, At Risk and Non-Compliant instances in one view, so we know where we stand before an audit does.",
    },
  ],
];

// Static, all-at-once rendering (no card-by-card player) for whichever
// question is selected; nothing selected = a bare, undimmed embed.
// TEMP: the lifecycle-stage tooltips (every hotspot targeting a lifecycle tab)
// are hidden while the story is reworked — each is swapped for a bare
// spotlight over the whole lifecycle card instead. Flip to true to restore.
const SHOW_STAGE_TOOLTIPS = false;

const isStageHotspot = (h: AnnotationHotspotData) =>
  h.targetSelectors?.some((sel) => sel.includes("lifecycle-stage-terms"));

const STAGE_CARD_SPOTLIGHT: AnnotationHotspotData = {
  ...NO_INSIGHT,
  targetId: "lifecycle-stage-scope",
  cutoutOnly: true,
  spotlightPadding: 0,
  spotlightRadius: 12,
  title: "",
  body: "",
};

// The two general notes (why stages matter, how the baseline columns were
// chosen) sit at the tooltips' own level — an overlay row directly above the
// lifecycle card, shown whenever a question is selected (see StageNotes).
const STAGE_NOTES_OFFSET = 32;
const STAGE_QUESTIONS_OFFSET = 32;

const STAGE_NOTES = [
  {
    title: "Lifecycle Stage Visibility",
    body: "Visibility into what assets exist and how many sit at each lifecycle stage was core to the XOPS observability model. It gave the role accountable at each stage the context to make proactive decisions, cut waste and address risks before they became costly.",
  },
  {
    title: "Baseline Columns",
    body: "Each stage calls for different kinds of decisions, so I asked ChatGPT, Gemini and Claude which attributes matter most to our three roles, then kept the ones all three models agreed on. This became my baseline hypothesis to test.",
  },
];

// Measured against the live lifecycle card and scaled with the embed, same as
// the tooltips, so the type matches them at any embed width.
function StageNotes({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement>;
}) {
  const [box, setBox] = useState<{
    left: number;
    bottom: number;
    width: number;
    noteWidth: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const card = container.querySelector<HTMLElement>(
        '[data-hotspot="lifecycle-stage-scope"]',
      );
      if (!card) return;
      const c = container.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      const scale = c.width / 1440;
      // The card is a 12-col GridItem; its parent Grid's column-gap (native px)
      // gives the width of 3 columns: (W - 3·gap) / 4.
      const grid = card.parentElement?.parentElement;
      const gap = grid ? parseFloat(getComputedStyle(grid).columnGap) || 0 : 0;
      const width = r.width / scale;
      setBox({
        left: r.left - c.left,
        // 32px clear of the card's top edge. Everything here is in on-screen
        // px: the tooltips' type isn't scaled with the embed, so neither is
        // this; only the card's position and 3-column width follow it.
        bottom: c.bottom - r.top + STAGE_NOTES_OFFSET,
        width: r.width,
        noteWidth: ((width - 3 * gap) / 4) * scale,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef]);

  if (!box) return null;
  return (
    <div
      className={styles.stageNotes}
      style={{
        left: box.left,
        bottom: box.bottom,
        width: box.width,
      }}
    >
      {STAGE_NOTES.map((note) => (
        <div
          key={note.title}
          className={styles.stageNote}
          style={{ width: box.noteWidth }}
        >
          <p className={styles.stageNoteTitle}>{note.title}</p>
          <p className={styles.stageNoteBody}>{note.body}</p>
        </div>
      ))}
    </div>
  );
}

// Stage questions per category (same order as QUESTION_LABELS): what the
// lifecycle table itself answers, by stage and column. Listed as a plain column
// 32px left of the lifecycle card — no connectors. Compliant has none: the
// table has no compliance column. Titles/descriptions are drafts to confirm.
const STAGE_QUESTIONS: {
  stage: StageValue;
  title: string;
  roles: string[];
  body: string;
}[][] = [
  // What do we own?
  [
    {
      stage: "provisioning",
      title: "What purchased software is still being set up?",
      roles: ["SAM", "IT OPS"],
      body: "On the Provisioning tab, Assigned and B.U Owner show what was purchased but is still being set up, and who owns it.",
    },
    {
      stage: "active",
      title: "What software has no business unit owner?",
      roles: ["FINANCIAL SPECIALIST"],
      body: "On the Active tab, a blank B.U Owner beside Total Spend marks software nobody is accountable for.",
    },
  ],
  // What does it cost?
  [
    {
      stage: "procurement",
      title: "What new spend is in the pipeline?",
      roles: ["FINANCIAL SPECIALIST"],
      body: "On the Procurement tab, Licenses Requested, Latest Request Date and Est. Annual Cost show spend before it's committed.",
    },
    {
      stage: "renewal",
      title: "Which titles renew soonest, and what are they worth?",
      roles: ["SAM", "FINANCIAL SPECIALIST"],
      body: "On the Renewal tab, Days to Renewal beside Total Spend ranks the biggest, closest contracts so action starts early.",
    },
  ],
  // How is it used?
  [
    {
      stage: "active",
      title: "Where is spend high and adoption low?",
      roles: ["SAM", "FINANCIAL SPECIALIST"],
      body: "On the Active tab, Total Spend sits beside Utilization and Inactive, so over-paid, under-used software stands out.",
    },
    {
      stage: "provisioning",
      title: "Are new rollouts taking hold?",
      roles: ["IT OPS"],
      body: "On the Provisioning tab, Assigned against the Activation Threshold shows rollouts that haven't taken hold.",
    },
    {
      stage: "renewal",
      title: "What is underused going into renewal?",
      roles: ["SAM"],
      body: "On the Renewal tab, Utilization and Inactive beside Days to Renewal show what to cut before the contract renews.",
    },
  ],
  // Are we compliant?
  [],
];

// Only the question(s) for the stage tab currently open in the embed show.
function StageQuestions({
  containerRef,
  questionIndex,
  stage,
}: {
  containerRef: React.RefObject<HTMLElement>;
  questionIndex: number;
  stage: StageValue;
}) {
  const [box, setBox] = useState<{
    top: number;
    right: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const card = container.querySelector<HTMLElement>(
        '[data-hotspot="lifecycle-stage-scope"]',
      );
      if (!card) return;
      const c = container.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      // Right edge sits 32px left of the card, top aligned with it. Width is the
      // tooltips' own fixed 232px, so the column may extend past the embed's
      // left edge (the ImgCard allows overflow).
      const edge = r.left - c.left - STAGE_QUESTIONS_OFFSET;
      setBox({ top: r.top - c.top, right: c.width - edge });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef]);

  const items = STAGE_QUESTIONS[questionIndex].filter((q) => q.stage === stage);
  if (!box || items.length === 0) return null;
  return (
    <div
      className={styles.stageQuestions}
      style={{ top: box.top, right: box.right }}
    >
      {items.map((q) => (
        <div key={q.title} className={styles.stageQuestion}>
          <p className={styles.stageNoteTitle}>{q.title}</p>
          <div className={styles.stageQuestionRoles}>
            {q.roles.map((role) => (
              <span key={role} className={styles.stageRoleTag}>
                {role}
              </span>
            ))}
          </div>
          <p className={styles.stageNoteBody}>{q.body}</p>
        </div>
      ))}
    </div>
  );
}

const VISIBLE_QUESTION_HOTSPOTS: AnnotationHotspotData[][] =
  QUESTION_HOTSPOTS.map((set) =>
    SHOW_STAGE_TOOLTIPS
      ? set
      : set.map((h) => (isStageHotspot(h) ? STAGE_CARD_SPOTLIGHT : h)),
  );

export default function OverviewPrototype1QuestionsMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [stage, setStage] = useState<StageValue>("provisioning");

  const hotspots =
    questionIndex === null ? [] : VISIBLE_QUESTION_HOTSPOTS[questionIndex];

  return (
    <>
      <div className={styles.questionRow}>
        {QUESTION_LABELS.map((label, qi) => (
          <button
            key={label}
            type="button"
            className={styles.question}
            aria-pressed={questionIndex === qi}
            onClick={() =>
              setQuestionIndex((prev) => (prev === qi ? null : qi))
            }
          >
            <Label
              size="lg"
              color={
                questionIndex === null || questionIndex === qi
                  ? "default"
                  : "tertiary"
              }
            >
              {label}
            </Label>
          </button>
        ))}
      </div>
      <ImgCard variant="embed" allowOverflow>
        <div ref={embedWrapperRef} style={{ position: "relative" }}>
          <LiveEmbed nativeWidth={1440} disableCanvasTransition>
            <OverviewLegacy showLogos={false} onStageChange={setStage} />
          </LiveEmbed>
          {questionIndex !== null && (
            <>
              <StageNotes containerRef={embedWrapperRef} />
              <StageQuestions
                containerRef={embedWrapperRef}
                questionIndex={questionIndex}
                stage={stage}
              />
            </>
          )}
          {hotspots.length > 0 && (
            <AnnotationConnectorHotspot
              containerRef={embedWrapperRef}
              nativeWidth={1440}
              hotspots={hotspots}
            />
          )}
        </div>
      </ImgCard>
    </>
  );
}
