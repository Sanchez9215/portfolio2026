import React, { useState } from "react";
import { LogoTile } from "./LogoTile";
import { Stat } from "./Stat";
import { Legend } from "./Legend";
import { BarChart } from "./BarChart";
import { RankedBarChart } from "./RankedBarChart";
import { Card } from "./Card";
import { Dropdown, DropdownOption } from "./Dropdown";
import { Toggle, ToggleOption } from "./Toggle";
import Icon from "./Icon";
import { Tooltip, TooltipProps } from "./Tooltip";
import { TagStatus } from "./Tag";
import { MagicSurface } from "./MagicSurface";
import styles from "./SoftwareProfile.module.css";

const viewByOptions: DropdownOption[] = [
  { value: "top-departments", label: "Top Departments" },
  { value: "cost-center", label: "Cost Center" },
];

const metricOptions: ToggleOption<"count" | "cost">[] = [
  { value: "count", label: "Count" },
  { value: "cost", label: "Cost" },
];

// Cycled by index — matches RankedBarChart's chart-library color convention (established
// in the Storybook story) for lists longer than the 8-color chart palette.
const departmentChartColors = [
  "var(--xops-chart-1)",
  "var(--xops-chart-2)",
  "var(--xops-chart-3)",
  "var(--xops-chart-4)",
  "var(--xops-chart-5)",
  "var(--xops-chart-6)",
  "var(--xops-chart-7)",
  "var(--xops-chart-8)",
];

export type DepartmentBreakdown = {
  id: string; // departmentId — the join key the drill-down fetches employees by
  label: string;
  count: number;
  cost: number;
};

export type EmployeeBreakdownContext = {
  unitId: string; // departmentId, for fetching the unit's employee rows
  unitLabel: string;
  unitValue: string;
  metricValue: string;
  metricPercent: string;
  opportunityValue: string;
};

export type SoftwareProfileProps = {
  logo: string;
  name: string;
  fullName: string;
  vendor: string;
  owner: string;
  description: string;
  renewalDate: string;
  renewalLabel: string;
  renewalStatus: TagStatus;
  renewalTooltip: Omit<TooltipProps, "children" | "className">;
  opportunityTotal: string;
  opportunityTooltip: Omit<TooltipProps, "children" | "className">;
  inactiveWasteAmount: string;
  inactiveWastePercent: string;
  unassignedWasteAmount: string;
  unassignedWastePercent: string;
  licensesPurchasedTotal: string;
  assignedValue: string;
  assignedPercent: string;
  assignedTooltip: Omit<TooltipProps, "children" | "className">;
  unassignedLicensesValue: string;
  unassignedLicensesPercent: string;
  unassignedTooltip: Omit<TooltipProps, "children" | "className">;
  utilizationRateValue: string;
  utilizationRateLabel: string;
  utilizationRateStatus: TagStatus;
  utilizationTooltip: Omit<TooltipProps, "children" | "className">;
  activeCount: number;
  activeValue: string;
  activePercent: string;
  activeTooltip: Omit<TooltipProps, "children" | "className">;
  inactiveCount: number;
  inactiveValue: string;
  inactivePercent: string;
  inactiveTooltip: Omit<TooltipProps, "children" | "className">;
  licensesPurchasedCount: number;
  unusedLicensesValue: string;
  unusedLicensesPercent: string;
  departmentBreakdown: DepartmentBreakdown[];
  distributionTooltip: Omit<TooltipProps, "children" | "className">;
  terminatedEmployeesBreakdown: DepartmentBreakdown[];
  onViewInactiveEmployees?: (context: EmployeeBreakdownContext) => void;
  onViewTerminatedEmployees?: (context: EmployeeBreakdownContext) => void;
};

export function SoftwareProfile({
  logo,
  name,
  fullName,
  vendor,
  owner,
  description,
  renewalDate,
  renewalLabel,
  renewalStatus,
  renewalTooltip,
  opportunityTotal,
  opportunityTooltip,
  inactiveWasteAmount,
  inactiveWastePercent,
  unassignedWasteAmount,
  unassignedWastePercent,
  licensesPurchasedTotal,
  assignedValue,
  assignedPercent,
  assignedTooltip,
  unassignedLicensesValue,
  unassignedLicensesPercent,
  unassignedTooltip,
  utilizationRateValue,
  utilizationRateLabel,
  utilizationRateStatus,
  utilizationTooltip,
  activeCount,
  activeValue,
  activePercent,
  activeTooltip,
  inactiveCount,
  inactiveValue,
  inactivePercent,
  inactiveTooltip,
  licensesPurchasedCount,
  unusedLicensesValue,
  unusedLicensesPercent,
  departmentBreakdown,
  distributionTooltip,
  terminatedEmployeesBreakdown,
  onViewInactiveEmployees,
  onViewTerminatedEmployees,
}: SoftwareProfileProps) {
  const [viewBy, setViewBy] = useState<string>("top-departments");
  const [metric, setMetric] = useState<"count" | "cost">("count");

  const formatBreakdownTotal = (rows: DepartmentBreakdown[]) => {
    const total = rows.reduce((sum, row) => sum + row[metric], 0);
    return metric === "cost" ? `$${total.toLocaleString()}` : total.toLocaleString();
  };

  // Tooltip's "% of Total" is always count-based, independent of the Count/Cost toggle.
  const formatSharePercent = (count: number, rows: DepartmentBreakdown[]) => {
    const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
    return totalCount > 0 ? `${((count / totalCount) * 100).toFixed(1)}%` : "0%";
  };

  // Cost Center has no real grouping data yet — reuses the department-shaped mock rows
  // (decorative, per user direction) but the title reflects the selected grouping.
  const distributionUnitLabel = viewBy === "cost-center" ? "Cost Center" : "Department";

  return (
    <div className={styles.profile}>
      <div className={styles.headerSection}>
        <div className={styles.appHeader}>
          <div className={styles.identity}>
            <LogoTile src={logo} alt={name} size="large" />
            <div className={styles.identityText}>
              <p className={styles.name} title={name}>
                {name}
              </p>
              {/* fullName (publisher) intentionally hidden for now — kept wired for a future re-enable */}
              <div className={styles.metaRow}>
                <span className={styles.metaText}>Vendor: {vendor}</span>
                <span className={styles.metaItem}>
                  <Icon name="id_card" color="var(--xops-text-secondary)" className={styles.metaIcon} />
                  <span className={styles.metaText}>{owner}</span>
                </span>
              </div>
            </div>
          </div>
          <Stat
            label="Renewal"
            icon
            value={renewalDate}
            tag={{ status: renewalStatus, label: renewalLabel }}
            valueSize="small"
            spaceBetween
            tooltip={renewalTooltip}
            className={styles.renewalStat}
          />
        </div>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.content}>
        <MagicSurface className={styles.summaryCard}>
          <div className={styles.summaryCardContent}>
            <div className={styles.summaryCardHeader}>
              <div className={styles.summaryCardTitleRow}>
                <p className={styles.summaryCardTitle}>Opportunity</p>
                <Tooltip {...opportunityTooltip}>
                  <Icon name="InfoCircle" color="var(--xops-text-secondary)" className={styles.summaryCardIcon} />
                </Tooltip>
              </div>
              <p className={styles.summaryCardValue}>{opportunityTotal}</p>
            </div>
            <div className={styles.summaryCardTiles}>
              <Stat
                label="Inactive Waste"
                value={inactiveWasteAmount}
                meta={inactiveWastePercent}
                surface="white"
              />
              <Stat
                label="Unassigned Waste"
                value={unassignedWasteAmount}
                meta={unassignedWastePercent}
                surface="white"
              />
            </div>
          </div>
        </MagicSurface>
        <div className={styles.licensesCard}>
          <div className={styles.summaryCardHeader}>
            <p className={styles.summaryCardTitle}>Licenses Purchased</p>
            <p className={styles.summaryCardValue}>{licensesPurchasedTotal}</p>
          </div>
          <div className={styles.summaryCardTiles}>
            <Stat
              label="Assigned"
              value={assignedValue}
              tag={{ status: "success", label: assignedPercent }}
              tooltip={assignedTooltip}
            />
            <Stat
              label="Unassigned"
              value={unassignedLicensesValue}
              meta={unassignedLicensesPercent}
              tooltip={unassignedTooltip}
            />
            <Stat
              label="Utilization Rate"
              value={utilizationRateValue}
              tag={{ status: utilizationRateStatus, label: utilizationRateLabel }}
              tooltip={utilizationTooltip}
            />
          </div>
        </div>
        <div className={styles.utilizationCard}>
          <p className={styles.summaryCardTitle}>Utilization Status</p>
          <BarChart
            total={licensesPurchasedCount}
            segments={[
              { value: activeCount, color: "var(--xops-status-success-solid)" },
              { value: inactiveCount, color: "var(--xops-status-warning-solid)" },
            ]}
          />
          <Legend
            items={[
              {
                label: "Active",
                value: activeValue,
                meta: activePercent,
                color: "var(--xops-status-success-solid)",
                tooltip: activeTooltip,
              },
              {
                label: "Inactive",
                value: inactiveValue,
                meta: inactivePercent,
                color: "var(--xops-status-warning-solid)",
                tooltip: inactiveTooltip,
              },
              {
                label: "Unassigned",
                value: unassignedLicensesValue,
                meta: unassignedLicensesPercent,
                color: "var(--xops-grey-500)",
                tooltip: unassignedTooltip,
              },
            ]}
          />
          <div className={styles.unusedLicensesRow}>
            <p className={styles.unusedLicensesLabel}>Unused Licenses (Inactive + Unassigned)</p>
            <div className={styles.unusedLicensesValueGroup}>
              <span className={styles.unusedLicensesValue}>{unusedLicensesValue}</span>
              <span className={styles.unusedLicensesMeta}>{unusedLicensesPercent}</span>
            </div>
          </div>
        </div>
        <div className={styles.detailContainer}>
          <div className={styles.detailHeader}>
            <div className={styles.summaryCardTitleRow}>
              <p className={styles.summaryCardTitle}>Inactive License Distribution</p>
              <Tooltip {...distributionTooltip}>
                <Icon name="InfoCircle" color="var(--xops-text-secondary)" className={styles.summaryCardIcon} />
              </Tooltip>
            </div>
            <div className={styles.breakdownOptions}>
              <div className={styles.viewByGroup}>
                <span className={styles.breakdownLabel}>View By</span>
                <Dropdown
                  value={viewBy}
                  options={viewByOptions}
                  onChange={setViewBy}
                  ariaLabel="View by"
                  openDirection="down"
                />
              </div>
              <div className={styles.metricGroup}>
                <span className={styles.breakdownLabel}>Metric</span>
                <Toggle value={metric} options={metricOptions} onChange={setMetric} ariaLabel="Metric" />
              </div>
            </div>
          </div>
          <Card
            title={`Inactive Licenses by ${distributionUnitLabel}`}
            titleSize="body-14"
            headerValue={formatBreakdownTotal(departmentBreakdown)}
          >
            <RankedBarChart
              rows={departmentBreakdown.map((department, index) => ({
                label: department.label,
                value: metric === "count" ? department.count : department.cost,
                color: departmentChartColors[index % departmentChartColors.length],
                tooltip: {
                  rows: [
                    { label: "Inactive Licenses", value: department.count.toLocaleString() },
                    {
                      label: "% of Total Inactive",
                      value: formatSharePercent(department.count, departmentBreakdown),
                    },
                  ],
                  opportunity: { label: "Opportunity", value: `$${department.cost.toLocaleString()}` },
                  action: {
                    label: "View Inactive Employees",
                    icon: <Icon name="person" color="var(--xops-text-secondary)" />,
                    onClick: () =>
                      onViewInactiveEmployees?.({
                        unitId: department.id,
                        unitLabel: distributionUnitLabel,
                        unitValue: department.label,
                        metricValue: department.count.toLocaleString(),
                        metricPercent: formatSharePercent(department.count, departmentBreakdown),
                        opportunityValue: `$${department.cost.toLocaleString()}`,
                      }),
                  },
                },
              }))}
            />
          </Card>
          <Card
            title={`Licenses Assigned to Terminated Employees by ${distributionUnitLabel}`}
            titleSize="body-14"
            headerValue={formatBreakdownTotal(terminatedEmployeesBreakdown)}
          >
            <RankedBarChart
              rows={terminatedEmployeesBreakdown.map((department, index) => ({
                label: department.label,
                value: metric === "count" ? department.count : department.cost,
                color: departmentChartColors[index % departmentChartColors.length],
                tooltip: {
                  rows: [
                    { label: "Terminated Employees", value: department.count.toLocaleString() },
                    {
                      label: "% of Total Terminated",
                      value: formatSharePercent(department.count, terminatedEmployeesBreakdown),
                    },
                  ],
                  opportunity: { label: "Opportunity", value: `$${department.cost.toLocaleString()}` },
                  action: {
                    label: "View Terminated Employees",
                    icon: <Icon name="person" color="var(--xops-text-secondary)" />,
                    onClick: () =>
                      onViewTerminatedEmployees?.({
                        unitId: department.id,
                        unitLabel: distributionUnitLabel,
                        unitValue: department.label,
                        metricValue: department.count.toLocaleString(),
                        metricPercent: formatSharePercent(department.count, terminatedEmployeesBreakdown),
                        opportunityValue: `$${department.cost.toLocaleString()}`,
                      }),
                  },
                },
              }))}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SoftwareProfile;
