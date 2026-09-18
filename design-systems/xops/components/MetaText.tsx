import React from "react";
import Icon from "./Icon";
import styles from "./MetaText.module.css";

export type MetaTextProps = {
  icon?: string;
  text: string;
};

export function MetaText({ icon, text }: MetaTextProps) {
  return (
    <div className={styles.meta}>
      {icon && <Icon name={icon} color="var(--xops-text-secondary)" />}
      <span className={styles.text}>{text}</span>
    </div>
  );
}

export default MetaText;
