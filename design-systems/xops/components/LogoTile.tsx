import React from "react";
import styles from "./LogoTile.module.css";

export type LogoTileSize = "small" | "medium" | "large";

export type LogoTileProps = {
  src: string;
  alt: string;
  size?: LogoTileSize;
  className?: string;
};

export function LogoTile({ src, alt, size = "medium", className }: LogoTileProps) {
  return (
    <div className={[styles.tile, styles[size], className].filter(Boolean).join(" ")}>
      <img src={src} alt={alt} className={styles.image} />
    </div>
  );
}

export default LogoTile;
