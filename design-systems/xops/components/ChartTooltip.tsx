import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ChartTooltip.module.css";
import Button from "./Button";

export type ChartTooltipRow = {
  label: string;
  value: string;
};

export type ChartTooltipAction = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
};

type ChartTooltipBaseProps = {
  color: string;
  // Viewport point the tooltip appears near — e.g. cursor position at hover-enter.
  anchorX: number;
  anchorY: number;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

// Default: a chart mark's category with label/value rows (DonutChart, RankedBarChart).
export type ChartTooltipDefaultProps = ChartTooltipBaseProps & {
  variant?: "default";
  category: string;
  rows: ChartTooltipRow[];
  opportunity?: ChartTooltipRow;
  action?: ChartTooltipAction;
};

// Event: one point on a swim lane — lane code | lane name, the event title and its timestamp
// (OrchestrationGraph). Not interactive; sits beside the point at `offset` instead of above it.
export type ChartTooltipEventProps = ChartTooltipBaseProps & {
  variant: "event";
  /** Lane code (e.g. "ITM-02"); omitted for the employee trunk. */
  code?: string;
  /** Lane name (e.g. "Badge Access"). */
  name: string;
  title: string;
  time: string;
  /** Distance from the anchor to the panel, on both axes. */
  offset: number;
  /** Fades the panel out while it stays mounted, so a consumer can fade it back in at the next point. */
  hidden?: boolean;
  /** Milliseconds the panel takes to glide to a new anchor and to fade; omit for no motion. */
  glideDuration?: number;
};

export type ChartTooltipProps = ChartTooltipDefaultProps | ChartTooltipEventProps;

// Must match .panel's width in ChartTooltip.module.css — used to detect right-edge overflow before render.
const PANEL_WIDTH = 256;
const GAP = 4;

type Position = { top: number; left?: number; right?: number };

export function ChartTooltip(props: ChartTooltipProps) {
  const { color, anchorX, anchorY, className, onMouseEnter, onMouseLeave } = props;
  const [position, setPosition] = useState<Position | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Event variant only: the panel glides between anchors, but its first placement must not fly in from off-screen.
  // Set after the render that first placed it, so gliding can never be switched on in that same render.
  const placedBefore = useRef(false);
  useEffect(() => {
    if (position) placedBefore.current = true;
  }, [position]);

  // Two-pass positioning, same pattern as Tooltip.tsx: render once invisibly to
  // measure the panel's real height (content-variable), then place it — defaults
  // above/right of the anchor point, flips if that would overflow the viewport.
  useEffect(() => {
    if (!panelRef.current) return;
    const { height: panelHeight, width: panelWidth } = panelRef.current.getBoundingClientRect();

    // Event: opens below-right of the point, flipping up / left when that would leave the viewport.
    if (props.variant === "event") {
      const fitsBelow = anchorY + props.offset + panelHeight <= window.innerHeight - GAP;
      const fitsRight = anchorX + props.offset + panelWidth <= window.innerWidth - GAP;
      // Always `left`, never `right`, so a flip is a position change the glide can animate.
      setPosition({
        top: fitsBelow ? anchorY + props.offset : anchorY - props.offset - panelHeight,
        left: fitsRight ? anchorX + props.offset : anchorX - props.offset - panelWidth,
      });
      return;
    }

    const fitsAbove = anchorY - GAP - panelHeight >= 0;
    const overflowsRight = anchorX + PANEL_WIDTH > window.innerWidth - GAP;

    setPosition({
      top: fitsAbove ? anchorY - GAP - panelHeight : anchorY + GAP,
      ...(overflowsRight
        ? { right: window.innerWidth - anchorX }
        : { left: anchorX }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorX, anchorY]);

  const panelClass = [styles.panel, props.variant === "event" && styles.panelEvent, className].filter(Boolean).join(" ");
  const isEvent = props.variant === "event";
  const duration = isEvent ? props.glideDuration : undefined;
  const panelStyle: React.CSSProperties = isEvent
    ? {
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        opacity: position && !props.hidden ? 1 : 0,
        transitionDuration: duration !== undefined ? `${duration}ms` : "0ms",
        // Position glides only after the first placement; opacity always eases.
        transitionProperty: placedBefore.current ? "top, left, opacity" : "opacity",
      }
    : position
      ? { top: position.top, left: position.left, right: position.right }
      : { top: -9999, left: -9999, visibility: "hidden" };

  if (props.variant === "event") {
    return createPortal(
      <div ref={panelRef} className={panelClass} role="tooltip" style={panelStyle}>
        <div className={styles.eventRow}>
          <span className={styles.eventSwatchSlot}>
            <span className={styles.swatch} style={{ backgroundColor: color }} />
          </span>
          <div className={styles.eventBody}>
            <div className={styles.eventLane}>
              {props.code && (
                <>
                  <p className={styles.eventCode}>{props.code}</p>
                  <span className={styles.eventDivider} />
                </>
              )}
              <p className={props.code ? styles.eventName : styles.eventCode}>{props.name}</p>
            </div>
            <div className={styles.eventDetail}>
              <p className={styles.eventTitle}>{props.title}</p>
              <p className={styles.eventTime}>{props.time}</p>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  const { category, rows, opportunity, action } = props;
  return createPortal(
    <div
      ref={panelRef}
      className={panelClass}
      role="tooltip"
      style={panelStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.header}>
        <div className={styles.categoryRow}>
          <span className={styles.swatch} style={{ backgroundColor: color }} />
          <p className={styles.category}>{category}</p>
        </div>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <p className={styles.rowLabel}>{row.label}</p>
            <p className={styles.rowValue}>{row.value}</p>
          </div>
        ))}
        {opportunity && (
          <>
            <hr className={styles.divider} />
            <div className={styles.row}>
              <p className={styles.rowLabel}>{opportunity.label}</p>
              <p className={styles.rowValue}>{opportunity.value}</p>
            </div>
          </>
        )}
      </div>
      {action && (
        <Button
          variant="secondary"
          icon={action.icon}
          className={styles.action}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>,
    document.body,
  );
}

export default ChartTooltip;
