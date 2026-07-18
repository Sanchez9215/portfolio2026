import React, { ReactNode } from "react";
import styles from "./Card.module.css";

export type CardTitleSize = "subheading-16" | "body-14";

export type CardProps = {
  title: string;
  titleSize?: CardTitleSize;
  headerValue?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, titleSize = "subheading-16", headerValue, children, className }: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={[styles.header, headerValue && styles.headerDivider].filter(Boolean).join(" ")}>
        <p
          className={[styles.title, titleSize === "body-14" && styles.titleBody14]
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
