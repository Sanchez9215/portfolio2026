import React from "react";

export type DonutSegment = {
  value: number;
  color: string;
};

export type DonutChartProps = {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
};

const DEFAULT_SIZE = 164;
const DEFAULT_STROKE_WIDTH = 24;

export function DonutChart({
  segments,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  className,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  let cumulative = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((segment, index) => {
          const fraction = total > 0 ? segment.value / total : 0;
          const dash = fraction * circumference;
          const offset = -cumulative;
          cumulative += dash;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </g>
    </svg>
  );
}

export default DonutChart;
