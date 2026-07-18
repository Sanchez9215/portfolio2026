import React from "react";
import { ChartTooltip, ChartTooltipRow } from "./ChartTooltip";
import { useChartHover } from "./useChartHover";

export type DonutSegment = {
  value: number;
  color: string;
  tooltip?: {
    category: string;
    rows: ChartTooltipRow[];
  };
};

export type DonutChartProps = {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
};

const DEFAULT_SIZE = 164;
const DEFAULT_STROKE_WIDTH = 24;
// Outward-only hover halo: a second band drawn just outside each segment's
// outer edge, tinted with the segment's own color. Values confirmed with the user.
const HOVER_HALO_WIDTH = 8;
const HOVER_HALO_TINT = 0.35;

export function DonutChart({
  segments,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  className,
}: DonutChartProps) {
  const { hovered: hoveredIndex, anchor, show: showTooltip, hide: hideTooltip, cancelHide } =
    useChartHover<number>();
  const radius = (size - strokeWidth) / 2;
  const haloRadius = radius + strokeWidth / 2 + HOVER_HALO_WIDTH / 2;
  const circumference = 2 * Math.PI * radius;
  // The halo circle has a different radius, so it has a different circumference —
  // dash/gap lengths and cumulative offset must be computed separately in its own
  // units, or the same fraction sweeps a different arc and lands out of alignment.
  const haloCircumference = 2 * Math.PI * haloRadius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  let cumulative = 0;
  let haloCumulative = 0;

  const hoveredSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
        className={className}
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((segment, index) => {
          const fraction = total > 0 ? segment.value / total : 0;
          const dash = fraction * circumference;
          const dashArray = `${dash} ${circumference - dash}`;
          const offset = -cumulative;
          cumulative += dash;

          const haloDash = fraction * haloCircumference;
          const haloDashArray = `${haloDash} ${haloCircumference - haloDash}`;
          const haloOffset = -haloCumulative;
          haloCumulative += haloDash;

          return (
            <React.Fragment key={index}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={haloRadius}
                fill="none"
                stroke={`color-mix(in srgb, ${segment.color} ${HOVER_HALO_TINT * 100}%, transparent)`}
                strokeWidth={HOVER_HALO_WIDTH}
                strokeDasharray={haloDashArray}
                strokeDashoffset={haloOffset}
                opacity={hoveredIndex === index ? 1 : 0}
                style={{
                  transition:
                    "opacity var(--xops-motion-duration-default) var(--xops-motion-easing-default)",
                  pointerEvents: "none",
                }}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
                onMouseEnter={(e) => showTooltip(index, e.clientX, e.clientY)}
                onMouseLeave={hideTooltip}
              />
            </React.Fragment>
          );
        })}
        </g>
      </svg>
      {anchor && hoveredSegment?.tooltip && (
        <ChartTooltip
          color={hoveredSegment.color}
          category={hoveredSegment.tooltip.category}
          rows={hoveredSegment.tooltip.rows}
          anchorX={anchor.x}
          anchorY={anchor.y}
          onMouseEnter={cancelHide}
          onMouseLeave={hideTooltip}
        />
      )}
    </>
  );
}

export default DonutChart;
