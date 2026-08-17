"use client";

import { forwardRef } from "react";
import styles from "./GhostCursor.module.css";

interface GhostCursorProps {
  /** Rendered cursor size in px. */
  size?: number;
  className?: string;
  /** "solid" (default, blue fill) or "outline" (surface-base fill + grey-500
   *  stroke) — see WorkCaseStudyRow's large cursor for "outline". */
  variant?: "solid" | "outline";
}

// Ghost-cursor icon. Renders centered by default (CSS fallback for first
// paint); a parent orchestrating a scripted sequence takes over via the
// forwarded ref + GSAP (xPercent/yPercent/x/y/rotation) for movement. Purely
// visual — dispatching real events on real DOM targets is the caller's job.
const GhostCursor = forwardRef<HTMLDivElement, GhostCursorProps>(function GhostCursor(
  { size = 48, className, variant = "solid" },
  ref
) {
  return (
    <div
      ref={ref}
      className={[styles.cursor, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Inlined from /SVG/cursor.svg (was <img src>) — same convention as
          MenuItem's go-arrow icon, avoids any <img>-in-SVG rendering quirks. */}
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={variant === "outline" ? styles.iconOutline : styles.icon}
      >
        <g clipPath="url(#ghost-cursor-clip)">
          {variant === "outline" ? (
            <>
              {/* Outside-only 2px border (--border-width-xs): SVG stroke is
                  always centered on the path, so this back copy strokes at
                  double width (4px) and the front fill path (same "d",
                  painted on top) covers the inner half — leaving only the
                  outer 2px visible. vector-effect keeps that 2px constant in
                  real screen px regardless of the cursor's current scaled
                  render size (it shrinks responsively, see WorkCaseStudyRow). */}
              <path
                d="M145.689 28.6217C151.586 16.8289 168.414 16.8289 174.311 28.6217L299.789 279.577C306.532 293.064 292.584 307.538 278.857 301.299L166.621 250.282C162.414 248.37 157.586 248.37 153.379 250.282L41.143 301.299C27.4163 307.538 13.4682 293.064 20.2113 279.577L145.689 28.6217Z"
                fill="none"
                stroke="var(--color-grey-500)"
                strokeWidth={4}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M145.689 28.6217C151.586 16.8289 168.414 16.8289 174.311 28.6217L299.789 279.577C306.532 293.064 292.584 307.538 278.857 301.299L166.621 250.282C162.414 248.37 157.586 248.37 153.379 250.282L41.143 301.299C27.4163 307.538 13.4682 293.064 20.2113 279.577L145.689 28.6217Z"
                fill="var(--surface-base)"
              />
            </>
          ) : (
            <path
              d="M145.689 28.6217C151.586 16.8289 168.414 16.8289 174.311 28.6217L299.789 279.577C306.532 293.064 292.584 307.538 278.857 301.299L166.621 250.282C162.414 248.37 157.586 248.37 153.379 250.282L41.143 301.299C27.4163 307.538 13.4682 293.064 20.2113 279.577L145.689 28.6217Z"
              fill="#0F8FFF"
            />
          )}
          <rect x="104" y="208" width="112" height="16" fill="#FFD53C" />
          <rect width="16" height="32" transform="translate(216 176)" fill="#FFD53C" />
          <rect width="16" height="32" transform="translate(88 176)" fill="#FFD53C" />
          <rect x="104" y="128" width="32" height="32" fill="#FFD53C" />
          <rect x="184" y="128" width="32" height="32" fill="#FFD53C" />
        </g>
        <defs>
          <clipPath id="ghost-cursor-clip">
            <rect width="320" height="320" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
});

export default GhostCursor;
