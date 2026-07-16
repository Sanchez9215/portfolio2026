import React, { ReactNode } from "react";
import styles from "./Card.module.css";

export type CardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <p className={styles.title}>{title}</p>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default Card;
