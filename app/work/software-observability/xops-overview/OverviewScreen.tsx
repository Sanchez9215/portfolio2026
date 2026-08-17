"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar, { SoftwareSubKey } from "../../../../design-systems/xops/components/Sidebar";
import GlobalHeader from "../../../../design-systems/xops/components/GlobalHeader";
import PageHeader from "../../../../design-systems/xops/components/PageHeader";
import {
  Grid,
  GridItem,
} from "../../../../design-systems/xops/components/Grid";
import { Card } from "../../../../design-systems/xops/components/Card";
import { Stat } from "../../../../design-systems/xops/components/Stat";
import { Legend } from "../../../../design-systems/xops/components/Legend";
import { DonutChart } from "../../../../design-systems/xops/components/DonutChart";
import {
  Table,
  Column,
} from "../../../../design-systems/xops/components/Table";
import { LogoTile } from "../../../../design-systems/xops/components/LogoTile";
import { Tag, TagStatus } from "../../../../design-systems/xops/components/Tag";
import { TooltipProps } from "../../../../design-systems/xops/components/Tooltip";
import {
  FilterTabs,
  FilterTabOption,
} from "../../../../design-systems/xops/components/FilterTabs";
import { getDataset } from "../../../../design-systems/xops/data/generate";
import { formatCount, formatCurrency, formatPercent, formatCountWithPercent } from "../../../../design-systems/xops/lib/format";
import {
  ProductSummary,
  OpenSourceSummary,
  EvaluationSummary,
  orgTotals,
  totalAnnualSpend,
  licenseModelProducts,
  openSourceProducts,
  evaluationProducts,
  lifecycleProducts,
} from "../../../../design-systems/xops/data/metrics";

type NonCompliantRow = {
  id: string;
  software: string;
  logo: string;
  instances: number;
  type: string;
};

// Decorative only — security/compliance data is deliberately out of the source-tagged model
// (DECISIONS 033) and stays hand-authored pending its removal from the case study.
const nonCompliantRows: NonCompliantRow[] = [
  {
    id: "1",
    software: "Adobe CC",
    logo: "/xops/publisher-logos/adobe-inc.jpg",
    instances: 4820,
    type: "Over-Assigned",
  },
  {
    id: "2",
    software: "Visio Pro",
    logo: "/xops/publisher-logos/microsoft-corporation.jpg",
    instances: 3640,
    type: "Unauthorized Installations",
  },
  {
    id: "3",
    software: "Zoom Pro",
    logo: "/xops/publisher-logos/zoom-video-communications-inc.jpg",
    instances: 3110,
    type: "Outdated Version",
  },
];

const makeNonCompliantColumns = (
  showLogos: boolean,
): Column<NonCompliantRow>[] => [
  {
    key: "software",
    label: "Software",
    width: "flex",
    render: (row) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--xops-spacing-8)",
        }}
      >
        {showLogos && (
          <LogoTile src={row.logo} alt={row.software} size="medium" />
        )}
        <span>{row.software}</span>
      </div>
    ),
  },
  { key: "instances", label: "Instances", width: 70, align: "right" },
  { key: "type", label: "Type", width: "flex" },
];

// Active Licenses ÷ Assigned Licenses, per the audited Utilization tooltip (Figma 352:28400):
// Critical ≤74%, Underutilized 75–84%, Healthy ≥85%.
function utilizationStatus(percent: number): TagStatus {
  if (percent >= 85) return "success";
  if (percent >= 75) return "warning";
  return "danger";
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

const unassignedTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Unassigned",
  description:
    "Purchased license seats remaining in the inventory pool that are available to be distributed to users.",
};

const assignedTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Assigned",
  description:
    "Purchased licenses designated to a specific employee, reserving the seat for their use.",
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

const opportunityTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Opportunity",
  description:
    "The dollar value of inactive and unassigned licenses, reflecting potential savings through reclamation and inventory optimization.",
};

const inEvaluationTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "In Evaluation",
  description:
    "Software that is being actively evaluated, requested, and purchased as a net new addition to the organization's portfolio, but has not yet been finalized or delivered.",
};

const rolloutTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Rollout",
  description:
    "The period from 0 to 6 months post-purchase when adoption of the software expands across the organization, focusing on increasing usage, training, and user onboarding.",
};

const operationalTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Operational",
  description:
    "Software in regular use organization-wide, from 6 months post-purchase through end-of-life or renewal, focusing on optimization, license management, and measuring business value.",
};

const renewalTooltip: Omit<TooltipProps, "children" | "className"> = {
  title: "Renewal",
  description:
    "Software approaching contract expiration within 180 days, requiring evaluation of value and utilization to inform renewal decisions.",
};

function softwareCell(
  software: string,
  vendorLogo: string | null,
  showLogo: boolean,
) {
  return (
    <div
      title={software}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--xops-spacing-8)",
        minWidth: 0,
      }}
    >
      {showLogo && <LogoTile src={vendorLogo} alt={software} size="medium" />}
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {software}
      </span>
    </div>
  );
}

// Utilization percentage — a status Tag by default, or plain text when the
// consuming variant suppresses tags (the case study's Prototype 02 embed, which
// predates the tag treatment).
function utilizationCell(percent: number, showTag: boolean) {
  if (!showTag) return `${percent}%`;
  return <Tag status={utilizationStatus(percent)}>{percent}%</Tag>;
}

// ---------------------------------------------------------------------------
// Top Spend By License Model — Enterprise Agreements tab
// ---------------------------------------------------------------------------

const makeEnterpriseColumns = (
  showLogos: boolean,
  showTags: boolean,
  showOpportunity: boolean,
): Column<ProductSummary>[] => {
  const columns: Column<ProductSummary>[] = [
    {
      key: "name",
      label: "Software",
      width: "flex",
      sortable: true,
      render: (row) => softwareCell(row.name, row.logo, showLogos),
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
      label: "Purchased Licenses",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => formatCount(row.purchased),
    },
    {
      key: "unassigned",
      label: "Unassigned",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: unassignedTooltip,
      render: (row) => formatCount(row.unassigned),
    },
    {
      key: "inactive",
      label: "Inactive",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: inactiveTooltip,
      render: (row) => formatCount(row.inactive),
    },
    {
      key: "active",
      label: "Active",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: activeTooltip,
      render: (row) => formatCount(row.active),
    },
    {
      key: "utilization",
      label: "Utilization",
      width: "auto",
      sortable: true,
      tooltip: utilizationTooltip,
      render: (row) => utilizationCell(row.utilization, showTags),
    },
    {
      key: "opportunity",
      label: "Opportunity",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: opportunityTooltip,
      render: (row) => formatCurrency(row.opportunity),
    },
  ];
  return columns.filter((column) => showOpportunity || column.key !== "opportunity");
};

// ---------------------------------------------------------------------------
// Top Spend — Open Source tab (Component / Version / Users, no logo per DECISIONS 032)
// ---------------------------------------------------------------------------

const openSourceColumns: Column<OpenSourceSummary>[] = [
  {
    key: "name",
    label: "Component",
    width: "flex",
    sortable: true,
    render: (row) => row.name,
  },
  {
    key: "version",
    label: "Version",
    width: "auto",
    sortable: true,
  },
  {
    key: "users",
    label: "Users",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatCount(row.users),
  },
];

// ---------------------------------------------------------------------------
// Top Spend — Perpetual tab (Acquisition Cost + Annual Maintenance, Assigned column)
// ---------------------------------------------------------------------------

const makePerpetualColumns = (
  showLogos: boolean,
  showTags: boolean,
): Column<ProductSummary>[] => [
  {
    key: "name",
    label: "Software",
    width: "flex",
    sortable: true,
    render: (row) => softwareCell(row.name, row.logo, showLogos),
  },
  {
    key: "acquisitionCost",
    label: "Acquisition Cost",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => (row.acquisitionCost === null ? "—" : formatCurrency(row.acquisitionCost)),
  },
  {
    key: "annualMaintenance",
    label: "Annual Maintenance",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => (row.annualMaintenance === null ? "—" : formatCurrency(row.annualMaintenance)),
  },
  {
    key: "purchased",
    label: "Purchased Licenses",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatCount(row.purchased),
  },
  {
    key: "unassigned",
    label: "Unassigned",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: unassignedTooltip,
    render: (row) => formatCount(row.unassigned),
  },
  {
    key: "assigned",
    label: "Assigned",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: assignedTooltip,
    render: (row) => formatCount(row.assigned),
  },
  {
    key: "inactive",
    label: "Inactive",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: inactiveTooltip,
    render: (row) => formatCount(row.inactive),
  },
  {
    key: "active",
    label: "Active",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: activeTooltip,
    render: (row) => formatCount(row.active),
  },
  {
    key: "utilization",
    label: "Utilization",
    width: "auto",
    sortable: true,
    tooltip: utilizationTooltip,
    render: (row) => utilizationCell(row.utilization, showTags),
  },
];

const licenseModelOptions: FilterTabOption[] = [
  { value: "enterprise-agreements", label: "Enterprise Agreements" },
  { value: "open-source", label: "Open Source" },
  { value: "perpetual", label: "Perpetual" },
  { value: "consumption-based", label: "Consumption-based", disabled: true },
];

// ---------------------------------------------------------------------------
// Lifecycle Stage tables
// ---------------------------------------------------------------------------

const makeInEvaluationColumns = (
  showLogos: boolean,
): Column<EvaluationSummary>[] => [
  {
    key: "name",
    label: "Software",
    width: 240,
    sortable: true,
    render: (row) => softwareCell(row.name, row.logo, showLogos),
  },
  { key: "publisher", label: "Vendor", width: "auto", sortable: true },
  { key: "edition", label: "Version", width: "auto", sortable: true },
  {
    key: "licensesRequested",
    label: "Licenses Requested",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatCount(row.licensesRequested),
  },
  {
    key: "estimatedAnnualCost",
    label: "Estimated Annual Cost",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatCurrency(row.estimatedAnnualCost),
  },
];

const makeRolloutColumns = (
  showLogos: boolean,
  showTags: boolean,
): Column<ProductSummary>[] => [
  {
    key: "name",
    label: "Software",
    width: 240,
    sortable: true,
    render: (row) => softwareCell(row.name, row.logo, showLogos),
  },
  { key: "publisher", label: "Vendor", width: "auto", sortable: true },
  { key: "edition", label: "Version", width: "auto", sortable: true },
  {
    key: "annualCost",
    label: "Total Cost",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatCurrency(row.annualCost),
  },
  {
    key: "purchased",
    label: "Licenses Purchased",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatCount(row.purchased),
  },
  {
    key: "utilization",
    label: "Utilization",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: utilizationTooltip,
    render: (row) => utilizationCell(row.utilization, showTags),
  },
  {
    key: "assigned",
    label: "Assigned",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: assignedTooltip,
    render: (row) => formatCountWithPercent(row.assigned, row.purchased),
  },
  {
    key: "inactive",
    label: "Inactive",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: inactiveTooltip,
    render: (row) => formatCountWithPercent(row.inactive, row.purchased),
  },
  {
    key: "active",
    label: "Active",
    width: "auto",
    align: "right",
    sortable: true,
    tooltip: activeTooltip,
    render: (row) => formatCountWithPercent(row.active, row.purchased),
  },
  {
    key: "monthsSincePurchase",
    label: "Months Since Purchase",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => `${row.monthsSincePurchase}`,
  },
  {
    key: "contractEffectiveDate",
    label: "Purchase Date",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => formatDate(row.contractEffectiveDate),
  },
];

const makeOperationalColumns = (
  showLogos: boolean,
  showTags: boolean,
  showOpportunity: boolean,
): Column<ProductSummary>[] => {
  const columns: Column<ProductSummary>[] = [
    {
      key: "name",
      label: "Software",
      width: 240,
      sortable: true,
      render: (row) => softwareCell(row.name, row.logo, showLogos),
    },
    { key: "publisher", label: "Vendor", width: "auto", sortable: true },
    { key: "edition", label: "Version", width: "auto", sortable: true },
    {
      key: "purchased",
      label: "Licenses Purchased",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => formatCount(row.purchased),
    },
    {
      key: "unassigned",
      label: "Unassigned",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: unassignedTooltip,
      render: (row) => formatCountWithPercent(row.unassigned, row.purchased),
    },
    {
      key: "assigned",
      label: "Assigned",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: assignedTooltip,
      render: (row) => formatCountWithPercent(row.assigned, row.purchased),
    },
    {
      key: "inactive",
      label: "Inactive",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: inactiveTooltip,
      render: (row) => formatCountWithPercent(row.inactive, row.purchased),
    },
    {
      key: "active",
      label: "Active",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: activeTooltip,
      render: (row) => formatCountWithPercent(row.active, row.purchased),
    },
    {
      key: "utilization",
      label: "Utilization",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: utilizationTooltip,
      render: (row) => utilizationCell(row.utilization, showTags),
    },
    {
      key: "opportunity",
      label: "Opportunity",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: opportunityTooltip,
      render: (row) => `${formatCurrency(row.opportunity)}/Year`,
    },
    {
      key: "contractExpirationDate",
      label: "Renewal Date",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => formatDate(row.contractExpirationDate),
    },
  ];
  return columns.filter((column) => showOpportunity || column.key !== "opportunity");
};

const makeRenewalColumns = (
  showLogos: boolean,
  showTags: boolean,
  showOpportunity: boolean,
): Column<ProductSummary>[] => {
  const columns: Column<ProductSummary>[] = [
    {
      key: "name",
      label: "Software",
      width: 240,
      sortable: true,
      render: (row) => softwareCell(row.name, row.logo, showLogos),
    },
    { key: "publisher", label: "Vendor", width: "auto", sortable: true },
    { key: "edition", label: "Version", width: "auto", sortable: true },
    {
      key: "contractExpirationDate",
      label: "Renewal Date",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => formatDate(row.contractExpirationDate),
    },
    {
      key: "renewalDays",
      label: "Days to Renewal",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => `${row.renewalDays} days`,
    },
    {
      key: "purchased",
      label: "Licenses Purchased",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => formatCount(row.purchased),
    },
    {
      // Efficiency Rate = Active ÷ Purchased — overall efficiency, distinct from Utilization (Active ÷ Assigned).
      key: "efficiencyRate",
      label: "Efficiency Rate",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => formatPercent(row.active, row.purchased),
    },
    {
      key: "utilization",
      label: "Utilization",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: utilizationTooltip,
      render: (row) => utilizationCell(row.utilization, showTags),
    },
    {
      key: "opportunity",
      label: "Opportunity",
      width: "auto",
      align: "right",
      sortable: true,
      tooltip: opportunityTooltip,
      render: (row) => `${formatCurrency(row.opportunity)}/Year`,
    },
    {
      key: "noticePeriodDeadline",
      label: "Notice Period Deadline",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => formatDate(row.noticePeriodDeadline),
    },
    {
      key: "autoRenew",
      label: "Auto Renew",
      width: "auto",
      align: "right",
      sortable: true,
    },
    {
      key: "estimatedRenewalValue",
      label: "Estimated Renewal Value",
      width: "auto",
      align: "right",
      sortable: true,
      render: (row) => formatCurrency(row.estimatedRenewalValue),
    },
  ];
  return columns.filter((column) => showOpportunity || column.key !== "opportunity");
};

// Named screen component. `onNavigate` is only supplied when rendered inside the
// case-study hero embed (SoftwareExperienceEmbed) — on its own route it's
// undefined and the Sidebar falls back to real next/link navigation. Kept
// separate from the route default export so Next's PageProps type-gen stays clean.
export function OverviewScreen({
  onNavigate,
  showLogos = true,
  showUtilizationTags = true,
  showScrollFade = true,
  showOpportunity = true,
  forceInactiveTooltip,
  lockTableScroll = false,
  showSecondaryCards = true,
  embedded = false,
}: {
  onNavigate?: (screen: SoftwareSubKey) => void;
  /** True when rendered inside SoftwareExperienceEmbed. Accepted for signature parity
   *  with AllSoftwareScreen's identical prop — Overview already sizes itself with
   *  minHeight in both contexts, so this doesn't change its behavior today. */
  embedded?: boolean;
  /** Suppress publisher logos in software cells (case study Prototype 02 embed). */
  showLogos?: boolean;
  /** Render utilization as plain-text % instead of a status Tag (Prototype 02 embed). */
  showUtilizationTags?: boolean;
  /** Table overflow scroll-fade gradient. Off in the Prototype 02 embed to match the
   *  legacy Overview — a bordered container with columns hard cut-off, no overlay. */
  showScrollFade?: boolean;
  /** Include the Opportunity column on the Enterprise, Operational, and Renewal tables. */
  showOpportunity?: boolean;
  /** When defined, the License Utilization legend gains an Inactive info tooltip;
   *  `true` forces it open (the inactivity-threshold hotspot). Undefined on the
   *  standalone route, leaving the legend untouched. */
  forceInactiveTooltip?: boolean;
  /** Case study only: blocks user-driven scroll (vertical + horizontal) on every
   *  table in this screen — for a hotspot embed whose tables must only move via the
   *  scripted scroll sequence, never direct user input. Off on the standalone route
   *  and other embeds. */
  lockTableScroll?: boolean;
  /** Hide the License Utilization, Top Non-Compliant Software, and Security
   *  Compliance cards below the Top Spend table (case study's cards-hidden
   *  Overview embed). On everywhere else. */
  showSecondaryCards?: boolean;
}) {
  const ds = useMemo(() => getDataset(), []);

  const enterpriseColumns = useMemo(
    () => makeEnterpriseColumns(showLogos, showUtilizationTags, showOpportunity),
    [showLogos, showUtilizationTags, showOpportunity],
  );
  const perpetualColumns = useMemo(
    () => makePerpetualColumns(showLogos, showUtilizationTags),
    [showLogos, showUtilizationTags],
  );
  const inEvaluationColumns = useMemo(
    () => makeInEvaluationColumns(showLogos),
    [showLogos],
  );
  const rolloutColumns = useMemo(
    () => makeRolloutColumns(showLogos, showUtilizationTags),
    [showLogos, showUtilizationTags],
  );
  const operationalColumns = useMemo(
    () => makeOperationalColumns(showLogos, showUtilizationTags, showOpportunity),
    [showLogos, showUtilizationTags, showOpportunity],
  );
  const renewalColumns = useMemo(
    () => makeRenewalColumns(showLogos, showUtilizationTags, showOpportunity),
    [showLogos, showUtilizationTags, showOpportunity],
  );
  const nonCompliantColumns = useMemo(
    () => makeNonCompliantColumns(showLogos),
    [showLogos],
  );

  const enterpriseRows = useMemo(
    () => licenseModelProducts(ds, "enterprise").slice(0, 10),
    [ds],
  );
  const perpetualRows = useMemo(
    () => licenseModelProducts(ds, "perpetual").slice(0, 10),
    [ds],
  );
  const openSourceRows = useMemo(() => openSourceProducts(ds), [ds]);

  const evaluationRows = useMemo(() => evaluationProducts(ds), [ds]);
  const rolloutRows = useMemo(() => lifecycleProducts(ds, "rollout"), [ds]);
  const operationalRows = useMemo(() => lifecycleProducts(ds, "operational"), [ds]);
  const renewalRows = useMemo(() => lifecycleProducts(ds, "renewal"), [ds]);

  const totals = useMemo(() => orgTotals(ds), [ds]);
  const annualSpend = useMemo(() => totalAnnualSpend(ds), [ds]);

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

  const lifecycleStageOptions: FilterTabOption[] = [
    {
      value: "in-evaluation",
      label: "In Evaluation",
      stat: formatCount(evaluationRows.length),
      tooltip: inEvaluationTooltip,
    },
    {
      value: "rollout",
      label: "Rollout",
      stat: formatCount(rolloutRows.length),
      tooltip: rolloutTooltip,
    },
    {
      value: "operational",
      label: "Operational",
      stat: formatCount(operationalRows.length),
      tooltip: operationalTooltip,
    },
    {
      value: "renewal",
      label: "Renewal",
      stat: formatCount(renewalRows.length),
      tooltip: renewalTooltip,
    },
  ];

  const [licenseModelTab, setLicenseModelTab] = useState(
    "enterprise-agreements",
  );
  const [licenseModelSortKey, setLicenseModelSortKey] = useState<
    string | undefined
  >(undefined);
  const [licenseModelSortDirection, setLicenseModelSortDirection] = useState<
    "asc" | "desc"
  >("asc");

  const handleLicenseModelSortChange = (key: string) => {
    if (key === licenseModelSortKey) {
      setLicenseModelSortDirection(
        licenseModelSortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setLicenseModelSortKey(key);
      setLicenseModelSortDirection("asc");
    }
  };

  const cardRowRef = useRef<HTMLDivElement>(null);
  const [cardRowHeight, setCardRowHeight] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    const el = cardRowRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setCardRowHeight(entries[0].contentRect.height);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const [lifecycleStage, setLifecycleStage] = useState("in-evaluation");
  const [lifecycleSortKey, setLifecycleSortKey] = useState<string | undefined>(
    undefined,
  );
  const [lifecycleSortDirection, setLifecycleSortDirection] = useState<
    "asc" | "desc"
  >("asc");

  const handleLifecycleSortChange = (key: string) => {
    if (key === lifecycleSortKey) {
      setLifecycleSortDirection(
        lifecycleSortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setLifecycleSortKey(key);
      setLifecycleSortDirection("asc");
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
      <Sidebar activeSoftwareItem="overview" onNavigate={onNavigate} />
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
          <div data-hotspot="geographic-filtering">
            <PageHeader
              title="Overview"
              metaIcon="cloud_download"
              metaText="Data last updated Jan 14, 2025 at 02:06PM"
            />
          </div>
          <Grid>
            <GridItem colSpan={12}>
              <div
                data-hotspot="licensing-model-breakdown"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--xops-spacing-16)",
                  backgroundColor: "var(--xops-white)",
                  border:
                    "var(--xops-border-width-1) solid var(--xops-border-divider)",
                  borderRadius: "var(--xops-radius-12)",
                  padding: "var(--xops-spacing-16)",
                  height: cardRowHeight ? `${cardRowHeight}px` : undefined,
                  minHeight: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "var(--xops-spacing-16)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--xops-spacing-16)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--xops-font-family)",
                        fontWeight: "var(--xops-font-weight-medium)",
                        fontSize:
                          "var(--xops-typography-subheading-16-font-size)",
                        lineHeight:
                          "var(--xops-typography-subheading-16-line-height)",
                        color: "var(--xops-text-primary)",
                      }}
                    >
                      Top Spend By License Model
                    </p>
                    <FilterTabs
                      options={licenseModelOptions}
                      value={licenseModelTab}
                      onChange={setLicenseModelTab}
                      ariaLabel="Filter by license model"
                    />
                  </div>
                  <Stat
                    label="Total Annual Spend"
                    value={formatCurrency(annualSpend, { compact: true })}
                    style={{ flex: "0 0 auto" }}
                  />
                </div>
                {licenseModelTab === "open-source" ? (
                  <Table
                    chrome={false}
                    scrollFade={showScrollFade}
                    disableVerticalScroll={lockTableScroll}
                    disableHorizontalScroll={lockTableScroll}
                    columns={openSourceColumns}
                    data={openSourceRows}
                    rowKey={(row) => row.sku}
                    sortKey={licenseModelSortKey}
                    sortDirection={licenseModelSortDirection}
                    onSortChange={handleLicenseModelSortChange}
                  />
                ) : licenseModelTab === "perpetual" ? (
                  <Table
                    chrome={false}
                    scrollFade={showScrollFade}
                    disableVerticalScroll={lockTableScroll}
                    disableHorizontalScroll={lockTableScroll}
                    columns={perpetualColumns}
                    data={perpetualRows}
                    rowKey={(row) => row.sku}
                    sortKey={licenseModelSortKey}
                    sortDirection={licenseModelSortDirection}
                    onSortChange={handleLicenseModelSortChange}
                  />
                ) : (
                  <Table
                    chrome={false}
                    scrollFade={showScrollFade}
                    disableVerticalScroll={lockTableScroll}
                    disableHorizontalScroll={lockTableScroll}
                    columns={enterpriseColumns}
                    data={enterpriseRows}
                    rowKey={(row) => row.sku}
                    sortKey={licenseModelSortKey}
                    sortDirection={licenseModelSortDirection}
                    onSortChange={handleLicenseModelSortChange}
                  />
                )}
              </div>
            </GridItem>
            {showSecondaryCards && (
            <>
            <GridItem
              colSpan={4}
              ref={cardRowRef}
              data-hotspot="license-utilization-card"
            >
              <Card title="License Utilization">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--xops-spacing-24)",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: "var(--xops-spacing-8)" }}
                  >
                    <Stat label="Total Owned" value={utilizationCard.totalOwned} meta="100%" />
                    <Stat
                      label="Assigned"
                      value={utilizationCard.assigned}
                      meta={utilizationCard.assignedPct}
                      tooltip={assignedTooltip}
                    />
                  </div>
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
                          color: "var(--xops-status-warning-solid)",
                          tooltip: {
                            category: "Inactive",
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
                      {
                        label: "Active",
                        value: utilizationCard.active,
                        meta: utilizationCard.activePct,
                        color: "var(--xops-status-success-solid)",
                      },
                      {
                        label: "Inactive",
                        value: utilizationCard.inactive,
                        meta: utilizationCard.inactivePct,
                        color: "var(--xops-status-warning-solid)",
                        // Case study only: the inactivity-threshold hotspot exposes the
                        // Inactive definition (the 90-day threshold copy). Undefined on the
                        // standalone route, so the legend stays icon-free there. Shares
                        // "inactivity-threshold-tooltip" with the Unassigned row below and
                        // the tooltip panel itself so the hotspot's cutout can hug the panel's
                        // top edge while still reaching down to the card's bottom.
                        tooltip:
                          forceInactiveTooltip !== undefined
                            ? {
                                ...inactiveTooltip,
                                forceOpen: forceInactiveTooltip,
                                hotspotId: "inactivity-threshold-tooltip",
                              }
                            : undefined,
                        hotspotId:
                          forceInactiveTooltip !== undefined
                            ? "inactivity-threshold-tooltip"
                            : undefined,
                      },
                      {
                        label: "Unassigned",
                        value: utilizationCard.unassigned,
                        meta: utilizationCard.unassignedPct,
                        color: "var(--xops-grey-300)",
                        hotspotId:
                          forceInactiveTooltip !== undefined
                            ? "inactivity-threshold-tooltip"
                            : undefined,
                      },
                    ]}
                  />
                </div>
              </Card>
            </GridItem>
            <GridItem colSpan={4}>
              <Card title="Top Non-Compliant Software">
                <Table
                  chrome={false}
                  scrollFade={showScrollFade}
                  disableVerticalScroll={lockTableScroll}
                  disableHorizontalScroll={lockTableScroll}
                  columns={nonCompliantColumns}
                  data={nonCompliantRows}
                  rowKey={(row) => row.id}
                />
              </Card>
            </GridItem>
            <GridItem colSpan={4} data-hotspot="compliance-granularity">
              <Card title="Security Compliance">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--xops-spacing-24)",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: "var(--xops-spacing-8)" }}
                  >
                    <Stat label="Total Instances" value="248,000" meta="100%" />
                    <Stat label="Non-Compliant" value="38,200" meta="15.4%" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <DonutChart
                      segments={[
                        {
                          value: 209800,
                          color: "var(--xops-status-success-solid)",
                          tooltip: {
                            category: "Compliant",
                            rows: [
                              { label: "Instances", value: "209,800" },
                              { label: "% of Total", value: "84.6%" },
                            ],
                          },
                        },
                        {
                          value: 18400,
                          color: "var(--xops-status-danger-solid)",
                          tooltip: {
                            category: "Patch Required",
                            rows: [
                              { label: "Instances", value: "18,400" },
                              { label: "% of Total", value: "7.4%" },
                            ],
                          },
                        },
                        {
                          value: 11900,
                          color: "var(--xops-grey-300)",
                          tooltip: {
                            category: "Outdated Version",
                            rows: [
                              { label: "Instances", value: "11,900" },
                              { label: "% of Total", value: "4.8%" },
                            ],
                          },
                        },
                        {
                          value: 5200,
                          color: "var(--xops-chart-7)",
                          tooltip: {
                            category: "Support Ended",
                            rows: [
                              { label: "Instances", value: "5,200" },
                              { label: "% of Total", value: "2.1%" },
                            ],
                          },
                        },
                        {
                          value: 2700,
                          color: "var(--xops-status-warning-solid)",
                          tooltip: {
                            category: "Policy Violation",
                            rows: [
                              { label: "Instances", value: "2,700" },
                              { label: "% of Total", value: "1.1%" },
                            ],
                          },
                        },
                      ]}
                    />
                  </div>
                  <Legend
                    items={[
                      {
                        label: "Compliant",
                        value: "209,800",
                        meta: "84.6%",
                        color: "var(--xops-status-success-solid)",
                      },
                      {
                        label: "Patch Required",
                        value: "18,400",
                        meta: "7.4%",
                        color: "var(--xops-status-danger-solid)",
                      },
                      {
                        label: "Outdated Version",
                        value: "11,900",
                        meta: "4.8%",
                        color: "var(--xops-grey-300)",
                      },
                      {
                        label: "Support Ended",
                        value: "5,200",
                        meta: "2.1%",
                        color: "var(--xops-chart-7)",
                      },
                      {
                        label: "Policy Violation",
                        value: "2,700",
                        meta: "1.1%",
                        color: "var(--xops-status-warning-solid)",
                      },
                    ]}
                  />
                </div>
              </Card>
            </GridItem>
            </>
            )}
            <GridItem colSpan={12}>
              <div
                data-hotspot="stage-level-alerting"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--xops-spacing-24)",
                  backgroundColor: "var(--xops-white)",
                  border:
                    "var(--xops-border-width-1) solid var(--xops-border-divider)",
                  borderRadius: "var(--xops-radius-12)",
                  padding: "var(--xops-spacing-16)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--xops-font-family)",
                    fontWeight: "var(--xops-font-weight-medium)",
                    fontSize: "var(--xops-typography-subheading-16-font-size)",
                    lineHeight:
                      "var(--xops-typography-subheading-16-line-height)",
                    color: "var(--xops-text-primary)",
                  }}
                >
                  Software By Lifecycle Stage
                </p>
                <div data-hotspot="lifecycle-stages">
                  <FilterTabs
                    variant="large"
                    options={lifecycleStageOptions}
                    value={lifecycleStage}
                    onChange={(value) => {
                      setLifecycleStage(value);
                      setLifecycleSortKey(undefined);
                      setLifecycleSortDirection("asc");
                    }}
                    ariaLabel="Filter by lifecycle stage"
                  />
                </div>
                {lifecycleStage === "in-evaluation" && (
                  <Table
                    chrome={false}
                    scrollFade={showScrollFade}
                    disableVerticalScroll={lockTableScroll}
                    disableHorizontalScroll={lockTableScroll}
                    columns={inEvaluationColumns}
                    data={evaluationRows}
                    rowKey={(row) => row.sku}
                    sortKey={lifecycleSortKey}
                    sortDirection={lifecycleSortDirection}
                    onSortChange={handleLifecycleSortChange}
                  />
                )}
                {lifecycleStage === "rollout" && (
                  <Table
                    chrome={false}
                    scrollFade={showScrollFade}
                    disableVerticalScroll={lockTableScroll}
                    disableHorizontalScroll={lockTableScroll}
                    columns={rolloutColumns}
                    data={rolloutRows}
                    rowKey={(row) => row.sku}
                    sortKey={lifecycleSortKey}
                    sortDirection={lifecycleSortDirection}
                    onSortChange={handleLifecycleSortChange}
                  />
                )}
                {lifecycleStage === "operational" && (
                  <Table
                    chrome={false}
                    scrollFade={showScrollFade}
                    disableVerticalScroll={lockTableScroll}
                    disableHorizontalScroll={lockTableScroll}
                    columns={operationalColumns}
                    data={operationalRows}
                    rowKey={(row) => row.sku}
                    sortKey={lifecycleSortKey}
                    sortDirection={lifecycleSortDirection}
                    onSortChange={handleLifecycleSortChange}
                  />
                )}
                {lifecycleStage === "renewal" && (
                  <Table
                    chrome={false}
                    scrollFade={showScrollFade}
                    disableVerticalScroll={lockTableScroll}
                    disableHorizontalScroll={lockTableScroll}
                    columns={renewalColumns}
                    data={renewalRows}
                    rowKey={(row) => row.sku}
                    sortKey={lifecycleSortKey}
                    sortDirection={lifecycleSortDirection}
                    onSortChange={handleLifecycleSortChange}
                  />
                )}
              </div>
            </GridItem>
          </Grid>
        </main>
      </div>
    </div>
  );
}
