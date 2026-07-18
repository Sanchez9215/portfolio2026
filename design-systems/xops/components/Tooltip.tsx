import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";
import Icon from "./Icon";
import { TagStatus } from "./Tag";
import Button from "./Button";

export type TooltipLegendItem = {
  status: TagStatus;
  label: string;
  range: string;
};

export type TooltipProps = {
  title: string;
  description: string;
  calculation?: string;
  legend?: TooltipLegendItem[];
  children?: ReactNode;
  className?: string;
};

// Must match .panel's width in Tooltip.module.css — used to detect right-edge overflow before render.
const PANEL_WIDTH = 336;
const GAP = 4;

type Position = { top: number; left?: number; right?: number };

export function Tooltip({
  title,
  description,
  calculation,
  legend,
  children,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panelHeight = panelRef.current.getBoundingClientRect().height;

    const fitsAbove = triggerRect.top - GAP - panelHeight >= 0;

    if (fitsAbove) {
      const overflowsRight = triggerRect.left + PANEL_WIDTH > window.innerWidth - GAP;
      setPosition({
        top: triggerRect.top - GAP - panelHeight,
        ...(overflowsRight
          ? { right: window.innerWidth - triggerRect.right }
          : { left: triggerRect.left }),
      });
    } else {
      // Not enough room above (e.g. a header near the top of the viewport) — flip to a
      // right-side flyout, top-anchored so the icon sits at the panel's top-left corner.
      const fitsRight = triggerRect.right + GAP + PANEL_WIDTH <= window.innerWidth;
      setPosition({
        top: triggerRect.top,
        ...(fitsRight
          ? { left: triggerRect.right + GAP }
          : { right: window.innerWidth - triggerRect.left + GAP }),
      });
    }
  }, [open]);

  // A short close delay so the cursor can travel from the icon onto the panel
  // without the gap between them closing it first.
  const show = () => {
    clearTimeout(hideTimeoutRef.current);
    setOpen(true);
  };
  const hide = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setPosition(null);
    }, 250);
  };

  return (
    <span className={[styles.root, className].filter(Boolean).join(" ")}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={title}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children ?? <Icon name="InfoCircle" color="var(--xops-text-secondary)" />}
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className={styles.panel}
            role="tooltip"
            style={
              position
                ? { top: position.top, left: position.left, right: position.right }
                : { top: -9999, left: -9999, visibility: "hidden" }
            }
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            <div className={styles.header}>
              <p className={styles.title}>{title}</p>
              <p className={styles.description}>{description}</p>
            </div>
            {(calculation || legend) && (
              <div className={styles.details}>
                {calculation && (
                  <div className={styles.detailsRow}>
                    <p className={styles.detailsLabel}>Calculation</p>
                    <p className={styles.detailsValue}>{calculation}</p>
                  </div>
                )}
                {legend && (
                  <div className={[styles.detailsRow, styles.legendRow].filter(Boolean).join(" ")}>
                    <p className={styles.detailsLabel}>Legend</p>
                    <div className={styles.legendItems}>
                      {legend.map((item) => (
                        <div
                          key={item.label}
                          className={[styles.legendPill, styles[item.status]]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <p className={styles.legendPillLabel}>{item.label}</p>
                          <p className={styles.legendPillRange}>{item.range}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className={styles.footer}>
              <Button variant="link" size="small">
                Learn More
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}

export default Tooltip;
