"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import styles from "@/app/work/software-observability/software-observability.module.css";

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

/**
 * Framework Adaptation → Observability transition motif. One continuous SVG
 * overlay spans BOTH sections (mounted on their shared wrapper), so the line is
 * a single element with no seam:
 *   - a grey-500 funnel morphs flat→shape at the top of Framework Adaptation
 *   - a vertical spine grows out of its peak, descends across both sections
 *   - a second funnel, flipped to point UPWARD, morphs out of the big eye's
 *     almond top edge to "receive" the spine, which ends at the almond's center
 * Same MorphSVGPlugin + scrubbed-spine technique as InsightsGoalsContent. The
 * overlay sits ABOVE the blue blob but BEHIND the grey almond (z-index layered
 * in the page module CSS), and since spine/funnels/almond are all grey-500 they
 * merge into one continuous grey form where they meet.
 */

// funnel-morph.svg's native size (public/SVG/funnel-morph.svg) — same asset as
// the Insights & Goals funnel.
const FUNNEL_WIDTH = 256;
const FUNNEL_HEIGHT = 128;
// The spine overlaps the funnel tip by this many px (at both the top funnel's
// peak and the bottom funnel's tip) so the two don't visibly butt against each
// other, leaving a hairline gap.
const SPINE_FUNNEL_OVERLAP = 8;
// The bottom funnel's base is pushed this many px DOWN into the almond (below
// its top edge), so the flat base hides inside the almond body and the funnel
// reads as morphing organically out of it rather than sitting on top.
const FUNNEL_ALMOND_SINK = 14;
// Flat state: same path structure as the shape, all y's collapsed to 0.
const FUNNEL_FLAT_D = "M0 0C70.6875 0 128 0 128 0C128 0 185.312 0 256 0H0Z";
const FUNNEL_SHAPE_D =
  "M0 0C70.6875 0 128 57.3066 128 128C128 57.3066 185.312 0 256 0H0Z";

export default function FrameworkFunnelSpine() {
  const svgRef = useRef<SVGSVGElement>(null);
  const topFunnelRef = useRef<SVGPathElement>(null);
  const spineRef = useRef<SVGLineElement>(null);
  const bottomFunnelRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    const topFunnelEl = topFunnelRef.current;
    const spineEl = spineRef.current;
    const bottomFunnelEl = bottomFunnelRef.current;
    const wrapEl = svgEl?.parentElement;
    if (!svgEl || !topFunnelEl || !spineEl || !bottomFunnelEl || !wrapEl) return;

    const frameworkEl = wrapEl.querySelector<HTMLElement>("section");
    const bigEyeEl = wrapEl.querySelector<HTMLElement>('[data-eye="big"]');
    if (!frameworkEl || !bigEyeEl) return;

    const ctx = gsap.context(() => {
      const measure = () => {
        const wrapRect = wrapEl.getBoundingClientRect();
        const eyeRect = bigEyeEl.getBoundingClientRect();
        // The big almond's real center — the whole line (top funnel, spine,
        // bottom funnel) shares this x so it reads as one straight vertical.
        // Lands on ~the col-10/11 grid gutter but measured so it hits center
        // regardless of small layout drift.
        const almondCenterX = eyeRect.left - wrapRect.left + eyeRect.width / 2;
        const almondTopY = eyeRect.top - wrapRect.top;
        return {
          width: wrapRect.width,
          height: wrapRect.height,
          centerX: almondCenterX,
          almondTopY,
        };
      };

      const m = measure();
      svgEl.setAttribute("viewBox", `0 0 ${m.width} ${m.height}`);

      // Bottom funnel geometry: base sunk into the almond, tip a full funnel
      // height above it. The spine is received just past the tip (overlap).
      const funnelBaseY = m.almondTopY + FUNNEL_ALMOND_SINK;
      const funnelTipY = funnelBaseY - FUNNEL_HEIGHT;
      const spineEndY = funnelTipY + SPINE_FUNNEL_OVERLAP;

      // Top funnel — flat, native size, peak on the centerline, flush with the
      // wrapper's (= Framework section's) top edge.
      topFunnelEl.setAttribute(
        "transform",
        `translate(${m.centerX - FUNNEL_WIDTH / 2}, 0)`,
      );
      topFunnelEl.setAttribute("d", FUNNEL_FLAT_D);

      // Bottom funnel — flat, flipped vertically (scale(1,-1)) so it points UP,
      // its base sunk FUNNEL_ALMOND_SINK px into the almond; morphs upward out
      // of the almond to receive the spine.
      bottomFunnelEl.setAttribute(
        "transform",
        `translate(${m.centerX - FUNNEL_WIDTH / 2}, ${funnelBaseY}) scale(1, -1)`,
      );
      bottomFunnelEl.setAttribute("d", FUNNEL_FLAT_D);

      const spineStartY = FUNNEL_HEIGHT - SPINE_FUNNEL_OVERLAP;
      gsap.set(spineEl, {
        attr: { x1: m.centerX, x2: m.centerX, y1: spineStartY, y2: spineStartY },
      });

      ScrollTrigger.refresh();

      // Top funnel morphs flat → shape over the first 25% of the Framework
      // section's entry.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: frameworkEl,
            start: "top bottom",
            end: "top 75%",
            scrub: true,
          },
        })
        .to(topFunnelEl, { morphSVG: FUNNEL_SHAPE_D, duration: 1, ease: "none" });

      // Spine grows continuously from the top funnel's peak down to the bottom
      // funnel's tip — from just after the top funnel finishes until the almond
      // is centered in the viewport, when the bottom funnel is also full height.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: frameworkEl,
            start: "top 75%",
            endTrigger: bigEyeEl,
            end: "center center",
            scrub: true,
          },
        })
        .to(spineEl, { attr: { y2: spineEndY }, duration: 1, ease: "none" });

      // Bottom funnel morphs up as the spine tip nears the almond — from the
      // almond's top edge reaching viewport center to the almond centered.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: bigEyeEl,
            start: "top center",
            end: "center center",
            scrub: true,
          },
        })
        .to(bottomFunnelEl, {
          morphSVG: FUNNEL_SHAPE_D,
          duration: 1,
          ease: "none",
        });
    });

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      className={styles.frameworkFunnelSpineSvg}
      aria-hidden="true"
    >
      <path ref={topFunnelRef} fill="var(--color-grey-500)" />
      <line ref={spineRef} stroke="var(--color-grey-500)" strokeWidth={1} />
      <path ref={bottomFunnelRef} fill="var(--color-grey-500)" />
    </svg>
  );
}
