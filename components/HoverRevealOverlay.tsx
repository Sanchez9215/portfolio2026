"use client";

import { useEffect, useId, useState } from "react";
import styles from "./HoverRevealOverlay.module.css";
import type { Hotspot } from "./HotspotOverlay";

// Padding added around each measured target rect — same value HotspotOverlay's
// spotlight uses, for a consistent cutout feel between the two experiences.
const RECT_PADDING = 8;

interface HoverRevealOverlayProps {
  containerRef: React.RefObject<HTMLElement>;
  /** Whether the reveal is currently showing (e.g. the embed is hovered). */
  active: boolean;
  /** Every hotspot to cut a hole for, shown simultaneously — unlike HotspotOverlay,
   *  which spotlights one at a time on a scroll-driven sequence. */
  hotspots: Hotspot[];
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

// One cutout per hotspot — same target resolution as HotspotOverlay (targetIds →
// `[data-hotspot="id"]`, targetSelectors as a raw override, portalTargetIds resolved
// from `document` for portaled content, widthFromSelector overriding left/width to
// hug a container's real edges). Returns null when nothing on screen matches (e.g.
// a portal-only target, like a modal, that isn't currently open).
function cutoutForHotspot(hotspot: Hotspot, container: HTMLElement, containerRect: DOMRect): Rect | null {
  const containerIds = hotspot.targetIds ?? (hotspot.portalTargetIds ? [] : [hotspot.id]);
  const containerSelectors = hotspot.targetSelectors ?? containerIds.map((id) => `[data-hotspot="${id}"]`);
  const portalSelectors = (hotspot.portalTargetIds ?? []).map((id) => `[data-hotspot="${id}"]`);

  const containerRects = containerSelectors.map((selector) => {
    const matches = Array.from(container.querySelectorAll<HTMLElement>(selector));
    return boundingRect(matches, containerRect);
  });
  const portalRects = portalSelectors.map((selector) => {
    const matches = Array.from(document.querySelectorAll<HTMLElement>(selector));
    return boundingRect(matches, containerRect);
  });
  const targets = [...containerRects, ...portalRects].filter((r): r is Rect => r !== null);
  if (targets.length === 0) return null;

  let rect = targets[0];
  if (hotspot.widthFromSelector) {
    const frameEls = Array.from(container.querySelectorAll<HTMLElement>(hotspot.widthFromSelector));
    const frameRect = boundingRect(frameEls, containerRect);
    if (frameRect) rect = { ...rect, left: frameRect.left, width: frameRect.width };
  }
  return rect;
}

// Duotone target colors — white areas of the underlying content map to
// --surface-base (--color-grey-1100, #0B0B0D), black areas map to --color-grey-800
// (#555C66). Values below are each channel's 0–1 fraction, confirmed with the user
// rather than assumed. feComponentTransfer's 2-stop "table" lerps between them by
// the pixel's own (already-grayscaled) luminance value.
const DUOTONE_DARK = { r: 0.04314, g: 0.04314, b: 0.05098 }; // surface-base / grey-1100, output at luminance 1 (white)
const DUOTONE_GREY = { r: 0.33333, g: 0.36078, b: 0.4 }; // grey-800, output at luminance 0 (black)

// Covers the whole embed with a duotone-recolored version of whatever's actually
// behind it (via `backdrop-filter`, so no content duplication is needed), with one
// cutout hole per hotspot showing the real, unfiltered content through — everything
// *without* a hotspot attached reads as the duotone treatment, only the annotated
// elements/sections show their true colors. Unlike HotspotOverlay this isn't
// scroll-driven: every hotspot's cutout shows at once, gated purely by `active`
// (e.g. hover), with no tooltip content yet — a first pass on the reveal mechanic
// itself before content is layered in. Built/tested against Chrome; Safari doesn't
// support a custom SVG filter reference in `backdrop-filter` and will likely no-op it.
export default function HoverRevealOverlay({ containerRef, active, hotspots }: HoverRevealOverlayProps) {
  const maskId = useId();
  const filterId = useId();
  const [rects, setRects] = useState<Rect[]>([]);
  // Explicit pixel size for the mask's base fill rect — percentage width/height
  // resolves ambiguously in userSpaceOnUse content units when the mask is applied
  // to an HTML element via CSS `mask-image` (as opposed to referenced from inside
  // the same SVG), so the container's real measured size is used instead.
  const [containerSize, setContainerSize] = useState<Size | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return;

    const tick = () => {
      const containerRect = container.getBoundingClientRect();
      setContainerSize({ width: containerRect.width, height: containerRect.height });
      const next = hotspots
        .map((hotspot) => cutoutForHotspot(hotspot, container, containerRect))
        .filter((r): r is Rect => r !== null);
      setRects(next);
    };

    tick();
    const observer = new ResizeObserver(tick);
    observer.observe(container);
    window.addEventListener("resize", tick);

    // Live embeds can transform (LiveEmbed panning/scaling) without firing
    // ResizeObserver — remeasure every frame while active, same as HotspotOverlay.
    let frame = requestAnimationFrame(function loop() {
      tick();
      frame = requestAnimationFrame(loop);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", tick);
      cancelAnimationFrame(frame);
    };
  }, [containerRef, active, hotspots]);

  return (
    <div className={`${styles.overlay} ${active ? styles.visible : ""}`} aria-hidden={!active}>
      {/* defs-only SVG — not rendered itself, just holds the mask (cuts holes at
          hotspots) and the duotone filter (applied to the div below via backdrop-filter). */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <mask id={maskId} maskUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
            <rect x="0" y="0" width={containerSize?.width ?? 0} height={containerSize?.height ?? 0} fill="white" />
            {rects.map((r, i) => {
              const width = Math.max(r.width, 0);
              const height = Math.max(r.height, 0);
              const rx = Math.min(6, width / 2, height / 2);
              return <rect key={i} x={r.left} y={r.top} width={width} height={height} rx={rx} fill="black" />;
            })}
          </mask>
          {/* color-interpolation-filters="sRGB" is load-bearing — SVG filters default to
              computing in linear-light space, which would reinterpret the plain sRGB
              fractions below and gamma-encode the result back, lifting the darks well
              above the intended hex values (e.g. surface-base rendering as a washed-out
              grey instead of near-black). sRGB makes the table values match the hex
              colors they were computed from directly. */}
          <filter id={filterId} colorInterpolationFilters="sRGB">
            {/* Standard relative-luminance grayscale, written into every channel. */}
            <feColorMatrix
              type="matrix"
              values={`0.2126 0.7152 0.0722 0 0
                       0.2126 0.7152 0.0722 0 0
                       0.2126 0.7152 0.0722 0 0
                       0      0      0      1 0`}
            />
            {/* Remaps that grayscale value per channel: black → grey-700, white → grey-1000. */}
            <feComponentTransfer>
              <feFuncR type="table" tableValues={`${DUOTONE_GREY.r} ${DUOTONE_DARK.r}`} />
              <feFuncG type="table" tableValues={`${DUOTONE_GREY.g} ${DUOTONE_DARK.g}`} />
              <feFuncB type="table" tableValues={`${DUOTONE_GREY.b} ${DUOTONE_DARK.b}`} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <div
        className={styles.duotoneScrim}
        style={{
          // A backdrop-filter div with no paint of its own can composite as partially
          // washed out in some engines — this near-invisible background forces it into
          // its own proper paint layer so the filtered result renders at full strength.
          backgroundColor: "rgba(0, 0, 0, 0.01)",
          backdropFilter: `url(#${filterId})`,
          WebkitBackdropFilter: `url(#${filterId})`,
          maskImage: `url(#${maskId})`,
          WebkitMaskImage: `url(#${maskId})`,
        }}
      />
    </div>
  );
}
