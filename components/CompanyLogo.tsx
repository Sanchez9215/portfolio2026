/**
 * CompanyLogo — a brand mark (XOPS/Heap/Auryc) recolored to a single flat
 * color, replacing the WorkCaseStudyRow meta row's old plain-text Company
 * value.
 *
 * The source SVGs are full-color brand marks (gradients, multiple hex
 * fills) — recoloring per-path isn't viable, so the file is used purely as
 * a shape via CSS mask-image (background-color supplies the actual color),
 * the same technique XOPS's own Icon.tsx uses for its recolorable icons,
 * reimplemented here with this system's own tokens rather than shared code
 * (the two design systems stay isolated).
 *
 * Height defaults to the value text it replaces (--text-body-xs-lh, the
 * line-height TitleBlock's body would otherwise render at), overridable per
 * instance via `height` — different wordmarks read as different visual
 * weights at the same literal height (e.g. Heap's taller lettering vs.
 * XOPS's thin one), so each case study can tune its own. Width is always
 * derived from the logo's own real aspect ratio (nativeWidth/nativeHeight,
 * its actual SVG viewBox) via `aspect-ratio` so nothing is eyeballed.
 */

import styles from "./CompanyLogo.module.css";

export interface CompanyLogoProps {
  src: string;
  nativeWidth: number;
  nativeHeight: number;
  alt: string;
  /** Overrides the default height (--text-body-xs-lh). */
  height?: number;
  className?: string;
}

export default function CompanyLogo({
  src,
  nativeWidth,
  nativeHeight,
  alt,
  height,
  className,
}: CompanyLogoProps) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={`${styles.logo}${className ? ` ${className}` : ""}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        aspectRatio: `${nativeWidth} / ${nativeHeight}`,
        height: height !== undefined ? `${height}px` : undefined,
      }}
    />
  );
}
