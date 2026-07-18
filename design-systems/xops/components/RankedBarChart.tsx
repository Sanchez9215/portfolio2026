import React from "react";
import styles from "./RankedBarChart.module.css";
import {
  ChartTooltip,
  ChartTooltipRow,
  ChartTooltipAction,
} from "./ChartTooltip";
import { useChartHover } from "./useChartHover";

// Same tint/opacity as DonutChart's HOVER_HALO_TINT; width tuned down from
// DonutChart's HOVER_HALO_WIDTH (8px) to 6px for the all-around bar outline.
const HOVER_OUTLINE_WIDTH = 4;
const HOVER_OUTLINE_TINT = 0.35;

export type RankedBarRow = {
  label: string;
  value: number;
  color: string;
  tooltip?: {
    rows: ChartTooltipRow[];
    opportunity?: ChartTooltipRow;
    action?: ChartTooltipAction;
  };
};

export type RankedBarChartProps = {
  rows: RankedBarRow[];
  labelWidth?: number;
  className?: string;
};

const DEFAULT_LABEL_WIDTH = 164;

export function RankedBarChart({
  rows,
  labelWidth = DEFAULT_LABEL_WIDTH,
  className,
}: RankedBarChartProps) {
  const max = Math.max(0, ...rows.map((row) => row.value));
  const {
    hovered: hoveredLabel,
    anchor,
    show: showTooltip,
    hide: hideTooltip,
    cancelHide,
  } = useChartHover<string>();

  const hoveredRow = hoveredLabel
    ? rows.find((row) => row.label === hoveredLabel)
    : null;

  return (
    <div className={[styles.chart, className].filter(Boolean).join(" ")}>
      <div className={styles.labels} style={{ width: labelWidth }}>
        {rows.map((row) => (
          <div key={row.label} className={styles.labelRow}>
            <p className={styles.label} title={row.label}>
              {row.label}
            </p>
          </div>
        ))}
      </div>
      <div className={styles.bars}>
        {rows.map((row) => (
          <div
            key={row.label}
            className={[styles.barRow, row.tooltip && styles.barRowHoverable]
              .filter(Boolean)
              .join(" ")}
            onMouseEnter={(e) => {
              if (!row.tooltip) return;
              showTooltip(row.label, e.clientX, e.clientY);
            }}
            onMouseLeave={hideTooltip}
          >
            <div className={styles.track}>
              <div
                className={styles.bar}
                style={{
                  width: max > 0 ? `${(row.value / max) * 100}%` : 0,
                  backgroundColor: row.color,
                  outlineWidth: HOVER_OUTLINE_WIDTH,
                  outlineColor:
                    hoveredLabel === row.label
                      ? `color-mix(in srgb, ${row.color} ${HOVER_OUTLINE_TINT * 100}%, transparent)`
                      : "transparent",
                }}
              />
            </div>
            <span className={styles.value}>{row.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
      {anchor && hoveredRow?.tooltip && (
        <ChartTooltip
          color={hoveredRow.color}
          category={hoveredRow.label}
          rows={hoveredRow.tooltip.rows}
          opportunity={hoveredRow.tooltip.opportunity}
          action={hoveredRow.tooltip.action}
          anchorX={anchor.x}
          anchorY={anchor.y}
          onMouseEnter={cancelHide}
          onMouseLeave={hideTooltip}
        />
      )}
    </div>
  );
}

export default RankedBarChart;
