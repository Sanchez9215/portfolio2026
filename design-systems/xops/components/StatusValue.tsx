import React, { ReactNode } from "react";
import styles from "./StatusValue.module.css";

export type StatusValueStatus = "success" | "warning" | "danger" | "caution";

export type StatusValueProps = {
  status: StatusValueStatus;
  children: ReactNode;
  className?: string;
};

export function StatusValue({ status, children, className }: StatusValueProps) {
  return (
    <span className={[styles.statusValue, className].filter(Boolean).join(" ")}>
      <span className={[styles.dot, styles[status]].filter(Boolean).join(" ")} />
      <span className={styles.value}>{children}</span>
    </span>
  );
}

export default StatusValue;
