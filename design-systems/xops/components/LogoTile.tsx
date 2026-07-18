import React from "react";
import Icon from "./Icon";
import styles from "./LogoTile.module.css";

export type LogoTileSize = "small" | "medium" | "large";

export type LogoTileProps = {
  // Nullable: publishers without a sourced logo render the empty-state tile (no image),
  // a deliberate part of the catalog — see catalog.ts PUBLISHER_LOGOS.
  src?: string | null;
  alt: string;
  size?: LogoTileSize;
  className?: string;
};

export function LogoTile({ src, alt, size = "medium", className }: LogoTileProps) {
  return (
    <div className={[styles.tile, styles[size], className].filter(Boolean).join(" ")}>
      {src ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        // Empty-state: reuse the "Software" side-nav glyph, muted, at the Icon default (20px).
        <Icon name="code_blocks" color="var(--xops-text-secondary)" />
      )}
    </div>
  );
}

export default LogoTile;
