import React from "react";
import styles from "./BarChart.module.css";

export type BarSegment = {
  value: number;
  color: string;
};

export type BarChartHeight = "default" | "18" | "16";

export type BarChartProps = {
  segments: BarSegment[];
  total?: number;
  /** Off the shared bar-height scale (24px default / 18px / 16px). Defaults to "default". */
  height?: BarChartHeight;
  className?: string;
};

const heightClass: Record<BarChartHeight, string | undefined> = {
  default: undefined,
  "18": styles.height18,
  "16": styles.height16,
};

export function BarChart({ segments, total, height = "default", className }: BarChartProps) {
  const segmentSum = segments.reduce((sum, segment) => sum + segment.value, 0);
  const scale = total ?? segmentSum;

  return (
    <div className={[styles.track, heightClass[height], className].filter(Boolean).join(" ")}>
      {segments.map((segment, index) => (
        <div
          key={index}
          className={[styles.segment, index < segments.length - 1 && styles.segmentDivider]
            .filter(Boolean)
            .join(" ")}
          style={{
            flex: `${scale > 0 ? segment.value / scale : 0} 0 0`,
            backgroundColor: segment.color,
          }}
        />
      ))}
    </div>
  );
}

export default BarChart;
