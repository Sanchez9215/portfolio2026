import React, { ReactNode, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import styles from "./SidePanel.module.css";

export type SidePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

const DEFAULT_WIDTH = 580;
const MIN_WIDTH = DEFAULT_WIDTH;
const MAX_WIDTH = 900;

export function SidePanel({ isOpen, onClose, children }: SidePanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(DEFAULT_WIDTH);

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

  return (
    <div className={styles.overlay}>
      <div
        className={[styles.panel, isOpen && styles.open].filter(Boolean).join(" ")}
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
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default SidePanel;
