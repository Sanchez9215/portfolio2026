"use client";

import React, { useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { TimelineEvent } from "./TimelineEvent";
import { TimelineNav, TimelineNavPeriod } from "./TimelineNav";
import { StageFilter } from "./StageFilter";
import { STAGE_ORDER } from "./lifecycleStages";
import type { LifecycleEvent, LifecycleEventStage } from "../data/lifecycle";
import styles from "./LifecycleTimeline.module.css";

export type LifecycleTimelineProps = {
  events: LifecycleEvent[]; // pre-fetched for the product, newest first
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Composes the timeline log, the type filter/legend, search, and the year/month nav rail.
// Search filters events by title/description text; the nav scrolls the log to the first
// event in the selected year or month. Deferred: the type filter and search compose down
// to plain array filtering — no virtualization, fine at this event-list scale.
export function LifecycleTimeline({ events }: LifecycleTimelineProps) {
  const [activeStages, setActiveStages] = useState<Set<LifecycleEventStage>>(new Set(STAGE_ORDER));
  const [query, setQuery] = useState("");
  const [selectedYm, setSelectedYm] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const toggleStage = (stage: LifecycleEventStage) => {
    setActiveStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (!activeStages.has(e.stage)) return false;
      if (!q) return true;
      return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
    });
  }, [events, activeStages, query]);

  // Newest year expanded into its individual months (only months with real events show),
  // every earlier year with events collapsed to a single row — matches the source design.
  const periods = useMemo<TimelineNavPeriod[]>(() => {
    const years = new Map<number, Set<number>>(); // year -> months with events
    for (const e of events) {
      const d = new Date(e.date);
      const y = d.getUTCFullYear();
      if (!years.has(y)) years.set(y, new Set());
      years.get(y)!.add(d.getUTCMonth());
    }
    const sortedYears = Array.from(years.keys()).sort((a, b) => b - a);
    return sortedYears.map((year, index) => ({
      year,
      months:
        index === 0
          ? Array.from(years.get(year)!)
              .sort((a, b) => b - a)
              .map((m) => ({ label: MONTH_LABELS[m], ym: `${year}-${m}` }))
          : [],
    }));
  }, [events]);

  const handleNavSelect = (ym: string | null, year: number) => {
    setSelectedYm(ym);
    // A year click (ym === null) targets that year's first (newest) event instead of one
    // specific month, since collapsed years don't carry a month breakdown to target.
    const targetEvent = ym
      ? filteredEvents.find((e) => {
          const d = new Date(e.date);
          return `${d.getUTCFullYear()}-${d.getUTCMonth()}` === ym;
        })
      : filteredEvents.find((e) => new Date(e.date).getUTCFullYear() === year);
    if (!targetEvent) return;
    logRef.current
      ?.querySelector<HTMLElement>(`[data-event-id="${targetEvent.id}"]`)
      ?.scrollIntoView({ block: "start" });
  };

  return (
    <div className={styles.timeline}>
      <div className={styles.main}>
        <div className={styles.searchRow}>
          <Icon name="search" color="var(--xops-text-disabled)" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search Events"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <StageFilter active={activeStages} onToggle={toggleStage} />
        <div className={styles.log} ref={logRef}>
          {filteredEvents.length === 0 ? (
            <p className={styles.emptyState}>No events match the current filters.</p>
          ) : (
            <div className={styles.spine}>
              {filteredEvents.map((event) => (
                <TimelineEvent key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
      <TimelineNav periods={periods} selectedYm={selectedYm} onSelect={handleNavSelect} />
    </div>
  );
}

export default LifecycleTimeline;
