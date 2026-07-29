"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogoTile } from "../components/LogoTile";
import { BarChart } from "../components/BarChart";
import { Legend } from "../components/Legend";
import Icon from "../components/Icon";
import { FilterTabs, FilterTabOption } from "../components/FilterTabs";
import { LifecycleTimeline } from "../components/LifecycleTimeline";
import { TooltipProps } from "../components/Tooltip";
import { ProductSummary } from "../data/metrics";
import { LifecycleEvent } from "../data/lifecycle";
import { formatCount, formatCurrency, formatPercent } from "../lib/format";
import styles from "./SoftwareProfileLegacy.module.css";

// Legacy Software Profile — reconstructed from Figma node 1498:5483 (Profile Legacy),
// opened into SidePanel from Legacy All Software's row click. Reuses LogoTile / BarChart /
// Legend / FilterTabs(underline) / Icon / LifecycleTimeline; the #EEF2F7 filled panels are
// light custom markup (they don't map onto Stat), styled with absorbed XOPS tokens. All
// numbers are live joins off the ProductSummary passed in. Employees/Financial/Devices tab
// bodies are not built yet — only Lifecycle has real content.

type StatusTooltip = Omit<TooltipProps, "children" | "className">;

export type SoftwareProfileLegacyProps = {
  row: ProductSummary;
  lifecycleEvents: LifecycleEvent[];
  activeTooltip: StatusTooltip;
  assignedTooltip: StatusTooltip;
  inactiveTooltip: StatusTooltip;
  unassignedTooltip: StatusTooltip;
};

const detailTabs: FilterTabOption[] = [
  { value: "lifecycle", label: "Lifecycle" },
  { value: "employees", label: "Employees" },
  { value: "financial", label: "Financial" },
  { value: "devices", label: "Devices" },
];

export function SoftwareProfileLegacy({
  row,
  lifecycleEvents,
  activeTooltip,
  assignedTooltip,
  inactiveTooltip,
  unassignedTooltip,
}: SoftwareProfileLegacyProps) {
  const [tab, setTab] = useState("lifecycle");
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Tabs go sticky right below the header once scrolled past it — the header's height is
  // dynamic (description can wrap), so it's measured live (same technique as Table's
  // Pagination height) rather than assumed as a fixed number.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const purchased = row.purchased;
  const ofPurchased = (value: number) => `${formatPercent(value, purchased)} of Purchased`;
  // unitCost is annual per seat; the legacy card expresses per-license costs monthly.
  const costPerLicenseMonthly = row.unitCost / 12;
  const costPerActiveMonthly = row.active > 0 ? row.annualCost / row.active / 12 : 0;

  return (
    <div className={styles.profile}>
      <div className={styles.content}>
        <div ref={headerRef} className={styles.stickyHeader} data-hotspot="product-identity">
          <div className={styles.appTitle}>
            <LogoTile src={row.logo} alt={row.name} size="medium" />
            <p className={styles.appName} title={row.name}>
              {row.name}
            </p>
          </div>
          <div className={styles.description}>
            <div className={styles.descMeta}>
              <span className={styles.publisher}>{row.publisher}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.category}>{row.category}</span>
            </div>
            <p className={styles.descBody}>No description available yet.</p>
          </div>
        </div>

        <div className={styles.ownership} data-hotspot="ownership">
          <div className={styles.ownerTile}>
            <span className={styles.ownerLabel}>Primary Owner</span>
            <span className={styles.ownerValue}>{row.primaryOwner}</span>
          </div>
          <div className={styles.ownerTile}>
            <span className={styles.ownerLabel}>Secondary Owner</span>
            <span className={styles.ownerValue}>{row.secondaryOwner}</span>
          </div>
        </div>

        <div className={styles.summaryCard} data-hotspot="mixed-metrics">
          <div className={styles.purchasedHeader} data-hotspot="purchased-licenses">
            <p className={styles.summaryTitle}>Purchased Licenses</p>
            <p className={styles.summaryValue}>{formatCount(purchased)}</p>
          </div>

          <div className={styles.filledPanel}>
            <div className={styles.panelRow}>
              <span className={styles.panelLabel}>Total Annual Spend</span>
              <span className={styles.panelValueGroup}>
                <span className={styles.panelValue}>{formatCurrency(row.annualCost)}</span>
                <span className={styles.panelUnit}>/year</span>
              </span>
            </div>
            <div className={styles.panelRow}>
              <span className={styles.panelLabel}>Cost per License</span>
              <span className={styles.panelValueGroup}>
                <span className={styles.panelValue}>{formatCurrency(costPerLicenseMonthly)}</span>
                <span className={styles.panelUnit}>/month</span>
              </span>
            </div>
          </div>

          <div data-hotspot="utilization-summary">
            <BarChart
              total={purchased}
              segments={[
                { value: row.active, color: "var(--xops-status-success-solid)" },
                { value: row.inactive, color: "var(--xops-status-warning-solid)" },
              ]}
            />
          </div>

          <div className={styles.breakdown} data-hotspot="utilization-summary">
            <div className={styles.breakdownGroup}>
              <Legend
                items={[
                  {
                    label: "Active",
                    value: formatCount(row.active),
                    meta: ofPurchased(row.active),
                    color: "var(--xops-status-success-solid)",
                    tooltip: activeTooltip,
                  },
                  {
                    label: "Total Assigned",
                    value: formatCount(row.assigned),
                    meta: ofPurchased(row.assigned),
                    // opacity-0 dot in the Figma — a transparent swatch reproduces it via Legend as-is
                    color: "transparent",
                    tooltip: assignedTooltip,
                  },
                ]}
              />
              <div className={styles.costTile}>
                <span className={styles.costLabelGroup}>
                  <span className={styles.panelLabel}>Cost per Active License</span>
                  <Icon name="InfoCircle" color="var(--xops-text-secondary)" className={styles.infoIcon} />
                </span>
                <span className={styles.panelValueGroup}>
                  <span className={styles.panelValue}>{formatCurrency(costPerActiveMonthly)}</span>
                  <span className={styles.panelUnit}>/month</span>
                </span>
              </div>
            </div>

            <div className={styles.breakdownGroup}>
              <Legend
                items={[
                  {
                    label: "Inactive",
                    value: formatCount(row.inactive),
                    meta: ofPurchased(row.inactive),
                    color: "var(--xops-status-warning-solid)",
                    tooltip: inactiveTooltip,
                  },
                  {
                    label: "Unassigned",
                    value: formatCount(row.unassigned),
                    meta: ofPurchased(row.unassigned),
                    color: "var(--xops-grey-500)",
                    tooltip: unassignedTooltip,
                  },
                ]}
              />
              <div className={styles.costTile} data-hotspot="cost-impact">
                <span className={styles.costLabelGroup}>
                  <span className={styles.panelLabel}>Underutilized License Cost</span>
                  <Icon name="InfoCircle" color="var(--xops-text-secondary)" className={styles.infoIcon} />
                </span>
                <span className={styles.panelValueGroup}>
                  <span className={styles.panelValue}>{formatCurrency(row.opportunity)}</span>
                  <span className={styles.panelUnit}>/year</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailContainer} data-hotspot="lifecycle-timeline">
          <div className={styles.tabStripSticky} style={{ top: headerHeight }}>
            <FilterTabs
              variant="underline"
              options={detailTabs}
              value={tab}
              onChange={setTab}
              ariaLabel="Profile detail"
            />
          </div>
          {tab === "lifecycle" && <LifecycleTimeline events={lifecycleEvents} />}
          {tab !== "lifecycle" && (
            <div className={styles.tabPlaceholder}>Not built yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SoftwareProfileLegacy;
