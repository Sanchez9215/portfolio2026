import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import styles from "./Table.module.css";
import Icon from "./Icon";
import Button from "./Button";
import { Tooltip, TooltipProps } from "./Tooltip";

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
  tooltip?: Omit<TooltipProps, "children" | "className">;
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
  selectedRowKey?: string;
  onRowClick?: (row: T) => void;
  /** Pins to the bottom of the scroll area with rows scrolling behind it (e.g. `Pagination`), instead of stacking below in normal flow. */
  pagination?: ReactNode;
  /** Optional per-row tint (existing status tokens only) — e.g. flagging a threshold breach. Additive; omit for the default untinted row. */
  rowStatus?: (row: T) => "warning" | "danger" | undefined;
  /** Left/right hidden-overflow gradient overlays. Additive; defaults to on. */
  scrollFade?: boolean;
  /** data-hotspot id applied to every row where rowStatus(row) === "danger" — lets an external overlay target the flagged-row group as one unit. */
  dangerHotspotId?: string;
  /** Disables the body's internal vertical scroll (rows past the fold render but are
   *  clipped by an ancestor instead) — for a live embed whose row positions need to
   *  stay fixed while a hotspot overlay measures them. Horizontal scroll is unaffected. */
  disableVerticalScroll?: boolean;
  /** Blocks user-driven horizontal scroll (wheel/touch/drag/scrollbar) while leaving
   *  `scrollToX`'s programmatic scrollTo unaffected — for a live embed whose column
   *  position must only move as a scripted beat, never by direct user input. */
  disableHorizontalScroll?: boolean;
  /** Programmatically (smooth) scrolls the body horizontally to its start or end —
   *  for a live embed that needs to auto-reveal off-screen columns as a scripted
   *  beat. Omit for normal user-driven scroll. */
  scrollToX?: "start" | "end";
  /** Trailing arrow_forward_ios cell on every row, signaling the row navigates to a different page (vs. onRowClick alone, which covers in-place actions like row selection or opening a side panel). Requires onRowClick. */
  showChevron?: boolean;
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
  selectedRowKey,
  onRowClick,
  pagination,
  rowStatus,
  scrollFade = true,
  dangerHotspotId,
  disableVerticalScroll = false,
  disableHorizontalScroll = false,
  scrollToX,
  showChevron = false,
}: TableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const [paginationHeight, setPaginationHeight] = useState(0);

  useEffect(() => {
    if (!scrollToX) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: scrollToX === "end" ? el.scrollWidth : 0, behavior: "smooth" });
  }, [scrollToX]);

  useEffect(() => {
    const el = paginationRef.current;
    if (!el) {
      setPaginationHeight(0);
      return;
    }

    const updateHeight = () => setPaginationHeight(el.offsetHeight);
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [pagination]);

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
      <div
        ref={scrollRef}
        className={styles.scroll}
        style={{
          ...(pagination ? { paddingBottom: paginationHeight } : undefined),
          // "hidden", not "visible" — the CSS spec forces a "visible" overflow-y back to
          // "auto" whenever overflow-x isn't also "visible" (which it isn't once
          // disableHorizontalScroll sets overflow-x: hidden), silently re-enabling
          // scroll. "hidden" clips instead of the ancestor, but the ancestor (LiveEmbed's
          // fixed-height container) already clips at the same boundary, so nothing
          // additional is lost.
          ...(disableVerticalScroll ? { overflowY: "hidden" } : undefined),
          // overflow: hidden still allows programmatic scrollTo (scrollToX) — it only
          // blocks user-driven wheel/touch/drag/scrollbar interaction.
          ...(disableHorizontalScroll ? { overflowX: "hidden" } : undefined),
        }}
      >
      <table className={styles.table}>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={colStyle(column.width)} />
          ))}
          {showChevron && <col style={{ width: 20, whiteSpace: "nowrap" }} />}
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
                  aria-sort={
                    column.sortable
                      ? isSorted
                        ? sortDirection === "desc"
                          ? "descending"
                          : "ascending"
                        : "none"
                      : undefined
                  }
                >
                  {column.sortable ? (
                    <span className={styles.headerCellInner}>
                      <span className={styles.headerLabelGroup}>
                        <button
                          type="button"
                          className={styles.sortButton}
                          onClick={() => onSortChange?.(column.key)}
                        >
                          {column.label}
                        </button>
                        {column.tooltip && <Tooltip {...column.tooltip} />}
                      </span>
                      <button
                        type="button"
                        className={styles.sortIconButton}
                        onClick={() => onSortChange?.(column.key)}
                        aria-label={`Sort by ${column.label}`}
                      >
                        <Icon
                          name="Arrows"
                          color={isSorted ? "var(--xops-text-primary)" : "var(--xops-text-secondary)"}
                          className={
                            isSorted && sortDirection === "desc" ? styles.sortIconDesc : undefined
                          }
                        />
                      </button>
                    </span>
                  ) : (
                    <span className={styles.headerCellInner}>
                      <span className={styles.headerLabelGroup}>
                        <span>{column.label}</span>
                        {column.tooltip && <Tooltip {...column.tooltip} />}
                      </span>
                    </span>
                  )}
                </th>
              );
            })}
            {showChevron && <th scope="col" className={styles.headerCell} data-width="fixed" />}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              className={[
                styles.row,
                onRowClick ? styles.rowClickable : "",
                rowKey(row) === selectedRowKey ? styles.rowSelected : "",
                rowStatus?.(row) === "warning" ? styles.rowWarning : "",
                rowStatus?.(row) === "danger" ? styles.rowDanger : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-hotspot={rowStatus?.(row) === "danger" ? dangerHotspotId : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
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
              {showChevron && (
                <td className={styles.bodyCell} data-align="center" data-width="fixed">
                  <Button
                    iconOnly
                    size="small"
                    ariaLabel="View details"
                    icon={<Icon name="chevron_forward" className={styles.chevron} />}
                    className={styles.chevronButton}
                    tabIndex={-1}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {scrollFade && (
        <div
          className={[styles.scrollFade, styles.scrollFadeLeft, showLeftFade ? styles.scrollFadeVisible : ""]
            .filter(Boolean)
            .join(" ")}
        />
      )}
      {scrollFade && (
        <div
          className={[styles.scrollFade, styles.scrollFadeRight, showRightFade ? styles.scrollFadeVisible : ""]
            .filter(Boolean)
            .join(" ")}
        />
      )}
      {pagination && (
        <div ref={paginationRef} className={styles.paginationOverlay}>
          {pagination}
        </div>
      )}
    </div>
  );
}

export default Table;
