import React, { ReactNode } from "react";
import Icon from "./Icon";
import styles from "./Accordion.module.css";

export type AccordionProps = {
  /** Text or a node shown beside the chevron. */
  title: ReactNode;
  /** Optional content at the header's right edge (e.g. a progress bar and a count). */
  headerEnd?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  /** Takes part in a parent grid's columns (subgrid), so a list inside lines up with the rows around it. */
  subgrid?: boolean;
  className?: string;
};

// A full-width header button — chevron to the left of the title, hover wash — over a body that slides open and
// closed. Audited from the Remediation Request List's rows; open state is controlled so a list can make it
// single-open.
export function Accordion({ title, headerEnd, open, onToggle, children, subgrid = false, className }: AccordionProps) {
  return (
    <div className={[styles.accordion, subgrid && styles.subgrid, className].filter(Boolean).join(" ")}>
      <button type="button" className={styles.header} aria-expanded={open} onClick={onToggle}>
        <span className={styles.headerLeft}>
          <span className={[styles.chevron, open && styles.chevronOpen].filter(Boolean).join(" ")}>
            <Icon name="keyboard_arrow_down" color="var(--xops-text-secondary)" />
          </span>
          <span className={styles.title}>{title}</span>
        </span>
        {headerEnd && <span className={styles.headerEnd}>{headerEnd}</span>}
      </button>
      {/* Always rendered so its height can animate; inert while closed keeps it out of focus and the accessibility tree. */}
      <div className={[styles.drawer, open && styles.drawerOpen].filter(Boolean).join(" ")} {...({ inert: open ? undefined : "" } as object)}>
        <div className={styles.drawerContent}>{children}</div>
      </div>
    </div>
  );
}

export default Accordion;
