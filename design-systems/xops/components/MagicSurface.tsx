import React, { ReactNode } from "react";
import styles from "./MagicSurface.module.css";

export type MagicSurfaceProps = {
  children?: ReactNode;
  // Outer wrapper (radius, sizing) — the clipping/shape boundary.
  className?: string;
  // Inner content wrapper (layout/gap/padding around children) — kept separate from
  // `className` so a consumer's own flex/gap styling doesn't have to fight the blob
  // layer, which lives as an absolutely-positioned sibling, not a flex participant.
  contentClassName?: string;
  // Uniform CSS transform scale on the blob group (position + blur scale together),
  // so a smaller surface gets a proportional miniature of the same composition
  // instead of the same absolute blob offsets cropped into a tighter box.
  scale?: number;
};

// Four blurred, slow-spinning color blobs behind a white surface — the "magic" background
// treatment first built for SoftwareProfile's Opportunity card. Extracted as its own primitive
// so any container (Stat's `magic` surface, future Button variants, etc.) can drop it in as a
// background layer without copying the blob markup/CSS again.
const blobs = [
  { src: "/xops/svg/magenta.svg", left: -36, top: -36 },
  { src: "/xops/svg/light-purple.svg", left: 232, top: -186 },
  { src: "/xops/svg/teal.svg", left: 164, top: 98 },
  { src: "/xops/svg/dark-purple.svg", left: 436, top: 18 },
];

export function MagicSurface({ children, className, contentClassName, scale = 1 }: MagicSurfaceProps) {
  return (
    <div className={[styles.surface, className].filter(Boolean).join(" ")}>
      <div
        className={scale !== 1 ? styles.blobsScaled : styles.blobs}
        aria-hidden="true"
        style={scale !== 1 ? { transform: `scale(${scale})` } : undefined}
      >
        {blobs.map((blob) => (
          <img
            key={blob.src}
            src={blob.src}
            alt=""
            className={styles.blob}
            style={{ left: blob.left, top: blob.top }}
          />
        ))}
      </div>
      <div className={[styles.content, contentClassName].filter(Boolean).join(" ")}>{children}</div>
    </div>
  );
}

export default MagicSurface;
