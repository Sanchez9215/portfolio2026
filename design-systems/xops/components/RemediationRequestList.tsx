import React, { useState } from "react";
import Accordion from "./Accordion";
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
          <Accordion
            key={request.id}
            title={request.id}
            open={isOpen}
            onToggle={() => setOpenId(isOpen ? undefined : request.id)}
            headerEnd={
              <>
                <div className={styles.progressCell}>
                  <ProgressBar value={request.percent} status="info" valueLabel={request.percentLabel} height="8" />
                </div>
                <span className={styles.recordsCell}>{request.recordsLabel}</span>
              </>
            }
          >
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
          </Accordion>
        );
      })}
    </div>
  );
}

export default RemediationRequestList;
