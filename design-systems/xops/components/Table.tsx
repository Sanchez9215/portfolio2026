import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import styles from "./Table.module.css";
import Icon from "./Icon";

export type ColumnAlign = "left" | "right" | "center";

/**
 * "fixed" (px) locks a column to a known content size (logo, badge, checkbox).
 * "auto" hugs its content and never grows, even with leftover space.
 * "flex" takes any remaining space (text-heavy columns).
 */
export type ColumnWidth = number | "auto" | "flex";

export type Column<T> = {
  key: string;
  label: string;
  width: ColumnWidth;
  align?: ColumnAlign;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
};

export type SortDirection = "asc" | "desc";

export type TableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string) => void;
  /** false = bare markup only, no outer border/radius/bg — use when a parent (e.g. Card) supplies the chrome */
  chrome?: boolean;
};

function colStyle(width: ColumnWidth): CSSProperties {
  if (typeof width === "number") return { width, whiteSpace: "nowrap" };
  if (width === "auto") return { width: "1%", whiteSpace: "nowrap" };
  return {};
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  sortKey,
  sortDirection,
  onSortChange,
  chrome = true,
}: TableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateFades = () => {
      setShowLeftFade(el.scrollLeft > 0);
      setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    updateFades();
    el.addEventListener("scroll", updateFades);
    const resizeObserver = new ResizeObserver(updateFades);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateFades);
      resizeObserver.disconnect();
    };
  }, [columns, data]);

  return (
    <div className={[styles.outer, chrome ? styles.wrapper : styles.bare].filter(Boolean).join(" ")}>
      <div ref={scrollRef} className={styles.scroll}>
      <table className={styles.table}>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={colStyle(column.width)} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => {
              const isSorted = column.key === sortKey;
              const align = column.align ?? "left";
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={styles.headerCell}
                  data-align={align}
                  data-width={typeof column.width === "string" ? column.width : "fixed"}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => onSortChange?.(column.key)}
                      aria-sort={
                        isSorted ? (sortDirection === "desc" ? "descending" : "ascending") : "none"
                      }
                    >
                      <span>{column.label}</span>
                      <Icon
                        name="Arrows"
                        color={isSorted ? "var(--xops-text-primary)" : "var(--xops-text-secondary)"}
                        className={
                          isSorted && sortDirection === "desc" ? styles.sortIconDesc : undefined
                        }
                      />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={rowKey(row)} className={styles.row}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={styles.bodyCell}
                  data-align={column.align ?? "left"}
                  data-width={typeof column.width === "string" ? column.width : "fixed"}
                  style={typeof column.width === "number" ? { maxWidth: column.width } : undefined}
                >
                  {column.render ? column.render(row) : String(row[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div
        className={[styles.scrollFade, styles.scrollFadeLeft, showLeftFade ? styles.scrollFadeVisible : ""]
          .filter(Boolean)
          .join(" ")}
      />
      <div
        className={[styles.scrollFade, styles.scrollFadeRight, showRightFade ? styles.scrollFadeVisible : ""]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}

export default Table;
