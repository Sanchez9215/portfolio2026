"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "../../../../design-systems/xops/components/Sidebar";
import GlobalHeader from "../../../../design-systems/xops/components/GlobalHeader";
import PageHeader from "../../../../design-systems/xops/components/PageHeader";
import { Grid, GridItem } from "../../../../design-systems/xops/components/Grid";
import { Table, Column } from "../../../../design-systems/xops/components/Table";
import { LogoTile } from "../../../../design-systems/xops/components/LogoTile";
import { Tag, TagStatus } from "../../../../design-systems/xops/components/Tag";
import { FilterTabs, FilterTabOption } from "../../../../design-systems/xops/components/FilterTabs";
import Button from "../../../../design-systems/xops/components/Button";
import Icon from "../../../../design-systems/xops/components/Icon";
import { Pagination } from "../../../../design-systems/xops/components/Pagination";
import { SidePanel } from "../../../../design-systems/xops/components/SidePanel";
import {
  SoftwareProfile,
  DepartmentBreakdown,
  EmployeeBreakdownContext,
} from "../../../../design-systems/xops/components/SoftwareProfile";
import {
  EmployeeBreakdownView,
  InactiveEmployeeRow,
  TerminatedEmployeeRow,
} from "../../../../design-systems/xops/components/EmployeeBreakdownView";
import { TooltipProps } from "../../../../design-systems/xops/components/Tooltip";
import { getDataset } from "../../../../design-systems/xops/data/generate";
import {
  productSummaries,
  ProductSummary,
  inactiveByDepartment,
  terminatedByDepartment,
  inactiveEmployees,
  terminatedEmployees,
} from "../../../../design-systems/xops/data/metrics";

// Active Licenses ÷ Assigned Licenses, per the audited Utilization tooltip (Figma 352:28400):
// Critical ≤74%, Underutilized 75–84%, Healthy ≥85%.
function utilizationStatus(percent: number): TagStatus {
  if (percent >= 85) return "success";
  if (percent >= 75) return "warning";
  return "danger";
}

function utilizationLabel(percent: number): string {
  if (percent >= 85) return "Healthy";
  if (percent >= 75) return "Underutilized";
  return "Critical";
}

// Audited from Figma 666:2200 (Utilization tooltip, first Tooltip primitive variant).
const utilizationTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Utilization",
  description:
    "The percentage of assigned licenses that have shown activity within the last 90 days.",
  calculation: "Active Licenses/Assigned Licenses",
  legend: [
    { status: "danger", label: "Critical", range: "≤74%" },
    { status: "warning", label: "Underutilized", range: "76-84%" },
    { status: "success", label: "Healthy", range: "≥85%" },
  ],
};

const opportunityTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Opportunity",
  description:
    "The dollar value of inactive and unassigned licenses, reflecting potential savings through reclamation and inventory optimization.",
};

const assignedTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Assigned",
  description:
    "Purchased licenses designated to a specific employee, reserving the seat for their use.",
};

const unassignedTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Unassigned",
  description:
    "Purchased license seats remaining in the inventory pool that are available to be distributed to users.",
};

// Audited from Figma 1137:34471 (Case-Study--Software-Observability file) — legend thresholds
// match renewalStatus()'s own tiers below exactly.
const renewalTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Renewal",
  description:
    "Software approaching contract expiration within 180 days, requiring evaluation of value and utilization to inform renewal decisions.",
  legend: [
    { status: "danger", label: "Critical", range: "≤30 days" },
    { status: "caution", label: "High Priority", range: "31-89 days" },
    { status: "warning", label: "Upcoming", range: "90-180 days" },
    { status: "neutral", label: "Low Priority", range: "≥181 days" },
  ],
};

const distributionTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Inactive License Distribution",
  description:
    "Shows how this software's inactive licenses break down by organizational unit (department or cost center), in either license count or estimated cost.",
  calculation: "Cost = Organizational Unit License Count × Avg Cost/License (Total Spend ÷ Licenses Purchased)",
};

const activeTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Active",
  description:
    "Assigned licenses that have recorded user activity within the last 90 days, showing they are delivering value.",
};

const inactiveTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Inactive",
  description:
    "Assigned licenses that have recorded zero user activity within the last 90 days, making them primary targets for cost-saving reclamation.",
};

const inactiveLicensesMetricTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Inactive Licenses",
  description:
    "The count of this organizational unit's assigned licenses with zero user activity within the last 90 days.",
};

const terminatedEmployeesMetricTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Terminated Employees",
  description:
    "The count of this organizational unit's licenses still assigned to employees who have since left the company.",
};

// Renewal urgency thresholds: Critical ≤30 days, High priority 31–89, Upcoming 90–180, Low priority ≥181.
function renewalStatus(days: number): TagStatus {
  if (days <= 30) return "danger";
  if (days <= 89) return "caution";
  if (days <= 180) return "warning";
  return "neutral";
}

// Display only — matches renewalStatus's own ≤180-day boundary. Below it, the three urgent
// tiers show raw days; the open-ended Low Priority tier (≥181) switches to months, then years.
function formatRenewalDuration(days: number): string {
  if (days <= 180) return `${days} days`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} month${months === 1 ? "" : "s"}`;
  }
  const years = Math.round(days / 365);
  return `${years} year${years === 1 ? "" : "s"}`;
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

// Render-time share formatter; guards the zero-denominator case (e.g. consumption products
// carry no seats, so any per-seat share is undefined rather than a division by zero).
function formatPercent(part: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

// ISO date → "Mmm D, YYYY", matching the format the audited screens already displayed.
// UTC-pinned so the generator's UTC dates never shift a day under a local timezone.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const EM_DASH = "—";

const softwareColumns: Column<ProductSummary>[] = [
  {
    key: "name",
    label: "Software",
    width: 240,
    sortable: true,
    render: (row) => (
      <div
        title={row.name}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--xops-spacing-8)",
          minWidth: 0,
        }}
      >
        <LogoTile src={row.logo} alt={row.name} size="medium" />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {row.name}
        </span>
      </div>
    ),
  },
  { key: "reseller", label: "Vendor", width: "auto", sortable: true },
  { key: "category", label: "Category", width: "auto", sortable: true },
  {
    key: "utilization",
    label: "Utilization",
    width: "auto",
    sortable: true,
    tooltip: utilizationTooltip,
    render: (row) =>
      row.seatBased ? (
        <Tag status={utilizationStatus(row.utilization)}>{row.utilization}%</Tag>
      ) : (
        EM_DASH
      ),
  },
  {
    key: "opportunity",
    label: "Opportunity",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: opportunityTooltip,
    render: (row) => (row.seatBased ? formatCurrency(row.opportunity) : EM_DASH),
  },
  {
    key: "renewalDate",
    label: "Renewal",
    width: "auto",
    sortable: true,
    render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--xops-spacing-8)" }}>
        <span>{formatDate(row.renewalDate)}</span>
        <Tag status={renewalStatus(row.renewalDays)}>{formatRenewalDuration(row.renewalDays)}</Tag>
      </div>
    ),
  },
  {
    key: "totalSpend",
    label: "Total Spend",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatCurrency(row.totalSpend),
  },
  {
    key: "purchased",
    label: "Licenses Purchased",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => (row.seatBased ? row.purchased.toLocaleString() : EM_DASH),
  },
];

const regionOptions: FilterTabOption[] = [
  { value: "global", label: "Global" },
  { value: "na", label: "NA" },
  { value: "apac", label: "APAC" },
  { value: "latam", label: "LATAM" },
  { value: "emea", label: "EMEA" },
];

export default function XopsAllSoftwarePage() {
  const ds = useMemo(() => getDataset(), []);
  const summaries = useMemo(() => productSummaries(ds), [ds]);

  const [region, setRegion] = useState("global");
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined);
  const [profileOpen, setProfileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [panelView, setPanelView] = useState<"profile" | "inactive-employees" | "terminated-employees">(
    "profile",
  );
  const [employeeBreakdownContext, setEmployeeBreakdownContext] = useState<EmployeeBreakdownContext | null>(
    null,
  );

  const selectedRow = summaries.find((row) => row.sku === selectedRowId);

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const pagedRows = summaries.slice((page - 1) * pageSize, page * pageSize);

  const inactiveDrillRows: InactiveEmployeeRow[] =
    selectedRow && employeeBreakdownContext
      ? inactiveEmployees(ds, selectedRow.sku, employeeBreakdownContext.unitId).map((e) => ({
          name: e.name,
          daysInactive: e.daysInactive,
          lastActivity: e.lastActivity ? formatDate(e.lastActivity) : "Never",
          status: e.workerStatus,
        }))
      : [];

  const terminatedDrillRows: TerminatedEmployeeRow[] =
    selectedRow && employeeBreakdownContext
      ? terminatedEmployees(ds, selectedRow.sku, employeeBreakdownContext.unitId).map((e) => ({
          name: e.name,
          terminationDate: formatDate(e.terminationDate),
          daysSinceTermination: e.daysSinceTermination,
          licenseStatus: e.licenseStatus,
        }))
      : [];

  const departmentBreakdown: DepartmentBreakdown[] = selectedRow
    ? inactiveByDepartment(ds, selectedRow.sku).map((r) => ({
        id: r.departmentId,
        label: r.label,
        count: r.count,
        cost: r.cost,
      }))
    : [];

  const terminatedEmployeesBreakdown: DepartmentBreakdown[] = selectedRow
    ? terminatedByDepartment(ds, selectedRow.sku).map((r) => ({
        id: r.departmentId,
        label: r.label,
        count: r.count,
        cost: r.cost,
      }))
    : [];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--xops-grey-50)",
      }}
    >
      <Sidebar activeSoftwareItem="all-software" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <GlobalHeader userName="John Doe" notificationCount={19} />
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            gap: "var(--xops-spacing-24)",
            padding: "var(--xops-grid-margin)",
            backgroundColor: "var(--xops-surface-page)",
          }}
        >
          <PageHeader
            title="All Software"
            count={summaries.length}
            metaIcon="cloud_download"
            metaText="Data last updated Jan 14, 2025 at 02:06PM"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--xops-spacing-16)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--xops-spacing-16)" }}>
              <FilterTabs
                options={regionOptions}
                value={region}
                onChange={setRegion}
                ariaLabel="Filter by region"
              />
              <Button icon={<Icon name="add_circle" color="var(--xops-text-secondary)" />}>
                Add Filter
              </Button>
            </div>
            <Button iconOnly icon={<Icon name="settings" color="var(--xops-text-secondary)" />} ariaLabel="Settings" />
          </div>
          <Grid style={{ flex: 1, minHeight: 0, gridAutoRows: "1fr" }}>
            <GridItem colSpan={12} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <Table
                columns={softwareColumns}
                data={pagedRows}
                rowKey={(row) => row.sku}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                selectedRowKey={selectedRowId}
                onRowClick={(row) => {
                  setSelectedRowId(row.sku);
                  setProfileOpen(true);
                  setPanelView("profile");
                }}
                pagination={
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    pageSizeOptions={[10, 20, 50]}
                    totalItems={summaries.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                }
              />
            </GridItem>
          </Grid>
        </main>
      </div>
      <SidePanel
        isOpen={profileOpen}
        onClose={() => {
          setProfileOpen(false);
          setPanelView("profile");
        }}
      >
        {selectedRow && panelView === "inactive-employees" && employeeBreakdownContext && (
          <EmployeeBreakdownView
            mode="inactive"
            unitLabel={employeeBreakdownContext.unitLabel}
            unitValue={employeeBreakdownContext.unitValue}
            metricLabel="Inactive Licenses"
            metricValue={employeeBreakdownContext.metricValue}
            metricPercent={employeeBreakdownContext.metricPercent}
            metricTooltip={inactiveLicensesMetricTooltip}
            opportunityValue={employeeBreakdownContext.opportunityValue}
            opportunityTooltip={opportunityTooltip}
            inactiveRows={inactiveDrillRows}
            onBack={() => setPanelView("profile")}
            onExportCsv={() => console.log("Export CSV:", employeeBreakdownContext.unitValue)}
            onEmployeeClick={(name) => console.log("View employee:", name)}
          />
        )}
        {selectedRow && panelView === "terminated-employees" && employeeBreakdownContext && (
          <EmployeeBreakdownView
            mode="terminated"
            unitLabel={employeeBreakdownContext.unitLabel}
            unitValue={employeeBreakdownContext.unitValue}
            metricLabel="Terminated Employees"
            metricValue={employeeBreakdownContext.metricValue}
            metricPercent={employeeBreakdownContext.metricPercent}
            metricTooltip={terminatedEmployeesMetricTooltip}
            opportunityValue={employeeBreakdownContext.opportunityValue}
            opportunityTooltip={opportunityTooltip}
            terminatedRows={terminatedDrillRows}
            onBack={() => setPanelView("profile")}
            onExportCsv={() => console.log("Export CSV:", employeeBreakdownContext.unitValue)}
            onEmployeeClick={(name) => console.log("View employee:", name)}
          />
        )}
        {selectedRow && panelView === "profile" && (
          <SoftwareProfile
            logo={selectedRow.logo ?? ""}
            name={selectedRow.name}
            fullName={selectedRow.publisher}
            vendor={selectedRow.reseller}
            owner="—"
            description="No description available yet."
            renewalDate={formatDate(selectedRow.renewalDate)}
            renewalLabel={formatRenewalDuration(selectedRow.renewalDays)}
            renewalStatus={renewalStatus(selectedRow.renewalDays)}
            renewalTooltip={renewalTooltip}
            opportunityTotal={formatCurrency(selectedRow.opportunity)}
            opportunityTooltip={opportunityTooltip}
            inactiveWasteAmount={formatCurrency(selectedRow.inactiveWaste)}
            inactiveWastePercent={formatPercent(selectedRow.inactiveWaste, selectedRow.opportunity)}
            unassignedWasteAmount={formatCurrency(selectedRow.unassignedWaste)}
            unassignedWastePercent={formatPercent(selectedRow.unassignedWaste, selectedRow.opportunity)}
            licensesPurchasedTotal={selectedRow.purchased.toLocaleString()}
            assignedValue={selectedRow.assigned.toLocaleString()}
            assignedPercent={formatPercent(selectedRow.assigned, selectedRow.purchased)}
            assignedTooltip={assignedTooltip}
            unassignedLicensesValue={selectedRow.unassigned.toLocaleString()}
            unassignedLicensesPercent={formatPercent(selectedRow.unassigned, selectedRow.purchased)}
            unassignedTooltip={unassignedTooltip}
            utilizationRateValue={`${selectedRow.utilization}%`}
            utilizationRateLabel={utilizationLabel(selectedRow.utilization)}
            utilizationRateStatus={utilizationStatus(selectedRow.utilization)}
            utilizationTooltip={utilizationTooltip}
            activeCount={selectedRow.active}
            activeValue={selectedRow.active.toLocaleString()}
            activePercent={formatPercent(selectedRow.active, selectedRow.purchased)}
            activeTooltip={activeTooltip}
            inactiveCount={selectedRow.inactive}
            inactiveValue={selectedRow.inactive.toLocaleString()}
            inactivePercent={formatPercent(selectedRow.inactive, selectedRow.purchased)}
            inactiveTooltip={inactiveTooltip}
            licensesPurchasedCount={selectedRow.purchased}
            unusedLicensesValue={(selectedRow.inactive + selectedRow.unassigned).toLocaleString()}
            unusedLicensesPercent={formatPercent(
              selectedRow.inactive + selectedRow.unassigned,
              selectedRow.purchased,
            )}
            departmentBreakdown={departmentBreakdown}
            terminatedEmployeesBreakdown={terminatedEmployeesBreakdown}
            distributionTooltip={distributionTooltip}
            onViewInactiveEmployees={(context) => {
              setEmployeeBreakdownContext(context);
              setPanelView("inactive-employees");
            }}
            onViewTerminatedEmployees={(context) => {
              setEmployeeBreakdownContext(context);
              setPanelView("terminated-employees");
            }}
          />
        )}
      </SidePanel>
    </div>
  );
}
