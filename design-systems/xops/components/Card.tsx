import React, { ReactNode } from "react";
import styles from "./Card.module.css";

export type CardTitleSize = "subheading-16" | "subheading-14";

export type CardProps = {
  title: string;
  titleSize?: CardTitleSize;
  headerValue?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Sets `data-hotspot` on the outer card element, for hotspot targeting. */
  hotspotId?: string;
};

export function Card({ title, titleSize = "subheading-14", headerValue, children, className, hotspotId }: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} data-hotspot={hotspotId}>
      <div className={[styles.header, headerValue && styles.headerDivider].filter(Boolean).join(" ")}>
        <p
          className={[styles.title, titleSize === "subheading-14" && styles.titleSubheading14]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </p>
        {headerValue && <span className={styles.headerValue}>{headerValue}</span>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default Card;
