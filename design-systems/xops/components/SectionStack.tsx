import React, { ReactNode } from "react";
import styles from "./SectionStack.module.css";

export type SectionStackProps = {
  children: ReactNode;
  className?: string;
};

// Stacks sections vertically with a 16px gap; every section but the last gets a divider on its bottom edge.
// The same rule serves every panel and pane (Software Profile, request details), so section spacing is one number.
export function SectionStack({ children, className }: SectionStackProps) {
  return <div className={[styles.stack, className].filter(Boolean).join(" ")}>{children}</div>;
}

export default SectionStack;
