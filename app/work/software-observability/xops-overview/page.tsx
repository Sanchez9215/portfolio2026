"use client";

import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../../../design-systems/xops/components/Sidebar";
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
import {
  FilterTabs,
  FilterTabOption,
} from "../../../../design-systems/xops/components/FilterTabs";

type NonCompliantRow = {
  id: string;
  software: string;
  logo: string;
  instances: number;
  type: string;
};

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

const nonCompliantColumns: Column<NonCompliantRow>[] = [
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
        <LogoTile src={row.logo} alt={row.software} size="medium" />
        <span>{row.software}</span>
      </div>
    ),
  },
  { key: "instances", label: "Instances", width: 70, align: "right" },
  { key: "type", label: "Type", width: "flex" },
];

type LicenseModelRow = {
  id: string;
  software: string;
  logo: string;
  totalSpend: string;
  totalPurchasedLicenses: string;
  unassigned: string;
  inactive: string;
  active: string;
  utilization: number;
};

// Active Licenses ÷ Assigned Licenses, per the audited Utilization tooltip (Figma 352:28400):
// Critical ≤74%, Underutilized 75–84%, Healthy ≥85%.
function utilizationStatus(percent: number): TagStatus {
  if (percent >= 85) return "success";
  if (percent >= 75) return "warning";
  return "danger";
}

const licenseModelRows: LicenseModelRow[] = [
  {
    id: "1",
    software: "Microsoft 365 E3",
    logo: "/xops/publisher-logos/microsoft-corporation.jpg",
    totalSpend: "$18.6M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 71,
  },
  {
    id: "2",
    software: "SAP Enterprise",
    logo: "/xops/publisher-logos/sap-ag.jpg",
    totalSpend: "$14.2M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 80,
  },
  {
    id: "3",
    software: "Oracle ULA",
    logo: "/xops/publisher-logos/oracle-corporation.jpg",
    totalSpend: "$11.8M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 55,
  },
  {
    id: "4",
    software: "Salesforce Sales Cloud",
    logo: "/xops/publisher-logos/salesforce-inc.jpg",
    totalSpend: "$9.7M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 70,
  },
  {
    id: "5",
    software: "ServiceNow Enterprise",
    logo: "/xops/publisher-logos/servicenow-inc.jpg",
    totalSpend: "$8.3M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 38,
  },
  {
    id: "6",
    software: "VMware ELA",
    logo: "/xops/publisher-logos/vmware-inc.jpg",
    totalSpend: "$7.4M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 85,
  },
  {
    id: "7",
    software: "Workday HCM",
    logo: "/xops/publisher-logos/workday-inc.jpg",
    totalSpend: "$6.1M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 82,
  },
  {
    id: "8",
    software: "Adobe ETLA",
    logo: "/xops/publisher-logos/adobe-inc.jpg",
    totalSpend: "$5.2M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 67,
  },
  {
    id: "9",
    software: "Cisco EA",
    logo: "/xops/publisher-logos/cisco-systems-inc.jpg",
    totalSpend: "$4.3M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 62,
  },
  {
    id: "10",
    software: "Atlassian Cloud",
    logo: "/xops/publisher-logos/atlassian-corporation.jpg",
    totalSpend: "$2.8M",
    totalPurchasedLicenses: "-",
    unassigned: "-",
    inactive: "-",
    active: "-",
    utilization: 48,
  },
];

const licenseModelColumns: Column<LicenseModelRow>[] = [
  {
    key: "software",
    label: "Software",
    width: "flex",
    sortable: true,
    render: (row) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--xops-spacing-8)",
        }}
      >
        <LogoTile src={row.logo} alt={row.software} size="medium" />
        <span>{row.software}</span>
      </div>
    ),
  },
  {
    key: "totalSpend",
    label: "Total Spend",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "totalPurchasedLicenses",
    label: "Purchased Licenses",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "unassigned",
    label: "Unassigned",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "inactive",
    label: "Inactive",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "active",
    label: "Active",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "utilization",
    label: "Utilization",
    width: "auto",
    sortable: true,
    render: (row) => (
      <Tag status={utilizationStatus(row.utilization)}>{row.utilization}%</Tag>
    ),
  },
];

const licenseModelOptions: FilterTabOption[] = [
  { value: "enterprise-agreements", label: "Enterprise Agreements" },
  { value: "open-source", label: "Open Source" },
  { value: "perpetual", label: "Perpetual" },
  { value: "consumption-based", label: "Consumption-based", disabled: true },
];

const lifecycleStageOptions: FilterTabOption[] = [
  { value: "in-evaluation", label: "In Evaluation", stat: "120" },
  { value: "rollout", label: "Rollout", stat: "75" },
  { value: "operational", label: "Operational", stat: "1,200" },
  { value: "renewal", label: "Renewal", stat: "300" },
];

function softwareCell(software: string, vendorLogo: string) {
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
      <LogoTile src={vendorLogo} alt={software} size="medium" />
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

type InEvaluationRow = {
  id: string;
  software: string;
  vendorLogo: string;
  vendor: string;
  version: string;
  licensesRequested: string;
  estimatedAnnualCost: string;
};

const inEvaluationRows: InEvaluationRow[] = [
  {
    id: "1",
    software: "Figma Organization",
    vendorLogo: "/xops/publisher-logos/figma.jpg",
    vendor: "Figma",
    version: "Organization Plan",
    licensesRequested: "450",
    estimatedAnnualCost: "$324,000",
  },
  {
    id: "2",
    software: "Okta Workforce Identity",
    vendorLogo: "/xops/publisher-logos/okta-inc.jpg",
    vendor: "Okta",
    version: "Enterprise",
    licensesRequested: "3,200",
    estimatedAnnualCost: "$288,000",
  },
  {
    id: "3",
    software: "HashiCorp Vault",
    vendorLogo: "/xops/publisher-logos/hashicorp.jpg",
    vendor: "HashiCorp",
    version: "Enterprise",
    licensesRequested: "180",
    estimatedAnnualCost: "$215,000",
  },
  {
    id: "4",
    software: "GitHub Enterprise Cloud",
    vendorLogo: "/xops/publisher-logos/github-inc.jpg",
    vendor: "GitHub",
    version: "Enterprise Cloud",
    licensesRequested: "2,600",
    estimatedAnnualCost: "$156,000",
  },
  {
    id: "5",
    software: "Docusign eSignature",
    vendorLogo: "/xops/publisher-logos/docusign-inc.jpg",
    vendor: "DocuSign",
    version: "Business Pro",
    licensesRequested: "900",
    estimatedAnnualCost: "$97,200",
  },
  {
    id: "6",
    software: "Zendesk Suite",
    vendorLogo: "/xops/publisher-logos/zendesk.jpg",
    vendor: "Zendesk",
    version: "Enterprise Plus",
    licensesRequested: "310",
    estimatedAnnualCost: "$84,500",
  },
];

const inEvaluationColumns: Column<InEvaluationRow>[] = [
  {
    key: "software",
    label: "Software",
    width: 240,
    sortable: true,
    render: (row) => softwareCell(row.software, row.vendorLogo),
  },
  { key: "vendor", label: "Vendor", width: "auto", sortable: true },
  { key: "version", label: "Version", width: "auto", sortable: true },
  {
    key: "licensesRequested",
    label: "Licenses Requested",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "estimatedAnnualCost",
    label: "Estimated Annual Cost",
    width: "auto",
    align: "right",
    sortable: true,
  },
];

type RolloutRow = {
  id: string;
  software: string;
  vendorLogo: string;
  vendor: string;
  version: string;
  totalCost: string;
  licensesPurchased: string;
  utilization: number;
  assigned: string;
  inactive: string;
  active: string;
  monthsSincePurchase: string;
  purchaseDate: string;
};

const rolloutRows: RolloutRow[] = [
  {
    id: "1",
    software: "Slack Enterprise Grid",
    vendorLogo: "/xops/publisher-logos/slack-technologies.jpg",
    vendor: "Slack",
    version: "Enterprise Grid",
    totalCost: "$420,000",
    licensesPurchased: "5,200",
    utilization: 78,
    assigned: "4,056 (78%)",
    inactive: "1,014 (19%)",
    active: "3,042 (59%)",
    monthsSincePurchase: "2.4",
    purchaseDate: "May 12, 2025",
  },
  {
    id: "2",
    software: "Splunk Enterprise Security",
    vendorLogo: "/xops/publisher-logos/splunk-inc.jpg",
    vendor: "Splunk",
    version: "Enterprise Security 7.3",
    totalCost: "$365,000",
    licensesPurchased: "180",
    utilization: 82,
    assigned: "148 (82%)",
    inactive: "26 (14%)",
    active: "122 (68%)",
    monthsSincePurchase: "1.8",
    purchaseDate: "Jun 03, 2025",
  },
  {
    id: "3",
    software: "Tableau Creator",
    vendorLogo: "/xops/publisher-logos/tableau-software.jpg",
    vendor: "Tableau",
    version: "Creator 2025.1",
    totalCost: "$298,000",
    licensesPurchased: "620",
    utilization: 65,
    assigned: "403 (65%)",
    inactive: "121 (20%)",
    active: "282 (45%)",
    monthsSincePurchase: "3.1",
    purchaseDate: "Apr 22, 2025",
  },
  {
    id: "4",
    software: "CrowdStrike Falcon",
    vendorLogo: "/xops/publisher-logos/crowdstrike-inc.jpg",
    vendor: "CrowdStrike",
    version: "Falcon Complete",
    totalCost: "$540,000",
    licensesPurchased: "8,400",
    utilization: 91,
    assigned: "7,644 (91%)",
    inactive: "756 (9%)",
    active: "6,888 (82%)",
    monthsSincePurchase: "4.2",
    purchaseDate: "Mar 08, 2025",
  },
  {
    id: "5",
    software: "Zscaler Internet Access",
    vendorLogo: "/xops/publisher-logos/zscaler-inc.jpg",
    vendor: "Zscaler",
    version: "Business",
    totalCost: "$275,000",
    licensesPurchased: "3,600",
    utilization: 58,
    assigned: "2,088 (58%)",
    inactive: "864 (24%)",
    active: "1,224 (34%)",
    monthsSincePurchase: "2.9",
    purchaseDate: "May 30, 2025",
  },
  {
    id: "6",
    software: "Dropbox Business",
    vendorLogo: "/xops/publisher-logos/dropbox.jpg",
    vendor: "Dropbox",
    version: "Advanced",
    totalCost: "$112,000",
    licensesPurchased: "1,450",
    utilization: 73,
    assigned: "1,059 (73%)",
    inactive: "232 (16%)",
    active: "827 (57%)",
    monthsSincePurchase: "1.2",
    purchaseDate: "Jun 18, 2025",
  },
];

const rolloutColumns: Column<RolloutRow>[] = [
  {
    key: "software",
    label: "Software",
    width: 240,
    sortable: true,
    render: (row) => softwareCell(row.software, row.vendorLogo),
  },
  { key: "vendor", label: "Vendor", width: "auto", sortable: true },
  { key: "version", label: "Version", width: "auto", sortable: true },
  {
    key: "totalCost",
    label: "Total Cost",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "licensesPurchased",
    label: "Licenses Purchased",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "utilization",
    label: "Utilization Rate",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => (
      <Tag status={utilizationStatus(row.utilization)}>{row.utilization}%</Tag>
    ),
  },
  {
    key: "assigned",
    label: "Assigned",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "inactive",
    label: "Inactive",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "active",
    label: "Active",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "monthsSincePurchase",
    label: "Months Since Purchase",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "purchaseDate",
    label: "Purchase Date",
    width: "auto",
    align: "right",
    sortable: true,
  },
];

type OperationalRow = {
  id: string;
  software: string;
  vendorLogo: string;
  vendor: string;
  version: string;
  licensesPurchased: string;
  unassigned: string;
  assigned: string;
  inactive: string;
  active: string;
  utilization: number;
  unusedLicenseWaste: string;
  renewalDate: string;
};

const operationalRows: OperationalRow[] = [
  {
    id: "1",
    software: "Autodesk AEC Collection",
    vendorLogo: "/xops/publisher-logos/autodesk-inc.jpg",
    vendor: "Autodesk",
    version: "2025",
    licensesPurchased: "1,100",
    unassigned: "132 (12%)",
    assigned: "968 (88%)",
    inactive: "290 (26%)",
    active: "678 (62%)",
    utilization: 70,
    unusedLicenseWaste: "$198,000/Year",
    renewalDate: "Feb 10, 2026",
  },
  {
    id: "2",
    software: "Unity Pro",
    vendorLogo: "/xops/publisher-logos/unity-technologies.jpg",
    vendor: "Unity Technologies",
    version: "Pro 2024",
    licensesPurchased: "340",
    unassigned: "34 (10%)",
    assigned: "306 (90%)",
    inactive: "122 (36%)",
    active: "184 (54%)",
    utilization: 60,
    unusedLicenseWaste: "$146,000/Year",
    renewalDate: "Jan 22, 2026",
  },
  {
    id: "3",
    software: "Citrix Virtual Apps",
    vendorLogo: "/xops/publisher-logos/citrix-systems-inc.jpg",
    vendor: "Citrix",
    version: "Enterprise",
    licensesPurchased: "2,800",
    unassigned: "252 (9%)",
    assigned: "2,548 (91%)",
    inactive: "364 (13%)",
    active: "2,184 (78%)",
    utilization: 86,
    unusedLicenseWaste: "$84,000/Year",
    renewalDate: "Mar 15, 2026",
  },
  {
    id: "4",
    software: "IBM Maximo",
    vendorLogo: "/xops/publisher-logos/ibm.jpg",
    vendor: "IBM",
    version: "Application Suite",
    licensesPurchased: "215",
    unassigned: "22 (10%)",
    assigned: "193 (90%)",
    inactive: "58 (27%)",
    active: "135 (63%)",
    utilization: 70,
    unusedLicenseWaste: "$112,000/Year",
    renewalDate: "Dec 05, 2025",
  },
  {
    id: "5",
    software: "SolarWinds Observability",
    vendorLogo: "/xops/publisher-logos/solarwinds-worldwide-llc.jpg",
    vendor: "SolarWinds",
    version: "SaaS",
    licensesPurchased: "480",
    unassigned: "58 (12%)",
    assigned: "422 (88%)",
    inactive: "76 (16%)",
    active: "346 (72%)",
    utilization: 82,
    unusedLicenseWaste: "$54,000/Year",
    renewalDate: "Apr 28, 2026",
  },
  {
    id: "6",
    software: "Tanium Core Platform",
    vendorLogo: "/xops/publisher-logos/tanium-inc.jpg",
    vendor: "Tanium",
    version: "Core",
    licensesPurchased: "6,200",
    unassigned: "620 (10%)",
    assigned: "5,580 (90%)",
    inactive: "1,674 (27%)",
    active: "3,906 (63%)",
    utilization: 70,
    unusedLicenseWaste: "$267,000/Year",
    renewalDate: "Feb 18, 2026",
  },
];

const operationalColumns: Column<OperationalRow>[] = [
  {
    key: "software",
    label: "Software",
    width: 240,
    sortable: true,
    render: (row) => softwareCell(row.software, row.vendorLogo),
  },
  { key: "vendor", label: "Vendor", width: "auto", sortable: true },
  { key: "version", label: "Version", width: "auto", sortable: true },
  {
    key: "licensesPurchased",
    label: "Licenses Purchased",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "unassigned",
    label: "Unassigned",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "assigned",
    label: "Assigned",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "inactive",
    label: "Inactive",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "active",
    label: "Active",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "utilization",
    label: "Utilization Rate",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => (
      <Tag status={utilizationStatus(row.utilization)}>{row.utilization}%</Tag>
    ),
  },
  {
    key: "unusedLicenseWaste",
    label: "Unused License Waste",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "renewalDate",
    label: "Renewal Date",
    width: "auto",
    align: "right",
    sortable: true,
  },
];

type RenewalRow = {
  id: string;
  software: string;
  vendorLogo: string;
  vendor: string;
  version: string;
  renewalDate: string;
  licensesPurchased: string;
  efficiencyRate: string;
  utilization: number;
  unusedLicenseWaste: string;
  noticePeriodDeadline: string;
  autoRenew: string;
  estimatedRenewalValue: string;
};

const renewalRows: RenewalRow[] = [
  {
    id: "1",
    software: "Broadcom VMware Cloud Foundation",
    vendorLogo: "/xops/publisher-logos/broadcom-corporation.jpg",
    vendor: "Broadcom",
    version: "9.0",
    renewalDate: "Nov 30, 2025",
    licensesPurchased: "1,850",
    efficiencyRate: "68%",
    utilization: 72,
    unusedLicenseWaste: "$310,000/Year",
    noticePeriodDeadline: "Oct 31, 2025",
    autoRenew: "Manual",
    estimatedRenewalValue: "$1,240,000",
  },
  {
    id: "2",
    software: "McAfee Total Protection",
    vendorLogo: "/xops/publisher-logos/mcafee-llc.jpg",
    vendor: "McAfee",
    version: "Enterprise",
    renewalDate: "Dec 15, 2025",
    licensesPurchased: "4,200",
    efficiencyRate: "74%",
    utilization: 65,
    unusedLicenseWaste: "$186,000/Year",
    noticePeriodDeadline: "Nov 15, 2025",
    autoRenew: "Automatic",
    estimatedRenewalValue: "$462,000",
  },
  {
    id: "3",
    software: "NortonLifeLock Enterprise",
    vendorLogo: "/xops/publisher-logos/nortonlifelock.jpg",
    vendor: "NortonLifeLock",
    version: "360 Business",
    renewalDate: "Jan 10, 2026",
    licensesPurchased: "2,600",
    efficiencyRate: "81%",
    utilization: 84,
    unusedLicenseWaste: "$64,000/Year",
    noticePeriodDeadline: "Dec 10, 2025",
    autoRenew: "Automatic",
    estimatedRenewalValue: "$338,000",
  },
  {
    id: "4",
    software: "Red Hat OpenShift",
    vendorLogo: "/xops/publisher-logos/red-hat-inc.jpg",
    vendor: "Red Hat",
    version: "4.16",
    renewalDate: "Nov 05, 2025",
    licensesPurchased: "980",
    efficiencyRate: "58%",
    utilization: 54,
    unusedLicenseWaste: "$225,000/Year",
    noticePeriodDeadline: "Oct 05, 2025",
    autoRenew: "Manual",
    estimatedRenewalValue: "$588,000",
  },
  {
    id: "5",
    software: "Intuit QuickBooks Enterprise",
    vendorLogo: "/xops/publisher-logos/intuit-inc.jpg",
    vendor: "Intuit",
    version: "Enterprise 25",
    renewalDate: "Dec 22, 2025",
    licensesPurchased: "310",
    efficiencyRate: "77%",
    utilization: 79,
    unusedLicenseWaste: "$38,000/Year",
    noticePeriodDeadline: "Nov 22, 2025",
    autoRenew: "Automatic",
    estimatedRenewalValue: "$96,000",
  },
  {
    id: "6",
    software: "Nuance Dragon Medical One",
    vendorLogo: "/xops/publisher-logos/nuance-communications-inc.jpg",
    vendor: "Nuance",
    version: "Medical One",
    renewalDate: "Oct 28, 2025",
    licensesPurchased: "540",
    efficiencyRate: "62%",
    utilization: 60,
    unusedLicenseWaste: "$71,000/Year",
    noticePeriodDeadline: "Sep 28, 2025",
    autoRenew: "Manual",
    estimatedRenewalValue: "$210,000",
  },
];

const renewalColumns: Column<RenewalRow>[] = [
  {
    key: "software",
    label: "Software",
    width: 240,
    sortable: true,
    render: (row) => softwareCell(row.software, row.vendorLogo),
  },
  { key: "vendor", label: "Vendor", width: "auto", sortable: true },
  { key: "version", label: "Version", width: "auto", sortable: true },
  {
    key: "renewalDate",
    label: "Renewal Date",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "daysToRenewal",
    label: "Days to Renewal",
    width: "auto",
    align: "right",
    render: () => "–",
  },
  {
    key: "licensesPurchased",
    label: "Licenses Purchased",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "efficiencyRate",
    label: "Efficiency Rate",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "utilization",
    label: "Utilization Rate",
    width: "auto",
    align: "right",
    sortable: true,
    render: (row) => (
      <Tag status={utilizationStatus(row.utilization)}>{row.utilization}%</Tag>
    ),
  },
  {
    key: "unusedLicenseWaste",
    label: "Unused License Waste",
    width: "auto",
    align: "right",
    sortable: true,
  },
  {
    key: "noticePeriodDeadline",
    label: "Notice Period Deadline",
    width: "auto",
    align: "right",
    sortable: true,
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
  },
];

export default function XopsOverviewPage() {
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
      <Sidebar activeSoftwareItem="overview" />
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
            backgroundColor: "var(--xops-surface-page)",
          }}
        >
          <PageHeader
            title="Overview"
            metaIcon="cloud_download"
            metaText="Data last updated Jan 14, 2025 at 02:06PM"
          />
          <Grid>
            <GridItem colSpan={12}>
              <div
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
                    value="$132.2M"
                    meta="(13%)"
                    style={{ flex: "0 0 auto" }}
                  />
                </div>
                <Table
                  chrome={false}
                  columns={licenseModelColumns}
                  data={licenseModelRows}
                  rowKey={(row) => row.id}
                  sortKey={licenseModelSortKey}
                  sortDirection={licenseModelSortDirection}
                  onSortChange={handleLicenseModelSortChange}
                />
              </div>
            </GridItem>
            <GridItem colSpan={4} ref={cardRowRef}>
              <Card title="License Utilization">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--xops-spacing-16)",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: "var(--xops-spacing-8)" }}
                  >
                    <Stat label="Total Owned" value="412,000" meta="100%" />
                    <Stat label="Assigned" value="357,000" meta="86.7%" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <DonutChart
                      segments={[
                        {
                          value: 289000,
                          color: "var(--xops-status-success-solid)",
                        },
                        {
                          value: 52000,
                          color: "var(--xops-status-warning-solid)",
                        },
                        { value: 71000, color: "var(--xops-grey-300)" },
                      ]}
                    />
                  </div>
                  <Legend
                    items={[
                      {
                        label: "Active",
                        value: "289,000",
                        meta: "70.1%",
                        color: "var(--xops-status-success-solid)",
                      },
                      {
                        label: "Inactive",
                        value: "52,000",
                        meta: "12.6%",
                        color: "var(--xops-status-warning-solid)",
                      },
                      {
                        label: "Unassigned",
                        value: "71,000",
                        meta: "17.2%",
                        color: "var(--xops-grey-300)",
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
                  columns={nonCompliantColumns}
                  data={nonCompliantRows}
                  rowKey={(row) => row.id}
                />
              </Card>
            </GridItem>
            <GridItem colSpan={4}>
              <Card title="Security Compliance">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--xops-spacing-16)",
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
                        },
                        {
                          value: 18400,
                          color: "var(--xops-status-danger-solid)",
                        },
                        { value: 11900, color: "var(--xops-grey-300)" },
                        { value: 5200, color: "var(--xops-chart-7)" },
                        {
                          value: 2700,
                          color: "var(--xops-status-warning-solid)",
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
            <GridItem colSpan={12}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--xops-spacing-16)",
                  backgroundColor: "var(--xops-white)",
                  border:
                    "var(--xops-border-width-1) solid var(--xops-border-divider)",
                  borderRadius: "var(--xops-radius-12)",
                  padding: "var(--xops-spacing-16)",
                }}
              >
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
                {lifecycleStage === "in-evaluation" && (
                  <Table
                    chrome={false}
                    columns={inEvaluationColumns}
                    data={inEvaluationRows}
                    rowKey={(row) => row.id}
                    sortKey={lifecycleSortKey}
                    sortDirection={lifecycleSortDirection}
                    onSortChange={handleLifecycleSortChange}
                  />
                )}
                {lifecycleStage === "rollout" && (
                  <Table
                    chrome={false}
                    columns={rolloutColumns}
                    data={rolloutRows}
                    rowKey={(row) => row.id}
                    sortKey={lifecycleSortKey}
                    sortDirection={lifecycleSortDirection}
                    onSortChange={handleLifecycleSortChange}
                  />
                )}
                {lifecycleStage === "operational" && (
                  <Table
                    chrome={false}
                    columns={operationalColumns}
                    data={operationalRows}
                    rowKey={(row) => row.id}
                    sortKey={lifecycleSortKey}
                    sortDirection={lifecycleSortDirection}
                    onSortChange={handleLifecycleSortChange}
                  />
                )}
                {lifecycleStage === "renewal" && (
                  <Table
                    chrome={false}
                    columns={renewalColumns}
                    data={renewalRows}
                    rowKey={(row) => row.id}
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
