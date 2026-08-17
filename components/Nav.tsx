/**
 * Nav
 *
 * Sticky full-viewport overlay nav. Fixed at top; expands on open to fill
 * the screen. Menu items are direct children of <nav> itself (no separate
 * card/wrapper) — nav's own overflow:hidden + locked collapsed height is
 * what clips them out of view when closed, same as it always clipped the
 * old card. Each item flex-grows to evenly split the full expanded height.
 *
 * Header row rebuilt from Figma node 572:1787 ("Portfolio Cleaning" file) —
 * plain-text "Edgar Sanchez" wordmark (Label, no logo mark) + a bare-text
 * "Menu"/"Close" trigger (Button variant="text" size="small"). Expand/collapse
 * mechanism below is unchanged, still from the original nodes 273:439
 * (nav-button) + 274:75 (nav) — Claude-Code file.
 * Tokens: nav.* + surface.* + motion.* (design-system/tokens.json)
 * Spec:   components/components.md → nav
 *
 * Open animation sequence (GSAP):
 *   1. Nav container → 100dvh       (TIMING.expandDuration)
 *   2. Each MenuItem staggers in:   (TIMING.itemsDuration)
 *        • wrapper opacity 0→1 (border appears)
 *        • label span slides up 50ms later
 *
 * Close animation: nav shrinks back to header height; no interior exit animation.
 *
 * Easing: power2.inOut ≈ cubic-bezier(0.4, 0, 0.2, 1)
 *
 * TIMING is a live-tweak surface, same pattern as SectionIntroduction /
 * WorkCaseStudyRow — edit and save to see changes via Fast Refresh.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import Button from "./Button";
import Label from "./Label";
import styles from "./Nav.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MorphSVGPlugin);
}

// Raw path data for the mobile trigger's burger↔close morph — sourced from
// public/icons/burgericon.svg / close.svg. Kept as raw strings (not hidden
// DOM refs) since MorphSVGPlugin's morphSVG value accepts path data directly.
const BURGER_PATH_D = "M3 7V5H21V7H3ZM3 19V17H21V19H3ZM3 13V11H21V13H3Z";
const CLOSE_PATH_D =
  "M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z";

/* ── Nav links ─────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "mailto:edgar.sanchez9215@gmail.com" },
] as const;

// go-arrow icon — inlined for currentColor, same convention as
// MenuItem/Hero/WorkCaseStudyRow/SoftwareExperienceEmbed. Reused here since
// this replaces MenuItem's own usage of the same icon.
function GoArrowIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <mask
        id="nav-go-arrow-mask"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="48"
        height="48"
      >
        <rect width="48" height="48" fill="#D9D9D9" />
      </mask>
      <g mask="url(#nav-go-arrow-mask)">
        <path
          d="M13.0825 36.9326L9.34996 33.2001L27.9 14.6501H11.6325V9.3501H36.9325V34.6501H31.6325V18.3826L13.0825 36.9326Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

/* ── Timing ─────────────────────────────────────────────────── */

const TIMING = {
  expandDuration: 0.35,
  itemsDuration: 0.35,
  itemsDelay: 0.15,
  itemsStagger: 0.25,
  itemsFadeOutDuration: 0.15,
};

/* ── Helpers ────────────────────────────────────────────────── */

// Finds the visible label span inside a menu item's Button(variant="menu").
// Document order of <span>s in that markup is: [0] menuDefaultFace (outer),
// [1] its label span, [2] menuHoverFace (outer), [3] faceField, [4] its
// label span, [5] faceBadge — index 1 is always the default-face label,
// the one this entrance/exit animation targets.
function getLabelSpan(item: HTMLDivElement): HTMLElement | undefined {
  return item.querySelectorAll("span")[1] as HTMLElement | undefined;
}

/* ── Component ──────────────────────────────────────────────── */

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const collapsedHeight = useRef<number>(0);
  const morphPathRef = useRef<SVGPathElement>(null);

  /* ── Mount: capture collapsed height, prep GSAP initial states ── */
  useEffect(() => {
    if (!navRef.current) return;

    // Lock nav to its natural (header-only) height as an explicit px value
    // so GSAP can interpolate from it.
    collapsedHeight.current = navRef.current.offsetHeight;
    gsap.set(navRef.current, { height: collapsedHeight.current });

    // Publish the *measured* collapsed height to --nav-height so every consumer
    // (main padding, sticky offsets like the prototype labels, JS readers) lines
    // up exactly with the real nav instead of the static token estimate.
    document.documentElement.style.setProperty(
      "--nav-height",
      `${collapsedHeight.current}px`,
    );

    // Prep each wrapper's label span: opacity-0 + y-offset ready for entrance.
    // The wrapper divs are already at opacity-0 via CSS (.menuItemWrapper).
    itemRefs.current.forEach((item) => {
      if (!item) return;
      const labelSpan = getLabelSpan(item);
      if (labelSpan) gsap.set(labelSpan, { opacity: 0, y: 8 });
    });
  }, []);

  /* ── Open ───────────────────────────────────────────────────── */
  const handleOpen = () => {
    setIsOpen(true);
    tlRef.current?.kill();

    const durExpand = TIMING.expandDuration;
    const durItems = TIMING.itemsDuration;
    const delayItems = TIMING.itemsDelay;
    const stagger = TIMING.itemsStagger;
    // Easing: power2.inOut ≈ cubic-bezier(0.4, 0, 0.2, 1)
    const ease = "power2.inOut";

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Step 1 — Nav container expands to full viewport height
    tl.to(navRef.current, {
      height: "100dvh",
      duration: durExpand,
      ease,
    });

    // Mobile trigger's icon morphs burger → close in parallel with Step 1
    if (morphPathRef.current) {
      tl.to(
        morphPathRef.current,
        { morphSVG: CLOSE_PATH_D, duration: durExpand, ease },
        0,
      );
    }

    // Step 2 — Each MenuItem staggers in: border first, then label slides up
    itemRefs.current.forEach((item, i) => {
      if (!item) return;
      const labelSpan = getLabelSpan(item);
      const t = durExpand + delayItems + i * stagger;

      // Border appears: wrapper opacity 0 → 1
      tl.to(item, { opacity: 1, duration: 0.12, ease: "none" }, t);

      // Label fades up 50ms after border
      if (labelSpan) {
        tl.to(
          labelSpan,
          { opacity: 1, y: 0, duration: durItems, ease: "power2.out" },
          t + 0.05,
        );
      }
    });
  };

  /* ── Close ──────────────────────────────────────────────────── */
  const handleClose = () => {
    tlRef.current?.kill();

    // Revert button to Menu/outline immediately — don't wait for animation to finish
    setIsOpen(false);

    // Fade items out immediately, faster than the open fade-in, so the text
    // is gone before the nav's own collapse is visually underway — instead
    // of staying opaque and getting clipped away by the shrinking box. Ends
    // at the same {opacity:0, y:8} state the items need for the next open
    // to replay correctly, so no separate reset is needed on completion.
    itemRefs.current.forEach((item) => {
      if (!item) return;
      gsap.to(item, {
        opacity: 0,
        duration: TIMING.itemsFadeOutDuration,
        ease: "power1.out",
      });
      const labelSpan = getLabelSpan(item);
      if (labelSpan) {
        gsap.to(labelSpan, {
          opacity: 0,
          y: 8,
          duration: TIMING.itemsFadeOutDuration,
          ease: "power1.out",
        });
      }
    });

    gsap.to(navRef.current, {
      height: collapsedHeight.current,
      duration: TIMING.expandDuration,
      ease: "power2.inOut",
    });

    // Mobile trigger's icon morphs close → burger, in parallel
    if (morphPathRef.current) {
      gsap.to(morphPathRef.current, {
        morphSVG: BURGER_PATH_D,
        duration: TIMING.expandDuration,
        ease: "power2.inOut",
      });
    }
  };

  const toggleNav = () => (isOpen ? handleClose() : handleOpen());

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <nav
      ref={navRef}
      className={[styles.nav, isOpen ? styles.open : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label="Main navigation"
    >
      {/* ── Header (always visible) ─────────────────────────── */}
      <div className={styles.header}>
        {/* a.brand — return-home button; plain text wordmark, links home from any page */}
        <a href="/" className={styles.brand}>
          <Label size="md" color="tertiary">
            Edgar Sanchez
          </Label>
        </a>

        {/* Menu toggle, ≥786px — bare text trigger, Button's "text" variant */}
        <div className={styles.desktopTrigger}>
          <Button
            variant="text"
            size="small"
            onClick={toggleNav}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
          >
            {isOpen ? "Close" : "Menu"}
          </Button>
        </div>

        {/* Menu toggle, <786px — icon-only, burger↔close morph (see
            morphPathRef/handleOpen/handleClose). Bespoke markup, not
            through Button — this morph behavior is Nav-specific. */}
        <button
          type="button"
          className={styles.mobileTrigger}
          onClick={toggleNav}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path ref={morphPathRef} d={BURGER_PATH_D} fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* ── Menu items (hidden when closed) ─────────────────── */}
      {/*
        Direct children of <nav> — no separate card/wrapper. nav's own
        overflow:hidden + locked collapsed height clips them out of view
        when closed. Each wrapper flex-grows to evenly split the full
        expanded height (see .menuItemWrapper in Nav.module.css).
        aria-hidden lives per-item since there's no longer a single group
        element to hang it on.
      */}
      {NAV_LINKS.map((link, i) => (
        <div
          key={link.href}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className={styles.menuItemWrapper}
          aria-hidden={!isOpen}
        >
          {/*
            Button uses <a href>. For proper Next.js client-side routing,
            it could be updated to use <Link> — deferred to a future pass.
          */}
          <Button
            variant="menu"
            size="large"
            href={link.href}
            icon={<GoArrowIcon />}
          >
            {link.label}
          </Button>
        </div>
      ))}
    </nav>
  );
}
