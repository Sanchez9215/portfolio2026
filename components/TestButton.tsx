/**
 * TestButton — primary outlined button (Figma node 1135:3256, "Portfolio
 * Cleaning" file). Resting: surface-base fill, 1px grey-500 border. Hover:
 * the same fill as the prototype tabs' hover pill (--surface-card-border) —
 * no animated border draw or glow (removed).
 */

"use client";

import type { ReactNode } from "react";
import styles from "./TestButton.module.css";

export interface TestButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}

export default function TestButton({
  children,
  href,
  onClick,
}: TestButtonProps) {
  const content = <span className={styles.label}>{children}</span>;

  if (href) {
    return (
      <a href={href} className={styles.button}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={styles.button}>
      {content}
    </button>
  );
}
