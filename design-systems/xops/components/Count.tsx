import React from "react";
import styles from "./Count.module.css";

export type CountProps = {
  value: number | string;
};

export default function Count({ value }: CountProps) {
  return <span className={styles.count}>{value}</span>;
}
