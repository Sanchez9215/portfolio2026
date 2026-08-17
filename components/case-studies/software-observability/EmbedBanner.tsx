"use client";

import { forwardRef } from "react";
import Button from "@/components/Button";
import styles from "./EmbedBanner.module.css";

// Inlined from /icons/open_in_full.svg — currentColor resolves from the
// ghost button's own color, same convention as every other icon in this
// codebase (see e.g. WorkCaseStudyRow's arrow-outward icon).
function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 21V13H19V17.6L6.4 5H11V3H3V11H5V6.4L17.6 19H13V21H21Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Inlined from /icons/close_fullscreen.svg — currentColor.
function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.6 22L22 20.6L15.4 14H20V12H12V20H14V15.4L20.6 22ZM12 12V4H10V8.6L3.4 2L2 3.4L8.6 10H4V12H12Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface EmbedBannerProps {
  expanded: boolean;
  onToggle: () => void;
}

// Bottom-left banner for the live embed (Home's WorkCaseStudyRow only, gated
// by SoftwareExperienceEmbed's enableExpandedView prop) — slides in once the
// embed's own entrance settles, holds, then slides back out of sight; the
// same banner persists (icon swapped for the collapse glyph) while the embed
// is expanded to full screen. Slide choreography and full-screen toggle are
// both owned by the parent (SoftwareExperienceEmbed) via this forwarded ref
// and the onToggle callback — mirrors GhostCursor's "no built-in positioning,
// parent owns it" convention.
//
// Figma node 800:992 ("Portfolio Cleaning" file) supplied the icon + copy +
// 8px padding + top-only 6px radius — reproduced hugging its own content
// (icon, 16px gap, text) rather than that frame's 711px mock width, per
// direction. Copy type: Block "sm" as-authored (body/regular/14px/20px/0
// tracking) — Figma's "Medium" weight + -0.32px tracking have no exact
// token match in this codebase, closest existing tier used as-is.
const EmbedBanner = forwardRef<HTMLDivElement, EmbedBannerProps>(
  function EmbedBanner({ expanded, onToggle }, ref) {
    return (
      <div
        ref={ref}
        className={`${styles.banner} ${expanded ? styles.expanded : ""}`}
      >
        <Button
          variant="ghost"
          aria-label={expanded ? "Exit full screen" : "Expand to full screen"}
          icon={expanded ? <CollapseIcon /> : <ExpandIcon />}
          onClick={onToggle}
        />
        {!expanded && (
          <span className={styles.copy}>
            Click anywhere to take over. Or go full screen.
          </span>
        )}
      </div>
    );
  },
);

export default EmbedBanner;
