import React, { ReactNode } from "react";
import Icon from "./Icon";
import { TagStatus } from "./Tag";
import styles from "./Indicator.module.css";

export type IndicatorVariant = "icon" | "dot" | "count";

export type IndicatorProps = {
  variant: IndicatorVariant;
  status: TagStatus;
  icon?: string; // required when variant="icon"
  /** variant="count": leading glyph (e.g. a 12px StatusIcon) and the number beside it. */
  glyph?: ReactNode;
  count?: number;
  className?: string;
};

// No --xops-status-neutral-solid exists (Tag never needed one — it has no
// icon); reuses --xops-neutral-500 directly, same precedent as Banner's
// neutral status.
const statusColor: Record<TagStatus, string> = {
  success: "var(--xops-status-success-solid)",
  warning: "var(--xops-status-warning-solid)",
  danger: "var(--xops-status-danger-solid)",
  neutral: "var(--xops-neutral-500)",
  caution: "var(--xops-status-caution-solid)",
  info: "var(--xops-status-info-solid)",
  open: "var(--xops-neutral-500)",
};

export function Indicator({ variant, status, icon, glyph, count, className }: IndicatorProps) {
  if (variant === "dot") {
    throw new Error("Indicator: variant=\"dot\" is not built yet");
  }
  if (variant === "count") {
    return (
      <span className={[styles.count, styles[status], className].filter(Boolean).join(" ")}>
        {glyph}
        {count}
      </span>
    );
  }
  return <Icon name={icon!} color={statusColor[status]} size="18" className={className} />;
}

export default Indicator;
