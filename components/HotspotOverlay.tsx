"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./HotspotOverlay.module.css";

// Padding added around the measured target rect on each side (so the spotlight
// cutout reads as +16px taller/wider than the element itself, not a tight crop).
const RECT_PADDING = 8;
// Minimum gap kept between the tooltip card and the container's edge when clamped.
const EDGE_MARGIN = 12;
// Space left between the anchor rect and the tooltip on whichever side it lands.
const TOOLTIP_GAP = 16;
// Per-frame follow rate for the smoothed cutout rects — higher = snappier,
// lower = laggier. Framerate-independent via gsap.ticker.deltaRatio().
const RECT_FOLLOW_SPEED = 0.18;

// Two distinct geometries, not one 4-way grid — a tooltip either sits BESIDE the
// anchor (offset horizontally, aligned to its top or bottom edge) or is STACKED
// above/below it (offset vertically, justified to its left or right edge). The
// two geometries can't share one "top-left"-style code without ambiguity: beside
// placements need a horizontal offset + vertical alignment, stacked placements
// need the opposite pairing.
export type TooltipPlacement =
  | "left-top" // beside, to the anchor's left, top-aligned
  | "left-bottom" // beside, to the anchor's left, bottom-aligned
  | "right-top" // beside, to the anchor's right, top-aligned
  | "right-bottom" // beside, to the anchor's right, bottom-aligned
  | "below-left" // stacked below the anchor, left-justified
  | "below-right" // stacked below the anchor, right-justified
  | "above-left" // stacked above the anchor, left-justified
  | "above-right"; // stacked above the anchor, right-justified

export interface Hotspot {
  id: string;
  title: string;
  /** Small category tag above the body paragraph — omit when the source content has no separate category (title alone stands in for it). */
  label?: string;
  body: string;
  /** Insight card body, shown stacked directly below the assumption card. */
  insight?: string;
  /** DOM `data-hotspot` ids to spotlight — defaults to [id] when omitted. Each id gets
   *  its own cutout; if an id matches multiple elements (e.g. several flagged table rows),
   *  they're bounded into one shared cutout for that id. */
  targetIds?: string[];
  /** Raw CSS selectors (scoped to the embed container) to spotlight instead of
   *  `data-hotspot` ids — for targets with no attribute hook available (e.g. a
   *  shared design-system table's header/body cells by structural position).
   *  Each selector's full match set bounds into one shared cutout, same as targetIds. */
  targetSelectors?: string[];
  /** `data-hotspot` ids resolved from `document` instead of the embed container —
   *  for targets portaled outside the container's DOM subtree (e.g. a modal via
   *  createPortal, which still visually overlaps the embed but isn't a descendant
   *  of it). Only use this when the target truly lives outside the container;
   *  container-scoped ids can collide across multiple embeds on the same page,
   *  document-scoped ones can't be de-duped that way, so keep the id unique. */
  portalTargetIds?: string[];
  /** Container-scoped selector whose own left/width overrides every cutout rect's
   *  left/width for this hotspot — for capping a spotlight's height to a few rows of
   *  a table while still hugging the full card's left/right edges, instead of the
   *  (possibly wider, e.g. horizontally-scrolled) row's own rendered width. */
  widthFromSelector?: string;
  /** `data-hotspot` ids for `LiveEmbed`'s `panTargetIds` — only needed when the pan
   *  target should differ from this hotspot's own spotlight targeting (e.g. a hotspot
   *  spotlighting a portaled tooltip panel still needs the embed to pan to the
   *  underlying in-canvas card, since a portaled element has no in-canvas position to
   *  pan to). Defaults to `targetIds ?? [id]` when omitted — see call sites. */
  panTargetIds?: string[];
  /** Number of scroll slots this hotspot occupies — default 1. See useScrollHotspotSequence. */
  subBeats?: number;
  /** Where the tooltip sits relative to the anchor rect — default "right-top".
   *  The card's sharp (unrounded) corner always points back at the anchor. */
  placement?: TooltipPlacement;
}

interface HotspotOverlayProps {
  containerRef: React.RefObject<HTMLElement>;
  active: Hotspot | null;
  settled: boolean; // true during the hold phase — gates tooltip visibility
  /** Tooltip card accent — "default" is the standard yellow, "issue" is the FF7878
   *  red used for the "Issues Identified" hotspot experiences. */
  tone?: "default" | "issue";
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

// Raw (unclamped) position per placement, before edge-clamping into the container.
function rawTooltipPosition(anchor: Rect, tooltip: Size, placement: TooltipPlacement): { top: number; left: number } {
  switch (placement) {
    case "left-top":
      return { left: anchor.left - TOOLTIP_GAP - tooltip.width, top: anchor.top };
    case "left-bottom":
      return { left: anchor.left - TOOLTIP_GAP - tooltip.width, top: anchor.top + anchor.height - tooltip.height };
    case "right-top":
      return { left: anchor.left + anchor.width + TOOLTIP_GAP, top: anchor.top };
    case "right-bottom":
      return { left: anchor.left + anchor.width + TOOLTIP_GAP, top: anchor.top + anchor.height - tooltip.height };
    case "below-left":
      return { left: anchor.left, top: anchor.top + anchor.height + TOOLTIP_GAP };
    case "below-right":
      return { left: anchor.left + anchor.width - tooltip.width, top: anchor.top + anchor.height + TOOLTIP_GAP };
    case "above-left":
      return { left: anchor.left, top: anchor.top - TOOLTIP_GAP - tooltip.height };
    case "above-right":
      return { left: anchor.left + anchor.width - tooltip.width, top: anchor.top - TOOLTIP_GAP - tooltip.height };
  }
}

// Clamps the raw placement position into the container so the tooltip never
// spills past the container's own edges.
function clampedTooltipPosition(anchor: Rect, tooltip: Size, container: Size, placement: TooltipPlacement) {
  const { left, top } = rawTooltipPosition(anchor, tooltip, placement);
  return {
    left: Math.min(Math.max(left, EDGE_MARGIN), container.width - tooltip.width - EDGE_MARGIN),
    top: Math.min(Math.max(top, EDGE_MARGIN), container.height - tooltip.height - EDGE_MARGIN),
  };
}

// The tooltip's sharp (unrounded) corner is always the corner nearest the anchor.
// Beside placements ("left-*"/"right-*"): the anchor is on the opposite horizontal
// side from where the tooltip sits, at the same vertical edge as the alignment.
// Stacked placements ("above-*"/"below-*"): the anchor is on the opposite vertical
// side from where the tooltip sits, at the same horizontal edge as the justification.
function sharpCornerClass(placement: TooltipPlacement): string {
  const corner: Record<TooltipPlacement, string> = {
    "left-top": "top-right",
    "left-bottom": "bottom-right",
    "right-top": "top-left",
    "right-bottom": "bottom-left",
    "below-left": "top-left",
    "below-right": "top-right",
    "above-left": "bottom-left",
    "above-right": "bottom-right",
  };
  return styles[`corner-${corner[placement]}`];
}

function boundingRect(elements: HTMLElement[], containerRect: DOMRect): Rect | null {
  if (elements.length === 0) return null;
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const el of elements) {
    const r = el.getBoundingClientRect();
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  return {
    top: top - containerRect.top - RECT_PADDING,
    left: left - containerRect.left - RECT_PADDING,
    width: right - left + RECT_PADDING * 2,
    height: bottom - top + RECT_PADDING * 2,
  };
}

function lerpRect(from: Rect, to: Rect, t: number): Rect {
  return {
    top: gsap.utils.interpolate(from.top, to.top, t),
    left: gsap.utils.interpolate(from.left, to.left, t),
    width: gsap.utils.interpolate(from.width, to.width, t),
    height: gsap.utils.interpolate(from.height, to.height, t),
  };
}

// Spotlights real DOM elements (matched via `[data-hotspot="<id>"]` inside the
// live embed) rather than fixed screenshot coordinates — so it stays correct
// at any embed scale. Positioned by measuring each target's real rendered rect
// (getBoundingClientRect already reflects LiveEmbed's transform: scale). A
// hotspot can target more than one id at once (see `targetIds`); each id gets
// its own cutout, and same-id matches (e.g. several flagged rows) bound into one.
//
// The spotlight never scales to zero between hotspots — it stays full-size and
// its cutout rects smoothly chase the real measured target via a per-frame lerp
// (gsap.ticker + gsap.utils.interpolate), so moving from one hotspot to the next
// (or panning within one) reads as one continuous glide, not a shrink/regrow.
export default function HotspotOverlay({ containerRef, active, settled, tone = "default" }: HotspotOverlayProps) {
  const maskId = useId();
  const [displayRects, setDisplayRects] = useState<Rect[]>([]);
  const displayRectsRef = useRef<Rect[]>([]);
  const [containerSize, setContainerSize] = useState<Size | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState<Size | null>(null);
  // Remembers the last non-null hotspot so the overlay has something to render
  // while it CSS-fades out after `active` goes null — otherwise the mask/tooltip
  // would vanish instantly (conditionally unrendered) on the same frame the
  // fade-out transition starts, making the opacity transition meaningless.
  const lastHotspotRef = useRef<Hotspot | null>(null);
  if (active) lastHotspotRef.current = active;
  const renderedHotspot = active ?? lastHotspotRef.current;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) {
      // Deliberately don't clear displayRects/containerSize here — leave the
      // last measured frame in place so the fade-out shows the real last
      // position instead of popping to empty content mid-fade.
      return;
    }

    // Container ids default to [id] only when nothing else is set — a hotspot that
    // targets purely portaled content (portalTargetIds only, e.g. a modal) has no
    // container-scoped selectors at all.
    const containerIds = active.targetIds ?? (active.portalTargetIds ? [] : [active.id]);
    const containerSelectors = active.targetSelectors ?? containerIds.map((id) => `[data-hotspot="${id}"]`);
    const portalSelectors = (active.portalTargetIds ?? []).map((id) => `[data-hotspot="${id}"]`);

    const measureTargets = (): Rect[] => {
      const containerRect = container.getBoundingClientRect();
      setContainerSize({ width: containerRect.width, height: containerRect.height });
      const containerRects = containerSelectors.map((selector) => {
        const matches = Array.from(container.querySelectorAll<HTMLElement>(selector));
        return boundingRect(matches, containerRect);
      });
      // Portaled content (e.g. createPortal to document.body) isn't a descendant of
      // `container`, so it's resolved from `document` instead — getBoundingClientRect
      // is always viewport-relative regardless of where an element lives in the tree,
      // so subtracting containerRect still places it correctly in the overlay's space.
      const portalRects = portalSelectors.map((selector) => {
        const matches = Array.from(document.querySelectorAll<HTMLElement>(selector));
        return boundingRect(matches, containerRect);
      });
      const targets = [...containerRects, ...portalRects].filter((r): r is Rect => r !== null);

      if (active.widthFromSelector) {
        const frameEls = Array.from(container.querySelectorAll<HTMLElement>(active.widthFromSelector));
        const frameRect = boundingRect(frameEls, containerRect);
        if (frameRect) {
          return targets.map((r) => ({ ...r, left: frameRect.left, width: frameRect.width }));
        }
      }
      return targets;
    };

    const tick = () => {
      const targets = measureTargets();
      const prev = displayRectsRef.current;
      // Cutout count changed (different hotspot shape, e.g. 1 target → 2 targets) —
      // can't meaningfully lerp mismatched arrays, so snap instead of chasing.
      const next =
        prev.length === targets.length
          ? targets.map((t, i) => lerpRect(prev[i], t, RECT_FOLLOW_SPEED * gsap.ticker.deltaRatio()))
          : targets;
      displayRectsRef.current = next;
      setDisplayRects(next);
    };

    tick();
    const observer = new ResizeObserver(tick);
    observer.observe(container);
    window.addEventListener("resize", tick);

    // The canvas can also translate (LiveEmbed panning to a new hotspot) without
    // firing ResizeObserver — a transform, not a layout change — so remeasure every
    // frame for as long as this hotspot is active to keep the spotlight glued to it.
    let frame = requestAnimationFrame(function loop() {
      tick();
      frame = requestAnimationFrame(loop);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", tick);
      cancelAnimationFrame(frame);
    };
  }, [containerRef, active]);

  // Tooltip's own rendered size — its text can wrap to a different height
  // per hotspot, so the clamp math needs the real size, not an assumed one.
  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) {
      setTooltipSize(null);
      return;
    }
    const observer = new ResizeObserver(() => {
      setTooltipSize({ width: tooltip.offsetWidth, height: tooltip.offsetHeight });
    });
    observer.observe(tooltip);
    return () => observer.disconnect();
  }, [active]);

  const visible = Boolean(active && displayRects.length > 0);
  const anchorRect = displayRects[0] ?? null;
  const placement = renderedHotspot?.placement ?? "right-top";
  const tooltipPosition =
    anchorRect && containerSize && tooltipSize
      ? clampedTooltipPosition(anchorRect, tooltipSize, containerSize, placement)
      : anchorRect
        ? { top: anchorRect.top, left: anchorRect.left + anchorRect.width + TOOLTIP_GAP }
        : null;

  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : ""}`} aria-hidden={!visible}>
      {renderedHotspot && anchorRect && (
        <>
          {/* Single dark layer with one hole per cutout via SVG mask — as opposed to
              one box-shadow-spread div per cutout, which would darken each cutout's
              area with every *other* cutout's independent mask, compounding the dim. */}
          <svg className={styles.spotlightMask}>
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {displayRects.map((r, i) => {
                  const width = Math.max(r.width, 0);
                  const height = Math.max(r.height, 0);
                  const rx = Math.min(16, width / 2, height / 2);
                  return <rect key={i} x={r.left} y={r.top} width={width} height={height} rx={rx} fill="black" />;
                })}
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(17, 17, 20, 0.6)" mask={`url(#${maskId})`} />
          </svg>

          <div ref={tooltipRef} className={styles.tooltipStack} style={tooltipPosition ?? undefined}>
            <div
              className={`${styles.tooltipCard} ${tone === "issue" ? styles.issue : ""} ${sharpCornerClass(placement)} ${settled ? styles.settled : ""}`}
            >
              <span className={styles.tooltipTitle}>{renderedHotspot.title}</span>
              <div className={styles.tooltipBody}>
                {renderedHotspot.label && <span className={styles.tooltipLabel}>{renderedHotspot.label}</span>}
                <p className={styles.tooltipText}>{renderedHotspot.body}</p>
              </div>
            </div>
            {renderedHotspot.insight && (
              <div className={`${styles.tooltipCard} ${styles.insightCard} ${settled ? styles.settled : ""}`}>
                <span className={styles.tooltipLabel}>Insight</span>
                <p className={styles.tooltipText}>{renderedHotspot.insight}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
