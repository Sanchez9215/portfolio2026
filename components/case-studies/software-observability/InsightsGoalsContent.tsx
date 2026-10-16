"use client";

import { useEffect, useRef } from "react";
import LabelBlock from "@/components/LabelBlock";
import ContextBlock from "@/components/ContextBlock";
import Label from "@/components/Label";
import TitleBlock from "@/components/TitleBlock";
import Block from "@/components/Block";
import styles from "@/app/work/software-observability/software-observability.module.css";

// The curve's own native vertical drop (its path runs from y=0.5 to
// y=46.5) — the badge/spine target Y has to back this out, so the curve's
// far end lands exactly on the divider line instead of 46px below it.
const CONNECTOR_CURVE_DROP = 46;
// The exported connector-curve.svg's path (public/SVG/connector-curve.svg),
// rendered at native size — no scaling.
const CONNECTOR_PATH_D =
  "M0 0.5H121C133.703 0.5 144 10.7975 144 23.5C144 36.2025 154.297 46.5 167 46.5H320";
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
    body: "No consolidated spend data or proactive renewal alerts led to contracts auto-renewing for unused software before anyone could intervene.",
  },
  {
    title: "Utilization data was rarely actionable.",
    body: "Usage data was pulled in isolation, disconnected from ownership, compliance, and cost context.",
  },
];

const GOALS = [
  {
    title: "One source of truth for ownership, spend, and health.",
    body: "Create a unified view so finance and IT share the same numbers, and surface compliance risk before it becomes a liability.",
  },
  {
    title:
      "Proactive renewal signaling and usage data for negotiation leverage.",
    body: "Pair renewal deadlines with urgency flags, usage, and assignment data to enable early action, so decisions to cancel, renegotiate, or downsize are addressed in time and backed by verified data.",
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

  // Static layout — no scroll-triggered reveal. The spine runs the full
  // section height, and badges/connectors/extensions are positioned once
  // (and on resize) from the real DOM layout, all visible immediately.
  useEffect(() => {
    const sectionEl = labelWrapRef.current?.closest("section");
    const svgEl = svgRef.current;
    const spineEl = spineRef.current;
    const insightsColEl = insightsColRef.current;
    const goalsColEl = goalsColRef.current;
    const insightHeadingEls = insightHeadingRefs.current;
    const badgeEls = badgeRefs.current;
    const rightConnEls = rightConnectorRefs.current;
    const leftConnEls = leftConnectorRefs.current;
    const rightExtEls = rightExtensionRefs.current;
    const leftExtEls = leftExtensionRefs.current;

    if (
      !sectionEl ||
      !svgEl ||
      !spineEl ||
      !insightsColEl ||
      !goalsColEl ||
      insightHeadingEls.some((el) => !el) ||
      badgeEls.some((el) => !el) ||
      rightConnEls.some((el) => !el) ||
      leftConnEls.some((el) => !el) ||
      rightExtEls.some((el) => !el) ||
      leftExtEls.some((el) => !el)
    ) {
      return;
    }

    const layout = () => {
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
      const badgeTopYs = dividerYs.map(
        (y) => y - badgeHalfWidth - CONNECTOR_CURVE_DROP,
      );
      const insightPadding = parseFloat(
        getComputedStyle(insightItemRefs.current[0]!).paddingLeft,
      );
      const goalPadding = parseFloat(
        getComputedStyle(goalItemRefs.current[0]!).paddingRight,
      );
      const insightsEdgeX =
        insightsColEl.getBoundingClientRect().left -
        sectionRect.left +
        insightPadding;
      const goalsEdgeX =
        goalsColEl.getBoundingClientRect().right -
        sectionRect.left -
        goalPadding;

      svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);

      // Spine runs the full section height, flush with the top edge, fully
      // drawn — reads as one continuous line into the next section's own
      // spine (section.stakeholders), which picks up at its own top edge.
      spineEl.setAttribute("x1", String(centerX));
      spineEl.setAttribute("x2", String(centerX));
      spineEl.setAttribute("y1", "0");
      spineEl.setAttribute("y2", String(height));

      badgeEls.forEach((el, i) => {
        el!.style.left = `${centerX}px`;
        el!.style.top = `${badgeTopYs[i]}px`;
      });

      rightConnEls.forEach((el, i) => {
        const attachX = centerX + badgeHalfWidth;
        const attachY = badgeTopYs[i] + badgeHalfWidth;
        el!.setAttribute("transform", `translate(${attachX} ${attachY})`);
      });
      leftConnEls.forEach((el, i) => {
        const attachX = centerX - badgeHalfWidth;
        const attachY = badgeTopYs[i] + badgeHalfWidth;
        el!.setAttribute(
          "transform",
          `translate(${attachX} ${attachY}) scale(-1, 1)`,
        );
      });

      rightExtEls.forEach((el, i) => {
        const x1 = centerX + badgeHalfWidth + CONNECTOR_NATIVE_WIDTH;
        const y = dividerYs[i];
        el!.setAttribute("x1", String(x1));
        el!.setAttribute("y1", String(y));
        el!.setAttribute("x2", String(goalsEdgeX));
        el!.setAttribute("y2", String(y));
      });
      leftExtEls.forEach((el, i) => {
        const x1 = centerX - badgeHalfWidth - CONNECTOR_NATIVE_WIDTH;
        const y = dividerYs[i];
        el!.setAttribute("x1", String(x1));
        el!.setAttribute("y1", String(y));
        el!.setAttribute("x2", String(insightsEdgeX));
        el!.setAttribute("y2", String(y));
      });
    };

    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);

  return (
    <>
      <svg
        ref={svgRef}
        className={styles.insightsGoalsMotionSvg}
        aria-hidden="true"
      >
        <line
          ref={spineRef}
          stroke="var(--surface-card-border)"
          strokeWidth={1}
        />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            ref={(el) => {
              rightConnectorRefs.current[i] = el;
            }}
            d={CONNECTOR_PATH_D}
            stroke="var(--surface-card-border)"
            strokeWidth={1}
            fill="none"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            ref={(el) => {
              leftConnectorRefs.current[i] = el;
            }}
            d={CONNECTOR_PATH_D}
            stroke="var(--surface-card-border)"
            strokeWidth={1}
            fill="none"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            ref={(el) => {
              rightExtensionRefs.current[i] = el;
            }}
            stroke="var(--surface-card-border)"
            strokeWidth={1}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            ref={(el) => {
              leftExtensionRefs.current[i] = el;
            }}
            stroke="var(--surface-card-border)"
            strokeWidth={1}
          />
        ))}
      </svg>

      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            badgeRefs.current[i] = el;
          }}
          className={styles.insightsGoalsBadge}
        >
          {String(i + 1).padStart(2, "0")}
        </div>
      ))}

      <div ref={labelWrapRef} className={styles.insightsGoalsLeft}>
        <LabelBlock
          size="display"
          label="Insights & Goals"
          body="The groundwork allowed me to close the knowledge gap fast, move past the basics and straight product alignment."
          inverse
        />
      </div>
      <ContextBlock side="none" className={styles.insightsGoalsContext}>
        <Label ref={expertsTitleRef} size="md" color="inverse">
          The Experts
        </Label>
        <div className={styles.insightsGoalsDescriptions}>
          {EXPERTS.map((expert, i) => (
            <div
              key={expert.title}
              ref={(el) => {
                expertRefs.current[i] = el;
              }}
            >
              <TitleBlock
                size="md"
                title={expert.title}
                body={expert.body}
                inverse
              />
            </div>
          ))}
        </div>
      </ContextBlock>

      <div ref={insightsColRef} className={styles.insightsGoalsInsights}>
        <Label size="md" color="inverse">
          Insights
        </Label>
        <div className={styles.insightsGoalsItems}>
          {INSIGHTS.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => {
                insightItemRefs.current[i] = el;
              }}
              className={styles.insightsGoalsItem}
            >
              <div
                ref={(el) => {
                  insightHeadingRefs.current[i] = el;
                }}
                className={styles.insightsGoalsItemHeading}
              >
                <p className={styles.insightsGoalsItemTitle}>{item.title}</p>
              </div>
              <div className={styles.insightsGoalsItemBody}>
                <Block size="md" color="inverse">
                  {item.body}
                </Block>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div ref={goalsColRef} className={styles.insightsGoalsGoals}>
        <Label size="md" color="inverse">
          Goals
        </Label>
        <div className={styles.insightsGoalsItems}>
          {GOALS.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => {
                goalItemRefs.current[i] = el;
              }}
              className={styles.insightsGoalsItem}
            >
              <div className={styles.insightsGoalsItemHeading}>
                <p className={styles.insightsGoalsItemTitle}>{item.title}</p>
              </div>
              <div className={styles.insightsGoalsItemBody}>
                <Block size="md" color="inverse">
                  {item.body}
                </Block>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
