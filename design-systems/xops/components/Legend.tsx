import React from "react";
import styles from "./Legend.module.css";

export type LegendItem = {
  label: string;
  value: string;
  meta?: string;
  color: string;
};

export type LegendProps = {
  items: LegendItem[];
  className?: string;
};

export function Legend({ items, className }: LegendProps) {
  return (
    <div className={[styles.legend, className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <div className={styles.row} key={item.label}>
          <div className={styles.labelGroup}>
            <span className={styles.swatch} style={{ backgroundColor: item.color }} />
            <p className={styles.label}>{item.label}</p>
          </div>
          <div className={styles.valueGroup}>
            <span className={styles.value}>{item.value}</span>
            {item.meta && <span className={styles.meta}>{item.meta}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Legend;
