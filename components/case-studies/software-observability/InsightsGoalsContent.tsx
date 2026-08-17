"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import LabelBlock from "@/components/LabelBlock";
import ContextBlock from "@/components/ContextBlock";
import Label from "@/components/Label";
import TitleBlock from "@/components/TitleBlock";
import Block from "@/components/Block";
import styles from "@/app/work/software-observability/software-observability.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

// Matches LabelBlock's own display-size fade-in (LabelBlock.tsx) so "The
// Experts" title reads as part of the same reveal beat as "Insights & Goals".
const TITLE_DURATION = 0.2;
const TITLE_EASE = "power2.out";
// Matches TheProblemPinnedScene's ROW_REVEAL_STAGGER convention for
// one-by-one row reveals.
const EXPERT_STAGGER = 0.15;

// The exported funnel-morph.svg's native size (public/SVG/funnel-morph.svg),
// rendered at native size, centered at the section's top edge.
const FUNNEL_WIDTH = 256;
const FUNNEL_HEIGHT = 128;
// The spine starts this many px above the funnel's peak (overlapping into
// the shape) so the two don't visibly butt against each other at the tip.
const SPINE_FUNNEL_OVERLAP = 8;
// Flat state: same path structure as the funnel shape, all y's collapsed to
// 0, so it reads as the previous section's flat bottom edge before morphing.
const FUNNEL_FLAT_D =
  "M0 0C70.6875 0 128 0 128 0C128 0 185.312 0 256 0H0Z";
const FUNNEL_SHAPE_D =
  "M0 0C70.6875 0 128 57.3066 128 128C128 57.3066 185.312 0 256 0H0Z";
// Extra scroll distance (px) held after the spine reaches badge 3, so its
// row's reveal has room to finish before the phase's ScrollTrigger ends.
const SPINE_END_BUFFER = 200;
// How long (fraction of phase 2's scrub range) each connector takes to fill
// in once the spine arrives at its badge.
const CONNECTOR_FILL_DURATION = 0.05;
// How long the extension line takes to fill once the connector hands off.
const EXTENSION_FILL_DURATION = 0.05;
// The exported connector-curve.svg's path (public/SVG/connector-curve.svg),
// rendered at native size — no scaling.
const CONNECTOR_PATH_D =
  "M0 0.5H121C133.703 0.5 144 10.7975 144 23.5C144 36.2025 154.297 46.5 167 46.5H320";
// The curve's own native vertical drop (its path runs from y=0.5 to
// y=46.5) — the badge/spine target Y has to back this out, so the curve's
// far end lands exactly on the divider line instead of 46px below it.
const CONNECTOR_CURVE_DROP = 46;
// Connector path's native width (public/SVG/connector-curve.svg) — used to
// find where its far end lands, so the extension line picks up from there.
const CONNECTOR_NATIVE_WIDTH = 320;

const EXPERTS = [
  { title: "Chief Product Officer", body: "Former CIO" },
  {
    title: "VP of Customer Operations",
    body: "Former Director of IT & Technology Infrastructure",
  },
  { title: "Director of Product", body: "Former Lead Data & Gen AI Architect" },
];

const INSIGHTS = [
  {
    title: "No easy way to define the true cost of software.",
    body: "Licenses purchased, assignments, and spend lived in separate systems owned by different teams, with no unified view.",
  },
  {
    title: "Renewals were a recurring financial risk.",
    body: "Without consolidated spend data or proactive renewal visibility, contracts auto-renewed for unused software before anyone could intervene.",
  },
  {
    title: "Utilization data was rarely actionable.",
    body: "Usage telemetry was pulled in isolation, disconnected from ownership, compliance, and cost context.",
  },
];

const GOALS = [
  {
    title: "One source of truth for ownership, spend, and health.",
    body: "Create a unified view so finance and IT share the same numbers, and surface compliance risk before it becomes a liability.",
  },
  {
    title: "Negotiation leverage from discrepancies and usage data.",
    body: "Reconcile internal records against publisher and vendor data to catch discrepancies, and price low utilization, so renewal conversations are backed by verified numbers.",
  },
  {
    title: "Target unused licenses for recoverable spend.",
    body: "Translate low utilization into a dollar opportunity, and help teams focus reclamation on the departments and employees with the greatest impact.",
  },
];

export default function InsightsGoalsContent() {
  const labelWrapRef = useRef<HTMLDivElement>(null);
  const expertsTitleRef = useRef<HTMLSpanElement>(null);
  const expertRefs = useRef<(HTMLDivElement | null)[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const funnelRef = useRef<SVGPathElement>(null);
  const spineRef = useRef<SVGLineElement>(null);
  const insightsColRef = useRef<HTMLDivElement>(null);
  const goalsColRef = useRef<HTMLDivElement>(null);
  const insightHeadingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightConnectorRefs = useRef<(SVGPathElement | null)[]>([]);
  const leftConnectorRefs = useRef<(SVGPathElement | null)[]>([]);
  const rightExtensionRefs = useRef<(SVGLineElement | null)[]>([]);
  const leftExtensionRefs = useRef<(SVGLineElement | null)[]>([]);
  const insightItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const goalItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // "Insights & Goals" label / "The Experts" reveal — unchanged from before.
  useEffect(() => {
    const triggerEl = labelWrapRef.current;
    const titleEl = expertsTitleRef.current;
    const expertEls = expertRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (!triggerEl || !titleEl) return;

    const ctx = gsap.context(() => {
      gsap.set(titleEl, { opacity: 0, y: 16 });
      gsap.set(expertEls, { opacity: 0, y: 16 });

      scheduleScrollTriggerRefresh();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          start: "top 67%",
          end: "center center",
          scrub: true,
        },
      });

      tl.to(
        titleEl,
        { opacity: 1, y: 0, duration: TITLE_DURATION, ease: TITLE_EASE },
        0,
      );

      expertEls.forEach((el, i) => {
        tl.to(
          el,
          { opacity: 1, y: 0, duration: TITLE_DURATION, ease: TITLE_EASE },
          i === 0 ? ">" : `>${EXPERT_STAGGER}`,
        );
      });
    });

    return () => ctx.revert();
  }, []);

  // Funnel → spine → badge reveal. Connectors and card text are hidden for
  // now (step-by-step build) — reintroduced once this orchestration is right.
  useEffect(() => {
    const sectionEl = labelWrapRef.current?.closest("section");
    const svgEl = svgRef.current;
    const funnelEl = funnelRef.current;
    const spineEl = spineRef.current;
    const insightsColEl = insightsColRef.current;
    const goalsColEl = goalsColRef.current;
    const insightHeadingEls = insightHeadingRefs.current;
    const badgeEls = badgeRefs.current;
    const rightConnEls = rightConnectorRefs.current;
    const leftConnEls = leftConnectorRefs.current;
    const rightExtEls = rightExtensionRefs.current;
    const leftExtEls = leftExtensionRefs.current;
    const insightItemEls = insightItemRefs.current;
    const goalItemEls = goalItemRefs.current;

    if (
      !sectionEl ||
      !svgEl ||
      !funnelEl ||
      !spineEl ||
      !insightsColEl ||
      !goalsColEl ||
      insightHeadingEls.some((el) => !el) ||
      badgeEls.some((el) => !el) ||
      rightConnEls.some((el) => !el) ||
      leftConnEls.some((el) => !el) ||
      rightExtEls.some((el) => !el) ||
      leftExtEls.some((el) => !el) ||
      insightItemEls.some((el) => !el) ||
      goalItemEls.some((el) => !el)
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const measure = () => {
        const sectionRect = sectionEl.getBoundingClientRect();
        const width = sectionRect.width;
        const height = sectionRect.height;
        const centerX = width / 2;
        const badgeHalfWidth = badgeEls[0]!.getBoundingClientRect().width / 2;
        // Each row's divider Y, measured off the Insights column only —
        // fixed heading/body heights guarantee the Goals column's dividers
        // land on the exact same Y.
        const dividerYs = insightHeadingEls.map(
          (el) => el!.getBoundingClientRect().bottom - sectionRect.top,
        );
        // The badge (and spine, which stops at the badge's top edge) has to
        // sit higher than the divider — its vertical center is where the
        // connector attaches, and the connector's curve then drops
        // CONNECTOR_CURVE_DROP px as it travels out, so working backward
        // from the divider: badge top = dividerY − badgeHalfWidth (to the
        // badge's center) − CONNECTOR_CURVE_DROP.
        const badgeTopYs = dividerYs.map(
          (y) => y - badgeHalfWidth - CONNECTOR_CURVE_DROP,
        );
        // Pulled in by each card's own padding (measured, not duplicated
        // from the token) so the line stops right before that padding,
        // not at the card's true outer edge.
        const insightPadding = parseFloat(
          getComputedStyle(insightItemEls[0]!).paddingLeft,
        );
        const goalPadding = parseFloat(
          getComputedStyle(goalItemEls[0]!).paddingRight,
        );
        const insightsEdgeX =
          insightsColEl.getBoundingClientRect().left - sectionRect.left + insightPadding;
        const goalsEdgeX =
          goalsColEl.getBoundingClientRect().right - sectionRect.left - goalPadding;
        return {
          width,
          height,
          centerX,
          badgeHalfWidth,
          badgeTopYs,
          dividerYs,
          insightsEdgeX,
          goalsEdgeX,
        };
      };

      const m = measure();
      svgEl.setAttribute("viewBox", `0 0 ${m.width} ${m.height}`);

      // Funnel starts flat (its path collapsed to a line), centered
      // horizontally at native size, flush with the section's top edge.
      funnelEl.setAttribute(
        "transform",
        `translate(${m.centerX - FUNNEL_WIDTH / 2}, 0)`,
      );
      funnelEl.setAttribute("d", FUNNEL_FLAT_D);

      const spineStartY = FUNNEL_HEIGHT - SPINE_FUNNEL_OVERLAP;
      gsap.set(spineEl, {
        attr: { x1: m.centerX, x2: m.centerX, y1: spineStartY, y2: spineStartY },
      });
      gsap.set(badgeEls, { opacity: 0, scale: 0.6 });
      badgeEls.forEach((el, i) => {
        gsap.set(el, { left: m.centerX, top: m.badgeTopYs[i] });
      });
      gsap.set([...insightItemEls, ...goalItemEls], { opacity: 0, y: 16 });

      // Right connector: the real connector-curve.svg path at its native
      // 320×47 size, no scaling — left endpoint flush to the badge's right
      // edge at its vertical center. Geometry set to its real, final
      // position immediately; the reveal only animates strokeDashoffset.
      rightConnEls.forEach((el, i) => {
        const attachX = m.centerX + m.badgeHalfWidth;
        const attachY = m.badgeTopYs[i] + m.badgeHalfWidth;
        el!.setAttribute("transform", `translate(${attachX} ${attachY})`);
        const length = el!.getTotalLength();
        gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
      });

      // Left connector: same path, same native size, mirrored horizontally
      // (scale(-1,1) — flip, not a stretch) so it extends away from the
      // badge's left edge instead of its right.
      leftConnEls.forEach((el, i) => {
        const attachX = m.centerX - m.badgeHalfWidth;
        const attachY = m.badgeTopYs[i] + m.badgeHalfWidth;
        el!.setAttribute("transform", `translate(${attachX} ${attachY}) scale(-1, 1)`);
        const length = el!.getTotalLength();
        gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
      });

      // Extensions: flat lines picking up exactly where each connector's
      // native-length end lands, continuing at the divider's Y out to the
      // card's actual outer edge.
      rightExtEls.forEach((el, i) => {
        const x1 = m.centerX + m.badgeHalfWidth + CONNECTOR_NATIVE_WIDTH;
        const y = m.dividerYs[i];
        const length = Math.abs(m.goalsEdgeX - x1);
        gsap.set(el, {
          attr: { x1, y1: y, x2: m.goalsEdgeX, y2: y },
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });
      leftExtEls.forEach((el, i) => {
        const x1 = m.centerX - m.badgeHalfWidth - CONNECTOR_NATIVE_WIDTH;
        const y = m.dividerYs[i];
        const length = Math.abs(x1 - m.insightsEdgeX);
        gsap.set(el, {
          attr: { x1, y1: y, x2: m.insightsEdgeX, y2: y },
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      scheduleScrollTriggerRefresh();

      // Phase 1 — funnel morphs from flat to its full shape over the first
      // 25% of the section's entry.
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top bottom",
          end: "top 75%",
          scrub: true,
        },
      }).to(funnelEl, {
        morphSVG: FUNNEL_SHAPE_D,
        duration: 1,
        ease: "none",
      });

      // Phase 2 — spine grows continuously and stops exactly at each
      // badge's top edge; that badge must be FULLY revealed by the time the
      // spine's tip arrives, not just starting then — so each badge's tween
      // is scheduled to end, not start, at its measured scroll fraction.
      const lastBadgeTopY = m.badgeTopYs[m.badgeTopYs.length - 1];
      const spineTravel = lastBadgeTopY - spineStartY;
      const totalPhaseLength = spineTravel + SPINE_END_BUFFER;
      const badgeRevealDuration = 0.06;

      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 75%",
          end: () => `+=${totalPhaseLength}`,
          scrub: true,
        },
      });

      revealTl.to(
        spineEl,
        {
          attr: { y2: lastBadgeTopY },
          duration: spineTravel / totalPhaseLength,
          ease: "none",
        },
        0,
      );

      m.badgeTopYs.forEach((y, i) => {
        const arrivesAt = (y - spineStartY) / totalPhaseLength;
        revealTl.to(
          badgeEls[i],
          { opacity: 1, scale: 1, duration: badgeRevealDuration, ease: "power2.out" },
          Math.max(0, arrivesAt - badgeRevealDuration),
        );
        // Both connectors start filling in the instant the spine arrives —
        // not before, not gradually alongside it — and at the same exact
        // time as each other.
        revealTl.to(
          [rightConnEls[i], leftConnEls[i]],
          { strokeDashoffset: 0, duration: CONNECTOR_FILL_DURATION, ease: "power2.out" },
          arrivesAt,
        );
        // Extensions pick up the instant the connectors finish, continuing
        // the same fill motion seamlessly out to the card's outer edge.
        const extensionStart = arrivesAt + CONNECTOR_FILL_DURATION;
        revealTl.to(
          [rightExtEls[i], leftExtEls[i]],
          { strokeDashoffset: 0, duration: EXTENSION_FILL_DURATION, ease: "power2.out" },
          extensionStart,
        );
        // Cards fade up right after the extension reaches the card edge —
        // brought in now just to see where the fixed heights/gaps land
        // relative to the badge/connector/extension positions.
        revealTl.to(
          [insightItemEls[i], goalItemEls[i]],
          { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" },
          extensionStart + EXTENSION_FILL_DURATION,
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <svg ref={svgRef} className={styles.insightsGoalsMotionSvg} aria-hidden="true">
        <path ref={funnelRef} fill="var(--surface-base)" />
        <line
          ref={spineRef}
          stroke="var(--surface-card-border)"
          strokeWidth={1}
        />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            ref={(el) => { rightConnectorRefs.current[i] = el; }}
            d={CONNECTOR_PATH_D}
            stroke="var(--surface-card-border)"
            strokeWidth={1}
            fill="none"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            ref={(el) => { leftConnectorRefs.current[i] = el; }}
            d={CONNECTOR_PATH_D}
            stroke="var(--surface-card-border)"
            strokeWidth={1}
            fill="none"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            ref={(el) => { rightExtensionRefs.current[i] = el; }}
            stroke="var(--surface-card-border)"
            strokeWidth={1}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            ref={(el) => { leftExtensionRefs.current[i] = el; }}
            stroke="var(--surface-card-border)"
            strokeWidth={1}
          />
        ))}
      </svg>

      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => { badgeRefs.current[i] = el; }}
          className={styles.insightsGoalsBadge}
        >
          {String(i + 1).padStart(2, "0")}
        </div>
      ))}

      <div ref={labelWrapRef} className={styles.insightsGoalsLeft}>
        <LabelBlock
          size="display"
          label="Insights & Goals"
          body="The groundwork allowed me to close the knowledge gap fast, letting us move past the basics and straight to decision making."
          inverse
        />
      </div>
      <ContextBlock side="none" className={styles.insightsGoalsContext}>
        <Label ref={expertsTitleRef} size="md" color="inverse">
          The Experts
        </Label>
        <div className={styles.insightsGoalsDescriptions}>
          {EXPERTS.map((expert, i) => (
            <div key={expert.title} ref={(el) => { expertRefs.current[i] = el; }}>
              <TitleBlock size="md" title={expert.title} body={expert.body} inverse />
            </div>
          ))}
        </div>
      </ContextBlock>

      <div ref={insightsColRef} className={styles.insightsGoalsInsights}>
        <Label size="md" color="inverse">Insights</Label>
        <div className={styles.insightsGoalsItems}>
          {INSIGHTS.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => { insightItemRefs.current[i] = el; }}
              className={styles.insightsGoalsItem}
            >
              <div
                ref={(el) => { insightHeadingRefs.current[i] = el; }}
                className={styles.insightsGoalsItemHeading}
              >
                <p className={styles.insightsGoalsItemTitle}>{item.title}</p>
              </div>
              <div className={styles.insightsGoalsItemBody}>
                <Block size="md" color="inverse">{item.body}</Block>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div ref={goalsColRef} className={styles.insightsGoalsGoals}>
        <Label size="md" color="inverse">Goals</Label>
        <div className={styles.insightsGoalsItems}>
          {GOALS.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => { goalItemRefs.current[i] = el; }}
              className={styles.insightsGoalsItem}
            >
              <div className={styles.insightsGoalsItemHeading}>
                <p className={styles.insightsGoalsItemTitle}>{item.title}</p>
              </div>
              <div className={styles.insightsGoalsItemBody}>
                <Block size="md" color="inverse">{item.body}</Block>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
