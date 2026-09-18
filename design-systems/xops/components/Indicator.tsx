import React from "react";
import Icon from "./Icon";
import { TagStatus } from "./Tag";

export type IndicatorVariant = "icon" | "dot";

export type IndicatorProps = {
  variant: IndicatorVariant;
  status: TagStatus;
  icon?: string; // required when variant="icon"
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
};

export function Indicator({ variant, status, icon, className }: IndicatorProps) {
  if (variant === "dot") {
    throw new Error("Indicator: variant=\"dot\" is not built yet");
  }
  return <Icon name={icon!} color={statusColor[status]} size="18" className={className} />;
}

export default Indicator;
