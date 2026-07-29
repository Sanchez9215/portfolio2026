"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import type { SoftwareSubKey } from "../components/Sidebar";
import GlobalHeader from "../components/GlobalHeader";
import PageHeader from "../components/PageHeader";
import { Grid, GridItem } from "../components/Grid";
import { Table, Column } from "../components/Table";
import { FilterTabs, FilterTabOption } from "../components/FilterTabs";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { SidePanel } from "../components/SidePanel";
import { TooltipProps } from "../components/Tooltip";
import { getDataset } from "../data/generate";
import { productSummaries, ProductSummary } from "../data/metrics";
import { lifecycleEvents } from "../data/lifecycle";
import { formatCount, formatCurrency } from "../lib/format";
import { SoftwareProfileLegacy } from "./SoftwareProfileLegacy";
import styles from "./AllSoftwareLegacy.module.css";

// Shared status-tooltip copy — same confirmed wording used in the modern All Software screen,
// carried onto the legacy profile's Legend info icons.
const activeTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Active",
  description:
    "Assigned licenses that have recorded user activity within the last 90 days, showing they are delivering value.",
};

const assignedTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Assigned",
  description:
    "Purchased licenses designated to a specific employee, reserving the seat for their use.",
};

const inactiveTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Inactive",
  description:
    "Assigned licenses that have recorded zero user activity within the last 90 days, making them primary targets for cost-saving reclamation.",
};

const unassignedTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Unassigned",
  description:
    "Purchased license seats remaining in the inventory pool that are available to be distributed to users.",
};

// Legacy All Software — reconstructed from a real Figma node (2031:925), see
// .claude/projects/xops/DECISIONS.md 019/024. Reuses Sidebar/GlobalHeader/PageHeader/
// FilterTabs/Table as-is; the only adjustments are the three the user called out:
// tighter row padding, no publisher logos, no tags. Colocated in legacy/, never the
// shared components tree.

// ISO date → "Mmm D, YYYY", UTC-pinned so the generator's UTC dates never shift a day.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const regionOptions: FilterTabOption[] = [
  { value: "global", label: "Global" },
  { value: "na", label: "NA" },
  { value: "apac", label: "APAC" },
  { value: "latam", label: "LATAM" },
  { value: "emea", label: "EMEA" },
];

const columns: Column<ProductSummary>[] = [
  {
    key: "name",
    label: "Software",
    width: "flex",
    sortable: true,
    // Same truncation rule as the Overview tables (softwareCell): a minWidth:0
    // flex wrapper lets the ellipsis span shrink below its content and truncate,
    // with the full name on `title`. No LogoTile here — legacy has no logos.
    render: (row) => (
      <div title={row.name} style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
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
  { key: "publisher", label: "Publisher", width: "auto", sortable: true },
  { key: "reseller", label: "Vendor", width: "auto", sortable: true },
  { key: "category", label: "Category", width: "auto", align: "right", sortable: true },
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
    render: (row) => (row.seatBased ? formatCount(row.purchased) : "Usage-based"),
  },
  {
    key: "utilization",
    label: "Utilization",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => (row.seatBased ? `${row.utilization}%` : "N/A"),
  },
  {
    key: "inactive",
    label: "Inactive",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => (row.seatBased ? formatCount(row.inactive) : "N/A"),
  },
  {
    key: "renewalDate",
    label: "Renewal",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatDate(row.renewalDate),
  },
];

export interface AllSoftwareLegacyProps {
  /** When set, Sidebar's Software item becomes navigable (same pattern as the real
   *  OverviewScreen/AllSoftwareScreen) — lets a connected embed switch back to
   *  Overview in place instead of leaving the Sidebar inert. */
  onNavigate?: (screen: SoftwareSubKey) => void;
  /** Case study only: keeps row positions fixed for the hotspot overlay's structural
   *  (nth-child) column targeting — see `AllSoftwareLegacyHotspots`. */
  disableVerticalScroll?: boolean;
  /** Case study only: blocks user-driven horizontal scroll while leaving the scripted
   *  scrollToX auto-scroll unaffected — see `AllSoftwareLegacyHotspots`. */
  disableHorizontalScroll?: boolean;
  /** Case study only: scripted horizontal auto-scroll for the hotspot sequence,
   *  revealing the trailing columns before they're spotlighted. */
  scrollToX?: "start" | "end";
}

export default function AllSoftwareLegacy({
  onNavigate,
  disableVerticalScroll,
  disableHorizontalScroll,
  scrollToX,
}: AllSoftwareLegacyProps = {}) {
  const ds = useMemo(() => getDataset(), []);
  const summaries = useMemo(() => productSummaries(ds), [ds]);

  const [region, setRegion] = useState("global");
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined);
  const [profileOpen, setProfileOpen] = useState(false);

  const selectedRow = useMemo(
    () => summaries.find((s) => s.sku === selectedRowId),
    [summaries, selectedRowId],
  );

  const selectedLifecycleEvents = useMemo(
    () => (selectedRow ? lifecycleEvents(ds, selectedRow.sku) : []),
    [ds, selectedRow],
  );

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--xops-grey-50)",
      }}
    >
      <Sidebar activeSoftwareItem="all-software" onNavigate={onNavigate} />
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
          <div className={styles.pageHeader}>
            <PageHeader
              title="All Software"
              count={summaries.length}
              metaIcon="cloud_download"
              metaText="Data last updated Jan 14, 2025 at 02:06PM"
            />
          </div>
          <div className={styles.toolbarRow}>
            <div className={styles.regionGroup}>
              <FilterTabs
                options={regionOptions}
                value={region}
                onChange={setRegion}
                ariaLabel="Filter by region"
              />
            </div>
            <Button iconOnly icon={<Icon name="Filter" color="var(--xops-text-secondary)" />} ariaLabel="Filter" />
          </div>
          <Grid style={{ flex: 1, minHeight: 0, gridAutoRows: "1fr" }}>
            <GridItem colSpan={12} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div className={styles.tableWrapper}>
                <Table
                  columns={columns}
                  data={summaries}
                  rowKey={(row) => row.sku}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSortChange={handleSortChange}
                  selectedRowKey={selectedRowId}
                  onRowClick={(row) => {
                    setSelectedRowId(row.sku);
                    setProfileOpen(true);
                  }}
                  disableVerticalScroll={disableVerticalScroll}
                  disableHorizontalScroll={disableHorizontalScroll}
                  scrollToX={scrollToX}
                  scrollFade={false}
                />
              </div>
            </GridItem>
          </Grid>
        </main>
      </div>
      <SidePanel isOpen={profileOpen} onClose={() => setProfileOpen(false)}>
        {selectedRow && (
          <SoftwareProfileLegacy
            row={selectedRow}
            lifecycleEvents={selectedLifecycleEvents}
            activeTooltip={activeTooltip}
            assignedTooltip={assignedTooltip}
            inactiveTooltip={inactiveTooltip}
            unassignedTooltip={unassignedTooltip}
          />
        )}
      </SidePanel>
    </div>
  );
}
