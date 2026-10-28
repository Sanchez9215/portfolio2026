import React, { useEffect, useRef, useState } from "react";
import styles from "./DateRangePicker.module.css";
import Icon from "./Icon";

export type DateRange = { from: Date; to: Date };

export type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** First selectable day (inclusive). */
  min: Date;
  /** Last selectable day (inclusive). */
  max: Date;
  fromLabel?: string;
  toLabel?: string;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const dayKey = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
const isSameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
const pad = (n: number) => String(n).padStart(2, "0");
const formatDate = (d: Date) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

export function DateRangePicker({
  value,
  onChange,
  min,
  max,
  fromLabel = "Date From",
  toLabel = "Date To",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(value.from.getFullYear(), value.from.getMonth(), 1),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setPendingStart(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setPendingStart(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const openCalendar = () => {
    setViewMonth(new Date(value.from.getFullYear(), value.from.getMonth(), 1));
    setPendingStart(null);
    setOpen(true);
  };

  const handleDayClick = (day: Date) => {
    if (!pendingStart || day < pendingStart) {
      setPendingStart(day);
      return;
    }
    onChange({ from: pendingStart, to: day });
    setPendingStart(null);
    setOpen(false);
  };

  const shownRange: DateRange = pendingStart ? { from: pendingStart, to: pendingStart } : value;

  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const leading = firstOfMonth.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((leading + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, i) => {
    return new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i - leading + 1);
  });

  const monthTitle = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.field}>
        <span className={styles.label}>{fromLabel}</span>
        <button
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${fromLabel}: ${formatDate(value.from)}`}
          onClick={openCalendar}
        >
          {formatDate(value.from)}
        </button>
      </div>
      <span className={styles.separator}>to</span>
      <div className={styles.field}>
        <span className={styles.label}>{toLabel}</span>
        <button
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${toLabel}: ${formatDate(value.to)}`}
          onClick={openCalendar}
        >
          {formatDate(value.to)}
        </button>
      </div>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Choose date range">
          <div className={styles.monthBar}>
            <button
              type="button"
              className={styles.navButton}
              aria-label="Previous month"
              disabled={monthIndex(viewMonth) <= monthIndex(min)}
              onClick={() =>
                setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
              }
            >
              <Icon
                name="chevron_backward"
                color={
                  monthIndex(viewMonth) <= monthIndex(min)
                    ? "var(--xops-state-disabled-text)"
                    : "var(--xops-text-secondary)"
                }
              />
            </button>
            <span className={styles.monthTitle}>{monthTitle}</span>
            <button
              type="button"
              className={styles.navButton}
              aria-label="Next month"
              disabled={monthIndex(viewMonth) >= monthIndex(max)}
              onClick={() =>
                setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
              }
            >
              <Icon
                name="chevron_right"
                color={
                  monthIndex(viewMonth) >= monthIndex(max)
                    ? "var(--xops-state-disabled-text)"
                    : "var(--xops-text-secondary)"
                }
              />
            </button>
          </div>

          <div className={styles.grid}>
            {WEEKDAYS.map((label, i) => (
              <span key={i} className={styles.weekday}>
                {label}
              </span>
            ))}
            {cells.map((day) => {
              const key = dayKey(day);
              if (day.getMonth() !== viewMonth.getMonth()) {
                return (
                  <span key={key} className={[styles.day, styles.dayOutside].join(" ")}>
                    {day.getDate()}
                  </span>
                );
              }
              const outOfBounds = key < dayKey(min) || key > dayKey(max);
              const isEdge = isSameDay(day, shownRange.from) || isSameDay(day, shownRange.to);
              const inRange = key > dayKey(shownRange.from) && key < dayKey(shownRange.to);
              const className = [
                styles.day,
                isSameDay(day, today) ? styles.dayToday : "",
                inRange ? styles.dayInRange : "",
                isEdge ? styles.dayEdge : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={key}
                  type="button"
                  className={className}
                  disabled={outOfBounds}
                  aria-label={formatDate(day)}
                  aria-pressed={isEdge}
                  onClick={() => handleDayClick(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
