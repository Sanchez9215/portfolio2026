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
  /** Product names to bold within `description` — separate from `relatedSoftware` since a
   *  description can reference a product (e.g. a duplicate-tool comparison) that isn't the
   *  row being tinted. */
  descriptionHighlights?: string[];
};

// Bolds every occurrence of each `highlights` string found in `text`.
function renderHighlightedDescription(text: string, highlights: string[] | undefined, styles: Record<string, string>) {
  if (!highlights || highlights.length === 0) return text;
  const pattern = highlights.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const parts = text.split(new RegExp(`(${pattern})`, "g"));
  return parts.map((part, index) =>
    highlights.includes(part) ? (
      <span className={styles.cardDescriptionHighlight} key={index}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export type AlertsPanelProps = {
  open: boolean;
  onClose: () => void;
  stageLabel: string;
  alerts: AlertItem[];
  /** The element this panel portals into and fills (position: absolute; inset: 0) —
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

  // Portal-safe mount check — boundsRef.current doesn't exist until after the
  // bounds element itself has mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!rendered || !mounted || !boundsRef?.current) return null;

  // Portaled into boundsRef's own element (not document.body) with `position:
  // absolute` (not `fixed`) — this element (the live-embed's img wrapper) is
  // never itself transformed, only LiveEmbed's inner scaled/panned canvas is,
  // so an absolute child here needs no JS-measured bounds at all: it's normal
  // document flow, scrolling with the page exactly like everything else on it.
  // (A `position: fixed` + document.body portal was tried first, matching the
  // real viewport instead — but that requires re-measuring the bounds element's
  // position on every scroll event, which always lags a frame behind the
  // browser's own scroll compositing and reads as a visible jiggle/hunt.)
  return createPortal(
    <div
      className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
      onClick={onClose}
      style={dimmed ? undefined : { backgroundColor: "transparent" }}
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
            <h3 className={styles.title}>{stageLabel} Alerts</h3>
            <span className={styles.countBadge}>{alerts.length}</span>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close alerts">
            <Icon name="close" color="var(--xops-text-secondary)" />
          </button>
        </div>
        <div className={styles.list}>
          {alerts.map((alert, index) => (
            <div className={styles.card} key={index}>
              <Icon name="warning" color="var(--xops-status-danger-solid)" className={styles.cardIcon} />
              <div className={styles.cardContent}>
                <div className={styles.cardText}>
                  <p className={styles.cardTitle}>{alert.title}</p>
                  <p className={styles.cardDescription}>
                    {renderHighlightedDescription(alert.description, alert.descriptionHighlights, styles)}
                  </p>
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
    boundsRef.current
  );
}

export default AlertsPanel;
