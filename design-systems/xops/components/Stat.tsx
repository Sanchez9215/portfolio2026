import React, { CSSProperties } from "react";
import styles from "./Stat.module.css";

export type StatProps = {
  label: string;
  value: string;
  meta?: string;
  className?: string;
  style?: CSSProperties;
};

export function Stat({ label, value, meta, className, style }: StatProps) {
  return (
    <div className={[styles.stat, className].filter(Boolean).join(" ")} style={style}>
      <p className={styles.label}>{label}</p>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
    </div>
  );
}

export default Stat;
