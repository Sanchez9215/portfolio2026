import React, { ReactNode } from "react";
import styles from "./Tag.module.css";

export type TagStatus = "success" | "warning" | "danger" | "neutral" | "caution" | "info" | "open";

export type TagSize = "default" | "small";

export type TagProps = {
  status: TagStatus;
  size?: TagSize;
  /** Optional leading icon slot (e.g. a 12px status icon). */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Tag({ status, size = "default", icon, children, className }: TagProps) {
  return (
    <span className={[styles.tag, styles[status], size === "small" && styles.small, icon && styles.withIcon, className].filter(Boolean).join(" ")}>
      {icon}
      {children}
    </span>
  );
}

export default Tag;
