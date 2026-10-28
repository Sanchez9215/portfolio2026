"use client";

import { useLayoutEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import PrototypeTabs from "@/components/PrototypeTabs";
import LiveEmbed from "@/components/LiveEmbed";
import OverviewLegacy from "@/design-systems/xops/legacy/OverviewLegacy";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";
import { QUESTION_LABELS } from "./SoftwareSystemMap";
import styles from "./OverviewPrototype1QuestionsMap.module.css";

// One tooltip set per question (same order as QUESTION_LABELS), filled in
// role by role — SAM first, then Financial and IT Operations — as each is
// aligned. title = the question, role = the role(s) that asked it (shown as
// the tag pill), body is left empty (question-only tooltips). label/insightLabel/insight are
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
      body: "",
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
      body: "",
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
      body: "",
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
      body: "",
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
      body: "",
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
      title: "Where are our licenses held across regions and organizational units?",
      role: "SAM",
      body: "",
    },
    // ── Financial ──
    {
      ...NO_INSIGHT,
      targetId: "fin-active-tab",
      targetSelectors: [LIFECYCLE_TAB(3)],
      title: "What software is missing a business unit owner?",
      role: "FINANCIAL SPECIALIST",
      body: "",
    },
    // ── IT Ops ──
    {
      ...NO_INSIGHT,
      targetId: "it-provisioning-tab",
      targetSelectors: [LIFECYCLE_TAB(2)],
      flip: true,
      title: "What software is in provisioning/deprovisioning?",
      role: "IT OPS",
      body: "",
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
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-renewal-cost",
      spotlightId: "spend-overview",
      // Anchored at the Est. Renewals (90d) tile (2nd stat).
      targetSelectors: ['[data-hotspot="spend-stats"] > :nth-child(2)'],
      flip: true,
      title: "How much will software renewals cost us?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "",
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
      body: "",
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
      title: "How much is each organizational unit spending on software?",
      role: "FINANCIAL SPECIALIST",
      body: "",
    },
    // ── Lifecycle stages ──
    {
      ...NO_INSIGHT,
      targetId: "fin-procurement-pipeline",
      targetSelectors: [LIFECYCLE_TAB(1)],
      flip: true,
      title: "What new spend is in the pipeline?",
      role: "FINANCIAL SPECIALIST",
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "shared-renewal-tab",
      targetSelectors: [LIFECYCLE_TAB(4)],
      flipVertical: true,
      title: "Which software renewals are coming up, and for how much?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "",
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
      body: "",
    },
    {
      ...NO_INSIGHT,
      targetId: "sam-reclaimable-licenses",
      spotlightId: "sam-utilization-donut",
      targetSelectors: ['[data-hotspot="inactivity-threshold"]'],
      title: "What licenses can be reclaimed and reassigned right now?",
      role: "SAM",
      body: "",
    },
    // ── Financial ──
    {
      ...NO_INSIGHT,
      targetId: "fin-spend-vs-adoption",
      targetSelectors: [LIFECYCLE_TAB(3)],
      title: "What software has the biggest gap between high spend and low adoption?",
      role: ["SAM", "FINANCIAL SPECIALIST"],
      body: "",
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
      body: "",
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
      title: "What software has over assigned licenses?",
      role: "SAM",
      body: "",
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
      body: "",
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
      body: "",
    },
  ],
];

// Static, all-at-once rendering (no card-by-card player) for whichever
// question is selected; nothing selected = a bare, undimmed embed.
// The lifecycle-stage tooltips (every hotspot targeting a lifecycle tab). When
// false, each is swapped for a bare spotlight over the whole lifecycle card.
const SHOW_STAGE_TOOLTIPS = true;

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
// The stage notes are hidden for now (flip to true to restore).
const SHOW_STAGE_NOTES = false;

// The 4-question pill row above the embed. Hidden for now (flip to true to
// restore) — with it hidden no question can be selected, so the embed stays bare.
const SHOW_QUESTION_ROW = false;

// The notes now sit inside the lifecycle card, in its top-right corner.
const STAGE_NOTES_INSET_TOP = 16;
const STAGE_NOTES_INSET_RIGHT = 16;

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
    top: number;
    right: number;
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
        // Everything here is in on-screen px: the tooltips' type isn't scaled
        // with the embed, so neither are the insets; only the card's position
        // and 3-column width follow it.
        top: r.top - c.top + STAGE_NOTES_INSET_TOP,
        right: c.right - r.right + STAGE_NOTES_INSET_RIGHT,
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
      style={{ top: box.top, right: box.right }}
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

const VISIBLE_QUESTION_HOTSPOTS: AnnotationHotspotData[][] =
  QUESTION_HOTSPOTS.map((set) => {
    if (!set.some(isStageHotspot)) return set;
    // One spotlight over the whole lifecycle card (listed first so it defines
    // the cutout), shared by every stage tooltip in the set via spotlightId.
    // Each stage tooltip still anchors its connector at its own tab.
    return [
      STAGE_CARD_SPOTLIGHT,
      ...set.flatMap((h) => {
        if (!isStageHotspot(h)) return [h];
        return SHOW_STAGE_TOOLTIPS
          ? [{ ...h, spotlightId: STAGE_CARD_SPOTLIGHT.targetId }]
          : [];
      }),
    ];
  });

export default function OverviewPrototype1QuestionsMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);

  const hotspots =
    questionIndex === null ? [] : VISIBLE_QUESTION_HOTSPOTS[questionIndex];

  return (
    <>
      {SHOW_QUESTION_ROW && (
        <PrototypeTabs
          items={QUESTION_LABELS}
          value={questionIndex}
          onChange={setQuestionIndex}
          className={styles.tabsRow}
          data-question-row
        />
      )}
      <ImgCard variant="embed" allowOverflow>
        <div
          ref={embedWrapperRef}
          data-prototype-embed
          className={styles.embedFrame}
        >
          <LiveEmbed
            nativeWidth={1440}
            scroll
            disableCanvasTransition
            className={styles.liveEmbed}
          >
            <OverviewLegacy showLogos={false} />
          </LiveEmbed>
          {questionIndex !== null && (
            <>
              {SHOW_STAGE_NOTES && <StageNotes containerRef={embedWrapperRef} />}
            </>
          )}
          {hotspots.length > 0 && (
            <AnnotationConnectorHotspot
              containerRef={embedWrapperRef}
              nativeWidth={1440}
              hotspots={hotspots}
              accentColor="var(--color-grey-700)"
            />
          )}
        </div>
      </ImgCard>
    </>
  );
}
