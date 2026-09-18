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
import { ProgressBar } from "@/design-systems/xops/components/ProgressBar";
import { Card } from "@/design-systems/xops/components/Card";
import { RemediationRequestList, RemediationRequest } from "@/design-systems/xops/components/RemediationRequestList";
import {
  RemediationRequestPanel,
  RemediationAttributeRow,
  RemediationRequestFilter,
} from "@/design-systems/xops/components/RemediationRequestPanel";
import { Table, Column } from "@/design-systems/xops/components/Table";
import { BarChart } from "@/design-systems/xops/components/BarChart";

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

const insightsTabs: FilterTabOption<InsightsTabKey>[] = [
  { value: "requests", label: "Requests" },
  { value: "employees", label: "Employees" },
  { value: "workspace", label: "Workspace" },
  { value: "worksite", label: "Worksite" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "software", label: "Software" },
  { value: "data-health", label: "Data Health" },
];

// Only #INF-9912 was audited with a full department breakdown — #INF-9911/#INF-9910
// show empty department tables if expanded until those nodes are audited.
const remediationRequests: RemediationRequest[] = [
  {
    id: "#INF-9912",
    percent: 65,
    percentLabel: "65% Complete",
    recordsLabel: "1,475/2,270 CIs",
    departments: [
      { department: "Network Engineering", percent: 100, remediatedTotalLabel: "300/300 CIs" },
      { department: "Global Data Centers", percent: 82, remediatedTotalLabel: "590/720 CIs" },
      { department: "Cloud & Virtualization", percent: 60, remediatedTotalLabel: "240/400 CIs" },
      { department: "Cloud & Virtualization", percent: 40, remediatedTotalLabel: "340 / 850 CIs" },
    ],
  },
  {
    id: "#INF-9911",
    percent: 92,
    percentLabel: "92% Complete",
    recordsLabel: "1,104/1,200 CIs",
    departments: [],
  },
  {
    id: "#INF-9910",
    percent: 8,
    percentLabel: "8% Complete",
    recordsLabel: "24/310 CIs",
    departments: [],
  },
];

type FailureCategoryKey =
  | "missing-required-data"
  | "business-rule-violation"
  | "format-violations"
  | "duplicate-records"
  | "referential-integrity";

const domainFailureCategoryTabs: FilterTabOption<FailureCategoryKey>[] = [
  { value: "missing-required-data", label: "Missing Required Data", stat: "3,100" },
  { value: "business-rule-violation", label: "Business Rule Violation", stat: "1,850" },
  { value: "format-violations", label: "Format Violations", stat: "1,200" },
  { value: "duplicate-records", label: "Duplicate CIs", stat: "750" },
  { value: "referential-integrity", label: "Referential Integrity", stat: "500" },
];

type AttributeRow = {
  attribute: string;
  affectedRecords: number;
  singleFailure: number;
  multiFailure: number;
  percentOfCategory: number;
  percentLabel: string;
};

// Only "Missing Required Data" was audited with a full attribute breakdown — the other
// 4 categories only have their list totals (see domainFailureCategoryTabs).
const missingRequiredDataAttributes: AttributeRow[] = [
  { attribute: "Serial Number", affectedRecords: 850, singleFailure: 620, multiFailure: 230, percentOfCategory: 27.4, percentLabel: "27.4%" },
  { attribute: "Asset Model", affectedRecords: 420, singleFailure: 280, multiFailure: 140, percentOfCategory: 13.5, percentLabel: "13.5%" },
  { attribute: "Asset Tag", affectedRecords: 310, singleFailure: 110, multiFailure: 200, percentOfCategory: 10.0, percentLabel: "10.0%" },
  { attribute: "Purchase Date", affectedRecords: 180, singleFailure: 120, multiFailure: 60, percentOfCategory: 5.8, percentLabel: "5.8%" },
  { attribute: "Warranty Expiry", affectedRecords: 150, singleFailure: 30, multiFailure: 120, percentOfCategory: 4.8, percentLabel: "4.8%" },
  { attribute: "Manufacturer", affectedRecords: 140, singleFailure: 60, multiFailure: 80, percentOfCategory: 4.5, percentLabel: "4.5%" },
  { attribute: "Install Date", affectedRecords: 120, singleFailure: 20, multiFailure: 100, percentOfCategory: 3.9, percentLabel: "3.9%" },
  { attribute: "Vendor Name", affectedRecords: 110, singleFailure: 20, multiFailure: 90, percentOfCategory: 3.5, percentLabel: "3.5%" },
  { attribute: "BIOS Version", affectedRecords: 90, singleFailure: 0, multiFailure: 90, percentOfCategory: 2.9, percentLabel: "2.9%" },
  { attribute: "CPU Count", affectedRecords: 80, singleFailure: 0, multiFailure: 80, percentOfCategory: 2.6, percentLabel: "2.6%" },
  { attribute: "Memory (GB)", affectedRecords: 75, singleFailure: 0, multiFailure: 75, percentOfCategory: 2.4, percentLabel: "2.4%" },
  { attribute: "MAC Address", affectedRecords: 70, singleFailure: 0, multiFailure: 70, percentOfCategory: 2.3, percentLabel: "2.3%" },
  { attribute: "Operating System", affectedRecords: 70, singleFailure: 0, multiFailure: 65, percentOfCategory: 2.1, percentLabel: "2.1%" },
  { attribute: "OS Version", affectedRecords: 50, singleFailure: 0, multiFailure: 50, percentOfCategory: 1.6, percentLabel: "1.6%" },
  { attribute: "IP Address", affectedRecords: 45, singleFailure: 0, multiFailure: 45, percentOfCategory: 1.5, percentLabel: "1.5%" },
  { attribute: "Gateway", affectedRecords: 40, singleFailure: 0, multiFailure: 40, percentOfCategory: 1.1, percentLabel: "1.1%" },
  { attribute: "Subnet Mask", affectedRecords: 35, singleFailure: 0, multiFailure: 35, percentOfCategory: 1.0, percentLabel: "1.0%" },
  { attribute: "Location Code", affectedRecords: 30, singleFailure: 0, multiFailure: 30, percentOfCategory: 0.8, percentLabel: "0.8%" },
  { attribute: "Rack ID", affectedRecords: 25, singleFailure: 0, multiFailure: 25, percentOfCategory: 0.6, percentLabel: "0.6%" },
  { attribute: "Department Owner", affectedRecords: 20, singleFailure: 0, multiFailure: 20, percentOfCategory: 0.5, percentLabel: "0.5%" },
  { attribute: "Cost Center", affectedRecords: 15, singleFailure: 0, multiFailure: 15, percentOfCategory: 0.3, percentLabel: "0.3%" },
  { attribute: "Environment Tag", affectedRecords: 10, singleFailure: 0, multiFailure: 10, percentOfCategory: 0.3, percentLabel: "0.3%" },
  { attribute: "Support Group", affectedRecords: 10, singleFailure: 0, multiFailure: 10, percentOfCategory: 0.2, percentLabel: "0.2%" },
  { attribute: "Maintenance Window", affectedRecords: 5, singleFailure: 0, multiFailure: 5, percentOfCategory: 0.2, percentLabel: "0.2%" },
  { attribute: "Criticality Level", affectedRecords: 5, singleFailure: 0, multiFailure: 5, percentOfCategory: 0.2, percentLabel: "0.2%" },
];

const maxPercentOfCategory = Math.max(...missingRequiredDataAttributes.map((row) => row.percentOfCategory));

// Remediation Request view (Figma 739:1607) — only the first 8 attributes shown there
// are wired with real record counts; only Serial Number has an audited entity breakdown.
const remediationAttributes: RemediationAttributeRow[] = [
  {
    attribute: "Serial Number",
    totalRecords: 850,
    singleFailure: 620,
    multiFailure: 230,
    entitiesTotal: 850,
    entities: [
      {
        entityId: "SRV-DB-99",
        type: "Server",
        make: "Dell",
        model: "PowerEdge R740",
        serialNumber: "",
        location: "London-DC1",
        remediationLabel: "Single-Failure",
        remediationDot: "single",
        lifecycleStatus: "Active",
      },
      {
        entityId: "SW-DIST-04",
        type: "Switch Router",
        make: "Cisco",
        model: "Catalyst 9300",
        serialNumber: "",
        location: "NYC-Office",
        remediationLabel: "3 Other Failures",
        remediationDot: "multi",
        otherFailures: [
          { category: "Missing Required Data", attribute: "Management IP" },
          { category: "Business Rule Validation", attribute: "Location (Site ID)" },
          { category: "Format Violation", attribute: "Uptime Status" },
        ],
        lifecycleStatus: "Active",
      },
      {
        entityId: "RTR-EDGE-01",
        type: "Router",
        make: "Juniper",
        model: "MX240",
        serialNumber: "",
        location: "Tokyo-Hub",
        remediationLabel: "Single-Failure",
        remediationDot: "single",
        lifecycleStatus: "Active",
      },
      {
        entityId: "LB-WEB-12",
        type: "Load Balancer",
        make: "F5",
        model: "BIG-IP i5800",
        serialNumber: "",
        location: "Paris-DC2",
        remediationLabel: "Single-Issue",
        remediationDot: "single",
        lifecycleStatus: "Active",
      },
    ],
  },
  { attribute: "Asset Model", totalRecords: 420, singleFailure: 280, multiFailure: 140 },
  { attribute: "Asset Tag", totalRecords: 310, singleFailure: 110, multiFailure: 200 },
  { attribute: "Purchase Date", totalRecords: 180, singleFailure: 120, multiFailure: 60 },
  { attribute: "Warranty Expiry", totalRecords: 150, singleFailure: 30, multiFailure: 120 },
  { attribute: "Manufacturer", totalRecords: 140, singleFailure: 60, multiFailure: 80 },
  { attribute: "Install Date", totalRecords: 120, singleFailure: 20, multiFailure: 100 },
  { attribute: "Vendor Name", totalRecords: 110, singleFailure: 20, multiFailure: 90 },
];

export function DomainHealthScreen() {
  const router = useRouter();
  const [failureCategory, setFailureCategory] = useState<FailureCategoryKey>("missing-required-data");
  const [attributeSearch, setAttributeSearch] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set(["Serial Number"]));
  const [attributeSortKey, setAttributeSortKey] = useState<string | undefined>(undefined);
  const [attributeSortDirection, setAttributeSortDirection] = useState<"asc" | "desc">("asc");
  const [remediationFilter, setRemediationFilter] = useState<RemediationRequestFilter | null>(null);

  const handleAttributeSortChange = (key: string) => {
    if (key === attributeSortKey) {
      setAttributeSortDirection(attributeSortDirection === "asc" ? "desc" : "asc");
    } else {
      setAttributeSortKey(key);
      setAttributeSortDirection("asc");
    }
  };

  const toggleAttribute = (attribute: string) => {
    setSelectedAttributes((prev) => {
      const next = new Set(prev);
      if (next.has(attribute)) next.delete(attribute);
      else next.add(attribute);
      return next;
    });
  };

  const filteredAttributes = missingRequiredDataAttributes.filter((row) =>
    row.attribute.toLowerCase().includes(attributeSearch.toLowerCase())
  );

  const attributeColumns: Column<AttributeRow>[] = [
    {
      key: "selected",
      label: "",
      width: 44,
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedAttributes.has(row.attribute)}
          onChange={() => toggleAttribute(row.attribute)}
          aria-label={`Select ${row.attribute}`}
        />
      ),
    },
    {
      key: "attribute",
      label: "Attribute",
      width: 142,
      sortable: true,
      render: (row) => row.attribute,
    },
    {
      key: "affectedRecords",
      label: "Affected CIs",
      width: 149,
      align: "right",
      sortable: true,
      render: (row) =>
        row.attribute === "Serial Number" ? (
          <Button variant="text" size="small" onClick={() => setRemediationFilter({ attribute: row.attribute })}>
            {row.affectedRecords.toLocaleString("en-US")}
          </Button>
        ) : (
          <Button variant="text" size="small">
            {row.affectedRecords.toLocaleString("en-US")}
          </Button>
        ),
    },
    {
      key: "singleFailure",
      label: "Single-Failure",
      width: 169,
      align: "right",
      sortable: true,
      render: (row) =>
        row.singleFailure > 0 ? (
          row.attribute === "Serial Number" ? (
            <Button
              variant="text"
              size="small"
              onClick={() => setRemediationFilter({ attribute: row.attribute, failureType: "single" })}
            >
              {row.singleFailure.toLocaleString("en-US")}
            </Button>
          ) : (
            <Button variant="text" size="small">
              {row.singleFailure.toLocaleString("en-US")}
            </Button>
          )
        ) : (
          "0"
        ),
    },
    {
      key: "multiFailure",
      label: "Multi-Failure",
      width: 161,
      align: "right",
      sortable: true,
      render: (row) =>
        row.multiFailure > 0 ? (
          row.attribute === "Serial Number" ? (
            <Button
              variant="text"
              size="small"
              onClick={() => setRemediationFilter({ attribute: row.attribute, failureType: "multi" })}
            >
              {row.multiFailure.toLocaleString("en-US")}
            </Button>
          ) : (
            <Button variant="text" size="small">
              {row.multiFailure.toLocaleString("en-US")}
            </Button>
          )
        ) : (
          "0"
        ),
    },
    {
      key: "percentOfCategory",
      label: "% of Category",
      width: "flex",
      align: "left",
      sortable: true,
      tooltip: { title: "% of Category", description: "This attribute's share of the category's total failures." },
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--xops-spacing-8)" }}>
          <BarChart
            height="16"
            total={maxPercentOfCategory}
            segments={[{ value: row.percentOfCategory, color: "var(--xops-text-secondary)" }]}
          />
          <span style={{ fontFamily: "var(--xops-font-family)", fontWeight: "var(--xops-font-weight-regular)", fontSize: "var(--xops-typography-body-14-font-size)", lineHeight: "var(--xops-typography-body-14-line-height)", color: "var(--xops-text-primary)", whiteSpace: "nowrap" }}>
            {row.percentLabel}
          </span>
        </div>
      ),
    },
  ];

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
            gap: "var(--xops-spacing-24)",
            padding: "var(--xops-grid-margin)",
            paddingBottom: "var(--xops-spacing-8)",
            backgroundColor: "var(--xops-surface-page)",
          }}
        >
          <PageHeader title="Insights" />
          <FilterTabs
            options={insightsTabs}
            value="data-health"
            onChange={() => {}}
            variant="underline"
            fullWidth={false}
            ariaLabel="Insights"
          />

          {remediationFilter ? (
            <RemediationRequestPanel
              domain="Infrastructure"
              attributes={remediationAttributes}
              filter={remediationFilter}
              onCancel={() => setRemediationFilter(null)}
            />
          ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--xops-spacing-16)",
            }}
          >
            <Button
              variant="text"
              icon={<Icon name="chevron_backward" color="var(--xops-text-secondary)" />}
              onClick={() => router.push("/work/data-health-monitor/prototype")}
            >
              Back to Overview
            </Button>

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
                Infrastructure Data Health
              </h1>
              <MetaText icon="cloud_download" text="Data last updated Jul 15, 2025 at 02:06PM" />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--xops-spacing-8)",
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
                value="79%"
                icon
                content={
                  <>
                    <ProgressBar value={79} threshold={75} status="warning" />
                    <span style={deltaStyle}>Near threshold (75%)</span>
                  </>
                }
              />
              <Stat
                label="Quality"
                value="71%"
                icon
                content={
                  <>
                    <ProgressBar value={71} threshold={68} status="warning" />
                    <span style={deltaStyle}>Near threshold (68%)</span>
                  </>
                }
              />
              <Stat
                label="Recency"
                value="67%"
                icon
                content={
                  <>
                    <ProgressBar value={67} threshold={65} status="warning" />
                    <span style={deltaStyle}>Near threshold (65%)</span>
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

            <Card title="Certification Status">
              <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                <Stat label="Status" value="" valueSize="small" tag={{ status: "caution", label: "At Risk" }} />
                <Stat label="Last Certified" value="Apr 20, 2025" valueSize="small" />
                <Stat label="Valid Until" value="Dec 31, 2025" valueSize="small" />
                <Stat
                  label="Days Remaining"
                  value=""
                  valueSize="small"
                  content={<ProgressBar value={89} status="warning" valueLabel="5 days" height="8" />}
                />
              </div>
            </Card>

            <Card title="Open Remediation Requests">
              <RemediationRequestList requests={remediationRequests} defaultOpenId="#INF-9912" />
            </Card>

            <Card title="Validation Failures by Category">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-24)" }}>
                <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                  <Stat label="Total Failures Across Domain" value="7,400" icon />
                  <Stat label="Total Affected CIs" value="4,800" icon />
                </div>

                <div style={{ display: "flex", gap: "var(--xops-spacing-16)", alignItems: "flex-start" }}>
                  <div style={{ width: 232, flexShrink: 0 }}>
                    <FilterTabs
                      options={domainFailureCategoryTabs}
                      value={failureCategory}
                      onChange={setFailureCategory}
                      variant="vertical"
                      ariaLabel="Failure category"
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Card title="Missing Required Data" headerValue="3,100 Failures (50% of Total)" titleSize="subheading-14">
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-16)" }}>
                        <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                          <Stat label="Affected CIs" value="2,100" icon />
                          <Stat
                            label="Single-Issue CIs"
                            value="1,260"
                            meta="(60%)"
                            icon
                            legendColor="var(--xops-brand-primary)"
                          />
                          <Stat
                            label="Multi-Issue CIs"
                            value="840"
                            meta="(40%)"
                            icon
                            legendColor="var(--xops-status-warning-solid)"
                          />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--xops-spacing-16)" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--xops-spacing-4)",
                              width: 320,
                              padding: "var(--xops-spacing-6) var(--xops-spacing-12)",
                              border: "var(--xops-border-width-1) solid var(--xops-border-divider)",
                              borderRadius: "var(--xops-radius-6)",
                            }}
                          >
                            <Icon name="search" color="var(--xops-text-disabled)" />
                            <input
                              type="text"
                              placeholder="Search Attributes"
                              value={attributeSearch}
                              onChange={(e) => setAttributeSearch(e.target.value)}
                              style={{
                                border: "none",
                                outline: "none",
                                width: "100%",
                                fontFamily: "var(--xops-font-family)",
                                fontWeight: "var(--xops-font-weight-regular)",
                                fontSize: "var(--xops-typography-body-14-font-size)",
                                lineHeight: "var(--xops-typography-body-14-line-height)",
                                color: "var(--xops-text-primary)",
                              }}
                            />
                          </div>
                          <Button variant="primary" onClick={() => setRemediationFilter({})}>
                            Request Remediation
                          </Button>
                        </div>

                        <Table
                          columns={attributeColumns}
                          data={filteredAttributes}
                          rowKey={(row) => row.attribute}
                          sortKey={attributeSortKey}
                          sortDirection={attributeSortDirection}
                          onSortChange={handleAttributeSortChange}
                          chrome={false}
                          headerLabelSize="subheading-12"
                          scrollFade={false}
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DomainHealthScreen;
