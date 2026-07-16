import React from "react";
import Icon from "./Icon";
import Count from "./Count";
import styles from "./PageHeader.module.css";

export type PageHeaderProps = {
  title: string;
  count?: number;
  metaIcon?: string;
  metaText?: string;
};

export default function PageHeader({ title, count, metaIcon, metaText }: PageHeaderProps) {
  const hasCount = typeof count === "number";

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h2
          className={[styles.title, hasCount ? styles.titleWithDivider : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </h2>
        {hasCount && <Count value={count as number} />}
      </div>

      {(metaIcon || metaText) && (
        <div className={styles.meta}>
          {metaIcon && <Icon name={metaIcon} color="var(--xops-text-secondary)" />}
          {metaText && <span className={styles.metaText}>{metaText}</span>}
        </div>
      )}
    </div>
  );
}
