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

// "right-start" listed first since it's the placement most recently asked for by name —
// "top-start" (matching this component's original above-the-trigger behavior) stays the
// default so no existing consumer's layout changes.
export type TooltipPlacement =
  | "right-start"
  | "right"
  | "right-end"
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "left-start"
  | "left"
  | "left-end";

export type TooltipProps = {
  title: string;
  description: string;
  calculation?: string;
  legend?: TooltipLegendItem[];
  children?: ReactNode;
  className?: string;
  /** Which side of the trigger the panel opens on. Defaults to "top-start" (this
   *  component's original above-the-trigger, left-aligned behavior). Falls back to the
   *  opposite side (top<->bottom, right<->left) when the preferred placement doesn't fit
   *  the viewport — not a full collision-detection system, just a single flip. */
  placement?: TooltipPlacement;
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
// Mirrors --xops-motion-delay-tooltip-close (tokens.css) — kept as a plain
// number here since setTimeout needs milliseconds, not a CSS value.
const CLOSE_DELAY_MS = 250;

type Position = { top: number; left: number };

const oppositePlacement: Record<TooltipPlacement, TooltipPlacement> = {
  "top-start": "bottom-start",
  top: "bottom",
  "top-end": "bottom-end",
  "bottom-start": "top-start",
  bottom: "top",
  "bottom-end": "top-end",
  "right-start": "left-start",
  right: "left",
  "right-end": "left-end",
  "left-start": "right-start",
  left: "right",
  "left-end": "right-end",
};

// Raw (unclamped) position for a placement, before checking whether it actually fits.
function placementRect(
  placement: TooltipPlacement,
  triggerRect: DOMRect,
  panelHeight: number,
): { top: number; left: number } {
  const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
  const align = placement.includes("-start") ? "start" : placement.includes("-end") ? "end" : "center";

  if (side === "top" || side === "bottom") {
    const top = side === "top" ? triggerRect.top - GAP - panelHeight : triggerRect.bottom + GAP;
    const left =
      align === "start"
        ? triggerRect.left
        : align === "end"
          ? triggerRect.right - PANEL_WIDTH
          : triggerRect.left + triggerRect.width / 2 - PANEL_WIDTH / 2;
    return { top, left };
  }

  const left = side === "left" ? triggerRect.left - GAP - PANEL_WIDTH : triggerRect.right + GAP;
  const top =
    align === "start"
      ? triggerRect.top
      : align === "end"
        ? triggerRect.bottom - panelHeight
        : triggerRect.top + triggerRect.height / 2 - panelHeight / 2;
  return { top, left };
}

function fitsInViewport(rect: { top: number; left: number }, panelHeight: number): boolean {
  return (
    rect.top >= 0 &&
    rect.top + panelHeight <= window.innerHeight &&
    rect.left >= 0 &&
    rect.left + PANEL_WIDTH <= window.innerWidth
  );
}

export function Tooltip({
  title,
  description,
  calculation,
  legend,
  children,
  className,
  placement = "top-start",
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

      const preferred = placementRect(placement, triggerRect, panelHeight);
      // Single flip to the opposite side if the preferred placement doesn't fit — not full
      // collision detection, just enough to keep the panel on-screen near a viewport edge.
      const rect = fitsInViewport(preferred, panelHeight)
        ? preferred
        : placementRect(oppositePlacement[placement], triggerRect, panelHeight);

      // Clamp horizontally so the panel never runs off either edge, regardless of placement.
      const left = Math.min(Math.max(rect.left, GAP), window.innerWidth - PANEL_WIDTH - GAP);
      setPosition({ top: rect.top, left });
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
  }, [open, forceOpen, placement]);

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
    }, CLOSE_DELAY_MS);
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
        {children ?? <Icon name="InfoCircle" color="var(--xops-text-secondary)" size="16" />}
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
                ? { top: position.top, left: position.left }
                : { top: -9999, left: -9999, visibility: "hidden" }
            }
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            <div className={styles.header}>
              <p className={styles.title}>{title}</p>
              <p className={styles.description}>{description}</p>
            </div>
            {calculation && (
              <div className={styles.details}>
                <div className={styles.detailsRow}>
                  <p className={styles.detailsLabel}>Calculation</p>
                  <p className={styles.detailsValue}>{calculation}</p>
                </div>
              </div>
            )}
            {legend && (
              <div className={styles.legendItems}>
                {legend.map((item) => (
                  <div
                    key={item.label}
                    className={[styles.legendPill, styles[item.status]].filter(Boolean).join(" ")}
                  >
                    <p className={styles.legendPillLabel}>{item.label}</p>
                    <p className={styles.legendPillRange}>{item.range}</p>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.footer}>
              <Button variant="link" size="xsmall" className={styles.learnMoreButton}>
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
