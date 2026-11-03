import React, { ReactNode } from "react";
import styles from "./KeyValueList.module.css";

export type KeyValueItem = {
  label: string;
  /** Text, or a node (e.g. a link button). An array stacks its entries, one per line. */
  value: ReactNode | ReactNode[];
};

export type KeyValueListProps = {
  items: KeyValueItem[];
  className?: string;
};

// Label left, values left-aligned in one shared column. A real description list (dl/dt/dd), not Figma's
// div-flex rows, so assistive tech reads each pair as a term and its value.
export function KeyValueList({ items, className }: KeyValueListProps) {
  return (
    <dl className={[styles.list, className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>
            {Array.isArray(item.value) ? item.value.map((entry, index) => <span key={index}>{entry}</span>) : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default KeyValueList;
