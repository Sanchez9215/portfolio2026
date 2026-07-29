import React from "react";
import Icon from "./Icon";
import { STAGE_CONFIG } from "./lifecycleStages";
import type { LifecycleEvent } from "../data/lifecycle";
import styles from "./TimelineEvent.module.css";

export type TimelineEventProps = {
  event: LifecycleEvent;
};

// One event row on the lifecycle spine: date chip + colored stage marker + title/description.
// The date is UTC-pinned so the generator's UTC dates never shift a day across the local TZ.
export function TimelineEvent({ event }: TimelineEventProps) {
  const date = new Date(event.date);
  const month = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const day = date.toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" });
  const stage = STAGE_CONFIG[event.stage];

  return (
    <div className={styles.event} data-event-id={event.id}>
      <div className={styles.dateChip}>
        <span className={styles.dateMonth}>{month}</span>
        <span className={styles.dateDay}>{day}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.marker} style={{ backgroundColor: stage.color }}>
          <Icon name={stage.icon} color="var(--xops-text-inverse)" className={styles.markerIcon} />
        </span>
        <div className={styles.content}>
          <p className={styles.title}>{event.title}</p>
          <p className={styles.description}>{event.description}</p>
        </div>
      </div>
      <Icon name="InfoCircle" color="var(--xops-text-secondary)" className={styles.infoIcon} />
    </div>
  );
}

export default TimelineEvent;
