import React, { useState } from "react";
import Accordion from "./Accordion";
import Button from "./Button";
import DateBar from "./DateBar";
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
  /** Shows only this lane's events and hides the item filter — for an item's own drill-down. */
  lockedLane?: string;
};

const ALL = "all";

// The Up Next group (each lane's next planned event) is built but switched off for now; set to true to bring it back.
const SHOW_UP_NEXT = false;

export function EventLog({ events, laneOptions, lockedLane }: EventLogProps) {
  const [lane, setLane] = useState<string>(ALL);
  const [expanded, setExpanded] = useState(false);
  // The Up Next group folds away like a request's items in the request list; open by default so what is next is visible.
  const [nextOpen, setNextOpen] = useState(true);

  const activeLane = lockedLane ?? lane;
  const visible = activeLane === ALL ? events : events.filter((event) => event.lane === activeLane);
  // Planned events ("open") are the Up Next group; everything else is the dated history.
  const upNext = visible.filter((event) => event.status === "open");
  const history = visible.filter((event) => event.status !== "open");
  const options = [{ value: ALL, label: "Show All Events" }, ...laneOptions];

  return (
    <section className={styles.log}>
      <header className={[styles.header, lockedLane && styles.headerInline].filter(Boolean).join(" ")}>
        <h3 className={styles.heading}>Events</h3>
        <div className={[styles.controls, lockedLane && styles.controlsEnd].filter(Boolean).join(" ")}>
          {!lockedLane && <Dropdown value={lane} options={options} onChange={setLane} ariaLabel="Filter events by item" openDirection="down" />}
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
        {SHOW_UP_NEXT && upNext.length > 0 && (
          <li className={styles.upNextRow}>
            <Accordion subgrid title="Up Next" open={nextOpen} onToggle={() => setNextOpen((value) => !value)}>
              <ol className={styles.upNextList}>
                {upNext.map((event) => (
                  <li key={event.id} className={[styles.event, styles.next].join(" ")}>
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
                ))}
              </ol>
            </Accordion>
          </li>
        )}
        {history.map((event, index) => (
          <React.Fragment key={event.id}>
            {(index === 0 || history[index - 1].date !== event.date) && (
              <DateBar as="li" className={styles.date}>
                {event.date}
              </DateBar>
            )}
            <li
              className={[
                styles.event,
                event.status === "exception" && styles.exception,
                event.status === "warning" && styles.warning,
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
