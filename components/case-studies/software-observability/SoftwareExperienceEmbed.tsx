"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import LiveEmbed from "@/components/LiveEmbed";
import GhostCursor from "./GhostCursor";
import EmbedBanner from "./EmbedBanner";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import { AllSoftwareScreen } from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";
import type { SoftwareSubKey } from "@/design-systems/xops/components/Sidebar";
import styles from "./SoftwareExperienceEmbed.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
}

const NATIVE_WIDTH = 1440;
const TARGET_SKU_LABEL = "Adobe Acrobat Pro";
const CURSOR_SIZE = 64;

// Live-tweak surface for the ghost-cursor scripted sequence — edit and save
// to see changes via Fast Refresh. "Ms" suffix = milliseconds (waitUntil/
// wait() marks and holds); no suffix = seconds (gsap tween durations).
const TIMING = {
  // Independent of SectionIntroduction's own entrance timing — tuned to
  // roughly land after the hero embed settles, not derived from it.
  cursorFadeInMarkMs: 2500,
  cursorFadeInDuration: 0.3,
  cursorFadeOutDuration: 0.3,
  sequenceStartMarkMs: 3500,

  // Phase 1 — Overview: scroll to Lifecycle table, scroll back, click "All Software".
  scrollToLifecycleDuration: 1.3,
  holdAtLifecycleMs: 700,
  scrollBackUpDuration: 1.1,
  moveToNavDuration: 0.7,

  // Shared click-bounce (used by both phases).
  clickBounceDownDuration: 0.12,
  clickBounceUpDuration: 0.18,

  // Phase 2 — All Software: click Adobe Acrobat Pro row, hover stats, scroll panel.
  phase2StartDelayMs: 500,
  moveToRowDuration: 0.8,
  holdBeforeRowClickMs: 400,
  hoverMoveDuration: 0.6,
  hoverHoldMs: 700,
  scrollPanelDownDuration: 1.1,
  holdAtDistributionMs: 500,
  scrollPanelUpDuration: 1,

  // Expanded-view banner + take-over (enableExpandedView only) — first-pass
  // values, not yet tuned. Sequence: bannerStartDelayMs (from entranceReady)
  // → slide up over bannerEnterDuration → hold bannerHoldMs → slide out over
  // bannerExitDuration.
  bannerStartDelayMs: 0,
  bannerEnterDuration: 0.3,
  bannerHoldMs: 2550,
  bannerExitDuration: 0.3,
  takeOverGlideDuration: 0.6,
  expandDuration: 0.6,
  collapseDuration: 0.6,
};

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// Walks the offsetParent chain to get an element's top position relative to
// a boundary ancestor, in that ancestor's own (unscaled) layout coordinate
// space — same technique LiveEmbed itself uses internally for panTargetIds.
function offsetTopWithin(el: HTMLElement, boundary: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== boundary) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function getScrollEls(wrapper: HTMLElement) {
  const scrollEl = wrapper.querySelector<HTMLElement>(
    '[class*="scrollContainer"]',
  );
  const canvasEl = wrapper.querySelector<HTMLElement>('[class*="canvas"]');
  return { scrollEl, canvasEl };
}

// Walks up from a target to find its nearest actually-scrollable ancestor
// (e.g. SidePanel's own overflow-y:auto content region) — distinct from the
// outer LiveEmbed scroll container.
function findScrollableAncestor(
  el: HTMLElement,
  boundary: HTMLElement,
): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== boundary) {
    const style = window.getComputedStyle(node);
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function dispatchClick(el: HTMLElement) {
  const opts = { bubbles: true, cancelable: true, view: window };
  el.dispatchEvent(new MouseEvent("pointerdown", opts));
  el.dispatchEvent(new MouseEvent("mousedown", opts));
  el.dispatchEvent(new MouseEvent("pointerup", opts));
  el.dispatchEvent(new MouseEvent("mouseup", opts));
  el.dispatchEvent(new MouseEvent("click", opts));
}

function dispatchHover(el: HTMLElement) {
  const opts = {
    bubbles: true,
    cancelable: true,
    view: window,
    relatedTarget: document.body,
  };
  el.dispatchEvent(new MouseEvent("pointerover", opts));
  el.dispatchEvent(new MouseEvent("mouseover", opts));
  el.dispatchEvent(new MouseEvent("pointermove", opts));
  el.dispatchEvent(new MouseEvent("mousemove", opts));
}

function dispatchUnhover(el: HTMLElement) {
  const opts = {
    bubbles: true,
    cancelable: true,
    view: window,
    relatedTarget: document.body,
  };
  el.dispatchEvent(new MouseEvent("pointerout", opts));
  el.dispatchEvent(new MouseEvent("mouseout", opts));
}

// Finds the table row whose text content matches a product name — the shared
// XOPS Table component deliberately has no per-row hotspot hook (same reason
// the All Software hotspot embeds target columns structurally instead), so
// this is a text-content lookup rather than a data attribute.
function findRowByText(wrapper: HTMLElement, text: string): HTMLElement | null {
  const rows = wrapper.querySelectorAll<HTMLElement>("tbody tr");
  for (const row of Array.from(rows)) {
    if (row.textContent?.includes(text)) return row;
  }
  return null;
}

// Polls for an element to appear (panel content mounts on a React state
// update we don't control directly — no ref/callback exposed for it).
async function waitForElement(
  query: () => HTMLElement | null,
  {
    attempts = 10,
    interval = 100,
  }: { attempts?: number; interval?: number } = {},
): Promise<HTMLElement | null> {
  for (let i = 0; i < attempts; i++) {
    const el = query();
    if (el) return el;
    await wait(interval);
  }
  return null;
}

// LiveEmbed computes its scale/height via ResizeObserver asynchronously and
// keeps its canvas visibility:hidden until that's done. Waiting on a fixed
// timeout instead of this real signal is what caused the first scroll's
// glitchiness — the scroll target was being measured before LiveEmbed's own
// layout had actually settled.
async function waitForEmbedReady(
  wrapper: HTMLElement,
  attempts = 40,
  interval = 50,
): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const canvasEl = wrapper.querySelector<HTMLElement>('[class*="canvas"]');
    if (canvasEl && window.getComputedStyle(canvasEl).visibility === "visible")
      return true;
    await wait(interval);
  }
  return false;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

// Confirmed via real timing/frame-rate instrumentation (not guessed): the
// first scroll into the Lifecycle Stage table was stalling because that
// region had never been painted before — browsers defer rasterizing
// off-screen content, and the first scroll into it forces that paint work
// synchronously (~350ms stall observed). Jumping scrollTop there and back
// instantly, before the visible sequence starts, forces that paint to
// happen once, ahead of time, so the real scripted scroll later is just
// compositing an already-painted layer.
function primeScroll(scrollEl: HTMLElement, targetY: number): Promise<void> {
  return new Promise((resolve) => {
    scrollEl.scrollTop = targetY;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollEl.scrollTop = 0;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
    });
  });
}

// Waits until `targetMs` has elapsed since `t0` — used to land the cursor
// fade-in and sequence start on SectionIntroduction's own entrance-animation
// marks (1.25s, 1.5s) regardless of how long the readiness gate above took.
function waitUntil(t0: number, targetMs: number): Promise<void> {
  const remaining = targetMs - (performance.now() - t0);
  return remaining > 0 ? wait(remaining) : Promise.resolve();
}

// Late-loading <img> tags (LogoTile logos) change row/card heights after
// paint, which retriggers LiveEmbed's own ResizeObserver mid-scroll — and
// because its canvas has a CSS `transition: transform 500ms ease`, that
// retrigger animates on top of our own scroll tween. Waiting for every image
// to actually finish loading (not just a fixed delay) removes that race.
function waitForImages(wrapper: HTMLElement): Promise<void> {
  const imgs = Array.from(wrapper.querySelectorAll("img"));
  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    let remaining = pending.length;
    const done = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
    };
    pending.forEach((img) => {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  });
}

interface SoftwareExperienceEmbedProps {
  /** Gates the ghost-cursor walkthrough's start (t0 for its own internal
   *  timing marks, e.g. TIMING.cursorFadeInMarkMs) behind an external
   *  entrance animation finishing first — e.g. WorkCaseStudyRow's own
   *  embedWrap fade-in on Home. Defaults to true (start immediately on
   *  mount) so SectionIntroduction's usage — tuned to its own entrance,
   *  see the Phase 1 effect's comments — is unaffected. */
  entranceReady?: boolean;
  /** Overrides TIMING.cursorFadeInMarkMs (delay, from entranceReady flipping
   *  true, before the cursor starts fading in) for this usage only — e.g.
   *  WorkCaseStudyRow tunes its own value independent of SectionIntroduction.
   *  Defaults to TIMING.cursorFadeInMarkMs. */
  cursorFadeInMarkMs?: number;
  /** Overrides TIMING.cursorFadeInDuration (how long the fade itself takes)
   *  for this usage only. Defaults to TIMING.cursorFadeInDuration. */
  cursorFadeInDuration?: number;
  /** Overrides TIMING.sequenceStartMarkMs (delay, from entranceReady flipping
   *  true, before the scripted walkthrough itself starts moving/clicking —
   *  separate from the cursor's own fade-in mark) for this usage only.
   *  Defaults to TIMING.sequenceStartMarkMs. */
  sequenceStartMarkMs?: number;
  /** Turns on the bottom-left EmbedBanner + click-anywhere-to-take-over +
   *  expand-to-full-screen behavior. Home's WorkCaseStudyRow only, for now —
   *  defaults false so SectionIntroduction's case-study-page usage is
   *  completely unaffected. */
  enableExpandedView?: boolean;
}

export default function SoftwareExperienceEmbed({
  entranceReady = true,
  cursorFadeInMarkMs = TIMING.cursorFadeInMarkMs,
  cursorFadeInDuration = TIMING.cursorFadeInDuration,
  sequenceStartMarkMs = TIMING.sequenceStartMarkMs,
  enableExpandedView = false,
}: SoftwareExperienceEmbedProps = {}) {
  const [screen, setScreen] = useState<SoftwareSubKey>("overview");
  const [locked, setLocked] = useState(true);
  const [expanded, setExpanded] = useState(false);
  // Drives LiveEmbed's disableScaling (true responsive-layout mode) — set
  // true the instant expand() starts (same moment as `expanded`), but false
  // the instant collapse() *starts* rather than in its onComplete like
  // `expanded`/`expandedRef` are. Deliberately decoupled from `expanded`:
  // that state also re-arms the position-sync loop (see the effect below,
  // gated on `expanded`), which must NOT re-arm until the collapse tween has
  // actually finished (arming early fights the tween — see that effect's own
  // comment). If this flipped back to scaled-canvas mode only at collapse's
  // end (i.e. shared `expanded`), the whole shrink animation would play in
  // real-responsive-layout mode and snap to the scaled-canvas layout in one
  // frame right as it settled — a visible glitch. Flipping it at collapse's
  // start instead means the shrink plays out entirely in scaled-canvas mode
  // (which LiveEmbed already re-scales live every frame via ResizeObserver,
  // same mechanism `disableCanvasTransition` exists to keep glitch-free for),
  // so it's one continuous scale-down with no mode swap at the end.
  const [trueSizeMode, setTrueSizeMode] = useState(false);
  // True only while expand()/collapse()'s GSAP tween is actually running —
  // see LiveEmbed's disableCanvasTransition prop.
  const [canvasTransitionDisabled, setCanvasTransitionDisabled] =
    useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });
  const runPhaseTwo = useRef(false);
  const containerScaleRef = useRef(1);
  // Shared across both walkthrough-phase effects so an external interrupt
  // (takeOver, below) can cancel whichever phase is currently running —
  // each phase's async run() checks this on every await, same as its own
  // local `cancelled` flag.
  const takenOverRef = useRef(false);
  const activeTweensRef = useRef<gsap.core.Tween[]>([]);
  const expandedRef = useRef(false);
  const bannerTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const expandTweenRef = useRef<gsap.core.Tween | null>(null);
  // In-flow stand-in for .wrapper's normal grid position (enableExpandedView
  // only) — .wrapper itself gets portaled to document.body so it can escape
  // .embedWrap's overflow:hidden, which clips a position:fixed descendant's
  // paint regardless of the transform/containing-block issue (a separate,
  // additional constraint) — same reason AlertsPanel/SidePanel/Tooltip all
  // portal to document.body elsewhere in this codebase.
  const placeholderRef = useRef<HTMLDivElement>(null);
  const syncRafRef = useRef<number | null>(null);
  // Starts false on both server AND client's first render (matches
  // Tooltip.tsx's proven-safe portal convention elsewhere in this codebase)
  // — flips true in an effect below, one render later. That means every
  // other effect that reads wrapperRef/bannerRef/cursorRef.current directly
  // and only runs once (empty deps, or [enableExpandedView] which never
  // changes) must ALSO depend on canPortal and re-check it, or it'll see
  // null on that first run and never get a second chance — a ref becoming
  // non-null later doesn't by itself retrigger an effect. Look for
  // `canPortal` in each such effect's guard/deps below.
  const [canPortal, setCanPortal] = useState(false);
  useEffect(() => {
    if (!enableExpandedView) return;
    console.log("[embed-expand] canPortal flipping true");
    setCanPortal(true);
  }, [enableExpandedView]);

  // Hides the cursor immediately on mount, independent of entranceReady —
  // the Phase 1 effect below waits on that gate before running at all, so
  // without this the cursor sat visible at its raw CSS position (top:0;
  // left:0, see GhostCursor.module.css) for the whole gated wait, only
  // hidden once Phase 1 finally ran. useLayoutEffect (not useEffect) so this
  // resolves before first paint — no flash.
  useLayoutEffect(() => {
    if (enableExpandedView && !canPortal) return; // content (and cursor) not portaled yet
    const cursor = cursorRef.current;
    if (!cursor) return;
    gsap.set(cursor, { opacity: 0 });
  }, [enableExpandedView, canPortal]);

  // Hides the banner immediately on mount (enableExpandedView only) — same
  // "parent owns position via forwarded ref, hide before first paint"
  // convention as the cursor above.
  useLayoutEffect(() => {
    if (!enableExpandedView || !canPortal) return;
    const banner = bannerRef.current;
    if (!banner) return;
    gsap.set(banner, { yPercent: 100 });
  }, [enableExpandedView, canPortal]);

  // Hides the portaled .wrapper itself before first paint (enableExpandedView
  // only) — once portaled to document.body it's a completely separate DOM
  // node from .embedWrap, so it no longer inherits .embedWrap's own opacity
  // fade-in (opacity doesn't cascade through a portal); without this it
  // rendered instantly at full opacity the moment it mounted, ahead of
  // WorkCaseStudyRow's entrance animation. The sync loop below takes over
  // once running, mirroring .embedWrap's live opacity every frame.
  useLayoutEffect(() => {
    if (!enableExpandedView || !canPortal) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    gsap.set(wrapper, { opacity: 0 });
  }, [enableExpandedView, canPortal]);

  // Keeps the portaled .wrapper's fixed position glued to the in-flow
  // placeholder's real rect every frame — this is what makes the expand
  // feature work at all despite .embedWrap's overflow:hidden (see
  // placeholderRef's comment above). Paused while expanded (collapse()'s
  // tween re-arms it in its onComplete, once the box is genuinely back at
  // rest — arming it any earlier would fight the collapse tween, since this
  // loop's gsap.set would keep snapping the box back to the placeholder's
  // rect every frame instead of letting it ease there smoothly).
  useEffect(() => {
    if (!enableExpandedView || !canPortal || expanded) return;
    const wrapper = wrapperRef.current;
    const placeholder = placeholderRef.current;
    if (!wrapper || !placeholder) return;
    console.log("[embed-expand] sync loop starting", {
      placeholderRect: placeholder.getBoundingClientRect(),
      wrapperParent: wrapper.parentElement,
    });

    function sync() {
      const rect = placeholder!.getBoundingClientRect();
      // Mirrors .embedWrap's (placeholder's direct parent) live computed
      // opacity onto the portaled wrapper every frame — the only thing
      // position-tracking above doesn't already cover, since opacity
      // doesn't cascade through a portal the way it would to a normal
      // descendant. Falls back to "1" (no ancestor, or opacity not set).
      const ancestorOpacity = placeholder!.parentElement
        ? getComputedStyle(placeholder!.parentElement).opacity
        : "1";
      gsap.set(wrapper, {
        position: "fixed",
        left: 0,
        top: 0,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        opacity: ancestorOpacity,
        // Explicit low z-index even in the normal (non-expanded) synced
        // state — portaled to document.body and appended last, so with
        // z-index left at "auto" it could paint above content it shouldn't
        // near other stacked/fixed elements. Well below Nav's --z-nav (100).
        zIndex: 1,
      });
      syncRafRef.current = requestAnimationFrame(sync);
    }
    syncRafRef.current = requestAnimationFrame(sync);

    return () => {
      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current);
    };
  }, [enableExpandedView, canPortal, expanded]);

  // Keeps the ghost cursor's rendered size in step with the embed's own
  // scale-down. GhostCursor is a sibling of LiveEmbed (not inside its scaled
  // .canvas — see GhostCursor.tsx), so its size never shrinks with the
  // prototype on its own; CURSOR_SIZE is defined at native (1440px) scale.
  // Mirrors LiveEmbed's own ResizeObserver-driven scale calc. clickBounce()
  // below reads containerScaleRef rather than tweening scale to an absolute
  // 0.85/1 — GSAP's scale is a single shared transform property, so an
  // absolute tween there would silently wipe out this container-relative
  // value once it completes.
  useEffect(() => {
    if (enableExpandedView && !canPortal) return; // content not portaled yet
    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;
    if (!wrapper || !cursor) return;

    const updateScale = () => {
      const width = wrapper.getBoundingClientRect().width;
      if (!width) return;
      containerScaleRef.current = width / NATIVE_WIDTH;
      gsap.set(cursor, { scale: containerScaleRef.current });
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [enableExpandedView, canPortal]);

  // Fades the small embed cursor out and releases the interaction lock once
  // the scripted walkthrough itself finishes — no park/wiggle/bubble reveal
  // anymore (that attention-getting handoff moved to a separate, larger
  // page-level cursor owned by WorkCaseStudyRow).
  function finishWalkthrough() {
    const cursor = cursorRef.current;
    if (cursor) {
      gsap.to(cursor, {
        opacity: 0,
        duration: TIMING.cursorFadeOutDuration,
        ease: "power1.out",
      });
    }
    setLocked(false);
  }

  // Interrupts the scripted walkthrough (enableExpandedView only — see
  // .lockOverlay's onClick and expand() below, which also calls this).
  // Cancels whichever phase effect is currently running (both check
  // takenOverRef on every await), kills any tweens they had in flight, glides
  // the cursor off past the wrapper's top-right corner (clipped out of view
  // by .wrapper's own overflow:hidden — no separate fade needed, it just
  // exits the visible box), and unlocks real interaction immediately rather
  // than waiting for the glide to finish.
  function takeOver() {
    if (takenOverRef.current || !locked) return;
    takenOverRef.current = true;
    activeTweensRef.current.forEach((t) => t.kill());
    activeTweensRef.current = [];

    const cursor = cursorRef.current;
    const wrapper = wrapperRef.current;
    if (cursor && wrapper) {
      gsap.to(cursor, {
        x: wrapper.clientWidth + CURSOR_SIZE,
        y: -CURSOR_SIZE,
        duration: TIMING.takeOverGlideDuration,
        ease: "power2.in",
      });
    }
    setLocked(false);
  }

  // Expands the embed to fill the viewport — real width/height growth (not
  // transform:scale, same reasoning as TheProblemPinnedScene: scale would
  // distort the live app's real DOM content), but position moves via x/y
  // transform aliases rather than left/top so only width/height touch layout
  // (gsap-performance guidance). Body scroll locks for the duration so the
  // captured restRect stays valid for collapse() without re-measuring.
  function expand() {
    const wrapper = wrapperRef.current;
    if (!wrapper || expandedRef.current) return;
    takeOver(); // expanding is itself a form of taking over, per direction

    // Stop the sync loop immediately (imperative, not just via the effect's
    // `expanded` dependency) so it can't fight this tween on the frame
    // between calling setExpanded(true) and React actually re-running effects.
    if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current);

    const rect = wrapper.getBoundingClientRect();

    expandTweenRef.current?.kill();
    gsap.set(wrapper, {
      position: "fixed",
      left: 0,
      top: 0,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      zIndex: 9999, // matches CaseStudyCursor's established "above everything, including nav" value
      willChange: "transform, width, height",
    });
    if (bannerTimelineRef.current) bannerTimelineRef.current.kill();
    const banner = bannerRef.current;
    setCanvasTransitionDisabled(true);

    expandTweenRef.current = gsap.to(wrapper, {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      duration: TIMING.expandDuration,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(wrapper, { willChange: "auto" });
        setCanvasTransitionDisabled(false);
        // Banner comes up only once the box has genuinely finished growing
        // to full width/height — not concurrently, which read as the
        // banner arriving before the screen had actually finished resizing.
        if (banner) {
          gsap.to(banner, {
            yPercent: 0,
            duration: TIMING.bannerEnterDuration,
            ease: "power3.out",
          });
        }
      },
    });

    document.body.style.overflow = "hidden";
    expandedRef.current = true;
    setExpanded(true);
    setTrueSizeMode(true);
  }

  // Reverses expand() back to the placeholder's current resting rect
  // (re-measured fresh, not the stale restRectRef — more robust against e.g.
  // a window resize while expanded), then clears the inline fixed-position
  // styles and re-arms the sync loop.
  function collapse() {
    const wrapper = wrapperRef.current;
    const placeholder = placeholderRef.current;
    if (!wrapper || !expandedRef.current || !placeholder) return;

    // Switch back to scaled-canvas mode right now, before the shrink tween
    // even starts — see trueSizeMode's own comment above for why this can't
    // wait for the tween's onComplete the way expandedRef/setExpanded do.
    setTrueSizeMode(false);

    const rest = placeholder.getBoundingClientRect();
    const restBorderRadius = getComputedStyle(document.documentElement)
      .getPropertyValue("--border-radius-sm")
      .trim();

    gsap.set(wrapper, { willChange: "transform, width, height" });
    expandTweenRef.current?.kill();
    setCanvasTransitionDisabled(true);
    expandTweenRef.current = gsap.to(wrapper, {
      x: rest.left,
      y: rest.top,
      width: rest.width,
      height: rest.height,
      borderRadius: restBorderRadius || 0,
      duration: TIMING.collapseDuration,
      ease: "power3.inOut",
      onComplete: () => {
        // Re-glue explicitly to freshly-measured placeholder coordinates —
        // same property set the sync loop's own sync() writes every frame —
        // instead of clearProps. clearProps strips positioning entirely,
        // and the sync loop that would normally re-glue it only re-arms once
        // `expanded` flips false and React re-runs the gated effect, which
        // is at least one render + effect cycle later than this synchronous
        // callback. In that gap the portaled wrapper had no position at all
        // and fell back to wherever the browser default-flowed it — a real
        // jump-then-jump-back, not a rendering artifact. Landing on the
        // sync loop's own values up front means its first real frame, once
        // it re-arms, computes the same rect and is a no-op.
        const finalRect = placeholder.getBoundingClientRect();
        gsap.set(wrapper, {
          position: "fixed",
          left: 0,
          top: 0,
          x: finalRect.left,
          y: finalRect.top,
          width: finalRect.width,
          height: finalRect.height,
          zIndex: 1,
          borderRadius: restBorderRadius || 0,
          willChange: "auto",
        });
        setCanvasTransitionDisabled(false);
        // Only now re-arm the sync loop (via the `expanded` dependency
        // below) — any earlier and it would fight this very tween.
        expandedRef.current = false;
        setExpanded(false);
      },
    });

    const banner = bannerRef.current;
    if (banner) {
      gsap.to(banner, {
        yPercent: 100,
        duration: TIMING.bannerExitDuration,
        ease: "power3.in",
      });
    }

    document.body.style.overflow = "";
  }

  function handleBannerToggle() {
    if (expandedRef.current) collapse();
    else expand();
  }

  // Banner enter → hold → exit, once, right when the embed's own entrance
  // settles (entranceReady flipping true — see WorkCaseStudyRow). One
  // timeline with labels (gsap-timeline guidance) instead of chained
  // delays; killed/overridden by expand()'s own persistent-show tween if the
  // visitor expands before the auto-hide would've fired.
  useEffect(() => {
    if (!enableExpandedView || !entranceReady) return;
    const banner = bannerRef.current;
    if (!banner) return;

    const tl = gsap.timeline();
    tl.addLabel("enter", TIMING.bannerStartDelayMs / 1000)
      .to(
        banner,
        {
          yPercent: 0,
          duration: TIMING.bannerEnterDuration,
          ease: "power3.out",
        },
        "enter",
      )
      .addLabel("exit", `+=${TIMING.bannerHoldMs / 1000}`)
      .to(
        banner,
        {
          yPercent: 100,
          duration: TIMING.bannerExitDuration,
          ease: "power3.in",
        },
        "exit",
      );
    bannerTimelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [enableExpandedView, entranceReady]);

  // Escape collapses full screen — standard convention for a viewport-filling
  // overlay (enableExpandedView only).
  useEffect(() => {
    if (!enableExpandedView) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && expandedRef.current) collapse();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableExpandedView]);

  // Hovering the embed also reveals the banner (video-player-control-bar
  // convention), independent of the auto-show-once-on-settle timeline above —
  // pauses that timeline so the two don't fight, and does nothing while
  // already expanded (banner is persistently shown there regardless).
  useEffect(() => {
    if (!enableExpandedView || !canPortal) return;
    const wrapper = wrapperRef.current;
    const banner = bannerRef.current;
    if (!wrapper || !banner) return;

    function onEnter() {
      console.log("[embed-expand] hover enter fired");
      if (expandedRef.current) return;
      bannerTimelineRef.current?.pause();
      gsap.to(banner, {
        yPercent: 0,
        duration: TIMING.bannerEnterDuration,
        ease: "power3.out",
      });
    }
    function onLeave() {
      console.log("[embed-expand] hover leave fired");
      if (expandedRef.current) return;
      gsap.to(banner, {
        yPercent: 100,
        duration: TIMING.bannerExitDuration,
        ease: "power3.in",
      });
    }
    console.log("[embed-expand] hover listeners attached", { wrapper, banner });
    wrapper.addEventListener("mouseenter", onEnter);
    wrapper.addEventListener("mouseleave", onLeave);
    return () => {
      wrapper.removeEventListener("mouseenter", onEnter);
      wrapper.removeEventListener("mouseleave", onLeave);
    };
  }, [enableExpandedView, canPortal]);

  // Glides the cursor to a wrapper-relative point, tilting slightly toward
  // the direction of travel (subtle, not a full face-the-direction rotation —
  // this is a pointer icon, not an arrow glyph).
  function moveCursorTo(x: number, y: number, duration: number) {
    const cursor = cursorRef.current;
    if (!cursor) return gsap.timeline();
    const dx = x - cursorPos.current.x;
    const dy = y - cursorPos.current.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const rotation = Math.max(-18, Math.min(18, angle * 0.15));
    cursorPos.current = { x, y };
    return gsap.to(cursor, { x, y, rotation, duration, ease: "power2.inOut" });
  }

  function clickBounce() {
    const cursor = cursorRef.current;
    if (!cursor) return gsap.timeline();
    const base = containerScaleRef.current;
    return gsap
      .timeline()
      .to(cursor, {
        scale: base * 0.85,
        duration: TIMING.clickBounceDownDuration,
        ease: "power2.out",
      })
      .to(cursor, {
        scale: base,
        duration: TIMING.clickBounceUpDuration,
        ease: "power2.out",
      });
  }

  // Point relative to the wrapper, near a target's bottom-left — so the
  // cursor reads as pointing at the stat without its 48px icon sitting on
  // top of the actual value/label text.
  function hoverPointFor(target: HTMLElement, wrapperRect: DOMRect) {
    const rect = target.getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.15 - wrapperRect.left,
      y: rect.top + rect.height * 0.85 - wrapperRect.top,
    };
  }

  // Phase 1: brief static hold on Overview, scroll down to the Lifecycle
  // Stage table, scroll back up, then click the Sidebar's "All Software" item.
  useEffect(() => {
    if (enableExpandedView && !canPortal) return; // content not portaled yet
    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;
    if (!wrapper || !cursor || !entranceReady) return;

    let cancelled = false;
    const track = (t: gsap.core.Tween) => {
      activeTweensRef.current.push(t);
      return t;
    };

    async function run() {
      const t0 = performance.now();
      const log = (label: string) =>
        console.log(
          `[ghost-cursor] +${(performance.now() - t0).toFixed(0)}ms ${label}`,
        );
      const centerX = wrapper!.clientWidth / 2;
      const initialY = 128;
      cursorPos.current = { x: centerX, y: initialY };
      gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        x: centerX,
        y: initialY,
        rotation: 0,
        opacity: 0,
      });
      // Hidden pre-warm pass: readiness gate + priming scroll, all while
      // SectionIntroduction's own entrance animation is still playing (the
      // hero embed itself is still fading in), so none of this is visible.
      if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
      if (cancelled || takenOverRef.current) return;
      log("fonts ready");
      await waitForEmbedReady(wrapper!);
      if (cancelled || takenOverRef.current) return;
      log("embed canvas visible");
      await waitForImages(wrapper!);
      if (cancelled || takenOverRef.current) return;
      log("images loaded");
      await nextFrame();
      if (cancelled || takenOverRef.current) return;
      await nextFrame();
      if (cancelled || takenOverRef.current) return;

      const { scrollEl, canvasEl } = getScrollEls(wrapper!);
      const lifecycleEl = wrapper!.querySelector<HTMLElement>(
        '[data-hotspot="stage-level-alerting"]',
      );
      if (!scrollEl || !canvasEl || !lifecycleEl) return;

      const scale = scrollEl.clientWidth / NATIVE_WIDTH;
      const targetTop = offsetTopWithin(lifecycleEl, canvasEl) * scale;
      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      const scrollDownTo = Math.min(targetTop - 96, maxScroll);

      await primeScroll(scrollEl, scrollDownTo);
      if (cancelled || takenOverRef.current) return;
      log("prime scroll done");

      // Fade the cursor in at its resting position — timing mark is its own
      // tweakable number (cursorFadeInMarkMs, defaults to
      // TIMING.cursorFadeInMarkMs), not derived from SectionIntroduction's
      // entrance.
      await waitUntil(t0, cursorFadeInMarkMs);
      if (cancelled || takenOverRef.current) return;
      log("cursor fade-in start");
      await gsap
        .to(cursor, {
          opacity: 1,
          duration: cursorFadeInDuration,
          ease: "power1.out",
        })
        .then();
      if (cancelled || takenOverRef.current) return;

      // Scripted sequence starts at its own tweakable mark (defaults to
      // TIMING.sequenceStartMarkMs).
      await waitUntil(t0, sequenceStartMarkMs);
      if (cancelled || takenOverRef.current) return;
      log("scripted sequence start");

      await Promise.all([
        track(
          gsap.to(scrollEl, {
            scrollTop: scrollDownTo,
            duration: TIMING.scrollToLifecycleDuration,
            ease: "power2.inOut",
          }),
        ).then(),
        moveCursorTo(
          centerX,
          wrapper!.clientHeight * 0.7,
          TIMING.scrollToLifecycleDuration,
        ).then(),
      ]);
      if (cancelled || takenOverRef.current) return;

      await wait(TIMING.holdAtLifecycleMs);
      if (cancelled || takenOverRef.current) return;

      await Promise.all([
        track(
          gsap.to(scrollEl, {
            scrollTop: 0,
            duration: TIMING.scrollBackUpDuration,
            ease: "power2.inOut",
          }),
        ).then(),
        moveCursorTo(
          centerX,
          wrapper!.clientHeight * 0.35,
          TIMING.scrollBackUpDuration,
        ).then(),
      ]);
      if (cancelled || takenOverRef.current) return;

      const navButton = wrapper!.querySelector<HTMLElement>(
        '[data-hotspot="nav-all-software"]',
      );
      if (!navButton) return;
      const wrapperRect = wrapper!.getBoundingClientRect();
      const navRect = navButton.getBoundingClientRect();
      const navX = navRect.left + navRect.width / 2 - wrapperRect.left;
      const navY = navRect.top + navRect.height / 2 - wrapperRect.top;

      await moveCursorTo(navX, navY, TIMING.moveToNavDuration).then();
      if (cancelled || takenOverRef.current) return;

      await clickBounce().then();
      if (cancelled || takenOverRef.current) return;

      dispatchClick(navButton);
      runPhaseTwo.current = true;
      setScreen("all-software");
    }

    run();

    return () => {
      cancelled = true;
      activeTweensRef.current.forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entranceReady,
    cursorFadeInMarkMs,
    cursorFadeInDuration,
    sequenceStartMarkMs,
    enableExpandedView,
    canPortal,
  ]);

  // Phase 2: once All Software has mounted, move the cursor to the Adobe
  // Acrobat Pro row (no embed scroll — it's on page 1, already in view) and
  // click it to open the Software Profile panel. Phase 3 continues straight
  // on from there: hover Inactive Waste, hover Utilization Rate, scroll the
  // panel itself down to Inactive License Distribution, pause, scroll back
  // up, then unlock.
  useEffect(() => {
    if (enableExpandedView && !canPortal) return; // content not portaled yet
    if (screen !== "all-software" || !runPhaseTwo.current) return;
    runPhaseTwo.current = false;

    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;
    if (!wrapper || !cursor) return;

    let cancelled = false;
    const track = (t: gsap.core.Tween) => {
      activeTweensRef.current.push(t);
      return t;
    };

    async function run() {
      await wait(TIMING.phase2StartDelayMs);
      if (cancelled || takenOverRef.current) return;

      const row = findRowByText(wrapper!, TARGET_SKU_LABEL);
      if (!row) return;

      const wrapperRect = wrapper!.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const rowX = rowRect.left + rowRect.width * 0.3 - wrapperRect.left;
      const rowY = rowRect.top + rowRect.height / 2 - wrapperRect.top;

      await moveCursorTo(rowX, rowY, TIMING.moveToRowDuration).then();
      if (cancelled || takenOverRef.current) return;

      await wait(TIMING.holdBeforeRowClickMs);
      if (cancelled || takenOverRef.current) return;

      await clickBounce().then();
      if (cancelled || takenOverRef.current) return;

      dispatchClick(row);

      // Phase 3 — panel is now open.
      const opportunityBreakdown = await waitForElement(() =>
        wrapper!.querySelector<HTMLElement>(
          '[data-hotspot="opportunity-breakdown"]',
        ),
      );
      if (cancelled || takenOverRef.current || !opportunityBreakdown) return;

      const inactiveWasteStat = opportunityBreakdown.children[0] as
        | HTMLElement
        | undefined;
      const statusTags = wrapper!.querySelector<HTMLElement>(
        '[data-hotspot="status-tags"]',
      );
      const utilizationRateStat = statusTags?.children[2] as
        | HTMLElement
        | undefined;
      const distributionSection = wrapper!.querySelector<HTMLElement>(
        '[data-hotspot="department-breakdown-chart"]',
      );
      if (!inactiveWasteStat || !utilizationRateStat || !distributionSection)
        return;

      // Hover Inactive Waste.
      let point = hoverPointFor(
        inactiveWasteStat,
        wrapper!.getBoundingClientRect(),
      );
      await moveCursorTo(point.x, point.y, TIMING.hoverMoveDuration).then();
      if (cancelled || takenOverRef.current) return;
      dispatchHover(inactiveWasteStat);
      await wait(TIMING.hoverHoldMs);
      if (cancelled || takenOverRef.current) return;
      dispatchUnhover(inactiveWasteStat);

      // Hover Utilization Rate.
      point = hoverPointFor(
        utilizationRateStat,
        wrapper!.getBoundingClientRect(),
      );
      await moveCursorTo(point.x, point.y, TIMING.hoverMoveDuration).then();
      if (cancelled || takenOverRef.current) return;
      dispatchHover(utilizationRateStat);
      await wait(TIMING.hoverHoldMs);
      if (cancelled || takenOverRef.current) return;
      dispatchUnhover(utilizationRateStat);

      // Scroll the panel itself (not the outer embed) down to the
      // distribution section.
      const panelScrollEl = findScrollableAncestor(
        distributionSection,
        wrapper!,
      );
      if (!panelScrollEl) return;

      const targetTop = offsetTopWithin(distributionSection, panelScrollEl);
      const maxPanelScroll =
        panelScrollEl.scrollHeight - panelScrollEl.clientHeight;
      const panelScrollDownTo = Math.min(
        Math.max(targetTop - 24, 0),
        maxPanelScroll,
      );

      await Promise.all([
        track(
          gsap.to(panelScrollEl, {
            scrollTop: panelScrollDownTo,
            duration: TIMING.scrollPanelDownDuration,
            ease: "power2.inOut",
          }),
        ).then(),
        moveCursorTo(
          cursorPos.current.x,
          cursorPos.current.y - 60,
          TIMING.scrollPanelDownDuration,
        ).then(),
      ]);
      if (cancelled || takenOverRef.current) return;

      await wait(TIMING.holdAtDistributionMs);
      if (cancelled || takenOverRef.current) return;

      await track(
        gsap.to(panelScrollEl, {
          scrollTop: 0,
          duration: TIMING.scrollPanelUpDuration,
          ease: "power2.inOut",
        }),
      ).then();
      if (cancelled || takenOverRef.current) return;

      // Walkthrough is done — fade the cursor out and unlock the embed.
      finishWalkthrough();
    }

    run();

    return () => {
      cancelled = true;
      activeTweensRef.current.forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, enableExpandedView, canPortal]);

  const content = (
    <div ref={wrapperRef} className={styles.wrapper}>
      <LiveEmbed
        nativeWidth={NATIVE_WIDTH}
        scroll
        disableCanvasTransition={canvasTransitionDisabled}
        disableScaling={enableExpandedView && trueSizeMode}
      >
        {screen === "overview" ? (
          <OverviewScreen
            onNavigate={setScreen}
            showSecondaryCards={false}
            embedded
          />
        ) : (
          <AllSoftwareScreen onNavigate={setScreen} embedded />
        )}
      </LiveEmbed>
      {locked && (
        <div
          className={
            enableExpandedView
              ? `${styles.lockOverlay} ${styles.lockOverlayClickable}`
              : styles.lockOverlay
          }
          aria-hidden="true"
          onClick={enableExpandedView ? takeOver : undefined}
        />
      )}
      <GhostCursor ref={cursorRef} size={CURSOR_SIZE} />
      {enableExpandedView && (
        <EmbedBanner
          ref={bannerRef}
          expanded={expanded}
          onToggle={handleBannerToggle}
        />
      )}
    </div>
  );

  if (!enableExpandedView) return content;

  // Placeholder reserves .embedWrap's normal in-flow space (sized 100%/100%
  // by WorkCaseStudyRow.module.css's `.embedWrap > *` rule, same as .wrapper
  // itself used to be) — the real, interactive .wrapper is portaled to
  // document.body so it can go truly fixed/full-viewport without being
  // clipped by .embedWrap's overflow:hidden (see placeholderRef's comment).
  return (
    <>
      <div ref={placeholderRef} />
      {canPortal && createPortal(content, document.body)}
    </>
  );
}
