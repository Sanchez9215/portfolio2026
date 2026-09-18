import React from "react";
import Count from "./Count";
import { MetaText } from "./MetaText";
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

      {metaText && <MetaText icon={metaIcon} text={metaText} />}
    </div>
  );
}
