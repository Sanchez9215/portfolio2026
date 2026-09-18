"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/design-systems/xops/components/Sidebar";
import GlobalHeader from "@/design-systems/xops/components/GlobalHeader";
import PageHeader from "@/design-systems/xops/components/PageHeader";
import { FilterTabs, FilterTabOption } from "@/design-systems/xops/components/FilterTabs";
import { Tag } from "@/design-systems/xops/components/Tag";
import Icon from "@/design-systems/xops/components/Icon";
import Button from "@/design-systems/xops/components/Button";
import { MetaText } from "@/design-systems/xops/components/MetaText";
import { Stat } from "@/design-systems/xops/components/Stat";
import { Card } from "@/design-systems/xops/components/Card";
import { Table, Column } from "@/design-systems/xops/components/Table";
import { TagStatus } from "@/design-systems/xops/components/Tag";
import { BarChart } from "@/design-systems/xops/components/BarChart";
import { StatusValue, StatusValueStatus } from "@/design-systems/xops/components/StatusValue";
import { Tooltip } from "@/design-systems/xops/components/Tooltip";
import {
  domainHealthRows,
  domainRowState,
  metricState,
  worstState,
  metricLegend,
  overallMetric,
  DataHealthDomainRow,
  DataHealthMetric,
  DataHealthMetricKey,
  DataHealthState,
} from "@/design-systems/xops/data/dataHealth";

type InsightsTabKey =
  | "requests"
  | "employees"
  | "workspace"
  | "worksite"
  | "infrastructure"
  | "software"
  | "data-health";

const stateTagStatus: Record<DataHealthState, TagStatus> = {
  critical: "danger",
  "at-risk": "caution",
  healthy: "success",
};

const stateLabel: Record<DataHealthState, string> = {
  critical: "Critical",
  "at-risk": "At Risk",
  healthy: "Healthy",
};

const stateValueStatus: Record<DataHealthState, "danger" | "warning" | "success"> = {
  critical: "danger",
  "at-risk": "warning",
  healthy: "success",
};

const stateStatusValue: Record<DataHealthState, StatusValueStatus> = {
  critical: "danger",
  "at-risk": "caution",
  healthy: "success",
};

// Same descriptions as the top 3 Stat cards previously hand-wrote — now the single copy,
// since target/warning/value all now come from design-systems/xops/data/dataHealth.ts.
const metricMeta: Record<DataHealthMetricKey, { label: string; description: string }> = {
  completeness: {
    label: "Completeness",
    description: "Percentage of CIs with all required fields populated.",
  },
  quality: {
    label: "Quality",
    description: "Percentage of CIs that are accurate, properly formatted, and consistent across systems.",
  },
  recency: {
    label: "Recency",
    description: "Percentage of CIs synced within the last 24 hours.",
  },
};

function legendWithLabels(metric: DataHealthMetric) {
  return metricLegend(metric).map(({ state, range }) => ({
    status: stateTagStatus[state],
    label: stateLabel[state],
    range,
  }));
}

function MetricCell({ metric, metricKey }: { metric: DataHealthMetric; metricKey: DataHealthMetricKey }) {
  const meta = metricMeta[metricKey];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--xops-spacing-8)" }}>
      <StatusValue status={stateStatusValue[metricState(metric)]}>{metric.value}%</StatusValue>
      <span style={{ display: "inline-flex", alignItems: "center", opacity: "var(--xops-row-hover, 0)" }}>
        <Tooltip title={meta.label} description={meta.description} legend={legendWithLabels(metric)} placement="right-start" />
      </span>
    </div>
  );
}

const domainHealthColumns: Column<DataHealthDomainRow>[] = [
  {
    key: "domain",
    label: "Domain",
    width: "flex",
    sortable: true,
    render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--xops-spacing-8)" }}>
        <Icon name={row.icon} color="var(--xops-text-secondary)" />
        <span
          style={{
            fontFamily: "var(--xops-font-family)",
            fontWeight: "var(--xops-font-weight-medium)",
            fontSize: "var(--xops-typography-body-14-font-size)",
            lineHeight: "var(--xops-typography-body-14-line-height)",
            color: "var(--xops-text-primary)",
          }}
        >
          {row.domain}
        </span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    width: "auto",
    sortable: true,
    render: (row) => {
      const state = domainRowState(row);
      return <Tag status={stateTagStatus[state]}>{stateLabel[state]}</Tag>;
    },
  },
  {
    key: "completeness",
    label: "Completeness",
    width: "flex",
    align: "right",
    sortable: true,
    render: (row) => <MetricCell metric={row.completeness} metricKey="completeness" />,
  },
  {
    key: "quality",
    label: "Quality",
    width: "flex",
    align: "right",
    sortable: true,
    render: (row) => <MetricCell metric={row.quality} metricKey="quality" />,
  },
  {
    key: "recency",
    label: "Recency",
    width: "flex",
    align: "right",
    sortable: true,
    render: (row) => <MetricCell metric={row.recency} metricKey="recency" />,
  },
];

type FailureCategoryKey =
  | "missing-required-data"
  | "business-rule-violation"
  | "format-violations"
  | "duplicate-records"
  | "referential-integrity";

const failureCategoryTabs: FilterTabOption<FailureCategoryKey>[] = [
  { value: "missing-required-data", label: "Missing Required Data", stat: "6,200" },
  { value: "business-rule-violation", label: "Business Rule Violation", stat: "2,100" },
  { value: "format-violations", label: "Format Violations", stat: "1,850" },
  { value: "duplicate-records", label: "Duplicate CIs", stat: "1,350" },
  { value: "referential-integrity", label: "Referential Integrity", stat: "950" },
];

type FailureDomainRow = {
  domain: string;
  icon: string;
  failures: number;
  percentOfCategory: string;
  affectedRecords: number;
  single: number;
  multi: number;
};

// Only "Missing Required Data" was audited from Figma with a full breakdown — the other 4
// categories above only have their list totals. Detail panel stays on this category's data
// regardless of selection until the other 4 are audited.
// single/multi have no numeric labels in the source — only measured bar-segment pixel widths
// (227px track), used here directly as proportional values rather than inventing counts.
const missingRequiredDataRows: FailureDomainRow[] = [
  { domain: "Infrastructure", icon: "storage", failures: 3100, percentOfCategory: "50.0%", affectedRecords: 2100, single: 136, multi: 91 },
  { domain: "Employee", icon: "group", failures: 1800, percentOfCategory: "29.0%", affectedRecords: 1200, single: 182, multi: 45 },
  { domain: "Software", icon: "code_blocks", failures: 800, percentOfCategory: "12.9%", affectedRecords: 600, single: 68, multi: 159 },
  { domain: "Worksite", icon: "domain", failures: 500, percentOfCategory: "8.1%", affectedRecords: 296, single: 98, multi: 129 },
];

const failureDomainColumns: Column<FailureDomainRow>[] = [
  {
    key: "domain",
    label: "Domain",
    width: "flex",
    sortable: true,
    render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--xops-spacing-8)" }}>
        <Icon name={row.icon} color="var(--xops-text-secondary)" />
        <span
          style={{
            fontFamily: "var(--xops-font-family)",
            fontWeight: "var(--xops-font-weight-medium)",
            fontSize: "var(--xops-typography-body-14-font-size)",
            lineHeight: "var(--xops-typography-body-14-line-height)",
            color: "var(--xops-text-primary)",
          }}
        >
          {row.domain}
        </span>
      </div>
    ),
  },
  {
    key: "failures",
    label: "Failures",
    width: "flex",
    align: "right",
    sortable: true,
    render: (row) => row.failures.toLocaleString("en-US"),
  },
  {
    key: "percentOfCategory",
    label: "% of Category",
    width: "flex",
    align: "right",
    sortable: true,
    render: (row) => row.percentOfCategory,
  },
  {
    key: "affectedRecords",
    label: "Affected CIs",
    width: "flex",
    align: "right",
    sortable: true,
    render: (row) => row.affectedRecords.toLocaleString("en-US"),
  },
  {
    key: "singleVsMulti",
    label: "Single vs. Multi-Failure CIs",
    width: "flex",
    align: "left",
    tooltip: { title: "Single vs. Multi-Failure CIs", description: "CIs with one failure vs. CIs with more than one." },
    render: (row) => (
      <BarChart
        height="8"
        segments={[
          { value: row.single, color: "var(--xops-brand-primary)" },
          { value: row.multi, color: "var(--xops-status-warning-solid)" },
        ]}
      />
    ),
  },
];

type CertificationRow = {
  domain: string;
  icon: string;
  statusLabel: string;
  status: TagStatus;
  lastCertified: string;
  validUntil: string;
  daysRemainingLabel: string;
  openRemediationRequest: number;
};

const certificationRows: CertificationRow[] = [
  {
    domain: "Employee",
    icon: "group",
    statusLabel: "Overdue",
    status: "danger",
    lastCertified: "Mar 15, 2025",
    validUntil: "Jun 30, 2025",
    daysRemainingLabel: "-15 days",
    openRemediationRequest: 6,
  },
  {
    domain: "Infrastructure",
    icon: "storage",
    statusLabel: "At Risk",
    status: "caution",
    lastCertified: "Apr 20, 2025",
    validUntil: "Dec 31, 2025",
    daysRemainingLabel: "5 days",
    openRemediationRequest: 3,
  },
  {
    domain: "Worksite",
    icon: "domain",
    statusLabel: "Pending Remediation",
    status: "caution",
    lastCertified: "Apr 15, 2025",
    validUntil: "Jul 15, 2025",
    daysRemainingLabel: "0 days",
    openRemediationRequest: 2,
  },
  {
    domain: "Software",
    icon: "code_blocks",
    statusLabel: "Current",
    status: "success",
    lastCertified: "Apr 18, 2025",
    validUntil: "Oct 18, 2025",
    daysRemainingLabel: "95 days",
    openRemediationRequest: 2,
  },
];

const certificationColumns: Column<CertificationRow>[] = [
  {
    key: "domain",
    label: "Domain",
    width: "flex",
    sortable: true,
    render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--xops-spacing-8)" }}>
        <Icon name={row.icon} color="var(--xops-text-secondary)" />
        <span
          style={{
            fontFamily: "var(--xops-font-family)",
            fontWeight: "var(--xops-font-weight-medium)",
            fontSize: "var(--xops-typography-body-14-font-size)",
            lineHeight: "var(--xops-typography-body-14-line-height)",
            color: "var(--xops-text-primary)",
          }}
        >
          {row.domain}
        </span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    width: "flex",
    sortable: true,
    render: (row) => <Tag status={row.status}>{row.statusLabel}</Tag>,
  },
  {
    key: "lastCertified",
    label: "Last Certified",
    width: "flex",
    align: "right",
    sortable: true,
    tooltip: { title: "Last Certified", description: "The most recent date this domain's data was certified." },
    render: (row) => row.lastCertified,
  },
  {
    key: "validUntil",
    label: "Valid Until",
    width: "flex",
    align: "right",
    sortable: true,
    tooltip: { title: "Valid Until", description: "The date this domain's current certification expires, and days remaining. Negative means overdue." },
    render: (row) => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--xops-spacing-8)" }}>
        <span style={{ width: "12ch", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.validUntil}</span>
        <Tag status={row.status}>{row.daysRemainingLabel}</Tag>
      </div>
    ),
  },
  {
    key: "openRemediationRequest",
    label: "Open Remediation Request",
    width: "flex",
    align: "right",
    sortable: true,
    render: (row) => String(row.openRemediationRequest),
  },
];

const insightsTabs: FilterTabOption<InsightsTabKey>[] = [
  { value: "requests", label: "Requests" },
  { value: "employees", label: "Employees" },
  { value: "workspace", label: "Workspace" },
  { value: "worksite", label: "Worksite" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "software", label: "Software" },
  { value: "data-health", label: "Data Health" },
];

export function DataHealthScreen() {
  const router = useRouter();
  const [insightsTab, setInsightsTab] = useState<InsightsTabKey>("data-health");
  const [domainSortKey, setDomainSortKey] = useState<string | undefined>(undefined);
  const [domainSortDirection, setDomainSortDirection] = useState<"asc" | "desc">("asc");

  const handleDomainSortChange = (key: string) => {
    if (key === domainSortKey) {
      setDomainSortDirection(domainSortDirection === "asc" ? "desc" : "asc");
    } else {
      setDomainSortKey(key);
      setDomainSortDirection("asc");
    }
  };

  const [failureCategory, setFailureCategory] = useState<FailureCategoryKey>("missing-required-data");
  const [failureSortKey, setFailureSortKey] = useState<string | undefined>(undefined);
  const [failureSortDirection, setFailureSortDirection] = useState<"asc" | "desc">("asc");

  const handleFailureSortChange = (key: string) => {
    if (key === failureSortKey) {
      setFailureSortDirection(failureSortDirection === "asc" ? "desc" : "asc");
    } else {
      setFailureSortKey(key);
      setFailureSortDirection("asc");
    }
  };

  const [certificationSortKey, setCertificationSortKey] = useState<string | undefined>(undefined);
  const [certificationSortDirection, setCertificationSortDirection] = useState<"asc" | "desc">("asc");

  const handleCertificationSortChange = (key: string) => {
    if (key === certificationSortKey) {
      setCertificationSortDirection(certificationSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCertificationSortKey(key);
      setCertificationSortDirection("asc");
    }
  };

  const overallState = worstState(
    (["completeness", "quality", "recency"] as DataHealthMetricKey[]).map((key) => metricState(overallMetric(key)))
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--xops-grey-50)",
      }}
    >
      <Sidebar activeControlCenterItem="insights" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        <GlobalHeader userName="John Doe" notificationCount={19} />
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--xops-spacing-32)",
            padding: "var(--xops-grid-margin)",
            paddingBottom: "var(--xops-spacing-8)",
            backgroundColor: "var(--xops-surface-page)",
          }}
        >
          <PageHeader title="Insights" />
          <FilterTabs
            options={insightsTabs}
            value={insightsTab}
            onChange={setInsightsTab}
            variant="underline"
            fullWidth={false}
            ariaLabel="Insights"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--xops-spacing-16)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--xops-font-family)",
                  fontWeight: "var(--xops-font-weight-medium)",
                  fontSize: "var(--xops-typography-heading-20-font-size)",
                  lineHeight: "var(--xops-typography-heading-20-line-height)",
                  color: "var(--xops-text-primary)",
                }}
              >
                Data Health
              </h1>
              <MetaText icon="cloud_download" text="Data last updated Jul 15, 2025 at 02:06PM" />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--xops-spacing-8)",
                // parent already applies spacing-16 gap between rows; this adds the remainder to net spacing-32
                marginTop: "calc(var(--xops-spacing-32) - var(--xops-spacing-16))",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--xops-font-family)",
                  fontWeight: "var(--xops-font-weight-medium)",
                  fontSize: "var(--xops-typography-subheading-14-font-size)",
                  lineHeight: "var(--xops-typography-subheading-14-line-height)",
                  color: "var(--xops-text-primary)",
                }}
              >
                Overall Status
              </span>
              <Tag status={stateTagStatus[overallState]}>{stateLabel[overallState]}</Tag>
            </div>

            <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
              {(["completeness", "quality", "recency"] as DataHealthMetricKey[]).map((key) => {
                const metric = overallMetric(key);
                const meta = metricMeta[key];
                return (
                  <Stat
                    key={key}
                    label={meta.label}
                    value={`${metric.value}%`}
                    valueStatus={stateValueStatus[metricState(metric)]}
                    tooltip={{
                      title: meta.label,
                      description: meta.description,
                      placement: "right-start",
                      legend: legendWithLabels(metric),
                    }}
                  />
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "var(--xops-spacing-4)",
                // parent already applies spacing-16 gap above this row; this subtracts the excess to net spacing-8
                marginTop: "calc(var(--xops-spacing-8) - var(--xops-spacing-16))",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--xops-font-family)",
                  fontWeight: "var(--xops-font-weight-regular)",
                  fontSize: "var(--xops-typography-body-11-font-size)",
                  lineHeight: "var(--xops-typography-body-11-line-height)",
                  color: "var(--xops-text-secondary)",
                }}
              >
                All values reflect your organization&rsquo;s configured thresholds.
              </span>
              <Button
                variant="inline-link"
                size="xsmall"
                style={{
                  fontSize: "var(--xops-typography-body-11-font-size)",
                  lineHeight: "var(--xops-typography-body-11-line-height)",
                }}
              >
                Learn More
              </Button>
            </div>

            <Card title="Health by Domain">
              <Table
                columns={domainHealthColumns}
                data={domainHealthRows}
                rowKey={(row) => row.domain}
                sortKey={domainSortKey}
                sortDirection={domainSortDirection}
                onSortChange={handleDomainSortChange}
                headerLabelSize="subheading-12"
                onRowClick={(row) => {
                  if (row.domain === "Infrastructure") router.push("/work/data-health-monitor/prototype/domain");
                }}
                showChevron
                chrome={false}
                scrollFade={false}
              />
            </Card>

            <Card title="Validation Failures by Category">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-24)" }}>
                <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                  <Stat label="Total Failures Across System" value="12,450" icon />
                  <Stat label="Total Affected CIs" value="8,120" icon />
                </div>

                <div style={{ display: "flex", gap: "var(--xops-spacing-16)", alignItems: "flex-start" }}>
                  <div style={{ width: 232, flexShrink: 0 }}>
                    <FilterTabs
                      options={failureCategoryTabs}
                      value={failureCategory}
                      onChange={setFailureCategory}
                      variant="vertical"
                      ariaLabel="Failure category"
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Card
                      title="Missing Required Data"
                      headerValue={
                        <>
                          6,200 Failures <span style={{ color: "var(--xops-text-secondary)" }}>(49.8% of Total)</span>
                        </>
                      }
                      titleSize="subheading-14"
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-16)" }}>
                        <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                          <Stat label="Affected CIs" value="4,196" icon />
                          <Stat
                            label="Single-Failure CIs"
                            value="2,526"
                            meta="60%"
                            icon
                            legendColor="var(--xops-brand-primary)"
                          />
                          <Stat
                            label="Multi-Failure CIs"
                            value="1,670"
                            meta="40%"
                            icon
                            legendColor="var(--xops-status-warning-solid)"
                          />
                        </div>

                        <Table
                          columns={failureDomainColumns}
                          data={missingRequiredDataRows}
                          rowKey={(row) => row.domain}
                          sortKey={failureSortKey}
                          sortDirection={failureSortDirection}
                          onSortChange={handleFailureSortChange}
                          onRowClick={() => {}}
                          headerLabelSize="subheading-12"
                          showChevron
                          chrome={false}
                          scrollFade={false}
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Certification Status by Domain">
              <Table
                columns={certificationColumns}
                data={certificationRows}
                rowKey={(row) => row.domain}
                sortKey={certificationSortKey}
                sortDirection={certificationSortDirection}
                onSortChange={handleCertificationSortChange}
                onRowClick={(row) => {
                  if (row.domain === "Infrastructure") router.push("/work/data-health-monitor/prototype/domain");
                }}
                headerLabelSize="subheading-12"
                showChevron
                chrome={false}
                scrollFade={false}
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DataHealthScreen;
