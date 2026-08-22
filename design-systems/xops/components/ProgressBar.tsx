import React from "react";
import Icon from "./Icon";
import styles from "./ProgressBar.module.css";

export type ProgressBarStatus = "danger" | "warning" | "success";
export type ProgressBarHeight = "16" | "8";

export type ProgressBarProps = {
  /** Current value, 0-100 */
  value: number;
  /** Threshold marker position, 0-100. Omit to render the bar with no marker. */
  threshold?: number;
  status: ProgressBarStatus;
  /** Optional trailing value number (e.g. "89%" or "-15 days"), rendered beside the bar */
  valueLabel?: string;
  /** Off the shared bar-height scale. Defaults to "16". */
  height?: ProgressBarHeight;
  className?: string;
};

export function ProgressBar({
  value,
  threshold,
  status,
  valueLabel,
  height = "16",
  className,
}: ProgressBarProps) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <div className={[styles.bar, styles[status], styles[`height${height}`]].filter(Boolean).join(" ")}>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${value}%` }} />
        </div>
        {threshold !== undefined && (
          <div className={styles.markerWrap} style={{ left: `${threshold}%` }}>
            <Icon name="threshold-marker" color="var(--xops-text-primary)" className={styles.marker} />
          </div>
        )}
      </div>
      {valueLabel && (
        <span className={[styles.valueLabel, styles[`${status}Label`]].filter(Boolean).join(" ")}>
          {valueLabel}
        </span>
      )}
    </div>
  );
}

export default ProgressBar;
