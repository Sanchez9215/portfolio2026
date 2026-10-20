"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Label from "@/components/Label";
import styles from "./PrototypeTabs.module.css";

// Question-row pills: one shared hover pill and one shared selected pill sit
// behind the segments. A pill fades in on its segment, stretches edge by edge
// when it moves (the leading edge goes first, the trailing edge follows after
// a short lag) and fades out when released. Clicking the hovered segment
// turns the hover pill's color into the selected color.
const PILL_STRETCH_DURATION = 0.45;
const PILL_STRETCH_EASE = "power3.out";
const PILL_TRAILING_DELAY = 0.08;
const PILL_FADE_DURATION = 0.3;
const PILL_FADE_EASE = "power2.inOut";

interface PillState {
  el: HTMLElement | null;
  l: number;
  r: number;
  // Where the pill is supposed to be (shown) vs. its current rendered opacity.
  shown: boolean;
  alpha: number;
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderPill(pill: PillState) {
  if (!pill.el) return;
  gsap.set(pill.el, {
    x: pill.l,
    width: Math.max(0, pill.r - pill.l),
    autoAlpha: pill.alpha,
  });
}

function movePill(pill: PillState, target: { l: number; r: number } | null) {
  const instant = prefersReducedMotion();
  const fade = {
    duration: instant ? 0 : PILL_FADE_DURATION,
    ease: PILL_FADE_EASE,
    onUpdate: () => renderPill(pill),
  };
  gsap.killTweensOf(pill);
  if (!target) {
    pill.shown = false;
    gsap.to(pill, { alpha: 0, ...fade });
    return;
  }
  pill.shown = true;
  // Fully faded out: reappear in place instead of traveling from wherever it
  // last was.
  if (pill.alpha === 0) {
    pill.l = target.l;
    pill.r = target.r;
    renderPill(pill);
  }
  gsap.to(pill, { alpha: 1, ...fade });
  const travel = (target.l + target.r) / 2 - (pill.l + pill.r) / 2;
  if (Math.abs(travel) < 0.5) return;
  const leading = travel > 0 ? "r" : "l";
  const trailing = leading === "r" ? "l" : "r";
  const stretchEdge = (edge: "l" | "r", delay: number) =>
    gsap.to(pill, {
      [edge]: target[edge],
      duration: instant ? 0 : PILL_STRETCH_DURATION,
      ease: PILL_STRETCH_EASE,
      delay: instant ? 0 : delay,
      onUpdate: () => renderPill(pill),
    });
  stretchEdge(leading, 0);
  stretchEdge(trailing, PILL_TRAILING_DELAY);
}

interface PrototypeTabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  items: readonly string[];
  /** Index of the selected tab, or null when none is selected. */
  value: number | null;
  /** Clicking the selected tab again clears it (null). */
  onChange: (value: number | null) => void;
  /** false = always one tab selected: no close icon, and clicking the selected
   *  tab does nothing. Default true. */
  deselectable?: boolean;
}

export default function PrototypeTabs({
  items,
  value,
  onChange,
  deselectable = true,
  className,
  ...rest
}: PrototypeTabsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverPill = useRef<PillState>({
    el: null,
    l: 0,
    r: 0,
    shown: false,
    alpha: 0,
  });
  const selectPill = useRef<PillState>({
    el: null,
    l: 0,
    r: 0,
    shown: false,
    alpha: 0,
  });
  const hoverIndexRef = useRef<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const hasMounted = useRef(false);

  const segmentBounds = (i: number) => {
    const el = segmentRefs.current[i];
    return el ? { l: el.offsetLeft, r: el.offsetLeft + el.offsetWidth } : null;
  };

  // Selection: the selected pill takes over from the hover pill (its color
  // turns from the hover color into the selected color), stretches when the
  // selection moves, and fades out when cleared (revealing the hover pill if
  // the cursor is still on that segment). Label colors follow.
  useEffect(() => {
    const select = selectPill.current;
    const hover = hoverPill.current;
    selectedRef.current = value;
    const row = rowRef.current;
    // Selected on first render (e.g. a row that always has one tab selected):
    // show the selected pill and its dark label immediately, no fade-in, and
    // keep it glued once fonts have loaded and the labels settle.
    if (!hasMounted.current && value !== null && row) {
      hasMounted.current = true;
      const place = () => {
        const bounds = segmentBounds(value);
        if (!bounds) return;
        select.l = bounds.l;
        select.r = bounds.r;
        select.shown = true;
        select.alpha = 1;
        renderPill(select);
      };
      place();
      document.fonts?.ready?.then(place);
      const computed = getComputedStyle(row);
      const onPill = computed.getPropertyValue("--surface-base").trim();
      segmentRefs.current.forEach((segment, i) => {
        const label = segment?.firstElementChild;
        if (label && i === value) gsap.set(label, { color: onPill });
      });
      return;
    }
    if (value === null) {
      const hovered = hoverIndexRef.current;
      if (hovered !== null) movePill(hover, segmentBounds(hovered));
      movePill(select, null);
    } else {
      const bounds = segmentBounds(value);
      if (
        bounds &&
        select.alpha === 0 &&
        hover.shown &&
        hoverIndexRef.current === value &&
        select.el &&
        hover.el
      ) {
        gsap.killTweensOf(select);
        select.l = bounds.l;
        select.r = bounds.r;
        select.shown = true;
        select.alpha = 1;
        renderPill(select);
        const hoverColor = getComputedStyle(hover.el).backgroundColor;
        const selectedColor = getComputedStyle(select.el).backgroundColor;
        gsap.fromTo(
          select.el,
          { backgroundColor: hoverColor },
          {
            backgroundColor: selectedColor,
            duration: prefersReducedMotion() ? 0 : PILL_FADE_DURATION,
            ease: PILL_FADE_EASE,
            clearProps: "backgroundColor",
          },
        );
      } else {
        movePill(select, bounds);
      }
    }
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (!row) return;
    const computed = getComputedStyle(row);
    const onPill = computed.getPropertyValue("--surface-base").trim();
    const resting = computed.getPropertyValue("--text-secondary").trim();
    segmentRefs.current.forEach((segment, i) => {
      const label = segment?.firstElementChild;
      if (!label) return;
      gsap.to(label, {
        color: i === value ? onPill : resting,
        duration: prefersReducedMotion() ? 0 : PILL_STRETCH_DURATION,
        ease: PILL_STRETCH_EASE,
        overwrite: "auto",
      });
    });
  }, [value]);

  // Keep the selected pill glued to its segment when the row resizes.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const hover = hoverPill.current;
    const select = selectPill.current;
    const observer = new ResizeObserver(() => {
      const index = selectedRef.current;
      const bounds = index === null ? null : segmentBounds(index);
      if (!bounds || !select.shown) return;
      gsap.killTweensOf(select);
      select.l = bounds.l;
      select.r = bounds.r;
      renderPill(select);
    });
    observer.observe(row);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(hover);
      gsap.killTweensOf(select);
    };
  }, []);

  return (
    <div
      {...rest}
      ref={rowRef}
      className={`${styles.tabs}${className ? ` ${className}` : ""}`}
      onPointerLeave={() => {
        hoverIndexRef.current = null;
        movePill(hoverPill.current, null);
      }}
    >
      <span
        ref={(el) => {
          hoverPill.current.el = el;
        }}
        className={`${styles.pill} ${styles.pillHover}`}
        aria-hidden
      />
      <span
        ref={(el) => {
          selectPill.current.el = el;
        }}
        className={`${styles.pill} ${styles.pillSelected}`}
        aria-hidden
      />
      {items.map((label, i) => (
        <button
          key={label}
          ref={(el) => {
            segmentRefs.current[i] = el;
          }}
          type="button"
          className={styles.tab}
          aria-pressed={value === i}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            hoverIndexRef.current = i;
            movePill(hoverPill.current, segmentBounds(i));
          }}
          onClick={() => {
            if (value === i) {
              if (deselectable) onChange(null);
            } else onChange(i);
          }}
        >
          <Label size="sm" color="secondary">
            {label}
          </Label>
          {value === i && deselectable && (
            <span className={styles.close} aria-hidden>
              <img src="/icons/close.svg" alt="" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
