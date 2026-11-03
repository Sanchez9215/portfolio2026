import React from "react";
import Icon from "./Icon";
import styles from "./Breadcrumb.module.css";

export type BreadcrumbItem = {
  label: string;
  /** Makes the item a link that goes back up; the last item is the current page and takes none. */
  onClick?: () => void;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

// A trail of where you are: earlier items are buttons that go back, the last is the current page. Chevron between.
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={[styles.breadcrumb, className].filter(Boolean).join(" ")}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.label} className={styles.item}>
              {current || !item.onClick ? (
                <span className={styles.current} aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <button type="button" className={styles.link} onClick={item.onClick}>
                  {item.label}
                </button>
              )}
              {!current && <Icon name="chevron_forward" size="16" color="var(--xops-text-secondary)" className={styles.separator} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
