import React, { ReactNode } from "react";
import styles from "./Section.module.css";

export type SectionProps = {
  children: ReactNode;
  className?: string;
  /** Sets `data-hotspot` on the section element, for hotspot targeting. */
  hotspotId?: string;
};

// One block of a panel or pane: 16px of padding on every side. It has no gap or margin of its own — stack
// sections in a SectionStack and the stack sets the gap between them and draws the divider.
export function Section({ children, className, hotspotId }: SectionProps) {
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")} data-hotspot={hotspotId}>
      {children}
    </section>
  );
}

export default Section;
