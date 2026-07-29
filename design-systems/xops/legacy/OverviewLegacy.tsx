"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import GlobalHeader from "../components/GlobalHeader";
import PageHeader from "../components/PageHeader";
import { Grid, GridItem } from "../components/Grid";
import { Card } from "../components/Card";
import { Stat } from "../components/Stat";
import { Legend } from "../components/Legend";
import { DonutChart } from "../components/DonutChart";
import { BarChart } from "../components/BarChart";
import { Table, Column } from "../components/Table";
import { LogoTile } from "../components/LogoTile";
import { Dropdown, DropdownOption } from "../components/Dropdown";
import { FilterTabs, FilterTabOption } from "../components/FilterTabs";
import { Pagination } from "../components/Pagination";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { getDataset } from "../data/generate";
import {
  productSummaries,
  orgTotals,
  evaluationProducts,
  lifecycleProducts,
  openSourceProducts,
  totalAnnualSpend,
  ProductSummary,
  EvaluationSummary,
} from "../data/metrics";
import { formatCount, formatCurrency, formatPercent } from "../lib/format";
import { AlertsPanel, AlertItem } from "./AlertsPanel";
import type { SoftwareSubKey } from "../components/Sidebar";
import styles from "./OverviewLegacy.module.css";

// Legacy Overview (v1) — reconstructed from a screenshot only (no Figma node for this
// generation, see .claude/projects/xops/DECISIONS.md 019/024). Composed entirely from the
// real design system's existing components; every net-new visual piece is a one-off
// scoped to this file or design-systems/xops/legacy/, never the shared components tree.

type StageValue = "procurement" | "provisioning" | "active" | "renewal";

// Decorative alert content — not backed by real computed alert logic (this pass's
// explicit scope). Related software ties into real catalog product names so the
// row-tint below lands on genuine table rows.
const STAGE_ALERTS: Record<StageValue, AlertItem[]> = {
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
      title: "Unassigned Licenses Detected",
      description: "3 software titles in provisioning have unassigned licenses.",
      cta: "View",
      relatedSoftware: ["SAP Concur", "Tableau Explorer", "Adobe Acrobat Pro"],
    },
    {
      title: "New Hire License Demand vs Available Licenses",
      description: "ServiceNow ITSM provisioning request includes new licenses, but a portion remain unassigned.",
      cta: "View",
      relatedSoftware: ["ServiceNow ITSM"],
    },
    {
      title: "Software Blocked by IT Dependencies",
      description: "Power BI Pro deployment is delayed due to missing server configurations.",
      cta: "View",
      relatedSoftware: ["Power BI Pro"],
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

function softwareCell(name: string, logo: string | null, showLogo: boolean) {
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

const filterOptions = { region: ["Global", "NA", "EMEA", "APAC", "LATAM"] };

export interface OverviewLegacyProps {
  /** Overrides internal alertsOpen state when set — lets the hotspot narrative drive the modal open/closed. Button click still works normally when omitted. */
  forceAlertsOpen?: boolean;
  /** Element the alerts modal insets itself 32px from (top/bottom) instead of the full viewport — the live-embed's img wrapper, passed down from the hotspot sequence. */
  alertsBoundsRef?: React.RefObject<HTMLElement>;
  /** Suppress publisher logos in software cells — the case study embeds both Overview
   *  prototypes without logos (per the user). Defaults to shown on the standalone route. */
  showLogos?: boolean;
  /** When set, Sidebar's Software item becomes navigable (same pattern as the real
   *  OverviewScreen/AllSoftwareScreen) — lets a connected embed switch to All Software
   *  in place instead of leaving the Sidebar inert. */
  onNavigate?: (screen: SoftwareSubKey) => void;
}

export default function OverviewLegacy({ forceAlertsOpen, alertsBoundsRef, showLogos = true, onNavigate }: OverviewLegacyProps = {}) {
  const ds = useMemo(() => getDataset(), []);
  const allProducts = useMemo(() => productSummaries(ds), [ds]);
  const openSourceRows = useMemo(() => openSourceProducts(ds), [ds]);
  const evaluationRows = useMemo(() => evaluationProducts(ds), [ds]);
  const rolloutRows = useMemo(() => lifecycleProducts(ds, "rollout"), [ds]);
  const operationalRows = useMemo(() => lifecycleProducts(ds, "operational"), [ds]);
  const renewalRows = useMemo(() => lifecycleProducts(ds, "renewal"), [ds]);
  const totals = useMemo(() => orgTotals(ds), [ds]);
  const annualSpend = useMemo(() => totalAnnualSpend(ds), [ds]);

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

  const licenseOverview = useMemo(() => {
    const commercialTitles = allProducts.length;
    const openSourceTitles = openSourceRows.length;
    const commercialLicenses = totals.totalOwned;
    const openSourceLicenses = openSourceRows.reduce((sum, r) => sum + r.users, 0);
    const activeTrialLicenses = evaluationRows.reduce((sum, r) => sum + r.licensesRequested, 0);
    const expiringSoon = allProducts
      .filter((r) => r.seatBased && r.renewalDays <= 30)
      .reduce((sum, r) => sum + r.purchased, 0);
    const totalOwned = commercialLicenses + openSourceLicenses + activeTrialLicenses;
    return {
      commercialTitles,
      openSourceTitles,
      totalTitles: commercialTitles + openSourceTitles,
      commercialLicenses,
      openSourceLicenses,
      activeTrialLicenses,
      totalOwned,
      expiringSoon,
    };
  }, [allProducts, openSourceRows, evaluationRows, totals]);

  const vendorSpend = useMemo(() => {
    const byVendor = new Map<string, number>();
    for (const p of allProducts) {
      byVendor.set(p.reseller, (byVendor.get(p.reseller) ?? 0) + p.annualCost);
    }
    return Array.from(byVendor.entries())
      .map(([vendor, spend]) => ({ vendor, spend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);
  }, [allProducts]);

  const forecastedRenewals90 = useMemo(
    () =>
      allProducts
        .filter((r) => r.renewalDays <= 90)
        .reduce((sum, r) => sum + r.estimatedRenewalValue, 0),
    [allProducts],
  );

  const utilizationCard = useMemo(() => {
    const { totalOwned, assigned, active, inactive, unassigned } = totals;
    const pct = (n: number) => formatPercent(n, totalOwned);
    const compactCount = (n: number) => formatCount(n, { compact: true });
    return {
      totalOwned: compactCount(totalOwned),
      assigned: compactCount(assigned),
      assignedPct: pct(assigned),
      active: compactCount(active),
      activePct: pct(active),
      inactive: compactCount(inactive),
      inactivePct: pct(inactive),
      unassigned: compactCount(unassigned),
      unassignedPct: pct(unassigned),
      activeCount: active,
      inactiveCount: inactive,
      unassignedCount: unassigned,
    };
  }, [totals]);

  // Cost Center / Business Unit / Department option lists — real org taxonomy from
  // ds.config, not modeled per-row filters (the row set itself isn't refiltered on change).
  const costCenterNames = useMemo(
    () => ["All", ...ds.config.costCenters.map((c) => c.name)],
    [ds],
  );
  const businessUnitNames = useMemo(
    () => ["All", ...Array.from(new Set(ds.config.departments.map((d) => d.parentOrg)))],
    [ds],
  );
  const departmentNames = useMemo(
    () => ["All", ...ds.config.departments.map((d) => d.departmentName)],
    [ds],
  );

  const [region, setRegion] = useState("Global");
  const [costCenter, setCostCenter] = useState("all");
  const [businessUnit, setBusinessUnit] = useState("all");
  const [department, setDepartment] = useState("all");

  const [stage, setStage] = useState<StageValue>("provisioning");
  const [alertsOpen, setAlertsOpen] = useState(false);

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const stageChange = (next: StageValue) => {
    setStage(next);
    setPage(1);
  };

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
    { key: "vendor", label: "Vendor", width: "auto", render: () => "—" },
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
      label: "Total Licenses Assigned",
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
      render: (row) => `${row.renewalDays} days`,
    },
  ];

  const dropdownOptions = (values: string[]): DropdownOption[] =>
    values.map((v) => ({ value: v.toLowerCase(), label: v }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--xops-grey-50)" }}>
      <Sidebar activeSoftwareItem="overview" onNavigate={onNavigate} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <GlobalHeader userName="Stebin Ben" notificationCount={9} />
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--xops-spacing-24)",
            padding: "var(--xops-grid-margin)",
            backgroundColor: "var(--xops-surface-page)",
          }}
        >
          <PageHeader
            title="Software Overview"
            metaIcon="cloud_download"
            metaText="Data last updated Apr 15, 2025 at 09:06 AM"
          />

          <Grid>
            <GridItem colSpan={12}>
              <div className={styles.filterBar}>
                <div className={styles.filterField} data-hotspot="geographic-filtering">
                  <span className={styles.filterLabel}>Region</span>
                  <Dropdown
                    value={region.toLowerCase()}
                    options={dropdownOptions(filterOptions.region)}
                    onChange={(v) => setRegion(v)}
                    ariaLabel="Filter by region"
                    openDirection="down"
                    className={styles.filterDropdown}
                    maxMenuHeight={200}
                  />
                </div>
                <div className={styles.filterDivider} />
                <div className={styles.filterField}>
                  <span className={styles.filterLabel}>Cost Center</span>
                  <Dropdown
                    value={costCenter}
                    options={dropdownOptions(costCenterNames)}
                    onChange={(v) => setCostCenter(v)}
                    ariaLabel="Filter by cost center"
                    openDirection="down"
                    className={styles.filterDropdown}
                    maxMenuHeight={200}
                  />
                </div>
                <div className={styles.filterField}>
                  <span className={styles.filterLabel}>Business Unit</span>
                  <Dropdown
                    value={businessUnit}
                    options={dropdownOptions(businessUnitNames)}
                    onChange={(v) => setBusinessUnit(v)}
                    ariaLabel="Filter by business unit"
                    openDirection="down"
                    className={styles.filterDropdown}
                    maxMenuHeight={200}
                  />
                </div>
                <div className={styles.filterField}>
                  <span className={styles.filterLabel}>Department</span>
                  <Dropdown
                    value={department}
                    options={dropdownOptions(departmentNames)}
                    onChange={(v) => setDepartment(v)}
                    ariaLabel="Filter by department"
                    openDirection="down"
                    className={styles.filterDropdown}
                    maxMenuHeight={200}
                  />
                </div>
              </div>
            </GridItem>

            {/* Card row 1 — License Overview / Spend / Usage */}
            <GridItem colSpan={4}>
              <div className={styles.panel}>
                <p className={styles.sectionTitle}>License Overview</p>

                <div className={styles.licenseBlocksGroup}>
                <div className={styles.licenseBlock} data-hotspot="licensing-model-breakdown">
                  <div className={styles.licenseBlockHeader}>
                    <span className={styles.licenseBlockLabel}>Total Licensed Software</span>
                    <span className={styles.licenseBlockValue}>{formatCount(licenseOverview.totalTitles)}</span>
                  </div>
                  <BarChart
                    segments={[
                      { value: licenseOverview.commercialTitles, color: "var(--xops-brand-primary)" },
                      { value: licenseOverview.openSourceTitles, color: "#b7b9ff" },
                    ]}
                  />
                  <Legend
                    items={[
                      {
                        label: "Commercial Software Titles",
                        value: formatCount(licenseOverview.commercialTitles),
                        meta: formatPercent(licenseOverview.commercialTitles, licenseOverview.totalTitles),
                        color: "var(--xops-brand-primary)",
                      },
                      {
                        label: "Open Source Software Titles",
                        value: formatCount(licenseOverview.openSourceTitles),
                        meta: formatPercent(licenseOverview.openSourceTitles, licenseOverview.totalTitles),
                        color: "#b7b9ff",
                      },
                    ]}
                  />
                </div>

                <div className={styles.licenseBlock}>
                  <div className={styles.licenseBlockHeader}>
                    <span className={styles.licenseBlockLabel}>Total Licenses Owned</span>
                    <span className={styles.licenseBlockValue}>{formatCount(licenseOverview.totalOwned)}</span>
                  </div>
                  <BarChart
                    segments={[
                      { value: licenseOverview.commercialLicenses, color: "var(--xops-brand-primary)" },
                      { value: licenseOverview.openSourceLicenses, color: "#b7b9ff" },
                      { value: licenseOverview.activeTrialLicenses, color: "var(--xops-status-success-solid)" },
                    ]}
                  />
                  <Legend
                    items={[
                      {
                        label: "Commercial",
                        value: formatCount(licenseOverview.commercialLicenses, { compact: true }),
                        color: "var(--xops-brand-primary)",
                      },
                      {
                        label: "Open Source",
                        value: formatCount(licenseOverview.openSourceLicenses, { compact: true }),
                        color: "#b7b9ff",
                      },
                      {
                        label: "Active Trial",
                        value: formatCount(licenseOverview.activeTrialLicenses, { compact: true }),
                        color: "var(--xops-status-success-solid)",
                      },
                    ]}
                  />
                  <div className={styles.expiringBanner} data-hotspot="expiring-licenses">
                    <span>Licenses Expiring (Next 30 Days)</span>
                    <span>
                      {formatCount(licenseOverview.expiringSoon, { compact: true })}{" "}
                      {formatPercent(licenseOverview.expiringSoon, licenseOverview.totalOwned)}
                    </span>
                  </div>
                </div>
                </div>
              </div>
            </GridItem>

            <GridItem colSpan={4}>
              <div className={styles.panel}>
                <p className={styles.sectionTitle}>Spend</p>
                <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                  <Stat label="Total Annual Spend" value={formatCurrency(annualSpend, { compact: true })} />
                  <Stat label="Est. Renewals (90 Days)" value={formatCurrency(forecastedRenewals90, { compact: true })} />
                </div>
                <div className={`${styles.licenseBlockLabel} ${styles.spendVendorLabel}`}>Top Spend By Vendor</div>
                <div className={styles.tableOutline}>
                  <Table
                    chrome={false}
                    scrollFade={false}
                    columns={[
                      { key: "vendor", label: "Vendor", width: "flex" },
                      {
                        key: "spend",
                        label: "Est. Annual Spend",
                        width: "auto",
                        align: "right",
                        render: (row) => formatCurrency(row.spend, { compact: true }),
                      },
                      {
                        key: "pct",
                        label: "% of Total Spend",
                        width: "auto",
                        align: "right",
                        render: (row) => formatPercent(row.spend, annualSpend),
                      },
                    ]}
                    data={vendorSpend}
                    rowKey={(row) => row.vendor}
                  />
                </div>
              </div>
            </GridItem>

            <GridItem colSpan={4}>
              <Card title="Usage">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-24)" }}>
                  <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                    <Stat label="Total Licenses Assigned" value={utilizationCard.assigned} meta={utilizationCard.assignedPct} />
                    <Stat label="Unassigned Licenses" value={utilizationCard.unassigned} meta={utilizationCard.unassignedPct} />
                  </div>
                  <p className={styles.licenseBlockLabel}>License Utilization</p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <DonutChart
                      segments={[
                        {
                          value: utilizationCard.activeCount,
                          color: "var(--xops-status-success-solid)",
                          tooltip: {
                            category: "Active",
                            rows: [
                              { label: "Count", value: utilizationCard.active },
                              { label: "% of Total", value: utilizationCard.activePct },
                            ],
                          },
                        },
                        {
                          value: utilizationCard.inactiveCount,
                          color: "var(--xops-status-danger-solid)",
                          tooltip: {
                            category: "Inactive (60+ Days)",
                            rows: [
                              { label: "Count", value: utilizationCard.inactive },
                              { label: "% of Total", value: utilizationCard.inactivePct },
                            ],
                          },
                        },
                        {
                          value: utilizationCard.unassignedCount,
                          color: "var(--xops-grey-300)",
                          tooltip: {
                            category: "Unassigned",
                            rows: [
                              { label: "Count", value: utilizationCard.unassigned },
                              { label: "% of Total", value: utilizationCard.unassignedPct },
                            ],
                          },
                        },
                      ]}
                    />
                  </div>
                  <Legend
                    items={[
                      { label: "Active", value: utilizationCard.active, meta: utilizationCard.activePct, color: "var(--xops-status-success-solid)" },
                      { label: "Inactive (60+ Days)", value: utilizationCard.inactive, meta: utilizationCard.inactivePct, color: "var(--xops-status-danger-solid)", hotspotId: "inactivity-threshold" },
                      { label: "Unassigned", value: utilizationCard.unassigned, meta: utilizationCard.unassignedPct, color: "var(--xops-grey-300)" },
                    ]}
                  />
                </div>
              </Card>
            </GridItem>

            {/* Card row 2 — Compliance / Top Non-Compliant Software (both decorative,
                copied from the real Overview build; pending removal per DECISIONS 033) */}
            <GridItem colSpan={5}>
              <div data-hotspot="compliance-granularity">
              <Card title="Compliance">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-24)" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <DonutChart
                      segments={[
                        {
                          value: 157000,
                          color: "var(--xops-status-success-solid)",
                          tooltip: { category: "Compliant", rows: [{ label: "Instances", value: "157,000" }, { label: "% of Total", value: "71.7%" }] },
                        },
                        {
                          value: 18000,
                          color: "var(--xops-status-warning-solid)",
                          tooltip: { category: "At Risk", rows: [{ label: "Instances", value: "18,000" }, { label: "% of Total", value: "8.2%" }] },
                        },
                        {
                          value: 21000,
                          color: "var(--xops-status-danger-solid)",
                          tooltip: { category: "Non-Compliant", rows: [{ label: "Instances", value: "21,000" }, { label: "% of Total", value: "9.6%" }] },
                        },
                        {
                          value: 23000,
                          color: "var(--xops-grey-300)",
                          tooltip: { category: "Unverified/Pending", rows: [{ label: "Instances", value: "23,000" }, { label: "% of Total", value: "10.5%" }] },
                        },
                      ]}
                    />
                  </div>
                  <Legend
                    items={[
                      { label: "Compliant", value: "157,000", meta: "71.7%", color: "var(--xops-status-success-solid)" },
                      { label: "At Risk", value: "18,000", meta: "8.2%", color: "var(--xops-status-warning-solid)" },
                      { label: "Non-Compliant", value: "21,000", meta: "9.6%", color: "var(--xops-status-danger-solid)" },
                      { label: "Unverified/Pending", value: "23,000", meta: "10.5%", color: "var(--xops-grey-300)" },
                    ]}
                  />
                </div>
              </Card>
              </div>
            </GridItem>

            <GridItem colSpan={7}>
              <Card title="Top Non-Compliant Software">
                <div className={styles.tableOutline}>
                  <Table
                    chrome={false}
                    scrollFade={false}
                    columns={[
                      { key: "software", label: "Software", width: "flex" },
                      { key: "instances", label: "Instances", width: "auto", align: "right" },
                      { key: "type", label: "Type of Non-Compliance", width: "auto" },
                    ]}
                    data={[
                      { software: "Adobe CC", instances: "120", type: "Over-deployed Licenses" },
                      { software: "Visio Pro", instances: "95", type: "Expired Licenses" },
                      { software: "Zoom Pro", instances: "60", type: "Unauthorized Installations" },
                      { software: "Lucid Chart", instances: "48", type: "Over-deployed Licenses" },
                      { software: "Miro", instances: "32", type: "Duplicate Assignments" },
                    ]}
                    rowKey={(row) => row.software}
                  />
                </div>
              </Card>
            </GridItem>

            {/* Stage pills + toolbar + main table */}
            <GridItem colSpan={12}>
              <div className={styles.panel}>
                <p className={styles.sectionTitle}>Software By Lifecycle Stage</p>
                <div data-hotspot="lifecycle-stage-terms">
                  <FilterTabs
                    options={stageOptions}
                    value={stage}
                    onChange={stageChange}
                    ariaLabel="Filter by lifecycle stage"
                  />
                </div>

                <div className={styles.toolbarRow}>
                  <div className={styles.toolbarLeftGroup}>
                    <div className={styles.searchBox}>
                      <Icon name="search" color="var(--xops-text-disabled)" />
                      <span className={styles.searchPlaceholder}>Search</span>
                    </div>
                    <Button
                      variant="secondary"
                      icon={<Icon name="Filter" color="var(--xops-text-secondary)" />}
                    >
                      Filters
                    </Button>
                  </div>
                  <div data-hotspot="alert-button">
                    <Button
                      variant="secondary"
                      icon={<Icon name="warning" color="var(--xops-status-danger-solid)" />}
                      onClick={() => setAlertsOpen(true)}
                    >
                      <span className={styles.viewAlertsBadge}>{STAGE_ALERTS[stage].length}</span>
                    </Button>
                  </div>
                </div>

                {stage === "procurement" && (
                  <div className={styles.tableOutline}>
                    <Table
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
            </GridItem>
          </Grid>
        </main>
      </div>

      <AlertsPanel
        open={forceAlertsOpen !== undefined ? forceAlertsOpen : alertsOpen}
        boundsRef={alertsBoundsRef}
        onClose={() => setAlertsOpen(false)}
        stageLabel={stageOptions.find((o) => o.value === stage)?.label ?? ""}
        alerts={STAGE_ALERTS[stage]}
        // The hotspot sequence's own spotlight already dims the embed — this panel's
        // own backdrop only dims when opened normally (button click, forceAlertsOpen unset).
        dimmed={forceAlertsOpen === undefined}
      />
    </div>
  );
}
