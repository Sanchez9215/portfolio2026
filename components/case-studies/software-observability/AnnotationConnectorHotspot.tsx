"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./AnnotationConnectorHotspot.module.css";

// Native diagonal size, taken from /icons/annotation-connect.svg's own diagonal
// segment (a clean 45°, 32x32, doubled to 64) — the diagonal portion of the path
// never changes; only the horizontal segment's own length grows, as more path in
// the *same* native unit space (see connectorPath below) — never a non-uniform
// stretch, which is what would actually skew/distort the diagonal's angle.
const DIAGONAL_SIZE = 32;
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
  /** One or more CSS selectors (queried relative to the container, or to
   *  `document` when `documentScoped` is set) whose matched elements' union
   *  bounding box becomes this hotspot's rect — e.g. a card header + its first
   *  N table rows, when the target isn't one single element. Overrides
   *  `targetId`'s plain `[data-hotspot]` lookup when present. When used for a
   *  shared cutout, only read from the first hotspot sharing that
   *  spotlightId/targetId (same convention as spotlightBottomSelector). */
  targetSelectors?: string[];
  /** CSS selector whose own element's left/width replaces the measured rect's
   *  — e.g. capping a table-row union's width to its card's real edges when
   *  the rows themselves can render wider (horizontal table scroll). Read the
   *  same way as targetSelectors above. */
  widthFromSelector?: string;
  /** Measures targetId/targetSelectors against `document` instead of the
   *  embed container — for elements portaled outside it (e.g. a forced-open
   *  tooltip panel attached to document.body). */
  documentScoped?: boolean;
}

interface AnnotationConnectorHotspotProps {
  containerRef: React.RefObject<HTMLElement>;
  /** The embed's own reference width (LiveEmbed's `nativeWidth`) — same scale
   *  derivation as HotspotOverlay/HoverRevealOverlay, so the connector shrinks
   *  proportionally when the embed itself is rendered smaller. */
  nativeWidth: number;
  hotspots: AnnotationHotspotData[];
  /** Renders each tooltip's `insight` text instead of its `body` — the
   *  Insights pass of the card player re-walks the identical hotspots/groups
   *  as the Intent pass, swapping which field shows. */
  showInsight?: boolean;
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
// Sequential fade transition (fade the outgoing cutout/tooltip/connector fully
// out, only then fade the incoming set in — no cross-dissolve, no positional
// slide) — tuned values, see PLAN.md's "Sequential fade transition" plan.
const FADE_OUT_MS = 200;
const FADE_IN_MS = 300;

export default function AnnotationConnectorHotspot({
  containerRef,
  nativeWidth,
  hotspots,
  showInsight = false,
}: AnnotationConnectorHotspotProps) {
  const maskId = useId();
  // What's actually measured/rendered right now — decoupled from the `hotspots`
  // prop so a prop change can drive a fade-out first instead of repainting
  // immediately. The prop is the "next" state; this is the "current" state.
  const [displayHotspots, setDisplayHotspots] = useState(hotspots);
  const [rects, setRects] = useState<(Rect | null)[]>([]);
  // Deduped cutout config — one or more hotspots can share the same spotlightId
  // (falling back to targetId) to punch a single shared hole instead of one
  // hole per hotspot. Padding/radius/selector overrides are read from
  // whichever hotspot first declares that key.
  const cutoutConfig = new Map<
    string,
    {
      padding: number;
      radius: number | null;
      bottomSelector: string | null;
      targetSelectors: string[] | null;
      widthFromSelector: string | null;
      documentScoped: boolean;
    }
  >();
  displayHotspots.forEach((h) => {
    const key = h.spotlightId ?? h.targetId;
    if (!cutoutConfig.has(key)) {
      cutoutConfig.set(key, {
        padding: h.spotlightPadding ?? RECT_PADDING,
        radius: h.spotlightRadius ?? null,
        bottomSelector: h.spotlightBottomSelector ?? null,
        targetSelectors: h.targetSelectors ?? null,
        widthFromSelector: h.widthFromSelector ?? null,
        documentScoped: h.documentScoped ?? false,
      });
    }
  });
  const cutoutKeys = Array.from(cutoutConfig.keys());
  const targetKey = hotspots.map((h) => h.targetId).join(",");
  const displayTargetKey = displayHotspots.map((h) => h.targetId).join(",");
  // Refs to the actual DOM nodes this transition fades — collected via callback
  // refs on render (see cutout rects + ConnectorTooltip wrapper below), read
  // fresh whenever a transition kicks off rather than stored per-render.
  const cutoutNodeRefs = useRef<Map<string, SVGRectElement>>(new Map());
  const tooltipNodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fadeOutTweenRef = useRef<gsap.core.Tween | null>(null);

  // Drives the fade-out → swap half of the sequence, whenever the `hotspots`
  // prop actually points at a different set of targets than what's on screen.
  // Fade-in is handled separately, per-element, on its own mount (see
  // FadeInCutout/ConnectorTooltip below) — those elements don't exist yet at
  // the moment this prop change is detected (displayHotspots hasn't swapped),
  // so orchestrating fade-in from here as well would race the async
  // measurement effect that actually mounts them. On mount (targetKey already
  // equals displayTargetKey), this is a no-op — nothing to fade out yet.
  // Guards against overlap: a change mid-transition kills whatever fade-out is
  // in flight and restarts cleanly from whatever's currently rendered.
  useEffect(() => {
    if (targetKey === displayTargetKey) return;

    fadeOutTweenRef.current?.kill();
    const outNodes = [
      ...Array.from(cutoutNodeRefs.current.values()),
      ...Array.from(tooltipNodeRefs.current.values()),
    ];
    if (outNodes.length === 0) {
      setDisplayHotspots(hotspots);
      return;
    }
    fadeOutTweenRef.current = gsap.to(outNodes, {
      opacity: 0,
      duration: FADE_OUT_MS / 1000,
      ease: "power1.in",
      onComplete: () => setDisplayHotspots(hotspots),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);
  const [cutoutRects, setCutoutRects] = useState<(Rect | null)[]>([]);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Measures the union bounding box of every element any of `selectors`
    // matches, queried against `scopeEl` (the embed container, or `document`
    // for portaled elements — see `documentScoped`). Handles the original
    // single-target case too (selectors = one `[data-hotspot="id"]` string,
    // exactly one match) — bottomSelector only applies then, since it's only
    // ever authored for single-target hotspots (capping one card's own
    // height); widthFromSelector applies regardless of match count.
    const measureUnion = (
      selectors: string[],
      scopeEl: Document | HTMLElement,
      containerRect: DOMRect,
      padding: number,
      bottomSelector?: string | null,
      widthFromSelector?: string | null,
    ): Rect | null => {
      const matched: HTMLElement[] = [];
      selectors.forEach((sel) => {
        scopeEl
          .querySelectorAll<HTMLElement>(sel)
          .forEach((el) => matched.push(el));
      });
      if (matched.length === 0) return null;

      let top = Infinity;
      let left = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;
      matched.forEach((el) => {
        const r = el.getBoundingClientRect();
        top = Math.min(top, r.top);
        left = Math.min(left, r.left);
        right = Math.max(right, r.right);
        bottom = Math.max(bottom, r.bottom);
      });

      if (bottomSelector && matched.length === 1) {
        const boundEl = matched[0].querySelector<HTMLElement>(bottomSelector);
        if (boundEl) bottom = boundEl.getBoundingClientRect().bottom;
      }
      if (widthFromSelector) {
        const widthEl = scopeEl.querySelector<HTMLElement>(widthFromSelector);
        if (widthEl) {
          const wr = widthEl.getBoundingClientRect();
          left = wr.left;
          right = wr.right;
        }
      }

      return {
        top: top - containerRect.top - padding,
        left: left - containerRect.left - padding,
        width: right - left + padding * 2,
        height: bottom - top + padding * 2,
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
        displayHotspots.map((hotspot) =>
          measureUnion(
            hotspot.targetSelectors ?? [`[data-hotspot="${hotspot.targetId}"]`],
            hotspot.documentScoped ? document : container,
            containerRect,
            RECT_PADDING,
            null,
            hotspot.widthFromSelector,
          ),
        ),
      );
      setCutoutRects(
        cutoutKeys.map((key) => {
          const config = cutoutConfig.get(key)!;
          return measureUnion(
            config.targetSelectors ?? [`[data-hotspot="${key}"]`],
            config.documentScoped ? document : container,
            containerRect,
            config.padding,
            config.bottomSelector,
            config.widthFromSelector,
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
  }, [containerRef, displayHotspots, nativeWidth, cutoutKeys.join(",")]);

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
                <FadeInCutout
                  key={key}
                  cutoutRef={(el) => {
                    if (el) cutoutNodeRefs.current.set(key, el);
                    else cutoutNodeRefs.current.delete(key);
                  }}
                  x={r.left}
                  y={r.top}
                  width={Math.max(r.width, 0)}
                  height={Math.max(r.height, 0)}
                  rx={rx}
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

      {displayHotspots.map((hotspot, i) => {
        if (hotspot.cutoutOnly) return null;
        const rect = rects[i];
        if (!rect) return null;
        return (
          <ConnectorTooltip
            key={hotspot.targetId}
            rect={rect}
            scale={scale}
            hotspot={hotspot}
            showInsight={showInsight}
            wrapperRef={(el) => {
              if (el) tooltipNodeRefs.current.set(hotspot.targetId, el);
              else tooltipNodeRefs.current.delete(hotspot.targetId);
            }}
          />
        );
      })}
    </div>
  );
}

// One cutout hole — self-fades in on its own mount (opacity 0→1, FADE_IN_MS),
// the same technique ConnectorTooltip below uses for its own mount. The parent
// only reaches in to fade these OUT (see cutoutNodeRefs above); fade-in can't
// be orchestrated top-down because these elements don't exist yet at the
// moment a card change is detected — they mount later, once the async
// measurement effect populates cutoutRects — so each one fading itself in
// right when it actually mounts is the only timing that's guaranteed correct.
function FadeInCutout({
  x,
  y,
  width,
  height,
  rx,
  cutoutRef,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  cutoutRef: (el: SVGRectElement | null) => void;
}) {
  const ref = useRef<SVGRectElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0 },
      { opacity: 1, duration: FADE_IN_MS / 1000, ease: "power1.out" },
    );
  }, []);

  return (
    <rect
      ref={(el) => {
        ref.current = el;
        cutoutRef(el);
      }}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      fill="black"
    />
  );
}

// One hotspot's tooltip + connector — split out from the container above so each
// gets its own title-measurement effect (rules of hooks: one component instance
// per array item, rather than hooks called in a loop inside a single component).
function ConnectorTooltip({
  rect,
  scale,
  hotspot,
  showInsight,
  wrapperRef,
}: {
  rect: Rect;
  scale: number;
  hotspot: AnnotationHotspotData;
  /** Renders `hotspot.insight` instead of `hotspot.body` — the Insights pass. */
  showInsight: boolean;
  /** Registers this instance's root node with the parent, which owns the
   *  fade-out/fade-in timing for the whole transition (see
   *  AnnotationConnectorHotspot above) — this component no longer animates
   *  its own opacity. */
  wrapperRef: (el: HTMLDivElement | null) => void;
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

  // Fades this card's tooltip + connector in on its own mount (the shared
  // spotlight scrim in the parent component is never remounted, so it stays
  // solid across card changes — only the tooltip content transitions). The
  // parent only reaches in to fade this OUT via wrapperRef/tooltipNodeRefs
  // (see AnnotationConnectorHotspot above) — fade-in has to happen here, tied
  // to this instance's actual mount, for the same reason FadeInCutout does:
  // the parent can't know when this element exists yet.
  const fadeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = fadeRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0 },
      { opacity: 1, duration: FADE_IN_MS / 1000, ease: "power1.out" },
    );
  }, []);

  return (
    <div
      ref={(el) => {
        fadeRef.current = el;
        wrapperRef(el);
      }}
    >
      <div
        className={styles.tooltip}
        style={{ left: tooltipLeft, top: tooltipTop }}
      >
        <span ref={titleRef} className={styles.title}>
          {hotspot.title}
        </span>
        <div className={styles.sections}>
          <div className={styles.section}>
            {/* Label (Assumption/Insight/Decision) hidden for now (this view
                only) — data untouched, just not rendered. showInsight swaps
                which field renders — the Insights pass re-walks the identical
                hotspots/groups as Intent, showing insight text instead. */}
            <p className={styles.text}>
              {showInsight ? hotspot.insight : hotspot.body}
            </p>
          </div>
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
    </div>
  );
}
