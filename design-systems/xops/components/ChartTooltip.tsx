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

export type ChartTooltipProps = {
  color: string;
  category: string;
  rows: ChartTooltipRow[];
  opportunity?: ChartTooltipRow;
  action?: ChartTooltipAction;
  // Viewport point the tooltip appears near — e.g. cursor position at hover-enter.
  anchorX: number;
  anchorY: number;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

// Must match .panel's width in ChartTooltip.module.css — used to detect right-edge overflow before render.
const PANEL_WIDTH = 256;
const GAP = 4;

type Position = { top: number; left?: number; right?: number };

export function ChartTooltip({
  color,
  category,
  rows,
  opportunity,
  action,
  anchorX,
  anchorY,
  className,
  onMouseEnter,
  onMouseLeave,
}: ChartTooltipProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Two-pass positioning, same pattern as Tooltip.tsx: render once invisibly to
  // measure the panel's real height (content-variable), then place it — defaults
  // above/right of the anchor point, flips if that would overflow the viewport.
  useEffect(() => {
    if (!panelRef.current) return;
    const panelHeight = panelRef.current.getBoundingClientRect().height;

    const fitsAbove = anchorY - GAP - panelHeight >= 0;
    const overflowsRight = anchorX + PANEL_WIDTH > window.innerWidth - GAP;

    setPosition({
      top: fitsAbove ? anchorY - GAP - panelHeight : anchorY + GAP,
      ...(overflowsRight
        ? { right: window.innerWidth - anchorX }
        : { left: anchorX }),
    });
  }, [anchorX, anchorY]);

  return createPortal(
    <div
      ref={panelRef}
      className={[styles.panel, className].filter(Boolean).join(" ")}
      role="tooltip"
      style={
        position
          ? { top: position.top, left: position.left, right: position.right }
          : { top: -9999, left: -9999, visibility: "hidden" }
      }
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
