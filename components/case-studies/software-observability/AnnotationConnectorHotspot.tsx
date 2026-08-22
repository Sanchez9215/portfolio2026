"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./AnnotationConnectorHotspot.module.css";

// Native diagonal size, taken from /icons/annotation-connect.svg's own diagonal
// segment (a clean 45°, 32x32, doubled to 64) — the diagonal portion of the path
// never changes; only the horizontal segment's own length grows, as more path in
// the *same* native unit space (see connectorPath below) — never a non-uniform
// stretch, which is what would actually skew/distort the diagonal's angle.
const DIAGONAL_SIZE = 72;
// Native stroke width (in the connector's own unit space) — renders at this
// many px once scaled to 1:1, scaling down with the connector like everything
// else here (consistent with RECT_PADDING/TOOLTIP_GAP elsewhere).
const STROKE_WIDTH = 2;
// Tooltip's fixed card width (unscaled, matches the Figma spec) — the connector's
// horizontal run is sized to reach exactly this far so it spans the card edge to edge.
const TOOLTIP_WIDTH = 200;
// Padding added around the measured target rect on each side, so the cutout
// reads as +4px taller/wider than the element itself, not a bare-tight crop.
const RECT_PADDING = 4;

export interface AnnotationHotspotData {
  /** `data-hotspot` id to attach to — this experiment only supports one target
   *  per hotspot (no unioning/selector modes HotspotOverlay supports). */
  targetId: string;
  title: string;
  label: string;
  body: string;
  insightLabel: string;
  insight: string;
  /** Contributes its own cutout hole (via targetId/spotlightId as normal) but
   *  renders no connector/tooltip — e.g. a second spotlight (the alert button)
   *  alongside another hotspot's own connector-bearing spotlight (the modal it
   *  opens), without a second tooltip. */
  cutoutOnly?: boolean;
  /** Attaches to the target's top-left corner with the connector/tooltip running
   *  out to the left, instead of the default top-right corner running right. */
  flip?: boolean;
  /** `data-hotspot` id for the spotlight cutout, when it should differ from
   *  `targetId` — e.g. multiple hotspots pointing into the same card share one
   *  cutout (the card) via a common `spotlightId`, while each keeps its own
   *  `targetId` for its connector's individual anchor point. Defaults to
   *  `targetId` (one cutout per hotspot, the original behavior). */
  spotlightId?: string;
  /** Overrides RECT_PADDING for this cutout (raw px, unscaled — same convention
   *  as RECT_PADDING). Only read from the first hotspot sharing a given
   *  spotlightId/targetId. */
  spotlightPadding?: number;
  /** Overrides the cutout's corner radius for this cutout, in native px —
   *  scaled by the embed's own `scale` so it matches the real element's own
   *  border-radius at any embed size. Only read from the first hotspot sharing
   *  a given spotlightId/targetId. */
  spotlightRadius?: number;
  /** CSS selector (queried relative to the cutout's own target element), whose
   *  bottom edge caps the cutout's height instead of the target's own bottom
   *  edge — e.g. a card whose spotlight should stop partway through a table
   *  rather than covering its full real height. Only read from the first
   *  hotspot sharing a given spotlightId/targetId. */
  spotlightBottomSelector?: string;
}

interface AnnotationConnectorHotspotProps {
  containerRef: React.RefObject<HTMLElement>;
  /** The embed's own reference width (LiveEmbed's `nativeWidth`) — same scale
   *  derivation as HotspotOverlay/HoverRevealOverlay, so the connector shrinks
   *  proportionally when the embed itself is rendered smaller. */
  nativeWidth: number;
  hotspots: AnnotationHotspotData[];
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// First pass at a new hotspot style, now showing every hotspot at once: a single
// shared spotlight (one SVG mask with one cutout hole per hotspot, same technique
// HotspotOverlay uses — a separate mask per hotspot would compound the dim
// everywhere else isn't cut out) plus one connector + tooltip per hotspot. Each
// connector is a single continuous path (diagonal + horizontal, the same shape as
// /icons/annotation-connect.svg, just with the horizontal segment's own length
// extended) running from the target's top-right corner up through an elbow and
// across the tooltip's title/content gap — landing 8px below the title and 8px
// above the Assumption/Insight content, spanning the tooltip's full width.
// Static/always-on for now (see OverviewPrototypeHotspots.tsx) — no scroll
// sequence, no hover gating yet. The corner dot marker is temporarily left out.
export default function AnnotationConnectorHotspot({
  containerRef,
  nativeWidth,
  hotspots,
}: AnnotationConnectorHotspotProps) {
  const maskId = useId();
  const [rects, setRects] = useState<(Rect | null)[]>([]);
  // Deduped cutout config — one or more hotspots can share the same spotlightId
  // (falling back to targetId) to punch a single shared hole instead of one
  // hole per hotspot. Padding/radius overrides are read from whichever hotspot
  // first declares that key.
  const cutoutConfig = new Map<
    string,
    { padding: number; radius: number | null; bottomSelector: string | null }
  >();
  hotspots.forEach((h) => {
    const key = h.spotlightId ?? h.targetId;
    if (!cutoutConfig.has(key)) {
      cutoutConfig.set(key, {
        padding: h.spotlightPadding ?? RECT_PADDING,
        radius: h.spotlightRadius ?? null,
        bottomSelector: h.spotlightBottomSelector ?? null,
      });
    }
  });
  const cutoutKeys = Array.from(cutoutConfig.keys());
  const [cutoutRects, setCutoutRects] = useState<(Rect | null)[]>([]);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = (
      id: string,
      containerRect: DOMRect,
      padding: number,
      bottomSelector?: string | null,
    ): Rect | null => {
      const el = container.querySelector<HTMLElement>(`[data-hotspot="${id}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      let bottom = r.bottom;
      if (bottomSelector) {
        const boundEl = el.querySelector<HTMLElement>(bottomSelector);
        if (boundEl) bottom = boundEl.getBoundingClientRect().bottom;
      }
      return {
        top: r.top - containerRect.top - padding,
        left: r.left - containerRect.left - padding,
        width: r.width + padding * 2,
        height: bottom - r.top + padding * 2,
      };
    };

    const tick = () => {
      const containerRect = container.getBoundingClientRect();
      setContainerSize({
        width: containerRect.width,
        height: containerRect.height,
      });
      setScale(containerRect.width / nativeWidth);

      setRects(
        hotspots.map((hotspot) =>
          measure(hotspot.targetId, containerRect, RECT_PADDING),
        ),
      );
      setCutoutRects(
        cutoutKeys.map((key) => {
          const config = cutoutConfig.get(key)!;
          return measure(
            key,
            containerRect,
            config.padding,
            config.bottomSelector,
          );
        }),
      );
    };

    tick();
    const observer = new ResizeObserver(tick);
    observer.observe(container);
    window.addEventListener("resize", tick);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, hotspots, nativeWidth, cutoutKeys.join(",")]);

  if (!containerSize) return null;

  return (
    <div className={styles.overlay}>
      <svg className={styles.spotlightMask}>
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <rect
              x="0"
              y="0"
              width={containerSize.width}
              height={containerSize.height}
              fill="white"
            />
            {cutoutRects.map((r, i) => {
              if (!r) return null;
              const key = cutoutKeys[i];
              const radiusOverride = cutoutConfig.get(key)!.radius;
              const rx =
                radiusOverride != null
                  ? radiusOverride * scale
                  : Math.min(2, r.width / 2, r.height / 2);
              return (
                <rect
                  key={key}
                  x={r.left}
                  y={r.top}
                  width={Math.max(r.width, 0)}
                  height={Math.max(r.height, 0)}
                  rx={rx}
                  fill="black"
                />
              );
            })}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(17, 17, 20, 0.85)"
          mask={`url(#${maskId})`}
        />
      </svg>

      {hotspots.map((hotspot, i) => {
        if (hotspot.cutoutOnly) return null;
        const rect = rects[i];
        if (!rect) return null;
        return (
          <ConnectorTooltip
            key={hotspot.targetId}
            rect={rect}
            scale={scale}
            hotspot={hotspot}
          />
        );
      })}
    </div>
  );
}

// One hotspot's tooltip + connector — split out from the container above so each
// gets its own title-measurement effect (rules of hooks: one component instance
// per array item, rather than hooks called in a loop inside a single component).
function ConnectorTooltip({
  rect,
  scale,
  hotspot,
}: {
  rect: Rect;
  scale: number;
  hotspot: AnnotationHotspotData;
}) {
  const titleRef = useRef<HTMLSpanElement>(null);
  // Where the connector's horizontal run should land, measured as an offset from
  // the tooltip's own top edge (8px below the title's rendered bottom) — depends
  // on the title's height, which can vary with text wrap, so it's measured rather
  // than assumed.
  const [lineOffsetY, setLineOffsetY] = useState<number | null>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const measure = () => setLineOffsetY(el.offsetTop + el.offsetHeight + 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hotspot.title]);

  // Attach corner — the target's top-right by default, or top-left when flipped
  // (the diagonal's lower end lands here either way).
  const cornerX = hotspot.flip ? rect.left : rect.left + rect.width;
  const cornerY = rect.top;
  const diagonalWidth = DIAGONAL_SIZE * scale;
  const diagonalHeight = DIAGONAL_SIZE * scale;
  // The elbow (diagonal's top end) is fixed relative to the corner (native size,
  // just scaled — never stretched), which fixes where the tooltip itself must sit
  // so its title/content gap lines up exactly with the connector's horizontal run.
  // Flipped runs the elbow (and everything after it) to the left instead of right.
  const elbowY = cornerY - diagonalHeight;
  const elbowX = hotspot.flip
    ? cornerX - diagonalWidth
    : cornerX + diagonalWidth;
  const tooltipLeft = hotspot.flip ? elbowX - TOOLTIP_WIDTH : elbowX;
  const tooltipTop = lineOffsetY != null ? elbowY - lineOffsetY : elbowY;

  // One continuous path, same native unit space throughout (never non-uniformly
  // stretched): diagonal from (0, DIAGONAL_SIZE) up to the elbow at (DIAGONAL_SIZE, 0),
  // then horizontal out to (DIAGONAL_SIZE + horizontalRun, 0) — sized so that run,
  // once scaled, reaches exactly the tooltip's full width.
  const horizontalRun = TOOLTIP_WIDTH / scale;
  const pathWidth = DIAGONAL_SIZE + horizontalRun;
  const connectorPath = `M0 ${DIAGONAL_SIZE}L${DIAGONAL_SIZE} 0H${pathWidth}`;

  return (
    <>
      <div
        className={styles.tooltip}
        style={{ left: tooltipLeft, top: tooltipTop }}
      >
        <span ref={titleRef} className={styles.title}>
          {hotspot.title}
        </span>
        <div className={styles.sections}>
          <div className={styles.section}>
            {/* "Assumption" label hidden for now (this view only) — data
                untouched, just not rendered. */}
            <p className={styles.text}>{hotspot.body}</p>
          </div>
          {/* Insight section hidden for now (this view only) — data untouched,
              just not rendered. */}
        </div>
      </div>

      {/* Rendered after (on top of) the tooltip so the horizontal run reads as
          crossing over the card, through its title/content gap. When flipped, the
          path itself is unchanged (still drawn running rightward) — mirrored via
          transform instead, pivoting around its own left edge (= the corner attach
          point, which must stay fixed) so it renders running leftward instead. */}
      <svg
        className={styles.connector}
        style={{
          left: cornerX,
          top: elbowY,
          width: pathWidth * scale,
          height: diagonalHeight,
          transform: hotspot.flip ? "scaleX(-1)" : undefined,
          transformOrigin: hotspot.flip ? "left" : undefined,
        }}
        viewBox={`0 0 ${pathWidth} ${DIAGONAL_SIZE}`}
        fill="none"
      >
        <path
          d={connectorPath}
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinejoin="miter"
        />
      </svg>
    </>
  );
}
