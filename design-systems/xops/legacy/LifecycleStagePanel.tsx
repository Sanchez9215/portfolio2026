"use client";

import React, { useMemo, useState } from "react";
import { Table, Column } from "../components/Table";
import { LogoTile } from "../components/LogoTile";
import { FilterTabs, FilterTabOption } from "../components/FilterTabs";
import { Pagination } from "../components/Pagination";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { getDataset } from "../data/generate";
import {
  evaluationProducts,
  lifecycleProducts,
  ProductSummary,
  EvaluationSummary,
} from "../data/metrics";
import { formatCount, formatCurrency } from "../lib/format";
import type { AlertItem } from "./AlertsPanel";
import styles from "./OverviewLegacy.module.css";

// "Software By Lifecycle Stage" panel — stage tabs, alerts button and the stage's
// paged table. Extracted from OverviewLegacy so it can also render on its own (e.g.
// the case study's small lifecycle card). Same markup, hotspot ids and styles as
// when it was inline; OverviewLegacy keeps owning the alerts modal.

export type StageValue = "procurement" | "provisioning" | "active" | "renewal";

export const STAGE_LABELS: Record<StageValue, string> = {
  procurement: "Procurement",
  provisioning: "Provisioning",
  active: "Active",
  renewal: "Renewal",
};

// Decorative alert content — not backed by real computed alert logic (this pass's
// explicit scope). Related software ties into real catalog product names so the
// row-tint below lands on genuine table rows.
export const STAGE_ALERTS: Record<StageValue, AlertItem[]> = {
  procurement: [
    {
      title: "Pending Approval Backlog",
      description: "2 software requests have been awaiting budget approval for over 10 business days.",
      cta: "View",
    },
    {
      title: "Duplicate Request Detected",
      description: "A new request for Tableau Creator overlaps with an existing active contract.",
      cta: "View",
      relatedSoftware: ["Tableau Creator"],
    },
  ],
  provisioning: [
    {
      title: "Approval Pending Before Rollout",
      description: "SAP Concur has 40 licenses ready, but rollout is paused pending a required security review.",
      cta: "View",
      relatedSoftware: ["SAP Concur"],
      descriptionHighlights: ["SAP Concur"],
    },
    {
      title: "Licenses Assigned but Not Activated",
      description: "ServiceNow ITSM has 65 licenses assigned, but 18 employees haven't logged in yet, 30 days after being given access.",
      cta: "View",
      relatedSoftware: ["ServiceNow ITSM"],
      descriptionHighlights: ["ServiceNow ITSM"],
    },
    {
      title: "Assignment Behind Go-Live Date",
      description: "Dynamics 365 Sales has assigned 24 of 60 purchased licenses, with only 5 days left before target launch date.",
      cta: "View",
      relatedSoftware: ["Dynamics 365 Sales"],
      descriptionHighlights: ["Dynamics 365 Sales"],
    },
    {
      title: "Stalled Past Stage SLA",
      description: "Power BI Pro has been in Provisioning for 34 days, 14 days past its 20 day target.",
      cta: "View",
      relatedSoftware: ["Power BI Pro"],
      descriptionHighlights: ["Power BI Pro"],
    },
  ],
  active: [
    {
      title: "Unassigned Licenses Detected",
      description: "3 software titles in operational use have unassigned licenses.",
      cta: "View",
      relatedSoftware: ["Oracle Database ULA", "SAP SuccessFactors", "Salesforce Marketing Cloud"],
    },
    {
      title: "Inactive Users with Assigned Licenses",
      description: "Workday HCM licenses are assigned to employees who have not logged in for the last 90 days.",
      cta: "View",
      relatedSoftware: ["Workday HCM"],
    },
    {
      title: "Over-Provisioned Software Detected",
      description: "Oracle Fusion ERP is exceeding its required seat count. Adjust allocations before renewal to avoid unnecessary costs.",
      cta: "View",
      relatedSoftware: ["Oracle Fusion ERP"],
    },
    {
      title: "Cross-BU License Pooling Opportunities",
      description: "Oracle Fusion ERP has underutilized licenses in Engineering. Finance and HR have open requests — consider reallocating instead of expanding.",
      cta: "View",
      relatedSoftware: ["Oracle Fusion ERP"],
    },
    {
      title: "Underutilized Software Across Regions",
      description: "Workday HCM utilization is below target in LATAM and APAC.",
      cta: "View",
      relatedSoftware: ["Workday HCM"],
    },
    {
      title: "Renewal & Reallocation Opportunity",
      description: "Cisco Umbrella's contract renewal is due next quarter, but a large share of licenses remain inactive.",
      cta: "View",
      relatedSoftware: ["Cisco Umbrella"],
    },
    {
      title: "Duplicate Assignment Detected",
      description: "A handful of employees hold two overlapping BI tool licenses.",
      cta: "View",
    },
  ],
  renewal: [
    {
      title: "Renewal Deadline Approaching",
      description: "Adobe Creative Cloud's contract renews in 14 days with no utilization review on file.",
      cta: "View",
      relatedSoftware: ["Adobe Creative Cloud"],
    },
    {
      title: "Auto-Renew Enabled on Underused Contract",
      description: "SAP Concur is set to auto-renew despite utilization trending below target.",
      cta: "View",
      relatedSoftware: ["SAP Concur"],
    },
  ],
};

export function softwareCell(name: string, logo: string | null, showLogo: boolean) {
  return (
    <div className={styles.softwareCell} title={name}>
      {showLogo && <LogoTile src={logo} alt={name} size="medium" />}
      <span className={styles.softwareCellName}>{name}</span>
    </div>
  );
}

// License-model policy tiers for the Activation Threshold column — confirmed with the
// user; consumption isn't seat-based, so no threshold applies (renders "—").
function activationThreshold(model: ProductSummary["licenseModel"]): number | null {
  if (model === "enterprise") return 80;
  if (model === "perpetual") return 70;
  return null;
}

// ISO date → "Mmm D, YYYY", UTC-pinned so the generator's UTC dates never shift a day.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export interface LifecycleStagePanelProps {
  /** Controlled active stage. Omit to let the panel own it (starts on `defaultStage`). */
  stage?: StageValue;
  defaultStage?: StageValue;
  onStageChange?: (stage: StageValue) => void;
  /** Alerts button click — the host owns the alerts modal. */
  onOpenAlerts?: () => void;
  showLogos?: boolean;
}

export function LifecycleStagePanel({
  stage: stageProp,
  defaultStage = "provisioning",
  onStageChange,
  onOpenAlerts,
  showLogos = true,
}: LifecycleStagePanelProps) {
  const ds = useMemo(() => getDataset(), []);
  const evaluationRows = useMemo(() => evaluationProducts(ds), [ds]);
  const rolloutRows = useMemo(() => lifecycleProducts(ds, "rollout"), [ds]);
  const operationalRows = useMemo(() => lifecycleProducts(ds, "operational"), [ds]);
  const renewalRows = useMemo(() => lifecycleProducts(ds, "renewal"), [ds]);

  // B.U Owner — resolved from the catalog's real `affinity` field (the department(s) a
  // product's usage concentrates in), not a modeled per-row field.
  const skuOwner = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of ds.catalog) {
      const deptId = entry.affinity?.[0];
      if (!deptId) continue;
      const dept = ds.config.departments.find((d) => d.departmentId === deptId);
      if (dept) map.set(entry.sku, dept.departmentName);
    }
    return map;
  }, [ds]);

  const [internalStage, setInternalStage] = useState<StageValue>(defaultStage);
  const stage = stageProp ?? internalStage;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const stageChange = (next: StageValue) => {
    setInternalStage(next);
    onStageChange?.(next);
    setPage(1);
  };

  const stageOptions: FilterTabOption<StageValue>[] = [
    { value: "procurement", label: "Procurement", stat: formatCount(evaluationRows.length) },
    { value: "provisioning", label: "Provisioning", stat: formatCount(rolloutRows.length) },
    { value: "active", label: "Active", stat: formatCount(operationalRows.length) },
    { value: "renewal", label: "Renewal", stat: formatCount(renewalRows.length) },
  ];

  const rowTint = useMemo(() => {
    const flagged = new Set<string>();
    for (const alert of STAGE_ALERTS[stage]) {
      for (const name of alert.relatedSoftware ?? []) {
        flagged.add(name);
      }
    }
    return flagged;
  }, [stage]);

  const pagedEvaluationRows = useMemo(
    () => evaluationRows.slice((page - 1) * pageSize, page * pageSize),
    [evaluationRows, page, pageSize],
  );
  const pagedRolloutRows = useMemo(
    () => rolloutRows.slice((page - 1) * pageSize, page * pageSize),
    [rolloutRows, page, pageSize],
  );
  const pagedOperationalRows = useMemo(
    () => operationalRows.slice((page - 1) * pageSize, page * pageSize),
    [operationalRows, page, pageSize],
  );
  const pagedRenewalRows = useMemo(
    () => renewalRows.slice((page - 1) * pageSize, page * pageSize),
    [renewalRows, page, pageSize],
  );

  const procurementColumns: Column<EvaluationSummary>[] = [
    {
      key: "name",
      label: "Software",
      width: "flex",
      render: (row) => softwareCell(row.name, row.logo, showLogos),
    },
    { key: "publisher", label: "Publisher", width: "auto" },
    // No reseller/vendor field exists pre-purchase (no PO yet) — flagged, not invented.
    { key: "reseller", label: "Vendor", width: "auto" },
    {
      key: "licensesRequested",
      label: "Licenses Requested",
      width: "auto",
      align: "right",
      render: (row) => formatCount(row.licensesRequested),
    },
    {
      key: "requestedDate",
      label: "Latest Request Date",
      width: "auto",
      align: "right",
      render: (row) => formatDate(row.requestedDate),
    },
    {
      key: "estimatedAnnualCost",
      label: "Est. Annual Cost",
      width: "auto",
      align: "right",
      render: (row) => formatCurrency(row.estimatedAnnualCost),
    },
  ];

  const provisioningColumns: Column<ProductSummary>[] = [
    {
      key: "name",
      label: "Software",
      width: "flex",
      render: (row) => softwareCell(row.name, row.logo, showLogos),
    },
    { key: "reseller", label: "Vendor", width: "auto" },
    { key: "category", label: "Category", width: "auto" },
    {
      key: "owner",
      label: "B.U Owner",
      width: "auto",
      render: (row) => skuOwner.get(row.sku) ?? "—",
    },
    {
      key: "assigned",
      label: "Assigned",
      width: "auto",
      align: "right",
      render: (row) => (row.seatBased ? formatCount(row.assigned) : "—"),
    },
    {
      key: "activationThreshold",
      label: "Activation Threshold",
      width: "auto",
      align: "right",
      render: (row) => {
        const threshold = row.seatBased ? activationThreshold(row.licenseModel) : null;
        return threshold === null ? "—" : `${threshold}%`;
      },
    },
  ];

  const activeColumns: Column<ProductSummary>[] = [
    {
      key: "name",
      label: "Software",
      width: "flex",
      render: (row) => softwareCell(row.name, row.logo, showLogos),
    },
    { key: "publisher", label: "Publisher", width: "auto" },
    { key: "reseller", label: "Vendor", width: "auto" },
    { key: "category", label: "Category", width: "auto" },
    {
      key: "owner",
      label: "B.U Owner",
      width: "auto",
      render: (row) => skuOwner.get(row.sku) ?? "—",
    },
    {
      key: "totalSpend",
      label: "Total Spend",
      width: "auto",
      align: "right",
      render: (row) => formatCurrency(row.totalSpend),
    },
    {
      key: "purchased",
      label: "Licenses Purchased",
      width: "auto",
      align: "right",
      render: (row) => (row.seatBased ? formatCount(row.purchased) : "—"),
    },
    {
      key: "utilization",
      label: "Utilization",
      width: "auto",
      align: "right",
      render: (row) => `${row.utilization}%`,
    },
    {
      key: "inactive",
      label: "Inactive",
      width: "auto",
      align: "right",
      render: (row) => (row.seatBased ? formatCount(row.inactive) : "—"),
    },
    {
      key: "contractExpirationDate",
      label: "Renewal Date",
      width: "auto",
      align: "right",
      render: (row) => formatDate(row.contractExpirationDate),
    },
  ];

  const renewalColumns: Column<ProductSummary>[] = [
    ...activeColumns,
    {
      key: "renewalDays",
      label: "Days to Renewal",
      width: "auto",
      align: "right",
      render: (row) => (row.renewalDays < 0 ? `${-row.renewalDays} days overdue` : `${row.renewalDays} days`),
    },
  ];

  return (
        <div className={styles.panel} data-hotspot="lifecycle-stage-scope">
          <p className={styles.sectionTitle}>Software By Lifecycle Stage</p>
          <div className={styles.toolbarRow}>
            <div data-hotspot="lifecycle-stage-terms">
              <FilterTabs
                options={stageOptions}
                value={stage}
                onChange={stageChange}
                ariaLabel="Filter by lifecycle stage"
              />
            </div>
            <div data-hotspot="alert-button">
              <Button
                variant="secondary"
                icon={<Icon name="warning" color="var(--xops-status-danger-solid)" />}
                onClick={onOpenAlerts}
              >
                <span className={styles.viewAlertsBadge}>{STAGE_ALERTS[stage].length}</span>
              </Button>
            </div>
          </div>

          {stage === "procurement" && (
            <div className={styles.tableOutline}>
              <Table
                headerSurface="grey"
                columns={procurementColumns}
                data={pagedEvaluationRows}
                rowKey={(row) => row.sku}
                rowStatus={(row) => (rowTint.has(row.name) ? "danger" : undefined)}
                dangerHotspotId="stage-level-alerting-rows"
                scrollFade={false}
                pagination={
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    pageSizeOptions={[10, 20, 50]}
                    totalItems={evaluationRows.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                }
              />
            </div>
          )}
          {stage === "provisioning" && (
            <div className={styles.tableOutline}>
              <Table
                headerSurface="grey"
                columns={provisioningColumns}
                data={pagedRolloutRows}
                rowKey={(row) => row.sku}
                rowStatus={(row) => (rowTint.has(row.name) ? "danger" : undefined)}
                dangerHotspotId="stage-level-alerting-rows"
                scrollFade={false}
                pagination={
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    pageSizeOptions={[10, 20, 50]}
                    totalItems={rolloutRows.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                }
              />
            </div>
          )}
          {stage === "active" && (
            <div className={styles.tableOutline}>
              <Table
                headerSurface="grey"
                columns={activeColumns}
                data={pagedOperationalRows}
                rowKey={(row) => row.sku}
                rowStatus={(row) => (rowTint.has(row.name) ? "danger" : undefined)}
                dangerHotspotId="stage-level-alerting-rows"
                scrollFade={false}
                pagination={
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    pageSizeOptions={[10, 20, 50]}
                    totalItems={operationalRows.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                }
              />
            </div>
          )}
          {stage === "renewal" && (
            <div className={styles.tableOutline}>
              <Table
                headerSurface="grey"
                columns={renewalColumns}
                data={pagedRenewalRows}
                rowKey={(row) => row.sku}
                rowStatus={(row) => (rowTint.has(row.name) ? "danger" : undefined)}
                dangerHotspotId="stage-level-alerting-rows"
                scrollFade={false}
                pagination={
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    pageSizeOptions={[10, 20, 50]}
                    totalItems={renewalRows.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                }
              />
            </div>
          )}
        </div>
  );
}
