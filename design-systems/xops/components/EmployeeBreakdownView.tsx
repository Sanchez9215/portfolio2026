import React, { useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import { Stat } from "./Stat";
import { Table, Column } from "./Table";
import { Tooltip, TooltipProps } from "./Tooltip";
import styles from "./EmployeeBreakdownView.module.css";

export type InactiveEmployeeRow = {
  name: string;
  daysInactive: number | null; // null → never signed in
  lastActivity: string;
  status: string;
};

export type TerminatedEmployeeRow = {
  name: string;
  terminationDate: string;
  daysSinceTermination: number;
  licenseStatus: "Reclaimed" | "Not Reclaimed";
};

export type EmployeeBreakdownViewProps = {
  mode: "inactive" | "terminated";
  unitLabel: string;
  unitValue: string;
  metricLabel: string;
  metricValue: string;
  metricPercent: string;
  metricTooltip: Omit<TooltipProps, "children" | "className">;
  opportunityValue: string;
  opportunityTooltip: Omit<TooltipProps, "children" | "className">;
  inactiveRows?: InactiveEmployeeRow[];
  terminatedRows?: TerminatedEmployeeRow[];
  onBack: () => void;
  // Roadmap: no real CSV export wired yet — structure only.
  onExportCsv?: () => void;
  // Roadmap: names render as link buttons (example only) — real navigation wired later.
  onEmployeeClick?: (name: string) => void;
};

export function EmployeeBreakdownView({
  mode,
  unitLabel,
  unitValue,
  metricLabel,
  metricValue,
  metricPercent,
  metricTooltip,
  opportunityValue,
  opportunityTooltip,
  inactiveRows = [],
  terminatedRows = [],
  onBack,
  onExportCsv,
  onEmployeeClick,
}: EmployeeBreakdownViewProps) {
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const nameCell = (name: string) => (
    <Button variant="link" size="small" onClick={() => onEmployeeClick?.(name)}>
      {name}
    </Button>
  );

  const inactiveColumns: Column<InactiveEmployeeRow>[] = [
    { key: "name", label: "Employee", width: "flex", sortable: true, render: (row) => nameCell(row.name) },
    {
      key: "daysInactive",
      label: "Days Inactive",
      width: "flex",
      sortable: true,
      render: (row) => (row.daysInactive === null ? "Never active" : `${row.daysInactive} days`),
    },
    { key: "lastActivity", label: "Last Activity", width: "flex", sortable: true },
    { key: "status", label: "Employment Status", width: "flex", sortable: true },
  ];

  const terminatedColumns: Column<TerminatedEmployeeRow>[] = [
    { key: "name", label: "Employee", width: "flex", sortable: true, render: (row) => nameCell(row.name) },
    { key: "terminationDate", label: "Termination Date", width: "flex", sortable: true },
    {
      key: "daysSinceTermination",
      label: "Days Since Termination",
      width: "flex",
      sortable: true,
      render: (row) => `${row.daysSinceTermination} days`,
    },
    { key: "licenseStatus", label: "License Status", width: "flex", sortable: true },
  ];

  return (
    <div className={styles.view}>
      <div className={styles.topBar}>
        <Button variant="text" icon={<Icon name="chevron_backward" color="var(--xops-text-secondary)" />} onClick={onBack}>
          Back to Profile
        </Button>
        <Button variant="primary" icon={<Icon name="download" color="var(--xops-white)" />} onClick={onExportCsv}>
          Export CSV
        </Button>
      </div>

      <div className={styles.heading}>
        <p className={styles.unitLabel}>{unitLabel}</p>
        <p className={styles.unitValue}>{unitValue}</p>
      </div>

      <div className={styles.summaryTiles}>
        <Stat
          label="Opportunity"
          value={opportunityValue}
          tooltip={opportunityTooltip}
          surface="magic"
          magicScale={0.5}
        />
        <Stat label={metricLabel} value={metricValue} meta={`(${metricPercent})`} tooltip={metricTooltip} />
      </div>

      {mode === "inactive" ? (
        <Table
          columns={inactiveColumns}
          data={inactiveRows}
          rowKey={(row) => row.name}
          chrome={false}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      ) : (
        <Table
          columns={terminatedColumns}
          data={terminatedRows}
          rowKey={(row) => row.name}
          chrome={false}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
}

export default EmployeeBreakdownView;
