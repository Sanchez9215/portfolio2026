import React, { ReactNode } from "react";
import styles from "./DateBar.module.css";

export type DateBarProps = {
  children: ReactNode;
  /** Element to render: "li" inside a list (the event log), "div" otherwise. Defaults to "div". */
  as?: "li" | "div";
  /** For the consumer's own placement (e.g. a grid column span). */
  className?: string;
};

// A sticky date heading for a time-ordered list: the current date stays pinned while its rows scroll under it,
// until the next date takes over. Shared by the event log and the request list.
export function DateBar({ children, as: Tag = "div", className }: DateBarProps) {
  return <Tag className={[styles.bar, className].filter(Boolean).join(" ")}>{children}</Tag>;
}

export default DateBar;
