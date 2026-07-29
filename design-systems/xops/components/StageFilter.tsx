import React from "react";
import Icon from "./Icon";
import { STAGE_CONFIG, STAGE_ORDER } from "./lifecycleStages";
import type { LifecycleEventStage } from "../data/lifecycle";
import styles from "./StageFilter.module.css";

export type StageFilterProps = {
  active: Set<LifecycleEventStage>;
  onToggle: (stage: LifecycleEventStage) => void;
};

// Multi-select legend/filter — each stage pill toggles that type's events on or off
// independently; all on by default. Acts as both the color legend and the filter control.
export function StageFilter({ active, onToggle }: StageFilterProps) {
  return (
    <div className={styles.group} role="group" aria-label="Filter events by type">
      {STAGE_ORDER.map((stage) => {
        const config = STAGE_CONFIG[stage];
        const isActive = active.has(stage);
        return (
          <button
            key={stage}
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
