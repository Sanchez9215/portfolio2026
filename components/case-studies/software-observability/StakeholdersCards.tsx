"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Block from "@/components/Block";
import ProcessConnector from "@/components/ProcessConnector";
import {
  buildFanTrapezoid,
  FAN_BRANCH_HEIGHT,
  type FanSegment,
} from "@/components/buildFanTrapezoid";
import styles from "@/app/work/software-observability/software-observability.module.css";

// section.stakeholders-cards — the old static Branch Top/Bottom SVG assets
// (public/SVG/Branch Top.svg, Branch Bottom.svg, fixed 855x133) are gone,
// replaced by the same rule-driven fan-trapezoid connector system as
// DataCertificationTriggers (components/buildFanTrapezoid.ts): one computed
// shoulder bar + fixed-angle diagonal legs to the outer cards + a vertical
// stub to the middle card, built from each card's REAL measured top/bottom-
// center anchor — not a fixed-width asset that could mismatch the row's
// actual rendered width. No reveal/animation yet (plain static render).

const FAN_COLOR = "var(--surface-card-border)";

const STAKEHOLDERS = [
  {
    title: "Software Asset Manager (SAM)",
    body: "Responsible for inventory, vendor compliance, and optimizing license assignment, and defending the organization during vendor audits.",
  },
  {
    title: "Financial Specialist",
    body: "Controls software spend and budgets across departments and cost centers, pushes to ensure maximum return on technology investments.",
  },
  {
    title: "IT Operations Manager",
    body: "Securely deploys, maintains, and retires software across the enterprise without disruption, while managing the discovery tools that provide the data SAM and Finance depend on.",
  },
];

export default function StakeholdersCards() {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [segments, setSegments] = useState<FanSegment[]>([]);

  useLayoutEffect(() => {
    const stackEl = stackRef.current;
    const cardEls = cardRefs.current;
    if (!stackEl || cardEls.some((el) => !el)) return;

    function measure() {
      const stackRect = stackEl!.getBoundingClientRect();
      const cardRects = cardEls.map((el) => el!.getBoundingClientRect());

      const topTargets = cardRects.map((r) => ({
        x: r.left + r.width / 2 - stackRect.left,
        y: r.top - stackRect.top,
      }));
      const bottomTargets = cardRects.map((r) => ({
        x: r.left + r.width / 2 - stackRect.left,
        y: r.bottom - stackRect.top,
      }));
      // 3 equal-width cards — the real targets' own midpoint coincides with
      // the center card's x (see buildFanTrapezoid.ts's centerX rationale).
      const centerX = topTargets[1].x;

      const top = buildFanTrapezoid(
        topTargets,
        "down",
        centerX,
        FAN_BRANCH_HEIGHT,
        FAN_COLOR,
      );
      const bottom = buildFanTrapezoid(
        bottomTargets,
        "up",
        centerX,
        FAN_BRANCH_HEIGHT,
        FAN_COLOR,
      );
      setSegments([...top.segments, ...bottom.segments]);
    }

    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready?.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className={styles.stakeholdersCardsStack} ref={stackRef}>
      <svg className={styles.stakeholdersFanSvg} aria-hidden="true">
        {segments.map((seg, i) => (
          <ProcessConnector
            key={i}
            from={seg.from}
            to={seg.to}
            shape={seg.shape}
            color={seg.color}
            gap={seg.gap}
          />
        ))}
      </svg>

      <div className={styles.stakeholdersRow}>
        {STAKEHOLDERS.map((item, i) => (
          <div
            key={item.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={styles.stakeholdersItem}
          >
            <p className={styles.stakeholdersItemTitle}>{item.title}</p>
            <Block size="sm" color="secondary">
              {item.body}
            </Block>
          </div>
        ))}
      </div>
    </div>
  );
}
