import React, { ReactNode, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import styles from "./SidePanel.module.css";

export type SidePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  /** Changing this value scrolls the panel's content back to the top — for
   *  consumers that swap children in place while the panel stays open (e.g.
   *  profile → drill-down view) without that new view inheriting the old
   *  view's scroll position. Pass whatever value identifies "which view is
   *  showing" (e.g. a panelView state string). */
  contentKey?: string | number;
};

const DEFAULT_WIDTH = 580;
const MIN_WIDTH = DEFAULT_WIDTH;
const MAX_WIDTH = 900;

export function SidePanel({ isOpen, onClose, children, contentKey }: SidePanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(DEFAULT_WIDTH);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [contentKey]);
  // Keeps the panel mounted only while open or actively sliding closed — the
  // overlay is position:fixed, so leaving it mounted (and merely
  // translateX(100%)'d) at rest let it bleed past a transformed ancestor's
  // overflow:hidden in one embed (worked around there without touching this
  // component). transitionend (not a timeout) so a killed/altered transition
  // can't leave the panel stuck mounted.
  const [mounted, setMounted] = useState(isOpen);
  // Drives the .open class separately from `mounted`. The panel has to mount
  // in its closed position first and flip open a frame later, or the browser
  // has no start state to transition the transform from and it snaps straight
  // to its final position (which is exactly what happens if .open is applied
  // on the same render it mounts).
  const [entered, setEntered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      setMounted(false);
      return;
    }
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target === panel && e.propertyName === "transform") {
        setMounted(false);
      }
    };
    panel.addEventListener("transitionend", handleTransitionEnd);
    // Backstop: if transitionend never fires (reduced motion zeroes the
    // duration, or the panel gets hidden mid-transition) the panel would stay
    // mounted forever — reinstating the exact fixed-overlay bleed this fix
    // exists to remove. Duration is read off the element's own computed style
    // rather than restating the motion token here, so the two can't drift.
    const durationMs =
      parseFloat(window.getComputedStyle(panel).transitionDuration) * 1000;
    const fallback = window.setTimeout(() => setMounted(false), durationMs);
    return () => {
      panel.removeEventListener("transitionend", handleTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [isOpen]);

  // Double rAF: the first fires before the browser has necessarily processed
  // the newly-mounted node's styles, the second is guaranteed to land after —
  // the standard way to get a mount-then-animate transition to actually run.
  useEffect(() => {
    if (!mounted || !isOpen) {
      setEntered(false);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [mounted, isOpen]);

  // Prevents text selection/cursor flicker elsewhere on the page while dragging —
  // the pointer regularly ends up over unrelated content mid-drag.
  useEffect(() => {
    if (!isDragging) return;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = width;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    // Panel is right-anchored, so dragging the left-edge handle leftward (negative
    // delta from the drag start) grows the panel — width tracks the inverse of clientX's movement.
    const delta = dragStartXRef.current - e.clientX;
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidthRef.current + delta));
    setWidth(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!mounted) return null;

  return (
    <div className={styles.overlay}>
      <div
        ref={panelRef}
        className={[styles.panel, entered && styles.open].filter(Boolean).join(" ")}
        style={{ width }}
        aria-hidden={!isOpen}
      >
        <div
          className={[styles.resizeHandle, isDragging && styles.resizeHandleActive]
            .filter(Boolean)
            .join(" ")}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel"
        />
        <div className={styles.topNav}>
          <button type="button" className={styles.iconButton} aria-label="Expand panel">
            <Icon name="expand_content" color="var(--xops-text-secondary)" />
          </button>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close panel">
            <Icon name="close" color="var(--xops-text-secondary)" />
          </button>
        </div>
        <div ref={contentRef} className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default SidePanel;
