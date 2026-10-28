"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import GlobalHeader from "../components/GlobalHeader";
import PageHeader from "../components/PageHeader";
import { Grid, GridItem } from "../components/Grid";
import { Card } from "../components/Card";
import { Stat } from "../components/Stat";
import { Legend } from "../components/Legend";
import { DonutChart } from "../components/DonutChart";
import { BarChart } from "../components/BarChart";
import { Table } from "../components/Table";
import { Dropdown, DropdownOption } from "../components/Dropdown";
import { getDataset } from "../data/generate";
import {
  productSummaries,
  orgTotals,
  evaluationProducts,
  openSourceProducts,
  totalAnnualSpend,
} from "../data/metrics";
import { formatCount, formatCurrency, formatPercent } from "../lib/format";
import { topNonCompliantTitles } from "../data/complianceMetrics";
import { AlertsPanel } from "./AlertsPanel";
import { CompliancePanel } from "./CompliancePanel";
import { LifecycleStagePanel, STAGE_ALERTS, STAGE_LABELS, softwareCell, type StageValue } from "./LifecycleStagePanel";
import type { SoftwareSubKey } from "../components/Sidebar";
import styles from "./OverviewLegacy.module.css";

// Legacy Overview (v1) — reconstructed from a screenshot only (no Figma node for this
// generation, see .claude/projects/xops/DECISIONS.md 019/024). Composed entirely from the
// real design system's existing components; every net-new visual piece is a one-off
// scoped to this file or design-systems/xops/legacy/, never the shared components tree.

export type { StageValue };

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
  /** Case study only: reports the active lifecycle stage tab (and its initial value on
   *  mount) so a surrounding overlay can follow which stage the visitor is viewing. */
  onStageChange?: (stage: StageValue) => void;
}

export default function OverviewLegacy({ forceAlertsOpen, alertsBoundsRef, showLogos = true, onNavigate, onStageChange }: OverviewLegacyProps = {}) {
  const ds = useMemo(() => getDataset(), []);
  const allProducts = useMemo(() => productSummaries(ds), [ds]);
  const openSourceRows = useMemo(() => openSourceProducts(ds), [ds]);
  const evaluationRows = useMemo(() => evaluationProducts(ds), [ds]);
  const totals = useMemo(() => orgTotals(ds), [ds]);
  const annualSpend = useMemo(() => totalAnnualSpend(ds), [ds]);
  const nonCompliantRows = useMemo(() => topNonCompliantTitles(ds), [ds]);


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

  // Compliance hugs its own content naturally; Top Non-Compliant Software is
  // capped to Compliance's real rendered height (measured live rather than
  // guessed) so its taller table doesn't grow the row past Compliance — any
  // content past that height is clipped, not scrolled. Uses offsetHeight (this
  // element's own local size), not getBoundingClientRect (post-transform screen
  // size) — this whole tree renders inside LiveEmbed's scaled canvas, and a
  // screen-space number fed back in as a CSS height would get scaled down a
  // second time by that same ancestor transform.
  const complianceRef = useRef<HTMLDivElement>(null);
  const [complianceHeight, setComplianceHeight] = useState<number | null>(null);
  useEffect(() => {
    const el = complianceRef.current;
    if (!el) return;
    const measure = () => setComplianceHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onStageChange?.(stage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

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
              <div className={styles.filterBar} data-hotspot="geographic-filtering">
                <div className={styles.filterField}>
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
              <div className={styles.panel} data-hotspot="license-overview">
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

                <div className={styles.licenseBlock} data-hotspot="total-licenses-owned">
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
              <Card title="Usage" hotspotId="usage-overview">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-24)" }}>
                  <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }}>
                    <Stat label="Assigned" value={utilizationCard.assigned} meta={utilizationCard.assignedPct} hotspotId="assigned-licenses" />
                    <Stat label="Unassigned" value={utilizationCard.unassigned} meta={utilizationCard.unassignedPct} />
                  </div>
                  <p className={styles.licenseBlockLabel} data-hotspot="license-utilization">License Utilization</p>
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

            <GridItem colSpan={4}>
              <div className={styles.panel} data-hotspot="spend-overview">
                <p className={styles.sectionTitle}>Spend</p>
                <div style={{ display: "flex", gap: "var(--xops-spacing-8)" }} data-hotspot="spend-stats">
                  <Stat label="Total Annual Spend" value={formatCurrency(annualSpend, { compact: true })} />
                  <Stat label="Est. Renewals (90d)" value={formatCurrency(forecastedRenewals90, { compact: true })} />
                </div>
                <div className={`${styles.licenseBlockLabel} ${styles.spendVendorLabel}`} data-hotspot="top-spend-vendor">Top 10 Vendors by Spend</div>
                <div className={styles.tableOutline}>
                  <Table
                    chrome={false}
                    scrollFade={false}
                    headerSurface="grey"
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

            {/* Card row 2 — Compliance / Top Non-Compliant Titles. Driven by
                complianceMetrics.ts (installed instances vs. entitled seats + contract
                dates) — see that file's header comment for the two-dimension model and
                what's explicitly out of scope this round. */}
            <GridItem colSpan={5} style={{ alignSelf: "start" }}>
              <div data-hotspot="compliance-granularity" ref={complianceRef}>
              <CompliancePanel />
              </div>
            </GridItem>

            <GridItem colSpan={7}>
              <div style={{ height: complianceHeight ?? undefined, overflow: "hidden" }}>
                <Card title="Top 10 Non-Compliant Software by Instance" hotspotId="top-non-compliant">
                  <div className={styles.tableOutline}>
                    <Table
                      chrome={false}
                      scrollFade={false}
                      headerSurface="grey"
                      columns={[
                        {
                          key: "software",
                          label: "Software",
                          width: "flex",
                          render: (row) => softwareCell(row.software, row.logo, showLogos),
                        },
                        { key: "instances", label: "Instances", width: "auto", align: "right", render: (row) => formatCount(row.instances) },
                        { key: "type", label: "Type", width: "auto" },
                      ]}
                      data={nonCompliantRows}
                      rowKey={(row) => row.sku}
                    />
                  </div>
                </Card>
              </div>
            </GridItem>

            {/* Stage pills + toolbar + main table */}
            <GridItem colSpan={12}>
              <LifecycleStagePanel
                stage={stage}
                onStageChange={setStage}
                onOpenAlerts={() => setAlertsOpen(true)}
                showLogos={showLogos}
              />
            </GridItem>
          </Grid>
        </main>
      </div>

      <AlertsPanel
        open={forceAlertsOpen !== undefined ? forceAlertsOpen : alertsOpen}
        boundsRef={alertsBoundsRef}
        onClose={() => setAlertsOpen(false)}
        stageLabel={STAGE_LABELS[stage]}
        alerts={STAGE_ALERTS[stage]}
        // The hotspot sequence's own spotlight already dims the embed — this panel's
        // own backdrop only dims when opened normally (button click, forceAlertsOpen unset).
        dimmed={forceAlertsOpen === undefined}
      />
    </div>
  );
}
