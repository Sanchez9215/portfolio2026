import React from "react";
import styles from "./TimelineNav.module.css";

export type TimelineNavPeriod = {
  year: number;
  months: { label: string; ym: string }[]; // populated only for the expanded (most recent) year
};

export type TimelineNavProps = {
  periods: TimelineNavPeriod[]; // newest first
  selectedYm: string | null;
  onSelect: (ym: string | null, year: number) => void;
};

// Right-side year/month rail. Only the newest year expands to show its months (matches the
// source design's "current year" treatment); older years are single collapsed rows. Selecting
// a year or month scrolls the timeline to the first matching event (wired by the parent).
export function TimelineNav({ periods, selectedYm, onSelect }: TimelineNavProps) {
  return (
    <nav className={styles.nav} aria-label="Jump to period">
      {periods.map((period, index) => {
        const expanded = index === 0 && period.months.length > 0;
        return (
          <React.Fragment key={period.year}>
            <button
              type="button"
              className={[styles.year, expanded ? styles.yearExpanded : ""].filter(Boolean).join(" ")}
              onClick={() => onSelect(null, period.year)}
            >
              {period.year}
            </button>
            {expanded && (
              <div className={styles.months}>
                {period.months.map((month) => (
                  <button
                    key={month.ym}
                    type="button"
                    className={[styles.month, selectedYm === month.ym ? styles.monthSelected : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onSelect(month.ym, period.year)}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default TimelineNav;
