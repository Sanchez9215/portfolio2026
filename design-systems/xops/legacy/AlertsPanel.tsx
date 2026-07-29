import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../components/Icon";
import Button from "../components/Button";
import styles from "./AlertsPanel.module.css";

// One-off legacy component (see .claude/projects/xops/DECISIONS.md, this session's
// legacy-Overview build) — decorative alert content per lifecycle stage, not backed
// by real computed alert logic. Colocated in legacy/, not the shared components tree.

export type AlertItem = {
  title: string;
  description: string;
  cta: string;
  /** Product names this alert calls out — drives the main table's row tint for the active stage. */
  relatedSoftware?: string[];
};

export type AlertsPanelProps = {
  open: boolean;
  onClose: () => void;
  stageLabel: string;
  alerts: AlertItem[];
  /** Element the backdrop matches exactly (top/bottom) instead of the full viewport —
   *  e.g. the live-embed's img wrapper. The panel itself insets 32px inside that via CSS. */
  boundsRef?: React.RefObject<HTMLElement>;
  /** Whether the backdrop dims the area behind it — default true. Set false when a
   *  `HotspotOverlay` is already dimming the same area (its scroll-hotspot spotlight
   *  targets this panel): a second dark layer on top double-dims that spotlight's
   *  cutout and darkens the hotspot tooltip, which sits underneath this portal. */
  dimmed?: boolean;
};

// Matches HotspotOverlay's own overlay fade duration, so a hotspot-driven close
// (modal + spotlight disappearing together) reads as one consistent motion.
const FADE_MS = 250;

export function AlertsPanel({ open, onClose, stageLabel, alerts, boundsRef, dimmed = true }: AlertsPanelProps) {
  // Portal-safe mount check — createPortal needs document.body, which doesn't
  // exist during SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lags `open` by the fade duration on close so the panel crossfades out
  // instead of unmounting the instant `open` goes false (which previously made
  // it vanish abruptly, e.g. right as a pinned hotspot section released).
  const [rendered, setRendered] = useState(open);
  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    const timeout = setTimeout(() => setRendered(false), FADE_MS);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Measures the bounds element live rather than once — window resize (or the
  // pinned frame's own height recalculating) can shift it while the modal is open.
  const [bounds, setBounds] = useState<{ top: number; bottom: number } | null>(null);
  useEffect(() => {
    const el = boundsRef?.current;
    // Deliberately don't clear bounds when `open` goes false — keep the last
    // measured region so the backdrop doesn't jump to full-viewport size while
    // it's fading out.
    if (!open || !el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setBounds({ top: rect.top, bottom: window.innerHeight - rect.bottom });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, boundsRef]);

  if (!rendered || !mounted) return null;

  // Portaled to document.body — this panel's `position: fixed` backdrop needs to
  // be relative to the real viewport, but it's rendered inside LiveEmbed's scaled/
  // panned canvas, and any transformed ancestor becomes the containing block for
  // fixed descendants (per spec), confining it to the canvas's own box instead.
  return createPortal(
    <div
      className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
      onClick={onClose}
      style={{
        ...(bounds ? { top: bounds.top, bottom: bounds.bottom } : undefined),
        ...(dimmed ? undefined : { backgroundColor: "transparent" }),
      }}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-label={`${stageLabel} alerts`}
        data-hotspot="alert-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>Alerts</h3>
            <span className={styles.countBadge}>{alerts.length}</span>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close alerts">
            <Icon name="close" color="var(--xops-text-secondary)" />
          </button>
        </div>
        <div className={styles.list}>
          {alerts.map((alert, index) => (
            <div className={styles.card} key={index}>
              <span className={styles.cardIcon}>
                <Icon name="warning" color="var(--xops-status-danger-solid)" />
              </span>
              <div className={styles.cardContent}>
                <div className={styles.cardText}>
                  <p className={styles.cardTitle}>{alert.title}</p>
                  <p className={styles.cardDescription}>{alert.description}</p>
                </div>
                <Button variant="secondary" className={styles.cardCta}>
                  {alert.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AlertsPanel;
