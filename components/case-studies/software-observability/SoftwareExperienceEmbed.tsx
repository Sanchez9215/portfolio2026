"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { CustomWiggle } from "gsap/CustomWiggle";
import LiveEmbed from "@/components/LiveEmbed";
import GhostCursor from "./GhostCursor";
import Button from "@/components/Button";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import { AllSoftwareScreen } from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";
import type { SoftwareSubKey } from "@/design-systems/xops/components/Sidebar";
import styles from "./SoftwareExperienceEmbed.module.css";

gsap.registerPlugin(ScrollTrigger, CustomEase, CustomWiggle);
// Attention-getting shake for the cursor once it parks bottom-left — a small
// number of oscillations, easing out so it settles rather than snapping.
CustomWiggle.create("cursorWiggle", { wiggles: 6, type: "easeOut" });

const NATIVE_WIDTH = 1440;
const TARGET_SKU_LABEL = "Adobe Acrobat Pro";
const CURSOR_SIZE = 64;
const CURSOR_REST_INSET = 32;

// Layer Inspect reveal copy — exact text from Figma node 2:2 (Portfolio
// Cleaning file), each line its own bubble in the stack.
const REVEAL_MESSAGES = [
  "This is a real end-to-end build.",
  "With a real design system.",
  "Real components, logic,",
  "& simulated data to mirror an actual deployment.",
  "Click anywhere to explore or...",
];

// Live-tweak surface for the ghost-cursor scripted sequence — edit and save
// to see changes via Fast Refresh. "Ms" suffix = milliseconds (waitUntil/
// wait() marks and holds); no suffix = seconds (gsap tween durations).
const TIMING = {
  // Independent of SectionIntroduction's own entrance timing — tuned to
  // roughly land after the hero embed settles, not derived from it.
  cursorFadeInMarkMs: 2500,
  cursorFadeInDuration: 0.3,
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

  // Phase 4 — Layer Inspect reveal: cursor parks bottom-left, wiggles, embed
  // dims, bubbles + CTA fade up in sequence. First-pass values, not tuned.
  parkCursorDuration: 0.6,
  wiggleOutDuration: 0.5,
  wiggleSettleDuration: 0.2,
  embedDimDuration: 0.4,
  bubbleFadeDuration: 0.4,
  bubbleStagger: 0.35,
  bubblePushDuration: 0.3,
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

export default function SoftwareExperienceEmbed() {
  const [screen, setScreen] = useState<SoftwareSubKey>("overview");
  const [locked, setLocked] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });
  const runPhaseTwo = useRef(false);
  const stackRef = useRef<HTMLDivElement>(null);
  const prevRectsRef = useRef<[HTMLElement, DOMRect][] | null>(null);
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const [showCta, setShowCta] = useState(false);
  const walkthroughDoneRef = useRef(false);
  const scrollReachedRef = useRef(false);
  const phase4StartedRef = useRef(false);
  const canUnlockRef = useRef(false);

  // Fires Phase 4 (cursor park + wiggle + bubble/CTA reveal) once both gates
  // are true — the scripted walkthrough finishing and the visitor having
  // scrolled the embed's top edge under the nav — whichever lands second.
  function tryStartPhase4() {
    if (phase4StartedRef.current) return;
    if (!walkthroughDoneRef.current || !scrollReachedRef.current) return;
    phase4StartedRef.current = true;
    runPhase4();
  }

  // Captures each already-mounted bubble's current on-screen top position
  // right before adding a new one — the paired useLayoutEffect below diffs
  // old vs. new top and glides purely on Y (no Flip: matching size/scale as
  // well as position read as the bubbles "shuffling" rather than a clean
  // push-up, since each bubble's own box never actually changes size).
  function captureStackRects() {
    const stack = stackRef.current;
    if (!stack) return;
    prevRectsRef.current = Array.from(stack.children).map((el) => [
      el as HTMLElement,
      (el as HTMLElement).getBoundingClientRect(),
    ]);
  }

  function runPhase4() {
    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;
    if (!wrapper || !cursor) return;
    const { canvasEl } = getScrollEls(wrapper);

    const restX = CURSOR_REST_INSET + CURSOR_SIZE / 2;
    const restY = wrapper.clientHeight - CURSOR_REST_INSET - CURSOR_SIZE / 2;

    const tl = gsap.timeline();
    tl.add(moveCursorTo(restX, restY, TIMING.parkCursorDuration));
    tl.to(cursor, {
      rotation: 12,
      duration: TIMING.wiggleOutDuration,
      ease: "cursorWiggle",
    });
    tl.to(cursor, {
      rotation: 0,
      duration: TIMING.wiggleSettleDuration,
      ease: "power1.out",
    });
    tl.addLabel("reveal");
    if (canvasEl) {
      tl.to(
        canvasEl,
        { opacity: 0.75, duration: TIMING.embedDimDuration },
        "reveal",
      );
    }
    REVEAL_MESSAGES.forEach((_, i) => {
      tl.call(
        () => {
          captureStackRects();
          setVisibleBubbles(i + 1);
        },
        [],
        i === 0 ? "reveal" : `+=${TIMING.bubbleStagger}`,
      );
    });
    tl.call(
      () => {
        captureStackRects();
        setShowCta(true);
      },
      [],
      `+=${TIMING.bubbleStagger}`,
    );
    tl.call(() => {
      canUnlockRef.current = true;
    });
  }

  // Runs after each bubble/CTA-added render: for every previously-mounted
  // bubble, diffs its captured top against its new (pushed-up) top and
  // glides purely on Y — no scale/width interpolation, so it reads as a
  // clean push-up rather than the elements re-sizing/shuffling. The newest
  // bubble (not in the captured list) gets its own separate fade/slide-in.
  useLayoutEffect(() => {
    const prevRects = prevRectsRef.current;
    prevRectsRef.current = null;
    if (!prevRects) return;

    prevRects.forEach(([el, oldRect]) => {
      const newRect = el.getBoundingClientRect();
      const deltaY = oldRect.top - newRect.top;
      if (deltaY === 0) return;
      gsap.killTweensOf(el);
      gsap.fromTo(
        el,
        { y: deltaY },
        { y: 0, duration: TIMING.bubblePushDuration, ease: "power2.out" },
      );
    });

    const stack = stackRef.current;
    const newest = stack?.lastElementChild as HTMLElement | null | undefined;
    if (newest) {
      gsap.fromTo(
        newest,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: TIMING.bubbleFadeDuration,
          ease: "power2.out",
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleBubbles, showCta]);

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
    return gsap
      .timeline()
      .to(cursor, {
        scale: 0.85,
        duration: TIMING.clickBounceDownDuration,
        ease: "power2.out",
      })
      .to(cursor, {
        scale: 1,
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
    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;
    if (!wrapper || !cursor) return;

    let cancelled = false;
    const active: gsap.core.Tween[] = [];
    const track = (t: gsap.core.Tween) => {
      active.push(t);
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
      if (cancelled) return;
      log("fonts ready");
      await waitForEmbedReady(wrapper!);
      if (cancelled) return;
      log("embed canvas visible");
      await waitForImages(wrapper!);
      if (cancelled) return;
      log("images loaded");
      await nextFrame();
      if (cancelled) return;
      await nextFrame();
      if (cancelled) return;

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
      if (cancelled) return;
      log("prime scroll done");

      // Fade the cursor in at its resting position — timing mark is its own
      // tweakable number (TIMING.cursorFadeInMarkMs), not derived from
      // SectionIntroduction's entrance.
      await waitUntil(t0, TIMING.cursorFadeInMarkMs);
      if (cancelled) return;
      log("cursor fade-in start");
      await gsap
        .to(cursor, {
          opacity: 1,
          duration: TIMING.cursorFadeInDuration,
          ease: "power1.out",
        })
        .then();
      if (cancelled) return;

      // Scripted sequence starts at its own tweakable mark.
      await waitUntil(t0, TIMING.sequenceStartMarkMs);
      if (cancelled) return;
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
      if (cancelled) return;

      await wait(TIMING.holdAtLifecycleMs);
      if (cancelled) return;

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
      if (cancelled) return;

      const navButton = wrapper!.querySelector<HTMLElement>(
        '[data-hotspot="nav-all-software"]',
      );
      if (!navButton) return;
      const wrapperRect = wrapper!.getBoundingClientRect();
      const navRect = navButton.getBoundingClientRect();
      const navX = navRect.left + navRect.width / 2 - wrapperRect.left;
      const navY = navRect.top + navRect.height / 2 - wrapperRect.top;

      await moveCursorTo(navX, navY, TIMING.moveToNavDuration).then();
      if (cancelled) return;

      await clickBounce().then();
      if (cancelled) return;

      dispatchClick(navButton);
      runPhaseTwo.current = true;
      setScreen("all-software");
    }

    run();

    return () => {
      cancelled = true;
      active.forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: once All Software has mounted, move the cursor to the Adobe
  // Acrobat Pro row (no embed scroll — it's on page 1, already in view) and
  // click it to open the Software Profile panel. Phase 3 continues straight
  // on from there: hover Inactive Waste, hover Utilization Rate, scroll the
  // panel itself down to Inactive License Distribution, pause, scroll back
  // up, then unlock.
  useEffect(() => {
    if (screen !== "all-software" || !runPhaseTwo.current) return;
    runPhaseTwo.current = false;

    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;
    if (!wrapper || !cursor) return;

    let cancelled = false;
    const active: gsap.core.Tween[] = [];
    const track = (t: gsap.core.Tween) => {
      active.push(t);
      return t;
    };

    async function run() {
      await wait(TIMING.phase2StartDelayMs);
      if (cancelled) return;

      const row = findRowByText(wrapper!, TARGET_SKU_LABEL);
      if (!row) return;

      const wrapperRect = wrapper!.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const rowX = rowRect.left + rowRect.width * 0.3 - wrapperRect.left;
      const rowY = rowRect.top + rowRect.height / 2 - wrapperRect.top;

      await moveCursorTo(rowX, rowY, TIMING.moveToRowDuration).then();
      if (cancelled) return;

      await wait(TIMING.holdBeforeRowClickMs);
      if (cancelled) return;

      await clickBounce().then();
      if (cancelled) return;

      dispatchClick(row);

      // Phase 3 — panel is now open.
      const opportunityBreakdown = await waitForElement(() =>
        wrapper!.querySelector<HTMLElement>(
          '[data-hotspot="opportunity-breakdown"]',
        ),
      );
      if (cancelled || !opportunityBreakdown) return;

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
      if (cancelled) return;
      dispatchHover(inactiveWasteStat);
      await wait(TIMING.hoverHoldMs);
      if (cancelled) return;
      dispatchUnhover(inactiveWasteStat);

      // Hover Utilization Rate.
      point = hoverPointFor(
        utilizationRateStat,
        wrapper!.getBoundingClientRect(),
      );
      await moveCursorTo(point.x, point.y, TIMING.hoverMoveDuration).then();
      if (cancelled) return;
      dispatchHover(utilizationRateStat);
      await wait(TIMING.hoverHoldMs);
      if (cancelled) return;
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
      if (cancelled) return;

      await wait(TIMING.holdAtDistributionMs);
      if (cancelled) return;

      await track(
        gsap.to(panelScrollEl, {
          scrollTop: 0,
          duration: TIMING.scrollPanelUpDuration,
          ease: "power2.inOut",
        }),
      ).then();
      if (cancelled) return;

      // Walkthrough is done — hand off to Phase 4 (cursor parks bottom-left,
      // wiggles, bubbles reveal). Stays locked until the visitor clicks.
      walkthroughDoneRef.current = true;
      tryStartPhase4();
    }

    run();

    return () => {
      cancelled = true;
      active.forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Phase 4's other gate: fires once the embed's top edge actually scrolls
  // under the nav (no pin — tried without one first per this session's
  // direction). Independent of walkthrough completion; tryStartPhase4()
  // only proceeds once both gates are true.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const navHeight =
      document.querySelector("nav")?.getBoundingClientRect().height ?? 0;

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: `top top+=${navHeight}`,
      onEnter: () => {
        scrollReachedRef.current = true;
        tryStartPhase4();
      },
    });

    return () => trigger.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <LiveEmbed nativeWidth={NATIVE_WIDTH} scroll>
        {/* AllSoftwareScreen always mounts XOPS's SidePanel (even closed, just
            slid off-screen), whose overlay is position:fixed — LiveEmbed's
            .canvas transform makes it the containing block, but the ancestor
            .wrapper's overflow:hidden 2+ levels up doesn't reliably clip it
            across browsers. This wrapper is the direct parent instead, scoped
            to this one embed — not a LiveEmbed/SidePanel change. */}
        <div className={styles.screenClip}>
          {screen === "overview" ? (
            <OverviewScreen onNavigate={setScreen} showSecondaryCards={false} />
          ) : (
            <AllSoftwareScreen onNavigate={setScreen} />
          )}
        </div>
      </LiveEmbed>
      {locked && (
        <div
          className={styles.lockOverlay}
          aria-hidden="true"
          onClick={() => {
            if (canUnlockRef.current) setLocked(false);
          }}
        />
      )}
      <div ref={stackRef} className={styles.bubbleStack}>
        {REVEAL_MESSAGES.slice(0, visibleBubbles).map((text) => (
          <div key={text} className={styles.bubble}>
            <p className={styles.bubbleText}>{text}</p>
          </div>
        ))}
        {showCta && (
        <div className={styles.ctaWrap}>
          <Button
            variant="accent"
            onClick={() => {
              console.log(
                "[layer-inspect] CTA clicked — stacked-layer view not built yet",
              );
            }}
            icon={
              // Inlined from /icons/go-arrow.svg (was <img src>) — same
              // convention as MenuItem's go-arrow, currentColor resolves
              // from the button's own text color.
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{ width: "100%", height: "100%" }}
              >
                <mask
                  id="cta-go-arrow-mask"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="48"
                  height="48"
                >
                  <rect width="48" height="48" fill="#D9D9D9" />
                </mask>
                <g mask="url(#cta-go-arrow-mask)">
                  <path
                    d="M13.0825 36.9326L9.34996 33.2001L27.9 14.6501H11.6325V9.3501H36.9325V34.6501H31.6325V18.3826L13.0825 36.9326Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            }
          >
            See how it&apos;s built
          </Button>
        </div>
        )}
      </div>
      <GhostCursor ref={cursorRef} size={CURSOR_SIZE} />
    </div>
  );
}
