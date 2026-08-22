"use client";

import React, { useState } from "react";
import Sidebar from "../../../design-systems/xops/components/Sidebar";
import GlobalHeader from "../../../design-systems/xops/components/GlobalHeader";
import PageHeader from "../../../design-systems/xops/components/PageHeader";
import { FilterTabs, FilterTabOption } from "../../../design-systems/xops/components/FilterTabs";
import { Tag } from "../../../design-systems/xops/components/Tag";
import Icon from "../../../design-systems/xops/components/Icon";
import { Stat } from "../../../design-systems/xops/components/Stat";
import { ProgressBar } from "../../../design-systems/xops/components/ProgressBar";
import { Card } from "../../../design-systems/xops/components/Card";
import { Table, Column } from "../../../design-systems/xops/components/Table";
import { TagStatus } from "../../../design-systems/xops/components/Tag";
import { BarChart } from "../../../design-systems/xops/components/BarChart";

type InsightsTabKey =
  | "requests"
  | "employees"
  | "workspace"
  | "worksite"
  | "infrastructure"
  | "software"
  | "data-health";

const deltaStyle: React.CSSProperties = {
  fontFamily: "var(--xops-font-family)",
  fontWeight: "var(--xops-font-weight-regular)",
  fontSize: "var(--xops-typography-body-12-font-size)",
  lineHeight: "var(--xops-typography-body-12-line-height)",
  color: "var(--xops-text-secondary)",
};

type DomainMetric = { value: number; threshold: number; deltaText: string };

type DomainHealthRow = {
  domain: string;
  icon: string;
  statusLabel: string;
  status: TagStatus;
  completeness: DomainMetric;
  quality: DomainMetric;
  recency: DomainMetric;
};

function metricStatus(metric: DomainMetric): "danger" | "warning" | "success" {
  if (metric.value < metric.threshold) return "danger";
  if (metric.value < metric.threshold + 10) return "warning";
  return "success";
}

const domainHealthRows: DomainHealthRow[] = [
  {
    domain: "Employee",
    icon: "group",
    statusLabel: "Critical",
    status: "danger",
    completeness: { value: 89, threshold: 90, deltaText: "1% below threshold (90%)" },
    quality: { value: 91, threshold: 92, deltaText: "1% below threshold (92%)" },
    recency: { value: 86, threshold: 85, deltaText: "Near threshold (85%)" },
  },
  {
    domain: "Infrastructure",
    icon: "storage",
    statusLabel: "Critical",
    status: "danger",
    completeness: { value: 79, threshold: 75, deltaText: "Near threshold (75%)" },
    quality: { value: 71, threshold: 68, deltaText: "Near threshold (68%)" },
    recency: { value: 67, threshold: 65, deltaText: "Near threshold (65%)" },
  },
  {
    domain: "Worksite",
    icon: "domain",
    statusLabel: "At Risk",
    status: "caution",
    completeness: { value: 94, threshold: 88, deltaText: "4% above threshold (88%)" },
    quality: { value: 88, threshold: 82, deltaText: "2% above threshold (82%)" },
    recency: { value: 41, threshold: 40, deltaText: "Near threshold (40%)" },
  },
  {
    domain: "Software",
    icon: "code_blocks",
    statusLabel: "Healthy",
    status: "success",
    completeness: { value: 99, threshold: 96, deltaText: "3% above threshold (96%)" },
    quality: { value: 94, threshold: 88, deltaText: "4% above threshold (88%)" },
    recency: { value: 98, threshold: 92, deltaText: "6% above threshold (92%)" },
  },
];

function MetricCell({ metric }: { metric: DomainMetric }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-4)" }}>
      <ProgressBar
        value={metric.value}
        threshold={metric.threshold}
        status={metricStatus(metric)}
        valueLabel={`${metric.value}%`}
      />
      <span style={deltaStyle}>{metric.deltaText}</span>
    </div>
  );
}

const domainHealthColumns: Column<DomainHealthRow>[] = [
  {
    key: "domain",
    label: "Domain",
    width: 200,
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
    render: (row) => <Tag status={row.status}>{row.statusLabel}</Tag>,
  },
  {
    key: "completeness",
    label: "Completeness",
    width: "auto",
    align: "left",
    sortable: true,
    render: (row) => <MetricCell metric={row.completeness} />,
  },
  {
    key: "quality",
    label: "Quality",
    width: "auto",
    align: "left",
    sortable: true,
    render: (row) => <MetricCell metric={row.quality} />,
  },
  {
    key: "recency",
    label: "Recency",
    width: "auto",
    align: "left",
    sortable: true,
    render: (row) => <MetricCell metric={row.recency} />,
  },
  {
    key: "spacer",
    label: "",
    width: "flex",
    render: () => null,
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
  { value: "duplicate-records", label: "Duplicate Records", stat: "1,350" },
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
    width: 134,
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
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => row.failures.toLocaleString("en-US"),
  },
  {
    key: "percentOfCategory",
    label: "% of Category",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => row.percentOfCategory,
  },
  {
    key: "affectedRecords",
    label: "Affected Records",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => row.affectedRecords.toLocaleString("en-US"),
  },
  {
    key: "singleVsMulti",
    label: "Single vs. Multi-Failure Records",
    width: 251,
    align: "left",
    tooltip: { title: "Single vs. Multi-Failure Records", description: "Records with one failure vs. records with more than one." },
    render: (row) => (
      <BarChart
        height="16"
        segments={[
          { value: row.single, color: "var(--xops-brand-primary)" },
          { value: row.multi, color: "var(--xops-status-warning-solid)" },
        ]}
      />
    ),
  },
  {
    key: "spacer",
    label: "",
    width: "flex",
    render: () => null,
  },
];

type CertificationRow = {
  domain: string;
  icon: string;
  statusLabel: string;
  status: TagStatus;
  lastCertified: string;
  validUntil: string;
  daysRemainingValue: number;
  daysRemainingStatus: "danger" | "warning" | "success";
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
    validUntil: "June 30, 2025",
    daysRemainingValue: 100,
    daysRemainingStatus: "danger",
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
    daysRemainingValue: 89,
    daysRemainingStatus: "warning",
    daysRemainingLabel: "5 days",
    openRemediationRequest: 3,
  },
  {
    domain: "Worksite",
    icon: "domain",
    statusLabel: "Pending Remediation",
    status: "caution",
    lastCertified: "Apr 15, 2025",
    validUntil: "July 15, 2025",
    daysRemainingValue: 100,
    daysRemainingStatus: "warning",
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
    daysRemainingValue: 47,
    daysRemainingStatus: "success",
    daysRemainingLabel: "95 days",
    openRemediationRequest: 2,
  },
];

const certificationColumns: Column<CertificationRow>[] = [
  {
    key: "domain",
    label: "Domain",
    width: 148,
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
    render: (row) => <Tag status={row.status}>{row.statusLabel}</Tag>,
  },
  {
    key: "lastCertified",
    label: "Last Certified",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: { title: "Last Certified", description: "The most recent date this domain's data was certified." },
    render: (row) => row.lastCertified,
  },
  {
    key: "validUntil",
    label: "Valid Until",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: { title: "Valid Until", description: "The date this domain's current certification expires." },
    render: (row) => row.validUntil,
  },
  {
    key: "daysRemaining",
    label: "Days Remaining",
    width: "auto",
    align: "left",
    sortable: true,
    tooltip: { title: "Days Remaining", description: "Days left before certification expires. Negative means overdue." },
    render: (row) => (
      <ProgressBar
        value={row.daysRemainingValue}
        status={row.daysRemainingStatus}
        valueLabel={row.daysRemainingLabel}
        height="8"
      />
    ),
  },
  {
    key: "openRemediationRequest",
    label: "Open Remediation Request",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => String(row.openRemediationRequest),
  },
  {
    key: "spacer",
    label: "",
    width: "flex",
    render: () => null,
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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--xops-grey-50)",
      }}
    >
      <Sidebar activeItem="requests" />
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
            gap: "var(--xops-spacing-24)",
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
                  fontSize: "var(--xops-typography-title-18-font-size)",
                  lineHeight: "var(--xops-typography-title-18-line-height)",
                  color: "var(--xops-text-primary)",
                }}
              >
                Data Health Overview
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--xops-spacing-6)" }}>
                <Icon name="cloud_download" color="var(--xops-text-secondary)" />
                <span
                  style={{
                    fontFamily: "var(--xops-font-family)",
                    fontWeight: "var(--xops-font-weight-regular)",
                    fontSize: "var(--xops-typography-body-14-font-size)",
                    lineHeight: "var(--xops-typography-body-14-line-height)",
                    color: "var(--xops-text-secondary)",
                  }}
                >
                  Data last updated Jul 15, 2025 at 02:06PM
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--xops-spacing-8)",
                // parent already applies spacing-16 gap between rows; this adds the remainder to net spacing-24 above this row specifically
                marginTop: "calc(var(--xops-spacing-24) - var(--xops-spacing-16))",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--xops-font-family)",
                  fontWeight: "var(--xops-font-weight-medium)",
                  fontSize: "var(--xops-typography-subheading-16-font-size)",
                  lineHeight: "var(--xops-typography-subheading-16-line-height)",
                  color: "var(--xops-text-primary)",
                }}
              >
                Overall Status
              </span>
              <Tag status="danger">Critical</Tag>
            </div>

            <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
              <Stat
                label="Completeness"
                value="82%"
                icon
                content={
                  <>
                    <ProgressBar value={82} threshold={85} status="danger" />
                    <span style={deltaStyle}>3% below threshold (85%)</span>
                  </>
                }
              />
              <Stat
                label="Quality"
                value="77%"
                icon
                content={
                  <>
                    <ProgressBar value={77} threshold={80} status="danger" />
                    <span style={deltaStyle}>3% below threshold (80%)</span>
                  </>
                }
              />
              <Stat
                label="Recency"
                value="71%"
                icon
                content={
                  <>
                    <ProgressBar value={71} threshold={75} status="danger" />
                    <span style={deltaStyle}>4% below threshold (75%)</span>
                  </>
                }
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--xops-spacing-4)" }}>
              <span
                style={{
                  fontFamily: "var(--xops-font-family)",
                  fontWeight: "var(--xops-font-weight-regular)",
                  fontSize: "var(--xops-typography-body-12-font-size)",
                  lineHeight: "var(--xops-typography-body-12-line-height)",
                  color: "var(--xops-text-secondary)",
                  textDecoration: "underline",
                }}
              >
                Learn More About Thresholds
              </span>
              <Icon name="InfoCircle" color="var(--xops-text-secondary)" />
            </div>

            <Card title="Health by Domain">
              <Table
                columns={domainHealthColumns}
                data={domainHealthRows}
                rowKey={(row) => row.domain}
                sortKey={domainSortKey}
                sortDirection={domainSortDirection}
                onSortChange={handleDomainSortChange}
                onRowClick={() => {}}
                showChevron
                chrome={false}
                scrollFade={false}
              />
            </Card>

            <Card title="Validation Failures by Category">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-24)" }}>
                <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                  <Stat label="Total Failures Across System" value="12,450" icon />
                  <Stat label="Total Affected Records" value="8,120" icon />
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
                    <Card title="Missing Required Data" headerValue="6,200 Failures (49.8% of Total)" titleSize="body-14">
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-16)" }}>
                        <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                          <Stat label="Affected Records" value="4,196" icon />
                          <Stat
                            label="Single-Failure Records"
                            value="2,526"
                            meta="(60%)"
                            icon
                            legendColor="var(--xops-brand-primary)"
                          />
                          <Stat
                            label="Multi-Failure Records"
                            value="1,670"
                            meta="(40%)"
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
                onRowClick={() => {}}
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
