import React, { useMemo, useState } from "react";
import { Table, Column, SortDirection } from "./Table";
import styles from "./DeviceTable.module.css";

export type DeviceTableRow = {
  id: string;
  assetTag: string;
  /** Image URL. */
  image: string;
  make: string;
  model: string;
  trackingNumber: string;
  warrantyEnd: string;
  /** ISO value the Warranty End column sorts on. */
  warrantyEndAt: string;
  serialNumber: string;
};

export type DeviceTableProps = {
  rows: DeviceTableRow[];
  /** A recovery adds the Warranty End column. */
  mode: "deployment" | "recovery";
};

const sortValue = (row: DeviceTableRow, key: string): string =>
  key === "warrantyEnd" ? row.warrantyEndAt : String((row as Record<string, unknown>)[key] ?? "");

// The device a request item is about, for the item drill-down: photo, then asset tag, make, model, tracking and serial.
export function DeviceTable({ rows, mode }: DeviceTableProps) {
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const columns: Column<DeviceTableRow>[] = [
    {
      key: "image",
      label: "",
      width: "auto",
      render: (row) => <img src={row.image} alt={`${row.make} ${row.model}`} className={styles.image} />,
    },
    { key: "assetTag", label: "Asset", width: "flex", sortable: true },
    { key: "make", label: "Make", width: "flex", sortable: true },
    { key: "model", label: "Model", width: "flex", sortable: true },
    {
      key: "trackingNumber",
      label: "Tracking #",
      width: "flex",
      sortable: true,
      // No shipment yet: muted, with an ellipsis, so it reads as not there yet.
      render: (row) => (row.trackingNumber === "Pending" ? <span className={styles.pending}>Pending...</span> : row.trackingNumber),
    },
    ...(mode === "recovery" ? [{ key: "warrantyEnd", label: "Warranty End", width: "flex" as const, sortable: true }] : []),
    { key: "serialNumber", label: "Serial Number", width: "flex", sortable: true },
  ];

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => sortValue(a, sortKey).localeCompare(sortValue(b, sortKey)) * direction);
  }, [rows, sortKey, sortDirection]);

  return (
    <Table
      chrome={false}
      columns={columns}
      data={sorted}
      rowKey={(row) => row.id}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortChange={(key) => {
        setSortDirection(key === sortKey && sortDirection === "asc" ? "desc" : "asc");
        setSortKey(key);
      }}
    />
  );
}

export default DeviceTable;
