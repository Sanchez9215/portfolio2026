import React, { useState } from "react";
import Icon from "./Icon";
import { ProgressBar } from "./ProgressBar";
import { Card } from "./Card";
import { Table, Column } from "./Table";
import styles from "./RemediationRequestList.module.css";

export type RemediationDepartmentRow = {
  department: string;
  percent: number;
  remediatedTotalLabel: string;
};

export type RemediationRequest = {
  id: string;
  percent: number;
  percentLabel: string;
  recordsLabel: string;
  departments: RemediationDepartmentRow[];
};

export type RemediationRequestListProps = {
  requests: RemediationRequest[];
  /** Ticket id of the initially-open row, if any. */
  defaultOpenId?: string;
};

const departmentColumns: Column<RemediationDepartmentRow>[] = [
  {
    key: "department",
    label: "Department",
    width: 142,
    sortable: true,
    render: (row) => row.department,
  },
  {
    key: "remediationProgress",
    label: "Remediation Progress",
    width: 200,
    align: "right",
    sortable: true,
    render: (row) => (
      <ProgressBar value={row.percent} status="info" valueLabel={`${row.percent}%`} height="8" />
    ),
  },
  {
    key: "remediatedTotal",
    label: "Remediated/Total",
    width: 154,
    align: "right",
    sortable: true,
    render: (row) => row.remediatedTotalLabel,
  },
];

export function RemediationRequestList({ requests, defaultOpenId }: RemediationRequestListProps) {
  const [openId, setOpenId] = useState<string | undefined>(defaultOpenId);

  return (
    <div className={styles.list}>
      {requests.map((request) => {
        const isOpen = openId === request.id;
        return (
          <div key={request.id} className={styles.row}>
            <button
              type="button"
              className={styles.header}
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? undefined : request.id)}
            >
              <div className={styles.headerLeft}>
                <span className={[styles.chevron, isOpen && styles.chevronOpen].filter(Boolean).join(" ")}>
                  <Icon name="keyboard_arrow_down" color="var(--xops-text-secondary)" />
                </span>
                <span className={styles.ticketId}>{request.id}</span>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.progressCell}>
                  <ProgressBar value={request.percent} status="info" valueLabel={request.percentLabel} height="8" />
                </div>
                <span className={styles.recordsCell}>{request.recordsLabel}</span>
              </div>
            </button>

            {isOpen && (
              <div className={styles.detail}>
                <Card title="Progress by Department" titleSize="subheading-14">
                  <Table
                    columns={departmentColumns}
                    data={request.departments}
                    rowKey={(row) => row.department}
                    chrome={false}
                    scrollFade={false}
                    headerLabelSize="subheading-12"
                  />
                </Card>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RemediationRequestList;
