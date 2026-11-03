import React from "react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";
import { Stat } from "./Stat";
import { RequestStatus, requestStatusTag } from "./requestStatus";
import styles from "./RequestDetailHeader.module.css";

export type RequestAction = "close" | "cancel";

const ACTIONS = [
  { value: "close" as const, label: "Close Request" },
  { value: "cancel" as const, label: "Cancel Request" },
];

export type RequestDetailHeaderProps = {
  id: string;
  runbookName: string;
  dateOpened: string;
  /** null while the request is still open. */
  dateClosed: string | null;
  requestor: string;
  status: RequestStatus;
  onAction?: (action: RequestAction) => void;
  /** Replaces the id title with a breadcrumb trail (e.g. REQ-232 › ITM-01) on a drill-down. */
  breadcrumb?: BreadcrumbItem[];
  /** Set false to hide the four info tiles. Defaults to true. */
  showTiles?: boolean;
};

export function RequestDetailHeader({
  id,
  runbookName,
  dateOpened,
  dateClosed,
  requestor,
  status,
  onAction,
  breadcrumb,
  showTiles = true,
}: RequestDetailHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.title}>
          {breadcrumb ? <Breadcrumb items={breadcrumb} /> : <h2 className={styles.id}>{id}</h2>}
          <p className={styles.runbookName}>{runbookName}</p>
        </div>
        <Dropdown<RequestAction | "">
          className={styles.actions}
          label="Actions"
          value=""
          options={ACTIONS}
          onChange={(action) => action && onAction?.(action)}
          ariaLabel="Request actions"
          openDirection="down"
        />
      </div>
      {showTiles && (
      <div className={styles.tiles}>
        <Stat label="Date Opened" value={dateOpened} valueSize="small" size="compact" />
        <Stat label="Date Closed" value={dateClosed ?? "-"} valueSize="small" size="compact" />
        <Stat
          label="Requestor"
          valueSize="small" size="compact"
          value={<Button variant="inline-link">{requestor}</Button>}
        />
        <Stat label="Status" size="compact" value="" tag={{ status: requestStatusTag[status], label: status }} />
      </div>
      )}
    </header>
  );
}

export default RequestDetailHeader;
