"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Block from "@/components/Block";
import Label from "@/components/Label";
import MetricCard from "@/components/MetricCard";
import QuoteBlock from "@/components/QuoteBlock";
import labelBlockStyles from "@/components/LabelBlock.module.css";
import styles from "./TheProblemPinnedScene.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger, SplitText);

const BLOCK_ROW_STAGGER = 0.08;
const CARD_FADE_DURATION = 0.15;
const CARD_GROW_DURATION = 0.85;
const ROW_DURATION = 0.2;
// Gap (px, = --spacing-xl) between the card's bottom edge and the viewport
// bottom at the end of the reveal, once the card settles at its pinned
// resting position (before the fullscreen grow phase).
const CARD_REVEAL_BOTTOM_GAP = 32;
// How long (px) the scene stays pinned at the top, fully revealed, before
// releasing and scrolling away. Adjust this to change the hold length.
const PIN_HOLD = 300;
// Extra px added on top of nav height before the scene pins. 0 = pins flush
// against the nav's bottom edge, matching where the card also rises to and
// where its fullscreen height is measured from.
const PIN_START_OFFSET = 0;
// How long (px), after PIN_HOLD ends, the card takes to grow to fullscreen
// and the rows to finish exiting — still within the same pin.
const GROW_SCROLL_LENGTH = 1200;
// Fraction of GROW_SCROLL_LENGTH the detail block takes to slide up and out.
const TEXT_EXIT_DURATION = 0.2;
// Fraction of GROW_SCROLL_LENGTH the card grows through before rows start exiting.
const EXIT_START_PROGRESS = 0.75;
// Fraction of the remaining exit window (after EXIT_START_PROGRESS) each
// row's own exit takes — the stagger between rows is derived from this so
// the last row always finishes exactly at the end of the grow phase.
const ROW_EXIT_DURATION = 0.4;
// How long (px), after the grow phase ends, the "Problem" label content
// takes to fade up line by line on the now-blank card — still within the
// same pin. The stagger between lines is derived (not set independently) so
// the last line always finishes exactly at the end of this length, however
// many lines are authored (label + PROBLEM_BODY_LINES + PROBLEM_SUPPORT_LINES).
const LABEL_REVEAL_LENGTH = 800;
// Fraction of LABEL_REVEAL_LENGTH each line's fade-up takes.
const LABEL_ROW_DURATION = 0.35;
// How long (px), once the label content has fully revealed, it holds in
// place — readable — before it starts exiting.
const LABEL_HOLD = 500;
// How long (px) the label content (label + body + support, as one group)
// takes to slide up and fade out, once LABEL_HOLD ends.
const LABEL_EXIT_LENGTH = 150;
// How long (px), after the label content finishes exiting, the metric cards
// take to fade in — centered in the now-empty card.
const METRIC_REVEAL_LENGTH = 500;
// How long (real seconds, NOT scroll px) each metric's count-up takes once
// triggered — deliberately not scrubbed to scroll, so it always plays
// through to completion instead of freezing mid-count if the user stops
// scrolling partway.
const METRIC_COUNT_DURATION = 1.2;
const METRIC_COUNT_EASE = "power2.out";
// How long (px), once the metrics have fully revealed, they hold in place —
// readable — before exiting, mirroring the label's own hold/exit rhythm.
const METRIC_HOLD = 500;
// How long (px) the metric cards (as one group) take to slide up and fade
// out, once METRIC_HOLD ends.
const METRIC_EXIT_LENGTH = 150;
// How long (px), after the metrics finish exiting, the quote block takes to
// fade up — same length as LABEL_REVEAL_LENGTH, since both are the "display
// block" beat of this card.
const QUOTE_REVEAL_LENGTH = LABEL_REVEAL_LENGTH;
// How long (px), once the quote has fully revealed, it holds in place —
// readable — before the pin releases into the next section. Matches
// LABEL_HOLD/METRIC_HOLD. No tween runs during this stretch: scrubbing
// through it just holds the quote's fully-revealed state as-is.
const QUOTE_HOLD = 500;
// Total scroll (px) the sticky stage stays stuck while all beats play — the
// sum of every beat length. The scene's height is one viewport (the stage) +
// this runway, so the stage sticks for exactly this distance, then releases
// and scrolls away into the next section.
const RUNWAY =
  PIN_HOLD +
  GROW_SCROLL_LENGTH +
  LABEL_REVEAL_LENGTH +
  LABEL_HOLD +
  LABEL_EXIT_LENGTH +
  METRIC_REVEAL_LENGTH +
  METRIC_HOLD +
  METRIC_EXIT_LENGTH +
  QUOTE_REVEAL_LENGTH +
  QUOTE_HOLD;

const PROBLEM_LABEL = "The Problem";
// Explicitly-authored line breaks (not auto-wrapped) — this content lives
// inside a card whose width changes continuously via a scrubbed tween, so
// any layout-detected line-wrap (SplitText, text-wrap:balance) would measure
// against a width that's already stale a moment later. See TheProblemPinnedScene
// module notes: this is the pattern for any future scene added to this card.
const PROBLEM_BODY_LINES = [
  "Enterprise software data is spread",
  "across various disconnected systems.",
];
const PROBLEM_SUPPORT_LINES = [
  "IT, Finance and Operations teams",
  "often make decisions working off",
  "of different numbers.",
];

interface ProblemMetric {
  value: string;
  label: string;
  source: { label: string; href: string };
}

const PROBLEM_METRICS: ProblemMetric[] = [
  {
    value: "53%",
    label: "Avg. rate of unused enterprise SaaS licenses.",
    source: {
      label: "Productiv",
      href: "https://productiv.com/blog/2023-state-of-saas-series-while-companies-make-progress-cutting-costs-previous-investments-and-growth-of-shadow-apps-like-chatgpt-challenge-efforts-to-manage-saas-spend/",
    },
  },
  {
    value: "$19.8M",
    label: "Avg. annual license waste per enterprise.",
    source: {
      label: "Zylo",
      href: "https://zylo.com/blog/how-much-wasted-on-saas-spend",
    },
  },
];

// Splits a metric's display string into its animatable parts, e.g.
// "$19.8M" -> prefix "$", target 19.8, decimals 1, suffix "M" — so the
// count-up can tween the numeric part while keeping the original formatting.
function parseMetricValue(raw: string) {
  const match = raw.match(/^([^\d.]*)([\d.]+)([^\d.]*)$/);
  if (!match) return { prefix: "", target: 0, decimals: 0, suffix: raw };
  const [, prefix, numStr, suffix] = match;
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { prefix, target: parseFloat(numStr), decimals, suffix };
}

interface MessageRow {
  side: "left" | "right";
  text?: string;
  image?: { src: string; alt: string };
}

const MESSAGES: MessageRow[] = [
  { side: "left", text: "Hey Edgar. Just got off a call." },
  { side: "right", text: "Hey. How'd it go?" },
  {
    side: "left",
    text: "Every team has the same pain points around software assets.",
  },
  {
    side: "left",
    text: "Millions are spent on licenses they can't track or efficiently optimize.",
  },
  {
    side: "left",
    text: "Everything is ran through spreadsheets and tools that don't talk to each other.",
  },
  {
    side: "right",
    image: { src: "/images/software-observability/face.jpg", alt: "" },
  },
];

interface TheProblemPinnedSceneProps {
  className?: string;
}

export default function TheProblemPinnedScene({
  className,
}: TheProblemPinnedSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const messageScreenRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const problemRevealRef = useRef<HTMLDivElement>(null);
  const labelGroupRef = useRef<HTMLDivElement>(null);
  const problemLabelRef = useRef<HTMLSpanElement>(null);
  const problemBodyLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const problemSupportLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const problemMetricsRef = useRef<HTMLDivElement>(null);
  const metricValueRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const quoteMarkRef = useRef<HTMLImageElement | null>(null);
  const quoteTextRef = useRef<HTMLParagraphElement | null>(null);
  const quoteEmphasisRef = useRef<HTMLParagraphElement | null>(null);
  const quoteAttributionRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const sceneEl = sceneRef.current;
    const stageEl = stageRef.current;
    const blockEl = blockRef.current;
    const cardEl = cardRef.current;
    const messageScreenEl = messageScreenRef.current;
    const problemRevealEl = problemRevealRef.current;
    const labelGroupEl = labelGroupRef.current;
    const problemLabelEl = problemLabelRef.current;
    const problemBodyLines = problemBodyLineRefs.current.filter(
      (line): line is HTMLParagraphElement => line !== null,
    );
    const problemSupportLines = problemSupportLineRefs.current.filter(
      (line): line is HTMLParagraphElement => line !== null,
    );
    const problemMetricsEl = problemMetricsRef.current;
    const metricValueEls = metricValueRefs.current.filter(
      (el): el is HTMLParagraphElement => el !== null,
    );
    const quoteMarkEl = quoteMarkRef.current;
    const quoteTextEl = quoteTextRef.current;
    const quoteEmphasisEl = quoteEmphasisRef.current;
    const quoteAttributionEl = quoteAttributionRef.current;
    const rows = rowRefs.current.filter(
      (row): row is HTMLDivElement => row !== null,
    );
    if (
      !sceneEl ||
      !stageEl ||
      !blockEl ||
      !cardEl ||
      !messageScreenEl ||
      !problemRevealEl ||
      !labelGroupEl ||
      !problemLabelEl ||
      !problemMetricsEl ||
      !quoteMarkEl ||
      !quoteTextEl ||
      !quoteEmphasisEl ||
      !quoteAttributionEl ||
      problemBodyLines.length === 0 ||
      problemSupportLines.length === 0 ||
      metricValueEls.length === 0 ||
      rows.length === 0
    )
      return;

    let split: InstanceType<typeof SplitText> | null = null;
    const navHeight =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-height")
        .trim() || "80px";
    const navHeightPx = parseFloat(navHeight) + PIN_START_OFFSET;

    // Scene height = one viewport (the sticky stage) + the beats' runway. Set
    // here rather than in CSS because the runway is a JS constant; calc() keeps
    // the 100vh part responsive to viewport resize. This fixed height is the
    // scroll distance the sticky stage travels — and it never changes as the
    // card grows (the card grows inside the fixed-height stage), so the next
    // section always follows exactly here.
    sceneEl.style.height = `calc(100vh + ${RUNWAY}px)`;
    const warningColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-warning")
      .trim();

    const ctx = gsap.context(() => {
      // The detail block's text fades in line by line as it scrolls up,
      // independent of the pinned scene below.
      split = new SplitText(blockEl, {
        type: "lines",
        linesClass: "theProblemDetailLine",
      });
      gsap.set(split.lines, { opacity: 0, y: 16 });

      const cardStyle = getComputedStyle(cardEl);
      const paddingY =
        parseFloat(cardStyle.paddingTop) + parseFloat(cardStyle.paddingBottom);
      const startHeight = rows[0].offsetHeight + paddingY;
      // Reveal target: grow the card so its BOTTOM edge lands
      // CARD_REVEAL_BOTTOM_GAP (32px) above the viewport bottom once it
      // settles at the pinned resting position — a viewport-relative height,
      // not the old content-hugging one. cardOffsetInScene is the card's top
      // offset within sceneEl (detail block height + gap); once sceneEl pins,
      // sceneEl top == navHeightPx, so the card's top in the viewport ==
      // navHeightPx + cardOffsetInScene. It's independent of the card's own
      // height, so it's safe to measure once here.
      const cardOffsetInScene =
        cardEl.getBoundingClientRect().top -
        sceneEl.getBoundingClientRect().top;
      const revealTargetHeight =
        window.innerHeight -
        CARD_REVEAL_BOTTOM_GAP -
        navHeightPx -
        cardOffsetInScene;

      // Per-row reveal thresholds: the card HEIGHT at which the growing card's
      // bottom edge has passed this row's bottom edge PLUS one message gap —
      // so each bubble's fade-in plays fully inside the revealed card, not
      // while it's still below the growing edge. Measured here, before any
      // y-offset is applied to the rows, as each row's bottom distance from
      // the card's top + one gap. (Row positions live in messageScreenEl,
      // independent of the card's own height, so this is stable.)
      const cardTopNow = cardEl.getBoundingClientRect().top;
      const messageGap =
        parseFloat(getComputedStyle(messageScreenEl).rowGap) || 0;
      const rowRevealHeights = rows.map(
        (row) => row.getBoundingClientRect().bottom - cardTopNow + messageGap,
      );

      gsap.set(cardEl, { height: startHeight, opacity: 0, overflow: "hidden" });
      // All rows start hidden + offset; each fades in at its own geometric
      // threshold below (gated on the card's edge passing it), so no row is
      // special-cased to the card fade anymore.
      gsap.set(rows, { opacity: 0, y: 16 });
      gsap.set(problemLabelEl, { opacity: 0, y: 16 });
      gsap.set([...problemBodyLines, ...problemSupportLines], {
        opacity: 0,
        y: 16,
      });
      gsap.set(problemMetricsEl, { opacity: 0 });
      metricValueEls.forEach((el, index) => {
        const { prefix, decimals, suffix } = parseMetricValue(
          PROBLEM_METRICS[index].value,
        );
        el.textContent = `${prefix}${(0).toFixed(decimals)}${suffix}`;
      });
      gsap.set(
        [quoteMarkEl, quoteTextEl, quoteEmphasisEl, quoteAttributionEl],
        { opacity: 0, y: 16 },
      );

      // SplitText + the height overrides above just reflowed this section —
      // force a synchronous layout read so ScrollTrigger measures the
      // settled result.
      void sceneEl.offsetHeight;
      scheduleScrollTriggerRefresh();

      gsap.to(split.lines, {
        opacity: 1,
        y: 0,
        stagger: BLOCK_ROW_STAGGER,
        ease: "none",
        scrollTrigger: {
          trigger: blockEl,
          start: "top bottom",
          end: "top 25%",
          scrub: true,
        },
      });

      // Message board reveal: starts once the block's top passes 50% of the
      // viewport, and finishes exactly by the time the block reaches its
      // pinned position (top+=80) — so it's fully revealed the moment the
      // block locks in place below.
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: blockEl,
          start: "top 50%",
          end: `top top+=${navHeight}`,
          scrub: true,
        },
      });

      revealTl.to(cardEl, { opacity: 1, duration: CARD_FADE_DURATION }, 0);
      revealTl.to(
        cardEl,
        {
          height: revealTargetHeight,
          duration: CARD_GROW_DURATION,
          ease: "none",
        },
        CARD_FADE_DURATION,
      );
      // Each row fades in at the timeline position where the card has grown
      // tall enough to have passed that row's bottom + one gap (rowRevealHeights
      // above). The card grows linearly from startHeight to revealTargetHeight
      // over [CARD_FADE_DURATION, CARD_FADE_DURATION + CARD_GROW_DURATION], so
      // map each threshold height into that segment. Clamped so a row's fade
      // still finishes by the end of the grow phase (never extends the
      // timeline past where the card finishes, which would shift the pin
      // hand-off). A row whose threshold exceeds revealTargetHeight (content
      // taller than the settled card) clamps to the last slot and fades right
      // at the end.
      const growEndAt = CARD_FADE_DURATION + CARD_GROW_DURATION;
      const heightRange = revealTargetHeight - startHeight;
      rows.forEach((row, index) => {
        const progress =
          heightRange > 0
            ? (rowRevealHeights[index] - startHeight) / heightRange
            : 1;
        const at = gsap.utils.clamp(
          0,
          growEndAt - ROW_DURATION,
          CARD_FADE_DURATION + CARD_GROW_DURATION * progress,
        );
        revealTl.to(
          row,
          { opacity: 1, y: 0, duration: ROW_DURATION, ease: "none" },
          at,
        );
      });

      // The beats, once the stage is stuck. First a flat hold (PIN_HOLD) with
      // the board fully revealed, then — still within the same stuck runway —
      // the detail block slides up out of view, the card grows to fill the
      // viewport (border-radius easing to 0 as its corners reach the viewport
      // corners), and the rows slide out to their own side once the card is
      // EXIT_START_PROGRESS of the way through growing.
      const textExitDuration = GROW_SCROLL_LENGTH * TEXT_EXIT_DURATION;
      const exitStart = PIN_HOLD + GROW_SCROLL_LENGTH * EXIT_START_PROGRESS;
      // The exit window is whatever's left of GROW_SCROLL_LENGTH after
      // EXIT_START_PROGRESS. ROW_EXIT_DURATION is a fraction of *that*
      // window (not of GROW_SCROLL_LENGTH); the stagger is derived — not
      // independently set — so the last row's exit always finishes exactly
      // when the exit window (and the grow phase) ends, regardless of row
      // count or duration.
      const exitWindow =
        GROW_SCROLL_LENGTH - GROW_SCROLL_LENGTH * EXIT_START_PROGRESS;
      const rowExitDuration = exitWindow * ROW_EXIT_DURATION;
      const rowExitStagger =
        rows.length > 1
          ? (exitWindow - rowExitDuration) / (rows.length - 1)
          : 0;

      // No pin — the sticky .stage (CSS) holds the content in the viewport
      // while the scene scrolls its runway. This scrub timeline is driven off
      // the scene's own scroll: start when the scene's top reaches the viewport
      // top (the stage begins sticking), run for exactly RUNWAY (the distance
      // the stage stays stuck). The card grows inside the fixed-height stage,
      // so nothing here changes the scene's layout height.
      const growTl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneEl,
          start: "top top",
          end: `+=${RUNWAY}`,
          scrub: true,
          // Re-evaluate the function-based width/height/x/y targets on every
          // refresh (resize, font load, layout change) so the fullscreen
          // dimensions and the captured resting rect stay correct.
          invalidateOnRefresh: true,
        },
      });

      growTl.to(
        blockEl,
        {
          yPercent: -120,
          opacity: 0,
          ease: "none",
          duration: textExitDuration,
        },
        PIN_HOLD,
      );

      // Grow the card to fullscreen by animating its REAL width/height (plus
      // an x/y translate to reposition), NOT transform:scale. Scaling
      // distorts every descendant (grid, radius, text) and is what forced
      // all the counter-scale/x-correction hacks this replaces; animating
      // the actual box size leaves children undistorted and laying out on
      // real pixels, so the 12-col grid and border-radius stay correct for
      // free. The card stays in normal flow inside the sticky stage, so it
      // scrolls away naturally when the stage releases at the end of the runway.
      //
      // messageScreenEl is a sibling of cardEl, positioned over the card's
      // resting band — it stays put as the card grows past it, until its own
      // rows slide out. problemRevealEl is a child of cardEl, so it grows
      // with the real card box to fill fullscreen at true pixel size.
      //
      // The card's resting on-screen rect can't be measured at mount (the
      // page hasn't scrolled to the pin yet). Capture it live when the
      // playhead first crosses PIN_HOLD, from a clean untransformed state so
      // repeated scrub crossings can't compound a stale offset. width/height
      // targets are pure viewport functions (recomputed on refresh via
      // invalidateOnRefresh); x/y targets derive from the capture.
      const cardFlip = { top: 0, left: 0 };
      growTl.call(
        () => {
          gsap.set(cardEl, { x: 0, y: 0 });
          const rect = cardEl.getBoundingClientRect();
          cardFlip.top = rect.top;
          cardFlip.left = rect.left;
        },
        undefined,
        PIN_HOLD,
      );

      // Horizontal grow + corner rounding, over the whole grow phase: width
      // expands to the full viewport, x-translate so the left edge lands at 0.
      growTl.to(
        cardEl,
        {
          width: () => window.innerWidth,
          x: () => -cardFlip.left,
          borderRadius: 0,
          ease: "none",
          duration: GROW_SCROLL_LENGTH,
        },
        PIN_HOLD,
      );

      // Vertical grow + rise, only after the detail block has finished
      // exiting (so the board doesn't climb into the still-present text):
      // height fills the TRUE full viewport (not just the space below the
      // nav), y-translate lifts the top edge flush to y:0 — the transform
      // moves cardEl outside the stage's own (lower, padded-below-nav) box
      // bounds, which is fine since transforms don't affect layout, only
      // paint position. The nav (fixed, opaque, its own z-index)
      // still renders on top of the card's top ~navHeightPx, but content
      // stays clear of it since it's vertically centered in the full height,
      // not anchored to the top edge. Finishes exactly when the grow phase
      // ends.
      growTl.to(
        cardEl,
        {
          height: () => window.innerHeight,
          y: () => -cardFlip.top,
          ease: "none",
          duration: GROW_SCROLL_LENGTH - textExitDuration,
        },
        PIN_HOLD + textExitDuration,
      );

      rows.forEach((row, index) => {
        const direction = MESSAGES[index].side === "left" ? -1 : 1;
        growTl.to(
          row,
          {
            xPercent: direction * 150,
            opacity: 0,
            ease: "none",
            duration: rowExitDuration,
          },
          exitStart + index * rowExitStagger,
        );
      });

      // The card's background color-transforms from its resting grey to the
      // warning red over the same window the rows use to exit — starts the
      // moment messages begin leaving the edge, finishes exactly at growEnd,
      // right before the "Problem" label content enters.
      growTl.to(
        cardEl,
        {
          backgroundColor: warningColor,
          ease: "none",
          duration: exitWindow,
        },
        exitStart,
      );

      // Once the grow phase ends (card is fullscreen, messages fully
      // exited), the "Problem" label content fades up line by line, already
      // at its final color — a plain fade, not the word-by-word recolor
      // LabelBlock normally does elsewhere, since this content is revealed
      // by the pinned scene's own timeline rather than its own scroll entry.
      // Lines are explicitly authored (PROBLEM_BODY_LINES/PROBLEM_SUPPORT_LINES),
      // not auto-wrapped, since this content sits inside a card whose width
      // is continuously changing via the tween above — a layout-detected
      // line-wrap would measure against a width that's already stale a
      // moment later. Stagger is derived (like the row-exit stagger above)
      // so the last line's reveal always finishes exactly at the end of
      // LABEL_REVEAL_LENGTH.
      const growEnd = PIN_HOLD + GROW_SCROLL_LENGTH;
      const labelRevealTargets = [
        problemLabelEl,
        ...problemBodyLines,
        ...problemSupportLines,
      ];
      const labelRowDuration = LABEL_REVEAL_LENGTH * LABEL_ROW_DURATION;
      const labelRowStagger =
        labelRevealTargets.length > 1
          ? (LABEL_REVEAL_LENGTH - labelRowDuration) /
            (labelRevealTargets.length - 1)
          : 0;

      labelRevealTargets.forEach((el, index) => {
        growTl.to(
          el,
          {
            opacity: 1,
            y: 0,
            ease: "none",
            duration: labelRowDuration,
          },
          growEnd + index * labelRowStagger,
        );
      });

      // Once the label content has fully finished revealing, it holds in
      // place (LABEL_HOLD) — long enough to read — then slides up and fades
      // out, clearing the card for the metric cards to take the now-empty,
      // centered space. Animated on labelGroupEl (the label + body + support
      // wrapper) as a single rigid block, NOT on the individual lines the
      // reveal-in used — yPercent on each line independently moves it by a
      // fraction of its OWN height, and the label (xl) and body/support
      // lines (smaller) have different heights, so they drift apart at
      // different absolute speeds and the shorter lines catch up into the
      // label's space. Moving the wrapper once preserves the internal
      // spacing throughout the exit.
      const labelRevealEnd = growEnd + LABEL_REVEAL_LENGTH;
      const labelExitStart = labelRevealEnd + LABEL_HOLD;
      growTl.to(
        labelGroupEl,
        {
          yPercent: -120,
          opacity: 0,
          ease: "none",
          duration: LABEL_EXIT_LENGTH,
        },
        labelExitStart,
      );

      // Once the label content has fully exited, the metric cards fade in,
      // centered in the card, while each value counts up from 0 to its real
      // number over the same window — prefix/suffix (%, $, M) stay put,
      // only the numeric part animates.
      const labelExitEnd = labelExitStart + LABEL_EXIT_LENGTH;
      growTl.to(
        problemMetricsEl,
        {
          opacity: 1,
          ease: "none",
          duration: METRIC_REVEAL_LENGTH,
        },
        labelExitEnd,
      );

      // The count-up itself runs in real time, NOT scrubbed to scroll like
      // everything else in this timeline — a scrubbed count is misleading if
      // the user stops scrolling partway through and the number just freezes
      // mid-count. growTl.call() fires once, in the same scrub-driven spot
      // (labelExitEnd) the fade-in starts, then the count plays out on its
      // own real-time clock regardless of what scroll does next.
      metricValueEls.forEach((el, index) => {
        const { prefix, target, decimals, suffix } = parseMetricValue(
          PROBLEM_METRICS[index].value,
        );
        growTl.call(
          () => {
            const counter = { count: 0 };
            gsap.to(counter, {
              count: target,
              duration: METRIC_COUNT_DURATION,
              ease: METRIC_COUNT_EASE,
              onUpdate: () => {
                el.textContent = `${prefix}${counter.count.toFixed(decimals)}${suffix}`;
              },
            });
          },
          undefined,
          labelExitEnd,
        );
      });

      // Once the metrics have fully revealed, they hold in place (METRIC_HOLD)
      // — long enough to read — then slide up and fade out as one group
      // (METRIC_EXIT_LENGTH), mirroring the label's own hold/exit rhythm and
      // clearing the card for the quote block.
      const metricsRevealEnd = labelExitEnd + METRIC_REVEAL_LENGTH;
      const metricsExitStart = metricsRevealEnd + METRIC_HOLD;
      growTl.to(
        problemMetricsEl,
        {
          yPercent: -120,
          opacity: 0,
          ease: "none",
          duration: METRIC_EXIT_LENGTH,
        },
        metricsExitStart,
      );

      // Once the metrics finish exiting, the quote block fades up — mark,
      // quote text, emphasis, then attribution, in that order, each with a
      // slight stagger. Reuses the exact same formula (and LABEL_ROW_DURATION)
      // as the "Problem" label reveal above, for consistency between the
      // two beats.
      const metricsExitEnd = metricsExitStart + METRIC_EXIT_LENGTH;
      const quoteRevealTargets = [
        quoteMarkEl,
        quoteTextEl,
        quoteEmphasisEl,
        quoteAttributionEl,
      ];
      const quoteRowDuration = QUOTE_REVEAL_LENGTH * LABEL_ROW_DURATION;
      const quoteRowStagger =
        quoteRevealTargets.length > 1
          ? (QUOTE_REVEAL_LENGTH - quoteRowDuration) /
            (quoteRevealTargets.length - 1)
          : 0;

      quoteRevealTargets.forEach((el, index) => {
        growTl.to(
          el,
          {
            opacity: 1,
            y: 0,
            ease: "none",
            duration: quoteRowDuration,
          },
          metricsExitEnd + index * quoteRowStagger,
        );
      });
    });

    return () => {
      ctx.revert();
      split?.revert();
      sceneEl.style.height = "";
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className={`${styles.scene}${className ? ` ${className}` : ""}`}
    >
      <div ref={stageRef} className={styles.stage}>
        <Block ref={blockRef} size="lg" className={styles.detailBlock}>
          This one came from a leadership ping after a sales call...
        </Block>
        <div className={styles.messageContainer}>
        <div ref={cardRef} className={styles.messageCard}>
          <div ref={problemRevealRef} className={styles.problemReveal}>
            <div ref={labelGroupRef} className={styles.problemLabelGroup}>
              <Label ref={problemLabelRef} size="xl">
                {PROBLEM_LABEL}
              </Label>
              <div
                className={`${labelBlockStyles.displayBody} ${styles.problemRevealBody}`}
              >
                <div>
                  {PROBLEM_BODY_LINES.map((line, index) => (
                    <p
                      key={line}
                      ref={(el) => {
                        problemBodyLineRefs.current[index] = el;
                      }}
                      className={`${labelBlockStyles.statement}${index === 1 ? ` ${styles.problemBodyLineNoWrap}` : ""}`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
                {/* .statement (not .support) on both groups — support's default
                    color is a darker grey; this content stays grey-500 throughout. */}
                <div>
                  {PROBLEM_SUPPORT_LINES.map((line, index) => (
                    <p
                      key={line}
                      ref={(el) => {
                        problemSupportLineRefs.current[index] = el;
                      }}
                      className={labelBlockStyles.statement}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* A sibling of .problemReveal, not a child — the label content
              above exits via its own transform/opacity but stays in the flow
              it was already in; centering the metrics independently here is
              what lets them occupy the card's centered space once the label
              clears, with no repositioning animation of their own needed. */}
          <div className={styles.problemMetrics}>
            <div
              ref={problemMetricsRef}
              className={`${styles.problemLabelGroup} ${styles.problemMetricsGroup}`}
            >
              {PROBLEM_METRICS.map((metric, index) => (
                <MetricCard
                  key={metric.value}
                  value={metric.value}
                  label={metric.label}
                  source={metric.source}
                  className={index === 1 ? styles.metricSecond : undefined}
                  valueRef={(el) => {
                    metricValueRefs.current[index] = el;
                  }}
                />
              ))}
            </div>
          </div>
          {/* A sibling of .problemReveal and .problemMetrics — the quote
              block is this card's final beat, entering only after the
              metrics have fully exited. */}
          <div className={styles.problemQuote}>
            <div className={styles.problemQuoteGroup}>
              <QuoteBlock
                quote="Making aligned, confident decisions on spend, compliance and resource allocation..."
                emphasis="Nearly impossible."
                attribution="— Sentiment echoed across prospect calls"
                markRef={(el) => {
                  quoteMarkRef.current = el;
                }}
                quoteTextRef={(el) => {
                  quoteTextRef.current = el;
                }}
                emphasisRef={(el) => {
                  quoteEmphasisRef.current = el;
                }}
                attributionRef={(el) => {
                  quoteAttributionRef.current = el;
                }}
              />
            </div>
          </div>
        </div>
        <div ref={messageScreenRef} className={styles.messageScreen}>
          {MESSAGES.map((message, index) => (
            <div
              key={index}
              ref={(el) => {
                rowRefs.current[index] = el;
              }}
              className={
                message.side === "left" ? styles.rowLeft : styles.rowRight
              }
            >
              {message.text && (
                <div
                  className={`${styles.bubble}${message.side === "right" ? ` ${styles.bubbleSent}` : ""}`}
                >
                  <p className={styles.bubbleText}>{message.text}</p>
                </div>
              )}
              {message.image && (
                <img
                  src={message.image.src}
                  alt={message.image.alt}
                  aria-hidden="true"
                  className={styles.emoji}
                />
              )}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
