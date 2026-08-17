"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LiveEmbed.module.css";

interface LiveEmbedProps {
  children: React.ReactNode;
  nativeWidth: number;
  className?: string;
  /** Pins the container to a fixed height (a viewport window) instead of hugging the
   *  full content height — pair with `panTargetIds` to scroll the content inside it. */
  viewportHeight?: number;
  /** `data-hotspot` ids to vertically center within the viewport window (only used
   *  when `viewportHeight` is set). Null/omitted resets the pan to the top. */
  panTargetIds?: string[] | null;
  /** Free-scroll window mode: the container fills its parent's height and the
   *  scaled canvas scrolls naturally inside it (native overflow), instead of the
   *  transform-based `panTargetIds` pan. For a live, interactive embed the user
   *  scrolls through themselves — pair with a height-bounded parent. */
  scroll?: boolean;
  /** Suppresses .canvas's own CSS transition on transform — for callers driving
   *  the container's width/height via their own tween (e.g. SoftwareExperienceEmbed's
   *  expand/collapse), where the canvas's independent 500ms ease would otherwise
   *  keep chasing a moving scale target and read as staggered against the
   *  smoothly-tweening box. Off by default so plain resize (e.g. window resize)
   *  keeps its smoothing. */
  disableCanvasTransition?: boolean;
  /** `scroll` mode only. Drops the fixed-nativeWidth-then-scale-down technique
   *  entirely — children render at the container's real, natural width with no
   *  transform, so the app's own responsive CSS breakpoints respond to the
   *  actual viewport width instead of a uniformly scaled 1440px layout. For a
   *  caller that expands its container to real viewport size (e.g.
   *  SoftwareExperienceEmbed's full-screen expand) and wants the true design
   *  system at true size — not an enlarged/shrunk proportional copy of it. */
  disableScaling?: boolean;
}

// Renders children at a fixed reference width, then scales the whole canvas
// to fit the actual container width (measured live via ResizeObserver) — so a
// full desktop-sized live UI can sit inside a small card and re-scale if the
// card's width changes later.
//
// Without `viewportHeight`, the container hugs the content's real (scaled)
// height so nothing gets cropped. With `viewportHeight`, the container is
// pinned to that fixed height instead, and the canvas pans vertically inside
// it (via `panTargetIds`) so content taller than one viewport can still be
// brought into view without the container itself growing.
export default function LiveEmbed({ children, nativeWidth, className, viewportHeight, panTargetIds, scroll, disableCanvasTransition, disableScaling }: LiveEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [autoHeight, setAutoHeight] = useState<number | null>(null);
  const [panPx, setPanPx] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const update = () => {
      const width = container.getBoundingClientRect().width;
      if (!width) return;
      const nextScale = width / nativeWidth;
      setScale(nextScale);
      setAutoHeight(canvas.offsetHeight * nextScale);
    };

    update();
    const containerObserver = new ResizeObserver(update);
    containerObserver.observe(container);
    const canvasObserver = new ResizeObserver(update);
    canvasObserver.observe(canvas);
    return () => {
      containerObserver.disconnect();
      canvasObserver.disconnect();
    };
  }, [nativeWidth]);

  // Centers the pan target's bounding box in the viewport window. Uses the
  // offsetTop/offsetParent chain (unaffected by CSS transforms) rather than
  // getBoundingClientRect, since the canvas's own translateY would otherwise
  // feed back into the measurement it's computing.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !viewportHeight || !scale || !panTargetIds || panTargetIds.length === 0) {
      // Deliberately don't reset panPx to 0 here — this fires whenever the hotspot
      // sequence ends (panTargetIds goes null) as the pin releases and the section
      // scrolls away. Snapping the canvas back to the top at that exact moment reads
      // as the embed rescrolling; leaving the pan where it was and letting the
      // section scroll off-screen with it looks like a clean release instead.
      return;
    }

    const nativeOffsetTop = (el: HTMLElement): number => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node && node !== canvas) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return top;
    };

    let top = Infinity;
    let bottom = -Infinity;
    for (const id of panTargetIds) {
      canvas.querySelectorAll<HTMLElement>(`[data-hotspot="${id}"]`).forEach((el) => {
        const elTop = nativeOffsetTop(el);
        top = Math.min(top, elTop);
        bottom = Math.max(bottom, elTop + el.offsetHeight);
      });
    }
    if (top === Infinity) {
      setPanPx(0);
      return;
    }

    const screenCenterY = ((top + bottom) / 2) * scale;
    const canvasScaledHeight = canvas.offsetHeight * scale;
    const maxPan = Math.max(canvasScaledHeight - viewportHeight, 0);
    const desiredPan = screenCenterY - viewportHeight / 2;
    setPanPx(Math.min(Math.max(desiredPan, 0), maxPan));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panTargetIds?.join(","), scale, viewportHeight]);

  // Free-scroll window: container fills its (height-bounded) parent and scrolls
  // the scaled canvas natively. A sizer holds the *scaled* height so the native
  // scrollbar tracks the visible content, not the unscaled 1440-wide canvas box.
  if (scroll) {
    // Same DOM nodes in both modes — only inline styles toggle between them
    // (position/width/transform on .canvas, height on .sizer). Branching to
    // two differently-shaped JSX trees here previously made React unmount +
    // remount everything under {children} (the actual live app instance —
    // OverviewScreen/AllSoftwareScreen) on every disableScaling flip, which
    // read as a flash/glitch (real component-state loss + fresh mount, not
    // an asset-loading delay). Keeping one stable tree and only changing
    // style values lets React patch it in place instead.
    return (
      <div ref={containerRef} className={`${styles.scrollContainer} ${className ?? ""}`}>
        <div
          className={styles.sizer}
          style={disableScaling ? undefined : { height: autoHeight ?? undefined }}
        >
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={
              disableScaling
                ? // transition: "none" is load-bearing here — .canvas's own
                  // CSS class has `transition: transform 500ms ease`. Without
                  // overriding it, flipping this transform from the scaled
                  // branch's matrix(...) to "none" gets smoothly animated by
                  // that class rule instead of applying instantly, which
                  // looked exactly like the content lagging behind the box's
                  // own (GSAP-driven, un-eased-by-CSS) width growth.
                  { position: "static", width: "100%", transform: "none", transition: "none" }
                : {
                    width: nativeWidth,
                    transform: scale ? `scale(${scale})` : undefined,
                    visibility: scale ? "visible" : "hidden",
                    transition: disableCanvasTransition ? "none" : undefined,
                  }
            }
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  const containerHeight = viewportHeight ?? autoHeight ?? undefined;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className ?? ""}`}
      style={containerHeight ? { height: containerHeight } : undefined}
    >
      <div
        ref={canvasRef}
        className={styles.canvas}
        style={{
          width: nativeWidth,
          transform: scale ? `translateY(${-panPx}px) scale(${scale})` : undefined,
          visibility: scale ? "visible" : "hidden",
          transition: disableCanvasTransition ? "none" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
