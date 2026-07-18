import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./MiniTooltip.module.css";

export type MiniTooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

// Single-line hover hint — lighter than Tooltip (no icon/footer/rich content).
// Reusable anywhere a short "what does this control do" hint is needed.
const GAP = 4;

export function MiniTooltip({ label, children, className }: MiniTooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + GAP, left: rect.left });
  }, [open]);

  return (
    <span
      ref={triggerRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open &&
        position &&
        createPortal(
          <span
            role="tooltip"
            className={styles.bubble}
            style={{ top: position.top, left: position.left }}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}

export default MiniTooltip;
