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
  /** Forces the panel open regardless of hover/focus — used to programmatically
   *  expose a tooltip (e.g. the case study's hotspot annotation spotlighting the
   *  Inactive definition). Repositions every frame while forced so it stays glued
   *  to its trigger as the live embed pans. */
  forceOpen?: boolean;
  /** `data-hotspot` id applied to the portaled panel — lets an external overlay
   *  target the open panel itself (e.g. the case study's hotspot spotlighting). */
  hotspotId?: string;
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
  forceOpen = false,
  hotspotId,
}: TooltipProps) {
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const open = hovered || forceOpen;

  useEffect(() => {
    if (!open) return;

    const reposition = () => {
      if (!triggerRef.current || !panelRef.current) return;
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
    };

    reposition();

    // When forced open the trigger can move without a hover event — the live
    // embed pans/scales the canvas it lives in — so track it every frame.
    if (!forceOpen) return;
    let frame = requestAnimationFrame(function loop() {
      reposition();
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, forceOpen]);

  // A short close delay so the cursor can travel from the icon onto the panel
  // without the gap between them closing it first.
  const show = () => {
    clearTimeout(hideTimeoutRef.current);
    setHovered(true);
  };
  const hide = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHovered(false);
      if (!forceOpen) setPosition(null);
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
            data-hotspot={hotspotId}
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
