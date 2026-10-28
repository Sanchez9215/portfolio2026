import React from "react";
import styles from "./StatusIcon.module.css";

export type StatusIconStatus = "open" | "in-progress" | "warning" | "exception" | "complete";

export type StatusIconProps = {
  status: StatusIconStatus;
  /** Off the shared icon-size scale. Defaults to "16". */
  size?: "12" | "16";
  /** Overrides the complete disc's fill (e.g. a lane color, or a muted grey for "not yet"). */
  color?: string;
  className?: string;
};

const labels: Record<StatusIconStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  warning: "Warning",
  exception: "Exception",
  complete: "Complete",
};

// Circle with an exclamation cut out (Figma item warning/exception glyph).
const ALERT_PATH =
  "M8 12C8.22667 12 8.41667 11.9233 8.57 11.77C8.72333 11.6167 8.8 11.4267 8.8 11.2C8.8 10.9733 8.72333 10.7833 8.57 10.63C8.41667 10.4767 8.22667 10.4 8 10.4C7.77333 10.4 7.58333 10.4767 7.43 10.63C7.27667 10.7833 7.2 10.9733 7.2 11.2C7.2 11.4267 7.27667 11.6167 7.43 11.77C7.58333 11.9233 7.77333 12 8 12ZM7.2 8.8H8.8V4H7.2V8.8ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16Z";

const CHECK_PATH = "M6.36665 12L2.56665 8.2L3.51665 7.25L6.36665 10.1L12.4833 3.98334L13.4333 4.93334L6.36665 12Z";

export function StatusIcon({ status, size = "16", color, className }: StatusIconProps) {
  return (
    <svg
      className={[styles.icon, size === "12" && styles.size12, className].filter(Boolean).join(" ")}
      viewBox="0 0 16 16"
      fill="none"
      role="img"
      aria-label={labels[status]}
    >
      {(status === "open" || status === "in-progress") && (
        <circle className={styles.track} cx="8" cy="8" r="6.56" />
      )}
      {status === "in-progress" && <path className={styles.fill} d="M8 1.44A6.56 6.56 0 0 1 8 14.56" />}
      {status === "complete" && (
        <>
          <circle className={styles.complete} cx="8" cy="8" r="8" style={color ? { fill: color } : undefined} />
          <path className={styles.check} d={CHECK_PATH} />
        </>
      )}
      {(status === "warning" || status === "exception") && (
        <>
          <circle className={styles.backing} cx="8" cy="8" r="8" />
          <path className={status === "warning" ? styles.warning : styles.exception} d={ALERT_PATH} />
        </>
      )}
    </svg>
  );
}

export default StatusIcon;
