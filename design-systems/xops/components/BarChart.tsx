import React from "react";
import styles from "./BarChart.module.css";

export type BarSegment = {
  value: number;
  color: string;
};

export type BarChartProps = {
  segments: BarSegment[];
  total?: number;
  className?: string;
};

export function BarChart({ segments, total, className }: BarChartProps) {
  const segmentSum = segments.reduce((sum, segment) => sum + segment.value, 0);
  const scale = total ?? segmentSum;

  return (
    <div className={[styles.track, className].filter(Boolean).join(" ")}>
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
