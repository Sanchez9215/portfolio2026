import React, { ReactNode } from "react";
import Icon from "./Icon";
import styles from "./Banner.module.css";

export type BannerStatus = "danger" | "risk" | "info" | "neutral" | "success";

export type BannerProps = {
  status: BannerStatus;
  icon: string;
  title: ReactNode;
  description: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

// Persistent inline disclosure — not a toast/snackbar (stays visible, doesn't
// auto-dismiss). Figma node 666:559, no real layer name given ("Frame..."),
// named after Material Design's own Banner component, which draws the same
// distinction. Every status: tinted background + a solid-colored icon: title
// and description always stay --xops-text-primary regardless of status (only
// the background/icon carry the color) — a deliberate departure from Tag,
// which colors its own text per status. `risk` reuses caution's color
// (no separate "risk" tokens exist); `info`'s tint/solid are new tokens
// sourced from the sidebar's own selected-state blue (see tokens.css).
export function Banner({ status, icon, title, description, className, style }: BannerProps) {
  return (
    <div className={[styles.banner, styles[status], className].filter(Boolean).join(" ")} style={style}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Icon name={icon} color="var(--banner-icon-color)" className={styles.icon} />
          <p className={styles.title}>{title}</p>
        </div>
        <div className={styles.body}>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
    </div>
  );
}

// For emphasized words inside `description` (e.g. "Active" and "Inactive")
// — a plain <strong> would pull in the browser default bold weight instead
// of this file's own --xops-font-weight-medium, and Banner.module.css's
// class names aren't reachable from a caller's own CSS module.
export function BannerEmphasis({ children }: { children: ReactNode }) {
  return <span className={styles.emphasis}>{children}</span>;
}

export default Banner;
