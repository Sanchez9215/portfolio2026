import React, { useState } from "react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import Icon from "./Icon";
import { StatusIcon, StatusIconStatus } from "./StatusIcon";
import styles from "./EventLog.module.css";

export type EventLogEvent = {
  id: string;
  /** Swim lane the event belongs to ("employee" or an item id). */
  lane: string;
  laneLabel: string;
  laneColor: string;
  /** Group heading, e.g. "Jan 14, 2026". Events arrive newest first. */
  date: string;
  time: string;
  title: string;
  status: StatusIconStatus;
};

export type EventLogLaneOption = { value: string; label: string };

export type EventLogProps = {
  events: EventLogEvent[];
  /** Filter options after the implicit "All Events". */
  laneOptions: EventLogLaneOption[];
};

const ALL = "all";

export function EventLog({ events, laneOptions }: EventLogProps) {
  const [lane, setLane] = useState<string>(ALL);
  const [expanded, setExpanded] = useState(false);

  const visible = lane === ALL ? events : events.filter((event) => event.lane === lane);
  const options = [{ value: ALL, label: "Show All Events" }, ...laneOptions];

  return (
    <section className={styles.log}>
      <header className={styles.header}>
        <h3 className={styles.heading}>Events</h3>
        <div className={styles.controls}>
          <Dropdown value={lane} options={options} onChange={setLane} ariaLabel="Filter events by item" openDirection="down" />
          <Button
            variant="text-secondary"
            size="medium"
            icon={<Icon name="unfold_less" />}
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? "Collapse Event Log" : "View Full Event Log"}
          </Button>
        </div>
      </header>

      <ol className={[styles.events, expanded && styles.expanded].filter(Boolean).join(" ")}>
        {visible.map((event, index) => (
          <React.Fragment key={event.id}>
            {(index === 0 || visible[index - 1].date !== event.date) && (
              <li className={styles.date}>{event.date}</li>
            )}
            <li
              className={[
                styles.event,
                event.status === "exception" && styles.exception,
                event.status === "warning" && styles.warning,
                event.status === "open" && styles.next,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={styles.info}>
                <StatusIcon status={event.status} />
                <span className={styles.lane}>{event.laneLabel}</span>
              </span>
              <span className={styles.time}>{event.time}</span>
              <span className={styles.dotCell}>
                <span className={styles.dot} style={{ backgroundColor: event.laneColor }} />
              </span>
              <span className={styles.title}>{event.title}</span>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </section>
  );
}

export default EventLog;
