import React, { useEffect, useState } from "react";
import styles from "./Pagination.module.css";
import { Dropdown, DropdownOption } from "./Dropdown";
import Button from "./Button";
import Icon from "./Icon";

export type PaginationProps = {
  page: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function Pagination({
  page,
  pageSize,
  pageSizeOptions,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const commitPageInput = () => {
    const parsed = Number(pageInput);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed);
    } else {
      setPageInput(String(page));
    }
  };

  const pageSizeOptionList: DropdownOption[] = pageSizeOptions.map((size) => ({
    value: String(size),
    label: String(size),
  }));

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.label}>Items Per Page</span>
        <Dropdown
          size="small"
          value={String(pageSize)}
          options={pageSizeOptionList}
          ariaLabel="Items per page"
          onChange={(value) => onPageSizeChange(Number(value))}
        />
      </div>

      <div className={styles.rangeText}>
        <span>
          {rangeStart}-{rangeEnd}
        </span>
        <span>of</span>
        <span>{totalItems.toLocaleString()}</span>
      </div>

      <div className={styles.right}>
        <div className={styles.pageGroup}>
          <span className={styles.label}>Page</span>
          <input
            type="text"
            inputMode="numeric"
            className={styles.pageInput}
            value={pageInput}
            disabled={totalPages <= 1}
            aria-label="Jump to page"
            onChange={(event) => setPageInput(event.target.value)}
            onBlur={commitPageInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
          />
          <span className={styles.label}>of</span>
          <span className={styles.label}>{totalPages} Pages</span>
        </div>

        <div className={styles.navGroup}>
          <Button
            variant="secondary"
            size="small"
            iconOnly
            icon={<Icon name="chevron_backward" color="var(--xops-text-secondary)" />}
            ariaLabel="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          />
          <Button
            variant="secondary"
            size="small"
            iconOnly
            icon={<Icon name="chevron_right" color="var(--xops-text-secondary)" />}
            ariaLabel="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          />
        </div>
      </div>
    </div>
  );
}

export default Pagination;
