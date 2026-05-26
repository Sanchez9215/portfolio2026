"use client";

/**
 * HeroSection — home page hero
 *
 * Built from Figma node 281:123 (Claude-Code file).
 *
 * Text entrance (GSAP):
 *   Headline is structurally split into 3 fixed lines via block spans.
 *   Each line (headline then subline) fades up one-by-one.
 *
 * Image area:
 *   BounceCanvas — DVD-screensaver SVG toy (happyAgents.svg)
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Button from "./Button";
import BounceCanvas from "./BounceCanvas";
import styles from "./HeroSection.module.css";

/* ── helpers ─────────────────────────────────────────────── */

const readMs = (prop: string): number => {
  if (typeof window === "undefined") return 0;
  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(prop),
    ) / 1000
  );
};

/* ── Component ───────────────────────────────────────────── */

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const headlineEl = headlineRef.current;
    const sublineEl = sublineRef.current;
    if (!headlineEl || !sublineEl) return;

    const dur = readMs("--motion-duration-nav-items"); // 0.5s
    const delay = readMs("--motion-delay-nav-items"); // 0.25s

    // Grab the structurally-fixed line spans directly
    const headlineLines = Array.from(
      headlineEl.querySelectorAll<HTMLSpanElement>(`.${styles.headlineLine}`),
    );
    const sublineLines = Array.from(
      sublineEl.querySelectorAll<HTMLSpanElement>(`.${styles.sublineLine}`),
    );

    const allLines = [...headlineLines, ...sublineLines];

    // All lines start hidden + offset downward
    gsap.set(allLines, { opacity: 0, y: 16 });

    // Sequential fade-up: next line starts when the previous is ~65% done
    const tl = gsap.timeline({ delay });
    allLines.forEach((line, i) => {
      tl.to(
        line,
        { opacity: 1, y: 0, duration: dur, ease: "power2.out" },
        i === 0 ? 0 : `>-${(dur * 0.35).toFixed(3)}`,
      );
    });
  }, []);

  return (
    <section className={styles.hero} aria-label="Hero">
      {/* ── Top content: headline + bounce toy ───────────────── */}
      <div className={styles.heroTopContent}>
        <h1 ref={headlineRef} className={styles.headline}>
          <span className={styles.headlineLine}>Specializing</span>
          <span className={styles.headlineLine}>
            in <span className={styles.headlineAccent}>Data-rich</span>
          </span>
          <span className={styles.headlineLine}>Environments.</span>
        </h1>

        <div className={styles.imgContainer}>
          <BounceCanvas />
        </div>
      </div>

      {/* ── Bottom content: blue card ──────────────────────────── */}
      <div className={styles.heroBottomContent}>
        <div className={styles.buttonGroup}>
          <Button variant="primary" href="mailto:edgar.sanchez9215@gmail.com">
            Let&apos;s Chat
          </Button>
          <Button variant="secondary" href="/#work">
            Work
          </Button>
        </div>

        <p ref={sublineRef} className={styles.heroSubline}>
          <span className={styles.sublineLine}>Driving</span>
          <span className={styles.sublineLine}>
            <span className={styles.sublineHighlight}>High-Stakes</span>
          </span>
          <span className={styles.sublineLine}>Decisions.</span>
        </p>
      </div>
    </section>
  );
}
