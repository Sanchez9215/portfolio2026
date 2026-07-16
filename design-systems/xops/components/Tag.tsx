import React, { ReactNode } from "react";
import styles from "./Tag.module.css";

export type TagStatus = "success" | "warning" | "danger" | "neutral";

export type TagProps = {
  status: TagStatus;
  children: ReactNode;
  className?: string;
};

export function Tag({ status, children, className }: TagProps) {
  return (
    <span className={[styles.tag, styles[status], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

export default Tag;
