import React, { useLayoutEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { STAGE_CONFIG, STAGE_ORDER } from "./lifecycleStages";
import type { LifecycleEventStage } from "../data/lifecycle";
import styles from "./StageFilter.module.css";

export type StageFilterProps = {
  active: Set<LifecycleEventStage>;
  onToggle: (stage: LifecycleEventStage) => void;
};

// Packs the pills into rows as tightly as possible (first-fit decreasing): widest
// first, each into the first row with room left. Returns the stages row by row; within
// a row they keep their lifecycle order.
function packStages(widths: Map<LifecycleEventStage, number>, rowWidth: number, gap: number) {
  const rows: { stages: LifecycleEventStage[]; used: number }[] = [];
  const byWidth = [...STAGE_ORDER].sort((a, b) => (widths.get(b) ?? 0) - (widths.get(a) ?? 0));
  for (const stage of byWidth) {
    const w = widths.get(stage) ?? 0;
    const row = rows.find((r) => r.used + gap + w <= rowWidth);
    if (row) {
      row.stages.push(stage);
      row.used += gap + w;
    } else {
      rows.push({ stages: [stage], used: w });
    }
  }
  return rows.flatMap((r) => r.stages.sort((a, b) => STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b)));
}

// Multi-select legend/filter — each stage pill toggles that type's events on or off
// independently; all on by default. Acts as both the color legend and the filter control.
export function StageFilter({ active, onToggle }: StageFilterProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef(new Map<LifecycleEventStage, HTMLButtonElement>());
  const [order, setOrder] = useState<LifecycleEventStage[]>(STAGE_ORDER);

  // Re-pack whenever the available width (or the loaded font) changes the pill sizes.
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const repack = () => {
      const widths = new Map<LifecycleEventStage, number>();
      pillRefs.current.forEach((el, stage) => widths.set(stage, el.offsetWidth));
      const gap = parseFloat(getComputedStyle(group).columnGap) || 0;
      const next = packStages(widths, group.clientWidth, gap);
      setOrder((prev) => (prev.join() === next.join() ? prev : next));
    };
    repack();
    const observer = new ResizeObserver(repack);
    observer.observe(group);
    document.fonts?.ready?.then(repack);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={groupRef} className={styles.group} role="group" aria-label="Filter events by type">
      {order.map((stage) => {
        const config = STAGE_CONFIG[stage];
        const isActive = active.has(stage);
        return (
          <button
            key={stage}
            ref={(el) => {
              if (el) pillRefs.current.set(stage, el);
              else pillRefs.current.delete(stage);
            }}
            type="button"
            aria-pressed={isActive}
            className={[styles.pill, isActive ? "" : styles.inactive].filter(Boolean).join(" ")}
            onClick={() => onToggle(stage)}
          >
            <span className={styles.dot} style={{ backgroundColor: config.color }}>
              <Icon name={config.icon} color="var(--xops-text-inverse)" className={styles.dotIcon} />
            </span>
            <span className={styles.label}>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default StageFilter;
