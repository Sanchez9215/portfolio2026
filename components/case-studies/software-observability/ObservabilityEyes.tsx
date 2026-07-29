"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./ObservabilityEyes.module.css";

/**
 * Observability-first hero: a collage of light-blue almond "eyes" over a blue
 * blob. Each pupil follows the cursor. The big eye holds the "Observability
 * first." copy, revealed only where the moving pupil passes over it (a
 * `mix-blend-mode: lighten` spotlight — the copy is the almond's own colour, so
 * it vanishes against the almond and lights up against the dark pupil).
 *
 * Layout lives in the page module CSS (software-observability.module.css): this
 * returns a fragment so the blob, eyes, and detail are DIRECT children of the
 * `<Section>`'s cs-grid and can be placed with `grid-column`. Horizontal size +
 * position come from the 12-col grid; vertical is free (grid-row 1 + translateY);
 * each eye's height follows the almond aspect-ratio.
 */

// Pupil tracks the cursor, offset toward it by 25% of the pupil's own radius.
const TRAVEL_RATIO = 0.25;

type Eye = {
  id: string;
  pupil: number; // pupil ⌀, % of almond width
  text?: boolean;
};

const EYES: Eye[] = [
  { id: "top-left", pupil: 38.6 },
  { id: "mid-left", pupil: 38.6 },
  { id: "upper-mid", pupil: 38.6 },
  { id: "lower-mid", pupil: 38.6 },
  { id: "big", pupil: 37.8, text: true },
];

function BlueBlob({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="125 117 1291 900"
      preserveAspectRatio="none"
      fill="none"
      data-blob
      aria-hidden
    >
      <path
        d="M125 517C125 296.086 304.086 117 525 117H1416V753C1416 898.803 1297.8 1017 1152 1017H125V517Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Almond({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 900 372" fill="none" aria-hidden>
      <path
        d="M0 186L115.06 105.518C213.247 36.8365 330.175 0 450 0C569.825 0 686.753 36.8365 784.94 105.518L900 186L784.94 266.482C686.753 335.164 569.825 372 450 372C330.175 372 213.247 335.164 115.06 266.482L0 186Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ObservabilityEyes() {
  const eyeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pupilRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const pupils = pupilRefs.current.filter(Boolean);
    if (pupils.length === 0) return;

    // Centre every pupil on its almond up front (GSAP owns the transform, so
    // the follow offset in x/y composes with this instead of fighting a CSS
    // translate). At rest / reduced motion the pupils sit dead-centre.
    gsap.set(pupils, { xPercent: -50, yPercent: -50 });

    const mm = gsap.matchMedia();

    mm.add(
      "(prefers-reduced-motion: no-preference) and (pointer: fine)",
      () => {
        const setters = pupilRefs.current.map((el) =>
          el
            ? {
                x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
                y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
              }
            : null,
        );

        const onMove = (e: MouseEvent) => {
          for (let i = 0; i < eyeRefs.current.length; i++) {
            const eye = eyeRefs.current[i];
            const pupil = pupilRefs.current[i];
            const set = setters[i];
            if (!eye || !pupil || !set) continue;

            // The eye box is centred on the almond, so its rect centre is the
            // pupil's resting centre — measured live so it stays correct as the
            // page scrolls / resizes.
            const rect = eye.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - originY, e.clientX - originX);
            const travel = (pupil.offsetWidth / 2) * TRAVEL_RATIO;

            set.x(Math.cos(angle) * travel);
            set.y(Math.sin(angle) * travel);
          }
        };

        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <>
      <BlueBlob className={styles.blob} />
      {EYES.map((eye, i) => (
        <div
          key={eye.id}
          ref={(el) => {
            eyeRefs.current[i] = el;
          }}
          className={`${styles.eye}${eye.text ? ` ${styles.eyeText}` : ""}`}
          data-eye={eye.id}
        >
          <Almond className={styles.almond} />
          <div
            ref={(el) => {
              pupilRefs.current[i] = el;
            }}
            className={styles.pupil}
            style={{ width: `${eye.pupil}%` }}
          />
          {eye.text && (
            <p className={styles.eyeCopy}>
              Observability
              <br />
              first.
            </p>
          )}
        </div>
      ))}
      <p className={styles.detail} data-detail>
        At XOPS, observability meant full visibility into the enterprise estate,
        its assets, their relationships to employees, and operational truth,
        unified across HR, IT, and financial system data.
      </p>
    </>
  );
}
