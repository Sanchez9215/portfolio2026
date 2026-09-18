"use client";

/**
 * Tooltip — hover card anchored to a trigger (e.g. an info icon).
 *
 * Figma node 1102:144 ("Portfolio Cleaning" file) supplied the card itself
 * (fixed 200px width, single body-text block, no tail/pointer). The
 * composition mechanism — portal the panel to document.body, position it via
 * the trigger's real DOM rect, flip to the opposite side if it would run off
 * the top of the viewport, and hold it open briefly after the cursor leaves
 * so it can travel from icon to card — is the same structural pattern
 * XOPS's own Tooltip.tsx uses, reimplemented here with this system's own
 * tokens (the two design systems stay isolated, never sharing code).
 *
 * Only "top-start" (+ its "bottom-start" flip fallback) is built — XOPS's
 * full 12-way placement matrix isn't needed anywhere in this system yet.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  /** The hover trigger (e.g. an info icon). */
  children: ReactNode;
  /** The card's body content. */
  content: ReactNode;
  className?: string;
}

// Must match .panel's width in Tooltip.module.css — used to detect
// top-edge overflow before render.
const PANEL_WIDTH = 200;
// Mirrors --motion-delay-tooltip-close (styles/globals.css) — kept as a
// plain number here since setTimeout needs milliseconds, not a CSS value.
const CLOSE_DELAY_MS = 250;

type Position = { top: number; left: number };

export default function Tooltip({ children, content, className }: TooltipProps) {
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!hovered) return;

    const reposition = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const triggerRect = trigger.getBoundingClientRect();
      const panelHeight = panel.getBoundingClientRect().height;
      const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spacing-xs")) || 4;

      // top-start: above the trigger, left-aligned with it.
      const topStart = { top: triggerRect.top - gap - panelHeight, left: triggerRect.left };
      // Flip to bottom-start only if top-start would run off the top of the
      // viewport — no other collision detection.
      const fits = topStart.top >= 0;
      const rect = fits ? topStart : { top: triggerRect.bottom + gap, left: triggerRect.left };

      const left = Math.min(Math.max(rect.left, gap), window.innerWidth - PANEL_WIDTH - gap);
      setPosition({ top: rect.top, left });
    };

    reposition();
  }, [hovered]);

  const show = () => {
    clearTimeout(hideTimeoutRef.current);
    setHovered(true);
  };
  const hide = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHovered(false);
      setPosition(null);
    }, CLOSE_DELAY_MS);
  };

  return (
    <span className={`${styles.root}${className ? ` ${className}` : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </button>
      {hovered &&
        createPortal(
          <div
            ref={panelRef}
            className={styles.panel}
            role="tooltip"
            style={
              position
                ? { top: position.top, left: position.left }
                : { top: -9999, left: -9999, visibility: "hidden" }
            }
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  );
}
