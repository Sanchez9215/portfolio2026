"use client";

import { useLayoutEffect, useRef, useState } from "react";
import ProcessConnector from "@/components/ProcessConnector";
import {
  buildFanTrapezoid as buildFanTrapezoidShared,
  buildFanLeadConnector as buildFanLeadConnectorShared,
  insetEnd as insetEndShared,
  FAN_BRANCH_HEIGHT,
  FAN_LEG_ANGLE_DEG,
  FAN_CARD_GAP,
} from "@/components/buildFanTrapezoid";
import styles from "./DataCertificationTriggers.module.css";

// First real build against PLAN.md's "Process Diagram / Connector System"
// ruleset — Figma node 1766:7607/1758:7579 (Triggers section only; the
// bottom mirrored half of that frame's hexagon bracket connects to the
// next section, not built yet, so it's skipped here). Copy verbatim from
// Figma; column spans and positions are NOT copied from Figma's own px
// values (its 96px side padding doesn't match this page's real --spacing-xl
// grid padding) — placed on this page's own 12-col grid instead.

interface CardContent {
  title: string;
  body: string;
}

const TRIGGERS: CardContent[] = [
  { title: "Upcoming Audit", body: "Need to pass compliance check." },
  { title: "Scheduled", body: "Annual/Quarterly Review" },
  { title: "Event", body: "Owner leaves, outage, or large migration." },
];

const REACTIVE_RUSH: CardContent = {
  title: "Reactive Rush",
  body: "Reviews only happen before audits.",
};

const THINGS_GO_UNNOTICED: CardContent = {
  title: "Things Go Unnoticed",
  body: "Owner changes or owners who are leaving slide past the radar.",
};

// Main certification flow (Figma node 1766:7651, "Section.StakeholderCards"
// — misleading layer name, actually this case study's continuation).
// Built incrementally, one step at a time; only step 1 so far.
const ASSET_PRIORITIZATION: CardContent = {
  title: "Asset Prioritization",
  body: "List of most critical assets must be finalized by this cycle.",
};

const OFTEN_OVER_SCOPED: CardContent = {
  title: "Often Over-Scoped",
  body: "Too many assets, nothing gets prioritized.",
};

const EASY_CLEAN_UP_FIRST: CardContent = {
  title: "Easy Clean-Up First",
  body: "Configuration management team takes care of obvious fixes (duplicate records, fields that can be sourced from other systems) so owners don't waste their time.",
};

const CLEAN_UP_DOESNT_HAPPEN: CardContent = {
  title: "Clean-up Doesn't Happen",
  body: "Owners waste time on easy fixes. This results in wasted time and bulk certification (rubber-stamping).",
};

const REVIEW_TASKS_ASSIGNED: CardContent = {
  title: "Review Tasks Assigned",
  body: "Once asset owners are confirmed, tasks and a deadline are sent.",
};

const TASKS_GO_NOWHERE: CardContent = {
  title: "Tasks Go Nowhere",
  body: "Tasks are sent to former employees or shared queues no one monitors.",
};

const OWNER_REVIEWS_EACH_ASSET: CardContent = {
  title: "Owner Reviews Each Asset",
  body: "Does the record match reality? Does the asset still exist? Is it still needed",
};

const ASSETS_GO_UNCHECKED: CardContent = {
  title: "Assets Go Unchecked",
  body: "Owner “certifies all’ without checking.",
};

// First 2-way fork (Figma node 1771:7737) — a decision label splitting into
// exactly 2 outcomes via buildFanTrapezoid (its own mid-stub loop is a
// no-op for a 2-target fan, so the shape is just the shoulder + 2 diagonal
// legs, no extra code needed). Only this fork is in scope this pass — "Yes"
// is a bare label (its own sub-chain continues past this node, not built
// yet); "No" has a full title+body in Figma already, built as a step card.
const DID_OWNER_RESPOND_BY_DEADLINE = "Did Owner Respond by Deadline?";

const NO: CardContent = {
  title: "No",
  body: "Final deadline is set, if passed again record is marked as unverified and assigned to someone else.",
};

// Yes continues into its own 3-way fork (Correct/Wrong/No Longer Exists,
// Figma node 1771:7737 continued).
const WHAT_DID_THEY_SAY = "What did they say about the record?";

// 3-way fork from "What did they say" — bare labels, same mechanic as
// Yes/No (no card chrome). Correct is the neutral/success path (grey);
// Wrong and No Longer Exists are both failure paths (warning red) —
// Figma carries no color info on these nodes, confirmed with the user.
const CORRECT = "Correct";
const WRONG = "Wrong";
const NO_LONGER_EXISTS = "No Longer Exists";

// Wrong/No Longer Exists' own downstream resolution steps (Figma node
// 1772:7737 continued). Neutral grey, confirmed by the user, despite
// continuing from the warning-red outcomes above (these are the
// resolution, not a pain annotation).
const IMPLEMENT_FIX: CardContent = {
  title: "Implement Fix",
  body: "Owner corrects the record. CMDB governance team fixes the cause.",
};

const RECORD_IS_RETIRED: CardContent = {
  title: "Record is Retired",
  body: "Decomissioning process starts.",
};

// Pain branch off Implement Fix — connects the same way as every other
// pain branch in this diagram (diagonal lead off the title label's own
// edge, growing outward, warning red).
const ISSUES_GO_UNFIXED: CardContent = {
  title: "Issues Go Unfixed",
  body: "No clear fix owner. Tasks compete with real work. No consequences for undone fixes.",
};

// Fed by an upward 3-way fan off Record is Retired/Implement Fix; the
// fan's third (Correct) slot is left hanging — see the component's
// fan-building comment.
const DOUBLE_CHECK_ANSWERS: CardContent = {
  title: "Double-Check Answers",
  body: "Compare what owners said against what the systems show, including records marked correct.",
};

// Double-Check Answers' own pain branch — same diagonal-lead-off-title
// mechanic as every other pain card, right side.
const NOTHING_IS_DOUBLE_CHECKED: CardContent = {
  title: "Nothing is Double-Checked",
  body: "Bad approvals slip through.",
};

// Third fork, off Double-Check Answers (Figma node 1776:7897/7898) — bare
// labels, same mechanic as Yes/No and Correct/Wrong/No Longer Exists. Match
// is the neutral/success side; Don't Match is the failure side, colored
// warning red including its own label (confirmed by the user — Figma
// itself renders both neutral, but the Did-Owner-Respond fork's Yes/No
// coloring is the actual precedent to match here, not Figma's raw color).
// Everything downstream of Don't Match (Mismatches Are Investigated, the
// "Fixes Re-Checked" loop-back) and downstream of Match (the merge into
// Certification Cycle Closes) is explicitly out of scope for this pass.
const MATCH = "Match";
const DONT_MATCH = "Don't Match";

// Don't Match drops straight into this resolution step (Figma node
// 1776:7915) — neutral grey, same as Implement Fix/Record is Retired
// continuing from the warning-red outcomes above (this is the
// resolution, not a pain annotation). Match's own continuation and the
// merge into Certification Cycle Closes are still out of scope.
const MISMATCHES_ARE_INVESTIGATED: CardContent = {
  title: "Mismatches Are Investigated",
  body: "Owner explains mismatch. CMDB team decides whats right. If unresolved, the record is marked 'not verified'.",
};

// Match + Mismatches Are Investigated's merge target (Figma node
// 1776:7929/7930/7931) — neutral grey, same as every other resolution
// step. Resolves the merge's previously-temporary shoulder centerX (see
// the merge-building effect) into a real external anchor.
const CERTIFICATION_CYCLE_CLOSES: CardContent = {
  title: "Certification Cycle Closes",
  body: "Every outcome, including records left unverified, is logged with proof and used to report how complete and accurate the data is.",
};

// Certification Cycle Closes' own 2 pain branches (Figma nodes
// 1776:8093-8096 and 1776:8098-8101) — same generic pain-branch mechanic
// as every other card in this diagram, just two cards off one step
// instead of one (see painBranches/branches config below).
const DATA_IS_CONSTANTLY_DECAYING: CardContent = {
  title: "Data is Constantly Decaying",
  body: 'Records are stale within weeks, but the "certified" label stays.',
};

const AUDIT_SCRAMBLE: CardContent = {
  title: "Audit Scramble",
  body: "Proof is gathered at the last minute before an audit, from emails and spreadsheets.",
};

interface Point {
  x: number;
  y: number;
}

interface LineSpec {
  from: Point;
  to: Point;
  shape: "straight" | "elbow" | "halfCircle";
  color: string;
  arrow?: boolean;
  gap?: number;
  bulge?: "left" | "right";
  dashed?: boolean;
}

const ARROW_ID = "data-certification-triggers-arrow";

// Trapezoid connector shape (PLAN.md's "Process Diagram / Connector System",
// superseded-rule entry) — replaces the old triangle fan (straight lines
// radiating from one point) and the old rounded elbow. Every diagonal leg
// is a fixed 30deg-from-horizontal line.
// The diagram's confirmed rendered length for every straight, non-fan stub
// is 64px. Both ends are always real anchors and this value only ever
// appears baked into the CSS gap between them (see this component's
// .module.css comments) — the browser gives the real distance, nothing
// computes it in JS, so it isn't declared as a JS constant.
// Fan-trapezoid branch height — the controlled, confirmed vertical distance
// from a fan's shoulder line down to its real targets. Governs both the
// center stub's length (e.g. shoulder→Scheduled) AND how far the diagonal
// legs must reach (dx = BRANCH_HEIGHT / tan(LEG_ANGLE_DEG)) to hit the real
// outer targets — the diagonals grow/shrink to fill whatever horizontal
// distance that implies, never the other way around. Independent of the
// 64px simple-stub length (the separate lead-in stub from a real source
// like the Triggers label into the shoulder) — the two don't share a
// derivation, so one can't silently collapse the other's visible length.
// Single control for every plain straight-stub connector's length (the
// diagram's confirmed 64px, matches --spacing-3xl) — applied to the DOM as
// the --connector-length CSS custom property on .wrap (see the JSX below),
// which the module CSS's margin calc()s reference instead of each
// re-deriving 64 from a different combination of spacing tokens. Unlike
// BRANCH_HEIGHT/CARD_GAP, nothing in this file does math with this value —
// it only ever sets real DOM spacing, which the measurement effects then
// read back via getBoundingClientRect, same as before.
const CONNECTOR_LENGTH = 64;
// The real horizontal margin between a step card's own edge and its pain
// card's own edge — this is what positions every pain card (see the
// painBranches effect), independent of the connector drawn between them.
// The connector itself (see buildBranch) is a separate, derived shape: a
// lead off the step's title label, then one diagonal landing on the pain
// card's real top-center, auto-adjusting its own lead/diagonal split to
// whatever real distance that implies — it does not define this gap, it
// just has to reach across it.
const STEP_PAIN_GAP = 96;
// The real vertical gap between a step card's own TOP edge and its pain
// card's own top — standardizes what used to be whatever align-self:end +
// shared-row-height happened to produce per instance (different body text
// lengths meant a different real distance every time). Measured from the
// step card's top, not its bottom or title, so it's unaffected by how
// much body text the step card itself has.
const STEP_PAIN_VERTICAL_GAP = 32;
// Sourced from components/buildFanTrapezoid.ts (shared with StakeholdersCards)
// — this file no longer defines its own copy of these values.
const BRANCH_HEIGHT = FAN_BRANCH_HEIGHT;
const LEG_ANGLE_DEG = FAN_LEG_ANGLE_DEG;
const LEG_ANGLE_RAD = (LEG_ANGLE_DEG * Math.PI) / 180;
const LEG_TAN = Math.tan(LEG_ANGLE_RAD);
const LEG_SIN = Math.sin(LEG_ANGLE_RAD);
// Real vertical clearance between a drawn line and the real card/label it
// touches — matches --spacing-sm. Along a diagonal (fixed LEG_ANGLE_DEG)
// line, dividing by sin(angle) converts this into the along-line distance
// that produces an exact CARD_GAP of real vertical clearance.
const CARD_GAP = FAN_CARD_GAP;
const CARD_GAP_ALONG_LINE = CARD_GAP / LEG_SIN;

export default function DataCertificationTriggers() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggersLabelRef = useRef<HTMLSpanElement>(null);
  const upcomingAuditRef = useRef<HTMLDivElement>(null);
  const upcomingAuditTitleRef = useRef<HTMLSpanElement>(null);
  const scheduledRef = useRef<HTMLDivElement>(null);
  const eventRef = useRef<HTMLDivElement>(null);
  const eventTitleRef = useRef<HTMLSpanElement>(null);
  const reactiveRushRef = useRef<HTMLDivElement>(null);
  const thingsGoUnnoticedRef = useRef<HTMLDivElement>(null);
  const assetPrioritizationRef = useRef<HTMLDivElement>(null);
  const assetPrioritizationTitleRef = useRef<HTMLSpanElement>(null);
  const oftenOverScopedRef = useRef<HTMLDivElement>(null);
  const easyCleanUpFirstRef = useRef<HTMLDivElement>(null);
  const easyCleanUpFirstTitleRef = useRef<HTMLSpanElement>(null);
  const cleanUpDoesntHappenRef = useRef<HTMLDivElement>(null);
  const reviewTasksAssignedRef = useRef<HTMLDivElement>(null);
  const reviewTasksAssignedTitleRef = useRef<HTMLSpanElement>(null);
  const tasksGoNowhereRef = useRef<HTMLDivElement>(null);
  const ownerReviewsEachAssetRef = useRef<HTMLDivElement>(null);
  const ownerReviewsEachAssetTitleRef = useRef<HTMLSpanElement>(null);
  const assetsGoUncheckedRef = useRef<HTMLDivElement>(null);
  const didOwnerRespondRef = useRef<HTMLSpanElement>(null);
  const noRef = useRef<HTMLDivElement>(null);
  const noTitleRef = useRef<HTMLSpanElement>(null);
  const yesRef = useRef<HTMLDivElement>(null);
  const yesTitleRef = useRef<HTMLSpanElement>(null);
  const whatDidTheySayRef = useRef<HTMLSpanElement>(null);
  const outcomesRowRef = useRef<HTMLDivElement>(null);
  const correctRef = useRef<HTMLDivElement>(null);
  const noLongerExistsRef = useRef<HTMLDivElement>(null);
  const wrongRef = useRef<HTMLDivElement>(null);
  const resolutionRowRef = useRef<HTMLDivElement>(null);
  const implementFixRef = useRef<HTMLDivElement>(null);
  const implementFixTitleRef = useRef<HTMLSpanElement>(null);
  const recordIsRetiredRef = useRef<HTMLDivElement>(null);
  const issuesGoUnfixedRef = useRef<HTMLDivElement>(null);
  const doubleCheckAnswersRef = useRef<HTMLDivElement>(null);
  const doubleCheckAnswersTitleRef = useRef<HTMLSpanElement>(null);
  const nothingIsDoubleCheckedRef = useRef<HTMLDivElement>(null);
  const matchDontMatchRowRef = useRef<HTMLDivElement>(null);
  const matchRef = useRef<HTMLDivElement>(null);
  const dontMatchRef = useRef<HTMLDivElement>(null);
  const mismatchesAreInvestigatedRef = useRef<HTMLDivElement>(null);
  const mismatchesAreInvestigatedTitleRef = useRef<HTMLSpanElement>(null);
  const certificationCycleClosesRef = useRef<HTMLDivElement>(null);
  const certificationCycleClosesTitleRef = useRef<HTMLSpanElement>(null);
  const dataIsConstantlyDecayingRef = useRef<HTMLDivElement>(null);
  const auditScrambleRef = useRef<HTMLDivElement>(null);

  const [wrapSize, setWrapSize] = useState({ width: 0, height: 0 });
  const [lines, setLines] = useState<LineSpec[]>([]);
  const [followUpsSentPos, setFollowUpsSentPos] = useState<Point | null>(null);
  const [fixesRecheckedPos, setFixesRecheckedPos] = useState<Point | null>(
    null,
  );
  // Real measured shift that puts the outcomes row's own center exactly on
  // "What did they say"'s real x — not a derived CSS calc() (which assumes
  // two differently-structured rows share an X just because both are
  // centered; the skill explicitly warns against that shortcut).
  const [outcomesOffset, setOutcomesOffset] = useState(0);
  // Same technique for the resolution row (Implement Fix/Record is
  // Retired) — both rows reuse triggerCardWidth + --spacing-xl gap (see
  // below), so a single row-level shift is enough; no per-card offset or
  // custom gap math needed, since matching widths/gaps already keep
  // adjacent items the same distance apart on both rows.
  const [resolutionOffset, setResolutionOffset] = useState(0);
  // Same measured-shift technique — aligns Double-Check Answers directly
  // under Record is Retired's real x (not plain grid centering).
  const [doubleCheckAnswersOffset, setDoubleCheckAnswersOffset] = useState(0);
  // Same measured-shift technique — centers the Match/Don't Match fork
  // row under Double-Check Answers' own real x (which itself already
  // carries doubleCheckAnswersOffset), not this span's grid center.
  const [matchDontMatchOffset, setMatchDontMatchOffset] = useState(0);
  // Same measured-shift technique — aligns Mismatches Are Investigated
  // directly under Don't Match's real x (the right member of the
  // Match/Don't Match pair, not that row's own center).
  const [mismatchesAreInvestigatedOffset, setMismatchesAreInvestigatedOffset] =
    useState(0);
  // Same measured-shift technique — Certification Cycle Closes continues
  // the same finalTargetCenterX spine Double-Check Answers/Record is
  // Retired already align to (the main flow's return-to-center point
  // after the Match/Don't Match fork), not an independent position.
  const [certificationCycleClosesOffset, setCertificationCycleClosesOffset] =
    useState(0);
  // Every pain card's own horizontal pull: lands its real edge exactly
  // STEP_PAIN_GAP away from its own parent step CARD's real edge (not the
  // connector — the connector is a separate, derived shape that just has
  // to reach across whatever this gap implies). Vertical position is
  // untouched, plain CSS/row placement. One shared, tunable gap for every
  // pain card, including Nothing is Double-Checked (previously a special
  // case aligned to Implement Fix instead). Keyed by the same name used
  // in painBranches below, computed once in the dedicated effect near it.
  const [painCardOffsets, setPainCardOffsets] = useState<
    Record<string, { x: number; y: number }>
  >({});
  // The trigger cards' own real rendered width — reused directly for
  // Correct/Wrong/No Longer Exists and Implement Fix/Record is Retired,
  // instead of assuming .stepCard's coded 301px actually renders at
  // 301px (it doesn't once 3 of them don't fit the available grid-column
  // width — the browser's default flex-shrink already compresses the
  // trigger row itself). Measuring the real value directly is the only
  // way two different-item-count rows reliably end up with the exact same
  // per-item width.
  const [triggerCardWidth, setTriggerCardWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const wrapEl = wrapRef.current;
    if (!wrapEl) return;
    const ro = new ResizeObserver(([entry]) => {
      setWrapSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    ro.observe(wrapEl);
    return () => ro.disconnect();
  }, []);

  // Every pain card in this diagram, reusable config: its own parent step
  // CARD (not just the title — the gap is card-edge to card-edge), its
  // own card element, and which way it sits outward. One place to
  // add/remove a pain card rather than a bespoke measurement per card.
  const painBranches = [
    {
      key: "reactiveRush",
      stepCardRef: upcomingAuditRef,
      cardRef: reactiveRushRef,
      direction: -1,
    },
    {
      key: "thingsGoUnnoticed",
      stepCardRef: eventRef,
      cardRef: thingsGoUnnoticedRef,
      direction: 1,
    },
    {
      key: "oftenOverScoped",
      stepCardRef: assetPrioritizationRef,
      cardRef: oftenOverScopedRef,
      direction: -1,
    },
    {
      key: "cleanUpDoesntHappen",
      stepCardRef: easyCleanUpFirstRef,
      cardRef: cleanUpDoesntHappenRef,
      direction: 1,
    },
    {
      key: "tasksGoNowhere",
      stepCardRef: reviewTasksAssignedRef,
      cardRef: tasksGoNowhereRef,
      direction: -1,
    },
    {
      key: "assetsGoUnchecked",
      stepCardRef: ownerReviewsEachAssetRef,
      cardRef: assetsGoUncheckedRef,
      direction: -1,
    },
    {
      key: "issuesGoUnfixed",
      stepCardRef: implementFixRef,
      cardRef: issuesGoUnfixedRef,
      direction: 1,
    },
    {
      key: "nothingIsDoubleChecked",
      stepCardRef: doubleCheckAnswersRef,
      cardRef: nothingIsDoubleCheckedRef,
      direction: 1,
    },
    {
      key: "dataIsConstantlyDecaying",
      stepCardRef: certificationCycleClosesRef,
      cardRef: dataIsConstantlyDecayingRef,
      direction: 1,
    },
    {
      key: "auditScramble",
      stepCardRef: certificationCycleClosesRef,
      cardRef: auditScrambleRef,
      direction: -1,
    },
  ] as const;

  // Pulls every pain card so its own real edge sits exactly STEP_PAIN_GAP
  // away from its parent step card's real edge (horizontal), and its own
  // top sits exactly STEP_PAIN_VERTICAL_GAP below that same step card's
  // own top edge (vertical) — both pure card-to-card margins, unrelated
  // to the connector drawn between them (see buildBranch, a separate
  // derived shape). Depends on doubleCheckAnswersOffset and
  // resolutionOffset too, since Implement Fix and Double-Check Answers
  // are the two step cards that carry their own transform — this effect
  // needs their settled, final position, not a stale one from before
  // those offsets committed.
  useLayoutEffect(() => {
    const next: Record<string, { x: number; y: number }> = {};
    for (const { key, stepCardRef, cardRef, direction } of painBranches) {
      const stepEl = stepCardRef.current;
      const cardEl = cardRef.current;
      if (!stepEl || !cardEl) continue;
      const stepRect = stepEl.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();

      const prevOffset = painCardOffsets[key] ?? { x: 0, y: 0 };

      let x: number;
      if (direction === 1) {
        const desiredLeftX = stepRect.right + STEP_PAIN_GAP;
        const naturalLeftX = cardRect.left - prevOffset.x;
        x = desiredLeftX - naturalLeftX;
      } else {
        const desiredRightX = stepRect.left - STEP_PAIN_GAP;
        const naturalRightX = cardRect.right - prevOffset.x;
        x = desiredRightX - naturalRightX;
      }

      const desiredTopY = stepRect.top + STEP_PAIN_VERTICAL_GAP;
      const naturalTopY = cardRect.top - prevOffset.y;
      const y = desiredTopY - naturalTopY;

      next[key] = { x, y };
    }
    setPainCardOffsets(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    wrapSize,
    doubleCheckAnswersOffset,
    resolutionOffset,
    certificationCycleClosesOffset,
  ]);

  // Measures the trigger cards' own real rendered width, re-measuring on
  // resize since the browser's flex-shrink can change that value at
  // different viewport widths.
  useLayoutEffect(() => {
    const w = upcomingAuditRef.current?.getBoundingClientRect().width;
    if (w) setTriggerCardWidth(w);
  }, [wrapSize]);

  // Computes both the outcomes row's shift AND the resolution row's shift
  // in one pass, analytically — not two separate effects each reading the
  // other's DOM output across render passes (that has a real timing risk:
  // the second effect can measure the first row's PRE-shift position if it
  // runs before React has re-rendered with the first offset applied).
  // Instead: measure every element's own NATURAL (currently-applied-offset
  // subtracted) position once, then derive where No Longer Exists will
  // land ONCE outcomesOffset is applied (natural position + the shift,
  // computed directly, not re-measured from the DOM), and align Record is
  // Retired to that computed final position. Runs after triggerCardWidth
  // settles, since that's what the rows' own widths (and so their natural
  // centers) are now based on.
  useLayoutEffect(() => {
    const rowEl = outcomesRowRef.current;
    const sayEl = whatDidTheySayRef.current;
    const targetEl = noLongerExistsRef.current;
    const recordEl = recordIsRetiredRef.current;
    if (!rowEl || !sayEl || !targetEl || !recordEl || triggerCardWidth === null)
      return;

    const rowRect = rowEl.getBoundingClientRect();
    const sayRect = sayEl.getBoundingClientRect();
    const naturalRowCenterX = rowRect.left + rowRect.width / 2 - outcomesOffset;
    const sayCenterX = sayRect.left + sayRect.width / 2;
    const nextOutcomesOffset = sayCenterX - naturalRowCenterX;

    const targetRect = targetEl.getBoundingClientRect();
    const naturalTargetCenterX =
      targetRect.left + targetRect.width / 2 - outcomesOffset;
    const finalTargetCenterX = naturalTargetCenterX + nextOutcomesOffset;

    const recordRect = recordEl.getBoundingClientRect();
    const naturalRecordCenterX =
      recordRect.left + recordRect.width / 2 - resolutionOffset;

    setOutcomesOffset(nextOutcomesOffset);
    setResolutionOffset(finalTargetCenterX - naturalRecordCenterX);

    // Double-Check Answers aligns to the exact same finalTargetCenterX
    // Record is Retired just aligned to — both end up at the same real x,
    // so Double-Check Answers sits directly below Record is Retired.
    const doubleCheckEl = doubleCheckAnswersRef.current;
    if (doubleCheckEl) {
      const doubleCheckRect = doubleCheckEl.getBoundingClientRect();
      const naturalDoubleCheckCenterX =
        doubleCheckRect.left +
        doubleCheckRect.width / 2 -
        doubleCheckAnswersOffset;
      setDoubleCheckAnswersOffset(
        finalTargetCenterX - naturalDoubleCheckCenterX,
      );
    }

    // Certification Cycle Closes aligns to the exact same
    // finalTargetCenterX the whole spine (Record is Retired →
    // Double-Check Answers) has been aligning to — it's the main flow's
    // return-to-center point after the Match/Don't Match fork, not a
    // position derived from its own two merge targets (that's what the
    // merge-fan call below needs THIS point for as its centerX, same
    // rule as every other fan here).
    const certificationCycleClosesEl = certificationCycleClosesRef.current;
    if (certificationCycleClosesEl) {
      const certificationCycleClosesRect =
        certificationCycleClosesEl.getBoundingClientRect();
      const naturalCertificationCycleClosesCenterX =
        certificationCycleClosesRect.left +
        certificationCycleClosesRect.width / 2 -
        certificationCycleClosesOffset;
      setCertificationCycleClosesOffset(
        finalTargetCenterX - naturalCertificationCycleClosesCenterX,
      );
    }

    // Match/Don't Match fork row aligns to the same finalTargetCenterX
    // Double-Check Answers itself just aligned to — both end up at the
    // same real x, so the fork centers directly under Double-Check
    // Answers rather than under this span's grid center.
    const matchRowEl = matchDontMatchRowRef.current;
    if (matchRowEl) {
      const matchRowRect = matchRowEl.getBoundingClientRect();
      const naturalMatchRowCenterX =
        matchRowRect.left + matchRowRect.width / 2 - matchDontMatchOffset;
      const nextMatchDontMatchOffset =
        finalTargetCenterX - naturalMatchRowCenterX;
      setMatchDontMatchOffset(nextMatchDontMatchOffset);

      // Mismatches Are Investigated aligns to Don't Match's own FINAL x —
      // dontMatchEl's rect this render still reflects the OLD
      // matchDontMatchOffset, so its natural center needs the new offset
      // added back, same analytical-not-remeasured technique as
      // finalTargetCenterX itself.
      const dontMatchEl = dontMatchRef.current;
      const mismatchesEl = mismatchesAreInvestigatedRef.current;
      if (dontMatchEl && mismatchesEl) {
        const dontMatchRect = dontMatchEl.getBoundingClientRect();
        const naturalDontMatchCenterX =
          dontMatchRect.left + dontMatchRect.width / 2 - matchDontMatchOffset;
        const dontMatchFinalCenterX =
          naturalDontMatchCenterX + nextMatchDontMatchOffset;

        const mismatchesRect = mismatchesEl.getBoundingClientRect();
        const naturalMismatchesCenterX =
          mismatchesRect.left +
          mismatchesRect.width / 2 -
          mismatchesAreInvestigatedOffset;
        setMismatchesAreInvestigatedOffset(
          dontMatchFinalCenterX - naturalMismatchesCenterX,
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapSize, triggerCardWidth]);

  useLayoutEffect(() => {
    const wrapEl = wrapRef.current;
    if (!wrapEl || wrapSize.width === 0) return;
    const wrapRect = wrapEl.getBoundingClientRect();

    // Real measured anchor — a card's own edge midpoint, per PLAN.md's
    // anchor rule (top/bottom-center for vertical approach; left/right-
    // center for the pain-point branches' horizontal lead-out, since those
    // grow outward from the trigger card's side, not its bottom). "center"
    // is the element's own true center (both x and y) — e.g. aligning a
    // connector to a label's vertical middle without separately anchoring
    // top+bottom and averaging by hand at the call site.
    const anchor = (
      el: HTMLElement | null,
      side: "top" | "bottom" | "left" | "right" | "center",
    ): Point | null => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (side === "center") {
        return {
          x: r.left + r.width / 2 - wrapRect.left,
          y: r.top + r.height / 2 - wrapRect.top,
        };
      }
      if (side === "left" || side === "right") {
        return {
          x: (side === "left" ? r.left : r.right) - wrapRect.left,
          y: r.top + r.height / 2 - wrapRect.top,
        };
      }
      return {
        x: r.left + r.width / 2 - wrapRect.left,
        y: (side === "top" ? r.top : r.bottom) - wrapRect.top,
      };
    };

    // Sourced from components/buildFanTrapezoid.ts (shared with
    // StakeholdersCards) — same "move `to` toward `from` by `amount` px
    // along the line" helper, no longer duplicated here.
    const insetEnd = insetEndShared;
    // Pain-branch lead anchor: the trigger card's own TITLE label edge
    // (not the whole card, which would cross the body text below), inset
    // CARD_GAP further out from the label as a lead-in gap — same control
    // as every other label/card-touching gap in this diagram, for
    // consistency (this lead is horizontal, so no sin/tan conversion is
    // needed: the along-line distance already equals the visible gap).
    const labelAnchor = (
      el: HTMLElement | null,
      side: "left" | "right",
    ): Point | null => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x:
          (side === "left" ? r.left - CARD_GAP : r.right + CARD_GAP) -
          wrapRect.left,
        y: r.top + r.height / 2 - wrapRect.top,
      };
    };

    const triggersPoint = anchor(triggersLabelRef.current, "bottom");
    const upcomingAuditTop = anchor(upcomingAuditRef.current, "top");
    const upcomingAuditBottom = anchor(upcomingAuditRef.current, "bottom");
    const upcomingAuditLabelLeft = labelAnchor(
      upcomingAuditTitleRef.current,
      "left",
    );
    const scheduledTop = anchor(scheduledRef.current, "top");
    const scheduledBottom = anchor(scheduledRef.current, "bottom");
    const eventTop = anchor(eventRef.current, "top");
    const eventBottom = anchor(eventRef.current, "bottom");
    const eventLabelRight = labelAnchor(eventTitleRef.current, "right");
    const reactiveRushTop = anchor(reactiveRushRef.current, "top");
    const thingsGoUnnoticedTop = anchor(thingsGoUnnoticedRef.current, "top");
    const assetPrioritizationTop = anchor(
      assetPrioritizationRef.current,
      "top",
    );
    const assetPrioritizationBottom = anchor(
      assetPrioritizationRef.current,
      "bottom",
    );
    const assetPrioritizationLabelLeft = labelAnchor(
      assetPrioritizationTitleRef.current,
      "left",
    );
    const oftenOverScopedTop = anchor(oftenOverScopedRef.current, "top");
    const easyCleanUpFirstTop = anchor(easyCleanUpFirstRef.current, "top");
    const easyCleanUpFirstLabelRight = labelAnchor(
      easyCleanUpFirstTitleRef.current,
      "right",
    );
    const cleanUpDoesntHappenTop = anchor(
      cleanUpDoesntHappenRef.current,
      "top",
    );
    const easyCleanUpFirstBottom = anchor(
      easyCleanUpFirstRef.current,
      "bottom",
    );
    const reviewTasksAssignedTop = anchor(
      reviewTasksAssignedRef.current,
      "top",
    );
    const reviewTasksAssignedLabelLeft = labelAnchor(
      reviewTasksAssignedTitleRef.current,
      "left",
    );
    const tasksGoNowhereTop = anchor(tasksGoNowhereRef.current, "top");
    const reviewTasksAssignedBottom = anchor(
      reviewTasksAssignedRef.current,
      "bottom",
    );
    const ownerReviewsEachAssetTop = anchor(
      ownerReviewsEachAssetRef.current,
      "top",
    );
    const ownerReviewsEachAssetLabelLeft = labelAnchor(
      ownerReviewsEachAssetTitleRef.current,
      "left",
    );
    const assetsGoUncheckedTop = anchor(assetsGoUncheckedRef.current, "top");
    const ownerReviewsEachAssetBottom = anchor(
      ownerReviewsEachAssetRef.current,
      "bottom",
    );
    const didOwnerRespondTop = anchor(didOwnerRespondRef.current, "top");
    const didOwnerRespondBottom = anchor(didOwnerRespondRef.current, "bottom");
    const noTop = anchor(noRef.current, "top");
    const yesTop = anchor(yesRef.current, "top");
    const ownerReviewsEachAssetTitleCenter = anchor(
      ownerReviewsEachAssetTitleRef.current,
      "center",
    );
    const doubleCheckAnswersTitleCenter = anchor(
      doubleCheckAnswersTitleRef.current,
      "center",
    );
    const nothingIsDoubleCheckedRight = anchor(
      nothingIsDoubleCheckedRef.current,
      "right",
    );
    const yesTitleBottom = anchor(yesTitleRef.current, "bottom");
    const whatDidTheySayTop = anchor(whatDidTheySayRef.current, "top");
    const whatDidTheySayBottom = anchor(whatDidTheySayRef.current, "bottom");
    const correctTop = anchor(correctRef.current, "top");
    const noLongerExistsTop = anchor(noLongerExistsRef.current, "top");
    const wrongTop = anchor(wrongRef.current, "top");
    const noLongerExistsBottom = anchor(noLongerExistsRef.current, "bottom");
    const wrongBottom = anchor(wrongRef.current, "bottom");
    const implementFixTop = anchor(implementFixRef.current, "top");
    const recordIsRetiredTop = anchor(recordIsRetiredRef.current, "top");
    const implementFixLabelRight = labelAnchor(
      implementFixTitleRef.current,
      "right",
    );
    const issuesGoUnfixedTop = anchor(issuesGoUnfixedRef.current, "top");
    const recordIsRetiredBottom = anchor(recordIsRetiredRef.current, "bottom");
    const implementFixBottom = anchor(implementFixRef.current, "bottom");
    const correctBottom = anchor(correctRef.current, "bottom");
    const doubleCheckAnswersTop = anchor(doubleCheckAnswersRef.current, "top");
    const doubleCheckAnswersBottomAnchor = anchor(
      doubleCheckAnswersRef.current,
      "bottom",
    );
    const matchTop = anchor(matchRef.current, "top");
    const matchBottom = anchor(matchRef.current, "bottom");
    const dontMatchTop = anchor(dontMatchRef.current, "top");
    const dontMatchBottom = anchor(dontMatchRef.current, "bottom");
    const mismatchesAreInvestigatedTop = anchor(
      mismatchesAreInvestigatedRef.current,
      "top",
    );
    const mismatchesAreInvestigatedBottom = anchor(
      mismatchesAreInvestigatedRef.current,
      "bottom",
    );
    const doubleCheckAnswersLabelRight = labelAnchor(
      doubleCheckAnswersTitleRef.current,
      "right",
    );
    const nothingIsDoubleCheckedTop = anchor(
      nothingIsDoubleCheckedRef.current,
      "top",
    );
    const certificationCycleClosesTop = anchor(
      certificationCycleClosesRef.current,
      "top",
    );
    const certificationCycleClosesLabelRight = labelAnchor(
      certificationCycleClosesTitleRef.current,
      "right",
    );
    const certificationCycleClosesLabelLeft = labelAnchor(
      certificationCycleClosesTitleRef.current,
      "left",
    );
    const dataIsConstantlyDecayingTop = anchor(
      dataIsConstantlyDecayingRef.current,
      "top",
    );
    const auditScrambleTop = anchor(auditScrambleRef.current, "top");

    const next: LineSpec[] = [];
    let nextFollowUpsSentPos: Point | null = null;
    let nextFixesRecheckedPos: Point | null = null;

    // Sourced from components/buildFanTrapezoid.ts (shared with
    // StakeholdersCards) — the generic N-way fan-out trapezoid shape, no
    // longer duplicated here. See that file for the full shape rationale.
    const buildFanTrapezoid = buildFanTrapezoidShared;

    // Self-standing lead-in/out connector between a single real point (the
    // Triggers label, or the next real step) and a fan's shoulder — built
    // independently of the fan's own center stub (see buildFanTrapezoid's
    // comment) so the two never merge into one overlong line just because
    // they happen to share an X. Renders at the diagram's confirmed 64px
    // stub length via the real CSS space provided (see this component's
    // CSS comments); CARD_GAP
    // breathing room at the real point, exact at the synthetic shoulder.
    const buildLeadConnector = buildFanLeadConnectorShared;

    if (
      triggersPoint &&
      upcomingAuditTop &&
      upcomingAuditBottom &&
      scheduledTop &&
      scheduledBottom &&
      eventTop &&
      eventBottom
    ) {
      // Upper fan — Triggers label feeding the 3 real cards. No arrowhead —
      // a grouping, not a process/dependency, per PLAN.md's arrowhead rule.
      const upper = buildFanTrapezoid(
        [upcomingAuditTop, scheduledTop, eventTop],
        "down",
        triggersPoint.x,
        BRANCH_HEIGHT,
        "var(--color-grey-500)",
      );
      next.push(
        buildLeadConnector(
          triggersPoint,
          upper.shoulderCenter,
          "var(--color-grey-500)",
        ),
        ...upper.segments,
      );

      // Lower mirror — the hexagon bracket's other half, anchored directly
      // to the real next step (Asset Prioritization) via its own
      // self-standing lead-out connector.
      if (assetPrioritizationTop) {
        const lower = buildFanTrapezoid(
          [upcomingAuditBottom, scheduledBottom, eventBottom],
          "up",
          assetPrioritizationTop.x,
          BRANCH_HEIGHT,
          "var(--color-grey-500)",
        );
        next.push(
          buildLeadConnector(
            assetPrioritizationTop,
            lower.shoulderCenter,
            "var(--color-grey-500)",
          ),
          ...lower.segments,
        );
      }
    }

    // Main chain continues straight down, one step to the next — both ends
    // are real card anchors, so each end gets its own CARD_GAP inset
    // (vertical segment, so no sin/tan conversion needed), rendering at
    // exactly the diagram's confirmed 64px stub length like every other
    // straight stub, as long as the CSS gap between the two cards is tuned
    // to match (see this component's CSS comments).
    const buildStepConnector = (from: Point | null, to: Point | null) =>
      from && to
        ? [
            {
              from: insetEnd(to, from, CARD_GAP),
              to: insetEnd(from, to, CARD_GAP),
              shape: "straight" as const,
              color: "var(--color-grey-500)",
              gap: 0,
            },
          ]
        : [];
    next.push(
      ...buildStepConnector(assetPrioritizationBottom, easyCleanUpFirstTop),
      ...buildStepConnector(easyCleanUpFirstBottom, reviewTasksAssignedTop),
      ...buildStepConnector(
        reviewTasksAssignedBottom,
        ownerReviewsEachAssetTop,
      ),
      ...buildStepConnector(ownerReviewsEachAssetBottom, didOwnerRespondTop),
      ...buildStepConnector(yesTitleBottom, whatDidTheySayTop),
    );

    // Second fork — "What did they say about the record?" is now a real
    // nested child of Yes's own cell (see .yesContinuation), so it's a
    // real measured anchor like any other step, not a synthetic point.
    // Splits into Correct / Wrong / No Longer Exists via the same
    // buildFanTrapezoid as every other fork. Wrong and No Longer Exists
    // share the warning-red half; Correct stays neutral grey.
    if (whatDidTheySayBottom && correctTop && noLongerExistsTop && wrongTop) {
      const secondFork = buildFanTrapezoid(
        [correctTop, noLongerExistsTop, wrongTop],
        "down",
        whatDidTheySayBottom.x,
        BRANCH_HEIGHT,
        { left: "var(--color-grey-500)", right: "var(--accent-warning)" },
      );
      next.push(
        buildLeadConnector(
          whatDidTheySayBottom,
          secondFork.shoulderCenter,
          "var(--color-grey-500)",
        ),
        ...secondFork.segments,
      );
    }

    // Wrong → Implement Fix, No Longer Exists → Record is Retired — both
    // read as straight vertical drops in Figma (near-identical x between
    // source and target), so simple step connectors, same as the main
    // chain.
    next.push(
      ...buildStepConnector(dontMatchBottom, mismatchesAreInvestigatedTop),
      ...buildStepConnector(wrongBottom, implementFixTop),
      ...buildStepConnector(noLongerExistsBottom, recordIsRetiredTop),
    );

    // Upward 3-way fan below Record is Retired/Implement Fix — the exact
    // same buildFanTrapezoid shape as the "What did they say" fork above.
    // Correct's own slot is a synthetic hanging point at Correct's real x
    // — since Correct sits left of Record is Retired, this sorts as the
    // farthest-left OUTER diagonal leg (not the mid-stub). Its tip now
    // connects to Correct's own real bottom via a plain straight
    // connector — same x, so it renders as a clean vertical drop.
    if (recordIsRetiredBottom && implementFixBottom && correctBottom) {
      const hangingMid: Point = {
        x: correctBottom.x,
        y: recordIsRetiredBottom.y,
      };
      const mergeFan = buildFanTrapezoid(
        [recordIsRetiredBottom, hangingMid, implementFixBottom],
        "up",
        doubleCheckAnswersTop?.x ?? hangingMid.x,
        BRANCH_HEIGHT,
        "var(--color-grey-500)",
      );
      // Correct's own connector is a plain vertical drop to hangingMid
      // (same x as correctBottom) — stays perfectly straight. The
      // diagonal leg itself stops short of hangingMid by its own
      // CARD_GAP inset (buildFanTrapezoid applies that to every target
      // uniformly) — extended here by that same short stretch, exact
      // (gap:0) at both ends, so its tip lands exactly on the vertical's
      // endpoint instead of leaving a small gap.
      const hangingLegShoulder = {
        x: hangingMid.x + BRANCH_HEIGHT / LEG_TAN,
        y: mergeFan.shoulderCenter.y,
      };
      const hangingLegTip = insetEnd(
        hangingLegShoulder,
        hangingMid,
        CARD_GAP_ALONG_LINE,
      );
      next.push(
        ...mergeFan.segments,
        {
          from: hangingLegTip,
          to: hangingMid,
          shape: "straight",
          color: "var(--color-grey-500)",
          gap: 0,
        },
        buildLeadConnector(correctBottom, hangingMid, "var(--color-grey-500)"),
      );
      if (doubleCheckAnswersTop) {
        next.push(
          buildLeadConnector(
            doubleCheckAnswersTop,
            mergeFan.shoulderCenter,
            "var(--color-grey-500)",
          ),
        );
      }
    }

    // Upward 2-way merge below Match/Mismatches Are Investigated — same
    // hanging-point mechanic as the Record is Retired/Implement Fix/
    // Correct merge above (Match has no card of its own, same situation
    // as Correct there; Match also sits left of its real-card sibling,
    // same relative arrangement, so the hangingLegShoulder/hangingLegTip
    // fixup formula is identical). With only 2 targets there's no
    // mid-stub either way. centerX is now Certification Cycle Closes'
    // own real top anchor (resolves the earlier temporary-placeholder
    // midpoint), plus its own lead-out connector from the shoulder —
    // same pattern as the first merge's lead-out to Double-Check Answers.
    if (matchBottom && mismatchesAreInvestigatedBottom) {
      const hangingMid: Point = {
        x: matchBottom.x,
        y: mismatchesAreInvestigatedBottom.y,
      };
      const mergeFan = buildFanTrapezoid(
        [hangingMid, mismatchesAreInvestigatedBottom],
        "up",
        certificationCycleClosesTop?.x ?? hangingMid.x,
        BRANCH_HEIGHT,
        "var(--color-grey-500)",
      );
      const hangingLegShoulder = {
        x: hangingMid.x + BRANCH_HEIGHT / LEG_TAN,
        y: mergeFan.shoulderCenter.y,
      };
      const hangingLegTip = insetEnd(
        hangingLegShoulder,
        hangingMid,
        CARD_GAP_ALONG_LINE,
      );
      next.push(
        ...mergeFan.segments,
        {
          from: hangingLegTip,
          to: hangingMid,
          shape: "straight",
          color: "var(--color-grey-500)",
          gap: 0,
        },
        buildLeadConnector(matchBottom, hangingMid, "var(--color-grey-500)"),
      );
      if (certificationCycleClosesTop) {
        next.push(
          buildLeadConnector(
            certificationCycleClosesTop,
            mergeFan.shoulderCenter,
            "var(--color-grey-500)",
          ),
        );
      }
    }

    // Second half-circle loop connector — "Fixes Re-Checked." Same
    // mechanic as the "No" → Owner Reviews Each Asset loop above, just
    // the reverse relative arrangement (source below, target above
    // instead of the other way — the shape itself doesn't care which
    // direction the retry flows). Bottom point: Mismatches Are
    // Investigated's own title edge + CARD_GAP. Top point: same x, at
    // Double-Check Answers' own TITLE LABEL vertical center (not the
    // whole card).
    if (
      mismatchesAreInvestigatedTitleRef.current &&
      doubleCheckAnswersTitleCenter
    ) {
      const loopBottom = labelAnchor(
        mismatchesAreInvestigatedTitleRef.current,
        "right",
      );
      if (loopBottom) {
        const loopTop = {
          x: loopBottom.x,
          y: doubleCheckAnswersTitleCenter.y,
        };

        // Push the arc's own vertical diameter right until it clears
        // Nothing is Double-Checked's real right edge (+ CARD_GAP
        // clearance) — the diameter is the arc's leftmost point, so
        // moving it past the card moves the entire bulge clear of it.
        const diameterX = nothingIsDoubleCheckedRight
          ? Math.max(loopBottom.x, nothingIsDoubleCheckedRight.x + CARD_GAP)
          : loopBottom.x;
        const shiftedLoopBottom = { x: diameterX, y: loopBottom.y };
        const shiftedLoopTop = { x: diameterX, y: loopTop.y };
        next.push({
          from: shiftedLoopBottom,
          to: shiftedLoopTop,
          shape: "halfCircle",
          bulge: "right",
          color: "var(--accent-warning)",
          dashed: true,
          gap: 0,
        });

        // Horizontal lead from Mismatches Are Investigated's own title
        // label across to the arc's (shifted) bottom point — real
        // CARD_GAP breathing room at the label end (labelAnchor already
        // bakes that in), exact at the arc's synthetic point.
        next.push({
          from: loopBottom,
          to: shiftedLoopBottom,
          shape: "straight",
          color: "var(--accent-warning)",
          dashed: true,
          gap: 0,
        });

        // Label x: the arc's own rightmost bulge point (now relative to
        // the shifted diameter). Label y: aligned to the Match/Don't
        // Match fork's own vertical center (the decision this loop
        // retries), not the arc's midpoint — same technique as
        // "Follow-ups Sent" aligning to its own decision label's level.
        const loopRadius = Math.abs(loopBottom.y - loopTop.y) / 2;
        if (dontMatchTop && dontMatchBottom) {
          nextFixesRecheckedPos = {
            x: diameterX + loopRadius,
            y: (dontMatchTop.y + dontMatchBottom.y) / 2,
          };
        }

        // Horizontal lead from the arc's (shifted) top point back
        // toward Double-Check Answers — but it must NOT travel all the
        // way to the real label, since that would overlap Nothing is
        // Double-Checked's own lead (same horizontal path, same y, from
        // the same label). Instead it stops CARD_GAP short of that
        // branch's own elbow (where its lead bends into its diagonal) —
        // recomputed here with the same formula buildBranch uses
        // (doubleCheckAnswersLabelRight is that branch's own `top`,
        // nothingIsDoubleCheckedTop its `bottom`, direction 1).
        if (doubleCheckAnswersLabelRight && nothingIsDoubleCheckedTop) {
          const nothingBranchVerticalRun =
            nothingIsDoubleCheckedTop.y - doubleCheckAnswersLabelRight.y;
          const nothingBranchDiagonalDx = nothingBranchVerticalRun / LEG_TAN;
          const nothingBranchElbow = {
            x: nothingIsDoubleCheckedTop.x - nothingBranchDiagonalDx,
            y: doubleCheckAnswersLabelRight.y,
          };
          const loopLeadEnd = {
            x: nothingBranchElbow.x + CARD_GAP + 12,
            y: shiftedLoopTop.y,
          };
          next.push({
            from: shiftedLoopTop,
            to: loopLeadEnd,
            shape: "straight",
            color: "var(--accent-warning)",
            dashed: true,
            arrow: true,
            gap: 0,
          });
        }
      }
    }

    // First 2-way fork — "Did Owner Respond by Deadline?" splits into
    // exactly 2 outcomes (Yes, No). buildFanTrapezoid already handles this
    // generically: with only 2 targets, its own mid-stub loop is a no-op,
    // so the shape is just the shoulder + 2 diagonal legs. The No (failure)
    // side is colored as warning red from the shoulder's center outward,
    // matching every other pain-branch connector.
    if (didOwnerRespondBottom && yesTop && noTop) {
      const fork = buildFanTrapezoid(
        [yesTop, noTop],
        "down",
        didOwnerRespondBottom.x,
        BRANCH_HEIGHT,
        { left: "var(--color-grey-500)", right: "var(--accent-warning)" },
      );
      next.push(
        buildLeadConnector(
          didOwnerRespondBottom,
          fork.shoulderCenter,
          "var(--color-grey-500)",
        ),
        ...fork.segments,
      );
    }

    // Third fork — "Double-Check Answers" splits into Match / Don't Match.
    // Same buildFanTrapezoid 2-way shape as Yes/No, color-split the same
    // way (Match neutral, Don't Match warning red — see this file's
    // MATCH/DONT_MATCH comment for why that deviates from Figma's own
    // uncolored labels). Downstream of either outcome isn't built yet.
    if (doubleCheckAnswersBottomAnchor && matchTop && dontMatchTop) {
      const matchFork = buildFanTrapezoid(
        [matchTop, dontMatchTop],
        "down",
        doubleCheckAnswersBottomAnchor.x,
        BRANCH_HEIGHT,
        { left: "var(--color-grey-500)", right: "var(--accent-warning)" },
      );
      next.push(
        buildLeadConnector(
          doubleCheckAnswersBottomAnchor,
          matchFork.shoulderCenter,
          "var(--color-grey-500)",
        ),
        ...matchFork.segments,
      );
    }

    // First half-circle loop connector — "No" loops back up to retry
    // Owner Reviews Each Asset. A true semicircular arc (not composed from
    // straight segments), bulging right. Bottom point: No's own title edge
    // + CARD_GAP breathing room (same as every other real-anchor lead-out).
    // Top point: same x, but at Owner Reviews Each Asset's own TITLE LABEL
    // vertical CENTER level (not the whole card, which would shift past
    // the title into the body) — not inset by CARD_GAP, since it only
    // needs to reach that level beside the step, not touch/collide with it.
    if (noTitleRef.current && ownerReviewsEachAssetTitleCenter) {
      const loopBottom = labelAnchor(noTitleRef.current, "right");
      if (loopBottom) {
        const loopTop = {
          x: loopBottom.x,
          y: ownerReviewsEachAssetTitleCenter.y,
        };
        next.push({
          from: loopBottom,
          to: loopTop,
          shape: "halfCircle",
          bulge: "right",
          color: "var(--accent-warning)",
          dashed: true,
          gap: 0,
        });

        // Label x: the arc's own rightmost bulge point (radius out from the
        // shared vertical diameter). Label y: aligned to "Did Owner Respond
        // by Deadline?"'s own vertical center, not the arc's midpoint.
        const loopRadius = Math.abs(loopBottom.y - loopTop.y) / 2;
        if (didOwnerRespondTop && didOwnerRespondBottom) {
          nextFollowUpsSentPos = {
            x: loopBottom.x + loopRadius,
            y: (didOwnerRespondTop.y + didOwnerRespondBottom.y) / 2,
          };
        }

        // Horizontal lead from the arc's top point back across to Owner
        // Reviews Each Asset's own title label — real CARD_GAP breathing
        // room at the label end (labelAnchor already bakes that in), exact
        // at the arc's synthetic top point. Arrowhead lands here (the
        // actual reconnection point), not mid-arc.
        const loopTargetLabel = labelAnchor(
          ownerReviewsEachAssetTitleRef.current,
          "right",
        );
        if (loopTargetLabel) {
          next.push({
            from: loopTop,
            to: loopTargetLabel,
            shape: "straight",
            color: "var(--accent-warning)",
            dashed: true,
            arrow: true,
            gap: 0,
          });
        }
      }
    }

    // Generic single branch — a horizontal lead that grows outward from a
    // real source anchor, then bends into a fixed-LEG_ANGLE_DEG diagonal
    // down to a real target. Both ends are real, so the bend point is fully
    // derived (no extra tunable needed): vertical run = real gap between
    // the two anchors, horizontal run of the diagonal = that gap /
    // tan(angle), leaving the remainder as the horizontal lead.
    // `direction` is explicit (-1 = left/outward, 1 = right/outward) rather
    // than inferred from real anchor x-positions — real card widths can
    // flip which side reads as "further out," silently reversing the sign.
    // Pass `top`/`bottom` as null to skip a branch entirely ("doesn't have
    // one") — the config array below is the single place branches are
    // declared, add/remove/reorder entries there rather than new if-blocks.
    // Every pain-card connector: a real-anchor lead (horizontal, off the
    // title label) that grows outward, then bends into the fixed-angle
    // diagonal, covering the FULL real vertical run down to the pain
    // card's own real top-center (per the Anchor rule's vertical-approach
    // convention — `bottom` is a plain `anchor(ref, "top")`, not a label
    // anchor). The lead absorbs whatever horizontal distance is left over
    // after the diagonal's own run — this auto-adjusts to whatever real
    // distance the card's STEP_PAIN_GAP-derived position (see the
    // painBranches effect above) and the step's own label height happen
    // to produce. Safe from the earlier "backwards 7" risk (a full-run
    // diagonal overshooting backward past a predetermined target) because
    // the card's position is now always derived outward from its own
    // parent step CARD's edge by a positive gap, never independently
    // fixed to an unrelated target the diagonal might outrun.
    interface BranchConfig {
      top: Point | null;
      bottom: Point | null;
      direction: -1 | 1;
      arrow: boolean;
    }
    const buildBranch = (config: BranchConfig): LineSpec[] => {
      if (!config.top || !config.bottom) return [];
      const { top, bottom, direction, arrow } = config;
      const verticalRun = bottom.y - top.y;
      const diagonalDx = verticalRun / LEG_TAN;
      const bend = { x: bottom.x - direction * diagonalDx, y: top.y };
      return [
        {
          from: top,
          to: bend,
          shape: "straight",
          color: "var(--accent-warning)",
          gap: 0,
        },
        {
          from: bend,
          to: insetEnd(bend, bottom, CARD_GAP_ALONG_LINE),
          shape: "straight",
          color: "var(--accent-warning)",
          arrow,
          gap: 0,
        },
      ];
    };
    const branches: BranchConfig[] = [
      {
        top: upcomingAuditLabelLeft,
        bottom: reactiveRushTop,
        direction: -1,
        arrow: false,
      },
      {
        top: eventLabelRight,
        bottom: thingsGoUnnoticedTop,
        direction: 1,
        arrow: false,
      },
      {
        top: assetPrioritizationLabelLeft,
        bottom: oftenOverScopedTop,
        direction: -1,
        arrow: false,
      },
      {
        top: easyCleanUpFirstLabelRight,
        bottom: cleanUpDoesntHappenTop,
        direction: 1,
        arrow: false,
      },
      {
        top: reviewTasksAssignedLabelLeft,
        bottom: tasksGoNowhereTop,
        direction: -1,
        arrow: false,
      },
      {
        top: ownerReviewsEachAssetLabelLeft,
        bottom: assetsGoUncheckedTop,
        direction: -1,
        arrow: false,
      },
      {
        top: implementFixLabelRight,
        bottom: issuesGoUnfixedTop,
        direction: 1,
        arrow: false,
      },
      {
        top: doubleCheckAnswersLabelRight,
        bottom: nothingIsDoubleCheckedTop,
        direction: 1,
        arrow: false,
      },
      {
        top: certificationCycleClosesLabelRight,
        bottom: dataIsConstantlyDecayingTop,
        direction: 1,
        arrow: false,
      },
      {
        top: certificationCycleClosesLabelLeft,
        bottom: auditScrambleTop,
        direction: -1,
        arrow: false,
      },
    ];
    branches.forEach((config) => next.push(...buildBranch(config)));
    setLines(next);
    setFollowUpsSentPos(nextFollowUpsSentPos);
    setFixesRecheckedPos(nextFixesRecheckedPos);
  }, [
    wrapSize,
    outcomesOffset,
    resolutionOffset,
    doubleCheckAnswersOffset,
    matchDontMatchOffset,
    mismatchesAreInvestigatedOffset,
    certificationCycleClosesOffset,
    painCardOffsets,
  ]);

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      style={{ ["--connector-length" as string]: `${CONNECTOR_LENGTH}px` }}
    >
      <span ref={triggersLabelRef} className={styles.triggersLabel}>
        Certification Triggers
      </span>

      <div className={styles.triggerRow}>
        <div ref={upcomingAuditRef} className={styles.stepCard}>
          <span ref={upcomingAuditTitleRef} className={styles.cardTitle}>
            {TRIGGERS[0].title}
          </span>
          <p className={styles.cardBody}>{TRIGGERS[0].body}</p>
        </div>
        <div ref={scheduledRef} className={styles.stepCard}>
          <span className={styles.cardTitle}>{TRIGGERS[1].title}</span>
          <p className={styles.cardBody}>{TRIGGERS[1].body}</p>
        </div>
        <div ref={eventRef} className={styles.stepCard}>
          <span ref={eventTitleRef} className={styles.cardTitle}>
            {TRIGGERS[2].title}
          </span>
          <p className={styles.cardBody}>{TRIGGERS[2].body}</p>
        </div>
      </div>

      <div
        ref={reactiveRushRef}
        className={`${styles.painCard} ${styles.reactiveRush}`}
        style={{
          transform: `translate(${painCardOffsets.reactiveRush?.x ?? 0}px, ${painCardOffsets.reactiveRush?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>{REACTIVE_RUSH.title}</span>
        <p className={styles.painCardBody}>{REACTIVE_RUSH.body}</p>
      </div>

      <div
        ref={thingsGoUnnoticedRef}
        className={`${styles.painCard} ${styles.thingsGoUnnoticed}`}
        style={{
          transform: `translate(${painCardOffsets.thingsGoUnnoticed?.x ?? 0}px, ${painCardOffsets.thingsGoUnnoticed?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>
          {THINGS_GO_UNNOTICED.title}
        </span>
        <p className={styles.painCardBody}>{THINGS_GO_UNNOTICED.body}</p>
      </div>

      <div
        ref={assetPrioritizationRef}
        className={`${styles.stepCard} ${styles.flowStep}`}
      >
        <span
          ref={assetPrioritizationTitleRef}
          className={styles.flowStepTitle}
        >
          {ASSET_PRIORITIZATION.title}
        </span>
        <p className={styles.flowStepBody}>{ASSET_PRIORITIZATION.body}</p>
      </div>

      <div
        ref={oftenOverScopedRef}
        className={`${styles.painCard} ${styles.oftenOverScoped}`}
        style={{
          transform: `translate(${painCardOffsets.oftenOverScoped?.x ?? 0}px, ${painCardOffsets.oftenOverScoped?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>{OFTEN_OVER_SCOPED.title}</span>
        <p className={styles.painCardBody}>{OFTEN_OVER_SCOPED.body}</p>
      </div>

      <div
        ref={easyCleanUpFirstRef}
        className={`${styles.stepCard} ${styles.flowStep2}`}
      >
        <span ref={easyCleanUpFirstTitleRef} className={styles.flowStepTitle}>
          {EASY_CLEAN_UP_FIRST.title}
        </span>
        <p className={styles.flowStepBody}>{EASY_CLEAN_UP_FIRST.body}</p>
      </div>

      <div
        ref={cleanUpDoesntHappenRef}
        className={`${styles.painCard} ${styles.cleanUpDoesntHappen}`}
        style={{
          transform: `translate(${painCardOffsets.cleanUpDoesntHappen?.x ?? 0}px, ${painCardOffsets.cleanUpDoesntHappen?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>
          {CLEAN_UP_DOESNT_HAPPEN.title}
        </span>
        <p className={styles.painCardBody}>{CLEAN_UP_DOESNT_HAPPEN.body}</p>
      </div>

      <div
        ref={reviewTasksAssignedRef}
        className={`${styles.stepCard} ${styles.flowStep3}`}
      >
        <span
          ref={reviewTasksAssignedTitleRef}
          className={styles.flowStepTitle}
        >
          {REVIEW_TASKS_ASSIGNED.title}
        </span>
        <p className={styles.flowStepBody}>{REVIEW_TASKS_ASSIGNED.body}</p>
      </div>

      <div
        ref={tasksGoNowhereRef}
        className={`${styles.painCard} ${styles.tasksGoNowhere}`}
        style={{
          transform: `translate(${painCardOffsets.tasksGoNowhere?.x ?? 0}px, ${painCardOffsets.tasksGoNowhere?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>{TASKS_GO_NOWHERE.title}</span>
        <p className={styles.painCardBody}>{TASKS_GO_NOWHERE.body}</p>
      </div>

      <div
        ref={ownerReviewsEachAssetRef}
        className={`${styles.stepCard} ${styles.flowStep4}`}
      >
        <span
          ref={ownerReviewsEachAssetTitleRef}
          className={styles.flowStepTitle}
        >
          {OWNER_REVIEWS_EACH_ASSET.title}
        </span>
        <p className={styles.flowStepBody}>{OWNER_REVIEWS_EACH_ASSET.body}</p>
      </div>

      <div
        ref={assetsGoUncheckedRef}
        className={`${styles.painCard} ${styles.assetsGoUnchecked}`}
        style={{
          transform: `translate(${painCardOffsets.assetsGoUnchecked?.x ?? 0}px, ${painCardOffsets.assetsGoUnchecked?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>
          {ASSETS_GO_UNCHECKED.title}
        </span>
        <p className={styles.painCardBody}>{ASSETS_GO_UNCHECKED.body}</p>
      </div>

      <span ref={didOwnerRespondRef} className={styles.decisionLabel}>
        {DID_OWNER_RESPOND_BY_DEADLINE}
      </span>

      <div className={styles.forkRow}>
        <div ref={yesRef} className={styles.forkLabel}>
          <span ref={yesTitleRef} className={styles.flowStepTitle}>
            Yes
          </span>
          <span
            ref={whatDidTheySayRef}
            className={`${styles.flowStepTitle} ${styles.yesContinuation}`}
          >
            {WHAT_DID_THEY_SAY}
          </span>
        </div>
        <div ref={noRef} className={styles.stepCard}>
          <span
            ref={noTitleRef}
            className={`${styles.flowStepTitle} ${styles.warningText}`}
          >
            {NO.title}
          </span>
          <p className={`${styles.flowStepBody} ${styles.warningText}`}>
            {NO.body}
          </p>
        </div>
      </div>

      <div
        ref={outcomesRowRef}
        className={styles.outcomesRow}
        style={{ transform: `translateX(${outcomesOffset}px)` }}
      >
        <div
          ref={correctRef}
          className={styles.forkLabel}
          style={triggerCardWidth ? { width: triggerCardWidth } : undefined}
        >
          <span className={styles.flowStepTitle}>{CORRECT}</span>
        </div>
        <div
          ref={noLongerExistsRef}
          className={styles.forkLabel}
          style={triggerCardWidth ? { width: triggerCardWidth } : undefined}
        >
          <span className={`${styles.flowStepTitle} ${styles.warningText}`}>
            {NO_LONGER_EXISTS}
          </span>
        </div>
        <div
          ref={wrongRef}
          className={styles.forkLabel}
          style={triggerCardWidth ? { width: triggerCardWidth } : undefined}
        >
          <span className={`${styles.flowStepTitle} ${styles.warningText}`}>
            {WRONG}
          </span>
        </div>
      </div>

      <div
        ref={resolutionRowRef}
        className={styles.resolutionRow}
        style={{ transform: `translateX(${resolutionOffset}px)` }}
      >
        <div
          ref={recordIsRetiredRef}
          className={styles.stepCard}
          style={triggerCardWidth ? { width: triggerCardWidth } : undefined}
        >
          <span className={styles.flowStepTitle}>
            {RECORD_IS_RETIRED.title}
          </span>
          <p className={styles.flowStepBody}>{RECORD_IS_RETIRED.body}</p>
        </div>
        <div
          ref={implementFixRef}
          className={styles.stepCard}
          style={triggerCardWidth ? { width: triggerCardWidth } : undefined}
        >
          <span ref={implementFixTitleRef} className={styles.flowStepTitle}>
            {IMPLEMENT_FIX.title}
          </span>
          <p className={styles.flowStepBody}>{IMPLEMENT_FIX.body}</p>
        </div>
      </div>

      <div
        ref={issuesGoUnfixedRef}
        className={`${styles.painCard} ${styles.issuesGoUnfixed}`}
        style={{
          transform: `translate(${painCardOffsets.issuesGoUnfixed?.x ?? 0}px, ${painCardOffsets.issuesGoUnfixed?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>{ISSUES_GO_UNFIXED.title}</span>
        <p className={styles.painCardBody}>{ISSUES_GO_UNFIXED.body}</p>
      </div>

      <div
        ref={doubleCheckAnswersRef}
        className={`${styles.stepCard} ${styles.doubleCheckAnswers}`}
        style={{
          width: triggerCardWidth ?? undefined,
          transform: `translateX(${doubleCheckAnswersOffset}px)`,
        }}
      >
        <span ref={doubleCheckAnswersTitleRef} className={styles.flowStepTitle}>
          {DOUBLE_CHECK_ANSWERS.title}
        </span>
        <p className={styles.flowStepBody}>{DOUBLE_CHECK_ANSWERS.body}</p>
      </div>

      <div
        ref={nothingIsDoubleCheckedRef}
        className={`${styles.painCard} ${styles.nothingIsDoubleChecked}`}
        style={{
          transform: `translate(${painCardOffsets.nothingIsDoubleChecked?.x ?? 0}px, ${painCardOffsets.nothingIsDoubleChecked?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>
          {NOTHING_IS_DOUBLE_CHECKED.title}
        </span>
        <p className={styles.painCardBody}>{NOTHING_IS_DOUBLE_CHECKED.body}</p>
      </div>

      <div
        ref={matchDontMatchRowRef}
        className={styles.forkRow3}
        style={{ transform: `translateX(${matchDontMatchOffset}px)` }}
      >
        <div ref={matchRef} className={styles.forkLabel}>
          <span className={styles.flowStepTitle}>{MATCH}</span>
        </div>
        <div ref={dontMatchRef} className={styles.forkLabel}>
          <span className={`${styles.flowStepTitle} ${styles.warningText}`}>
            {DONT_MATCH}
          </span>
        </div>
      </div>

      <div
        ref={mismatchesAreInvestigatedRef}
        className={`${styles.stepCard} ${styles.mismatchesAreInvestigated}`}
        style={{
          transform: `translateX(${mismatchesAreInvestigatedOffset}px)`,
        }}
      >
        <span
          ref={mismatchesAreInvestigatedTitleRef}
          className={styles.flowStepTitle}
        >
          {MISMATCHES_ARE_INVESTIGATED.title}
        </span>
        <p className={styles.flowStepBody}>
          {MISMATCHES_ARE_INVESTIGATED.body}
        </p>
      </div>

      <div
        ref={certificationCycleClosesRef}
        className={`${styles.stepCard} ${styles.certificationCycleCloses}`}
        style={{
          transform: `translateX(${certificationCycleClosesOffset}px)`,
        }}
      >
        <span
          ref={certificationCycleClosesTitleRef}
          className={styles.flowStepTitle}
        >
          {CERTIFICATION_CYCLE_CLOSES.title}
        </span>
        <p className={styles.flowStepBody}>
          {CERTIFICATION_CYCLE_CLOSES.body}
        </p>
      </div>

      <div
        ref={dataIsConstantlyDecayingRef}
        className={`${styles.painCard} ${styles.dataIsConstantlyDecaying}`}
        style={{
          transform: `translate(${painCardOffsets.dataIsConstantlyDecaying?.x ?? 0}px, ${painCardOffsets.dataIsConstantlyDecaying?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>
          {DATA_IS_CONSTANTLY_DECAYING.title}
        </span>
        <p className={styles.painCardBody}>
          {DATA_IS_CONSTANTLY_DECAYING.body}
        </p>
      </div>

      <div
        ref={auditScrambleRef}
        className={`${styles.painCard} ${styles.auditScramble}`}
        style={{
          transform: `translate(${painCardOffsets.auditScramble?.x ?? 0}px, ${painCardOffsets.auditScramble?.y ?? 0}px)`,
        }}
      >
        <span className={styles.painCardTitle}>{AUDIT_SCRAMBLE.title}</span>
        <p className={styles.painCardBody}>{AUDIT_SCRAMBLE.body}</p>
      </div>

      {followUpsSentPos && (
        <span
          className={`${styles.flowStepTitle} ${styles.warningText} ${styles.loopLabel}`}
          style={{ left: followUpsSentPos.x, top: followUpsSentPos.y }}
        >
          Follow-ups Sent
        </span>
      )}

      {fixesRecheckedPos && (
        <span
          className={`${styles.flowStepTitle} ${styles.warningText} ${styles.loopLabel}`}
          style={{ left: fixesRecheckedPos.x, top: fixesRecheckedPos.y }}
        >
          Fixes Re-Checked
        </span>
      )}

      {lines.length > 0 && (
        <svg
          className={styles.overlay}
          width={wrapSize.width}
          height={wrapSize.height}
          viewBox={`0 0 ${wrapSize.width} ${wrapSize.height}`}
          aria-hidden="true"
        >
          <defs>
            <marker
              id={ARROW_ID}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth={8}
              markerHeight={8}
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent-warning)" />
            </marker>
          </defs>
          {lines.map((line, i) => (
            <ProcessConnector
              key={i}
              from={line.from}
              to={line.to}
              shape={line.shape}
              color={line.color}
              gap={line.gap}
              bulge={line.bulge}
              dashed={line.dashed}
              arrowId={line.arrow ? ARROW_ID : undefined}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
