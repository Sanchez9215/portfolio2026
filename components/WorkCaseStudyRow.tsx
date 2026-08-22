/**
 * WorkCaseStudyRow — Home page Work section, first (and so far only) row.
 *
 * Figma node 641:7270 ("Portfolio Cleaning" file) supplied the row's layout
 * (fixed left column of title/description/CTAs, right column of meta/impact/
 * live embed, top-divider) — not its content or its static screenshot.
 * Copy is the real case study's own (`introContent.ts`, shared with
 * SectionIntroduction so the two can't drift). The embed is the real, live
 * `SoftwareExperienceEmbed` (with its own scripted ghost-cursor walkthrough)
 * in place of Figma's static screenshot.
 *
 * Entrance choreography mirrors SectionIntroduction's own timeline (title
 * rows staggered, description together, meta then impact in sequence, embed
 * fading/translating in parallel) — but fires on scroll into view instead of
 * on mount, since this row sits below the fold on Home.
 */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section from "@/components/Section";
import Block from "@/components/Block";
import Title from "@/components/Title";
import TitleBlock from "@/components/TitleBlock";
import GhostCursor from "@/components/case-studies/software-observability/GhostCursor";
import MessageBubble from "@/components/MessageBubble";
import SoftwareExperienceEmbed from "@/components/case-studies/software-observability/SoftwareExperienceEmbed";
import {
  introTitleLines,
  introDescription,
  introMeta,
  introImpact,
} from "@/components/case-studies/software-observability/introContent";
import styles from "./WorkCaseStudyRow.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Same beat shape as SectionIntroduction's TIMING, played on scroll-enter
// instead of on mount.
const TIMING = {
  titleDuration: 0.75,
  titleStagger: 0.35,
  descriptionStart: 0.6,
  descriptionDuration: 0.75,
  ctaStart: 0.85,
  ctaDuration: 0.5,
  metaStart: 0.85,
  metaDuration: 0.75,
  impactStart: 1.1,
  impactDuration: 0.75,
  embedStart: 1.1,
  embedDuration: 1,
  embedTravelDistance: 500,
  // Passed through to SoftwareExperienceEmbed as overrides so tweaking these
  // only affects this row's embed, not SectionIntroduction's usage on the
  // case study page. Values match SoftwareExperienceEmbed's own defaults
  // (TIMING.cursorFadeInMarkMs/cursorFadeInDuration) — unchanged until tuned.
  embedCursorFadeInMarkMs: 550,
  embedCursorFadeInDuration: 0.5,
  // Delay before the scripted walkthrough itself starts moving/clicking
  // (separate from the cursor fade-in above) — matches
  // SoftwareExperienceEmbed's own default (TIMING.sequenceStartMarkMs),
  // unchanged until tuned.
  embedSequenceStartMarkMs: 650,
};

// Toggled off for now — new content is being built for this space, and this
// cursor/bubble system is being kept intact (not deleted) to reuse elsewhere
// later. Flip back to true to re-enable.
const SHOW_POINTER_CURSOR = false;

// Large page-level ghost cursor — desktop-only (disabled ≤900px, see
// WorkCaseStudyRow.module.css's .pointerCursor), separate from
// SoftwareExperienceEmbed's own small internal walkthrough cursor.
const POINTER_SIZE = 180;
// Floor the cursor can shrink to (see the responsive-fit logic below) —
// below ~1330px there isn't room for POINTER_SIZE plus the bubble stack
// without overlapping the "Case Study" button, so the cursor scales down
// instead (the bubble text never does).
const MIN_POINTER_SIZE = 80;
// Tweakable: fraction of window.innerHeight the visitor's real mouse must
// pass (while the Work section is in view) before the cursor slides in.
const POINTER_TRIGGER_RATIO = 0.5;
// First-pass value, not yet tuned.
const POINTER_SLIDE_DURATION = 0.8;

// Message-bubble stack, revealed once the cursor lands (Figma node 796:930,
// same "Portfolio Cleaning" file). Copy + reveal order/timing restored from
// the old (now-removed) SoftwareExperienceEmbed Phase 4 bubble reveal.
// Last message is explicitly two lines (matches Figma's own authored break
// after "mirror") — not left to auto-wrap.
const BUBBLE_MESSAGES: React.ReactNode[] = [
  "This is a real end-to-end build.",
  "With a real design system.",
  "Real components, logic,",
  <>
    & simulated data to mirror
    <br />
    an actual deployment.
  </>,
];
// Bubble stack's top-left, relative to the cursor's own center point,
// expressed as a ratio of POINTER_SIZE so it scales if POINTER_SIZE changes.
// X was empirically retuned in devtools (188px at POINTER_SIZE=180 read more
// accurate than the raw Figma-derived value) — ratio back-derived from that.
const BUBBLE_OFFSET_X_RATIO = 0.367;
const BUBBLE_OFFSET_Y_RATIO = -1.424;
const BUBBLE_FADE_DURATION = 0.4;
const BUBBLE_STAGGER = 0.35;
const BUBBLE_PUSH_DURATION = 0.3;
// Gap kept between the (possibly shrunk) cursor and the bubble stack above
// it — matches the gap already visible before the responsive clamp kicks in.
const CURSOR_BUBBLE_GAP = 12;

export default function WorkCaseStudyRow() {
  // Gates SoftwareExperienceEmbed's internal ghost-cursor walkthrough behind
  // this row's own embedWrap fade-in starting (see the .call() below, fired
  // at TIMING.embedStart) — not finishing. SoftwareExperienceEmbed's own
  // hidden pre-warm pass (fonts/images/primeScroll) needs to run while the
  // embed is still low-opacity, same as it already does on SectionIntroduction
  // (where entranceReady defaults true from mount, concurrent with that
  // page's own fade-in) — gating on fade-in *finishing* let primeScroll's
  // instant scrollTop jump-and-back run after the embed was already fully
  // visible, which read as a glitch right after the entrance settled. Starts
  // false, flips once via the entrance timeline. Scoped to this component's
  // own SoftwareExperienceEmbed instance only; the case study page's own
  // usage (SectionIntroduction) doesn't pass this prop.
  const [entranceReady, setEntranceReady] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const pointerCursorRef = useRef<HTMLDivElement>(null);
  const bubbleStackRef = useRef<HTMLDivElement>(null);
  // Bubble stack grows one message at a time (messaging-app convention:
  // each new bubble pushes the earlier ones up) — restored from the old
  // (removed) SoftwareExperienceEmbed Phase 4 mechanism.
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const prevBubbleRectsRef = useRef<[HTMLElement, DOMRect][] | null>(null);
  // Hidden, always-fully-rendered copy of the stack — measured once for its
  // real height so the growing (bottom-anchored) stack's resting position
  // matches the already-approved full-stack position from bubble 1 onward.
  const bubbleMeasureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const titleEl = titleRef.current;
    const descriptionEl = descriptionRef.current;
    const ctaEl = ctaRef.current;
    const metaEl = metaRef.current;
    const impactEl = impactRef.current;
    const embedEl = embedRef.current;
    if (
      !titleEl ||
      !descriptionEl ||
      !ctaEl ||
      !metaEl ||
      !impactEl ||
      !embedEl
    )
      return;

    const ctx = gsap.context(() => {
      const titleRows = titleEl.querySelectorAll(`.${styles.titleRow}`);

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: titleEl,
          start: "top 80%",
          once: true,
        },
      });

      tl.to(titleRows, {
        opacity: 1,
        y: 0,
        duration: TIMING.titleDuration,
        stagger: TIMING.titleStagger,
      })
        .to(
          descriptionEl,
          { opacity: 1, y: 0, duration: TIMING.descriptionDuration },
          TIMING.descriptionStart,
        )
        .to(
          ctaEl.children,
          { opacity: 1, y: 0, duration: TIMING.ctaDuration },
          TIMING.ctaStart,
        )
        .to(
          metaEl,
          { opacity: 1, duration: TIMING.metaDuration },
          TIMING.metaStart,
        )
        .to(
          metaEl.children,
          { opacity: 1, y: 0, duration: TIMING.metaDuration },
          TIMING.metaStart,
        )
        .to(
          impactEl.children,
          { opacity: 1, y: 0, duration: TIMING.impactDuration },
          TIMING.impactStart,
        )
        .fromTo(
          embedEl,
          { y: TIMING.embedTravelDistance },
          { opacity: 1, y: 0, duration: TIMING.embedDuration },
          TIMING.embedStart,
        )
        .call(() => setEntranceReady(true), [], TIMING.embedStart)
        // Forces .embedWrap's transform to "none" once its own fade/
        // translate-in tween ends (at rest, y already 0 — visually a no-op).
        // Load-bearing for the expand-to-full-screen feature: any ancestor
        // with a transform becomes the containing block for a position:fixed
        // descendant. clearProps alone isn't enough here — .embedWrap's own
        // CSS class (WorkCaseStudyRow.module.css) bakes `transform:
        // translateY(24px)` into its base rule as the hidden-entrance state,
        // so clearing GSAP's inline override just reveals that class
        // transform again (still non-"none", still a containing block) —
        // an explicit inline "none" is required to actually remove it.
        .call(() => gsap.set(embedEl, { transform: "none" }));
    });

    return () => ctx.revert();
  }, []);

  // Hides the large pointer cursor immediately on mount — GhostCursor's raw
  // CSS position (top:0; left:0) would otherwise flash visible before the
  // effect below ever runs (same fix as SoftwareExperienceEmbed's own
  // cursor). useLayoutEffect so this resolves before first paint.
  useLayoutEffect(() => {
    const cursor = pointerCursorRef.current;
    if (!cursor) return;
    gsap.set(cursor, { opacity: 0 });
  }, []);

  // Captures each already-mounted bubble's current on-screen top position
  // right before adding a new one — the paired useLayoutEffect below diffs
  // old vs. new top and glides purely on Y, so the earlier bubbles read as
  // being pushed up by the new arrival (messaging-app convention) rather
  // than snapping to their new position.
  function captureBubbleRects() {
    const stack = bubbleStackRef.current;
    if (!stack) return;
    prevBubbleRectsRef.current = Array.from(stack.children).map((el) => [
      el as HTMLElement,
      (el as HTMLElement).getBoundingClientRect(),
    ]);
  }

  // Runs after each visibleBubbles-driven render: for every previously-
  // mounted bubble, diffs its captured top against its new (pushed-up) top
  // and glides purely on Y; the newest bubble (not in the captured list)
  // gets its own separate fade/slide-in.
  useLayoutEffect(() => {
    const prevRects = prevBubbleRectsRef.current;
    prevBubbleRectsRef.current = null;
    if (!prevRects) return;

    prevRects.forEach(([el, oldRect]) => {
      const newRect = el.getBoundingClientRect();
      const deltaY = oldRect.top - newRect.top;
      if (deltaY === 0) return;
      gsap.killTweensOf(el);
      gsap.fromTo(
        el,
        { y: deltaY },
        { y: 0, duration: BUBBLE_PUSH_DURATION, ease: "power2.out" },
      );
    });

    const stack = bubbleStackRef.current;
    const newest = stack?.lastElementChild as HTMLElement | null | undefined;
    if (newest) {
      gsap.fromTo(
        newest,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: BUBBLE_FADE_DURATION,
          ease: "power2.out",
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleBubbles]);

  // Large page-level ghost cursor: desktop-only (≤900px is a static check —
  // doesn't re-run on resize across the breakpoint, revisit if that matters
  // in practice), arms once the Work section scrolls into view (using
  // embedRef as a representative proxy — Section doesn't forward a ref of
  // its own), then waits for the visitor's real mouse to pass
  // POINTER_TRIGGER_RATIO down the viewport before sliding in from the
  // bottom-left corner to park flush against .work's own left/bottom
  // padding edges (--spacing-xl — the same token driving cs-grid's
  // padding-inline and .work's own padding-bottom), cursor edges (not
  // center) touching those bounds. Fires once; doesn't reverse.
  useEffect(() => {
    if (!SHOW_POINTER_CURSOR) return;
    const cursor = pointerCursorRef.current;
    const armTarget = embedRef.current;
    const bubbleStack = bubbleStackRef.current;
    const bubbleMeasure = bubbleMeasureRef.current;
    const ctaEl = ctaRef.current;
    const work = cursor?.parentElement;
    if (
      !cursor ||
      !armTarget ||
      !bubbleStack ||
      !bubbleMeasure ||
      !ctaEl ||
      !work
    )
      return;
    if (!window.matchMedia("(min-width: 901px)").matches) return;

    const spacingXl =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--spacing-xl",
        ),
      ) || 32;

    let armed = false;
    let fired = false;

    function slideIn() {
      const workRect = work!.getBoundingClientRect();

      // Desired (unclamped) position, computed at full POINTER_SIZE — the
      // reference the design was tuned against. +/- POINTER_SIZE/2
      // compensates for the cursor's own center-anchoring (xPercent/
      // yPercent: -50) so its *edges*, not its center, land flush at the
      // padding bounds.
      const targetY0 = workRect.height - spacingXl - POINTER_SIZE / 2;
      const desiredBubbleTop = targetY0 + POINTER_SIZE * BUBBLE_OFFSET_Y_RATIO;

      // Bubble text never scales — instead its top is clamped so it never
      // rises above spacingXl (--spacing-xl, 32px) below the "Case Study"
      // button's own bottom edge, regardless of how short .work gets.
      const primaryButton = ctaEl!.children[0] as HTMLElement | undefined;
      const buttonBottomY = primaryButton
        ? primaryButton.getBoundingClientRect().bottom - workRect.top
        : 0;
      const minBubbleTop = buttonBottomY + spacingXl;
      const bubbleTop = Math.max(desiredBubbleTop, minBubbleTop);
      const fullStackHeight = bubbleMeasure!.offsetHeight;
      const bubbleBottom = bubbleTop + fullStackHeight;

      // Cursor scales down (never below MIN_POINTER_SIZE) to whatever
      // vertical space remains below the bubble stack, so it never overlaps
      // it — while still landing flush at the same bottom-left padding
      // edges it always does, just smaller when space is tight.
      const availableForCursor =
        workRect.height - spacingXl - bubbleBottom - CURSOR_BUBBLE_GAP;
      const pointerSize = Math.min(
        POINTER_SIZE,
        Math.max(MIN_POINTER_SIZE, availableForCursor),
      );

      const targetX = spacingXl + pointerSize / 2;
      const targetY = workRect.height - spacingXl - pointerSize / 2;
      // Starts off past .work's own bottom-left corner (off-screen on both
      // axes, not just x) so the entrance reads as a diagonal traverse up
      // into the resting spot, not a horizontal slide along the same Y.
      // Safe off-screen on both axes — globals.css's body overflow-x: clip
      // absorbs the x overshoot, and .work has no overflow clip to catch
      // the y overshoot either.
      const startX = -pointerSize;
      const startY = workRect.height + pointerSize;

      // Bubble stack is anchored by `bottom`, not `top` — with `bottom`
      // fixed and the container's own height growing as bubbles are added,
      // the browser recomputes its top upward on every addition for free,
      // which is what makes earlier bubbles read as pushed up (see
      // captureBubbleRects + the paired useLayoutEffect above). Left still
      // tracks the cursor's actual (possibly shrunk) center, offset by the
      // fixed (always POINTER_SIZE-based) empirically-tuned ratio.
      gsap.set(bubbleStack, {
        left: targetX + POINTER_SIZE * BUBBLE_OFFSET_X_RATIO,
        bottom: workRect.height - bubbleTop - fullStackHeight,
      });

      gsap.set(cursor, {
        width: pointerSize,
        height: pointerSize,
        xPercent: -50,
        yPercent: -50,
        x: startX,
        y: startY,
        rotation: 45,
        opacity: 1,
      });
      gsap.to(cursor, {
        x: targetX,
        y: targetY,
        duration: POINTER_SLIDE_DURATION,
        ease: "power2.out",
        onComplete: () => {
          // Reveals one bubble at a time, each pushing the earlier ones up
          // (see captureBubbleRects + the paired useLayoutEffect above).
          const revealTl = gsap.timeline();
          BUBBLE_MESSAGES.forEach((_, i) => {
            revealTl.call(
              () => {
                captureBubbleRects();
                setVisibleBubbles(i + 1);
              },
              [],
              i === 0 ? 0 : `+=${BUBBLE_STAGGER}`,
            );
          });
        },
      });
    }

    function onMouseMove(e: MouseEvent) {
      if (!armed || fired) return;
      if (e.clientY <= window.innerHeight * POINTER_TRIGGER_RATIO) return;
      fired = true;
      window.removeEventListener("mousemove", onMouseMove);
      slideIn();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        armed = true;
        observer.disconnect();
      },
      { threshold: 0 },
    );
    observer.observe(armTarget);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <Section className={styles.work}>
      <div ref={leftRef} className={styles.left}>
        <div className={styles.intro}>
          <h2 ref={titleRef} className={styles.title}>
            {introTitleLines.map((line, i, arr) => (
              <span key={line}>
                <span className={styles.titleRow}>{line}</span>
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <Block size="lg" ref={descriptionRef} className={styles.description}>
            {introDescription}
          </Block>
        </div>
        <div ref={ctaRef} className={styles.ctaRow}>
          {/* Hidden until the case study is ready to link to publicly.
          <Button
            variant="primary"
            size={ctaButtonSize}
            href={CASE_STUDY_HREF}
            icon={<ArrowOutwardIcon />}
          >
            Case Study
          </Button> */}
          {/* <Button
            variant="secondary"
            size="large"
            href={CASE_STUDY_HREF}
            icon={<ArrowOutwardIcon />}
          >
            View Build
          </Button> */}
        </div>
      </div>

      <div className={styles.right}>
        <div ref={metaRef} className={styles.meta}>
          {introMeta.map((item) => {
            // Company's body is split so everything after "XOPS" can be
            // hidden at the ≤480px tier (see WorkCaseStudyRow.module.css).
            if (item.label !== "Company") {
              return (
                <TitleBlock
                  key={item.label}
                  size="xs"
                  titleColor="tertiary"
                  title={item.label}
                  body={item.body}
                />
              );
            }
            const [firstWord, ...rest] = item.body.split(" ");
            return (
              <TitleBlock
                key={item.label}
                size="xs"
                titleColor="tertiary"
                title={item.label}
                body={
                  <>
                    {firstWord}
                    <span className={styles.companyRest}>
                      {" "}
                      {rest.join(" ")}
                    </span>
                  </>
                }
              />
            );
          })}
        </div>
        <div ref={impactRef} className={styles.impact}>
          {introImpact.map((item) =>
            item.badge ? (
              <div key={item.heading} className={styles.impactItem}>
                <div className={styles.impactHeading}>
                  <Title size="sm">{item.heading}</Title>
                  <span className={styles.badge}>{item.badge}</span>
                </div>
                <Block size="sm" color="tertiary">
                  {item.body}
                </Block>
              </div>
            ) : (
              <TitleBlock
                key={item.heading}
                size="sm"
                title={item.heading}
                body={item.body}
              />
            ),
          )}
        </div>
        <div ref={embedRef} className={styles.embedWrap}>
          <SoftwareExperienceEmbed
            entranceReady={entranceReady}
            cursorFadeInMarkMs={TIMING.embedCursorFadeInMarkMs}
            cursorFadeInDuration={TIMING.embedCursorFadeInDuration}
            sequenceStartMarkMs={TIMING.embedSequenceStartMarkMs}
            enableExpandedView
          />
        </div>
      </div>
      {SHOW_POINTER_CURSOR && (
        <>
          <GhostCursor
            ref={pointerCursorRef}
            size={POINTER_SIZE}
            variant="outline"
            className={styles.pointerCursor}
          />
          <div ref={bubbleStackRef} className={styles.bubbleStack}>
            {BUBBLE_MESSAGES.slice(0, visibleBubbles).map((message, i) => (
              <MessageBubble key={i}>{message}</MessageBubble>
            ))}
          </div>
          {/* Hidden — full stack rendered purely to measure real height (see
              bubbleMeasureRef above); never shown, not part of the reveal. */}
          <div
            ref={bubbleMeasureRef}
            className={styles.bubbleStack}
            style={{ visibility: "hidden" }}
            aria-hidden="true"
          >
            {BUBBLE_MESSAGES.map((message, i) => (
              <MessageBubble key={i}>{message}</MessageBubble>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
