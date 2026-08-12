/**
 * introContent — shared copy for the Software Observability case study's
 * intro (title/description/meta/impact), reused by both the real case
 * study page's SectionIntroduction and the Home page's Work preview row
 * so the two never drift out of sync.
 */

export interface IntroMetaItem {
  label: string;
  body: string;
}

export interface IntroImpactItem {
  badge?: string;
  heading: string;
  body: string;
}

export const introTitleLines = ["Software", "Observability"];

export const introDescription =
  "Real-time visibility into license ownership, spend, and utilization to identify waste and drive cost optimization for the Fortune 500.";

export const introMeta: IntroMetaItem[] = [
  {
    label: "Company",
    body: "XOPS is an autonomous IT operations platform for Fortune 500 organizations.",
  },
  {
    label: "Role",
    body: "Lead Product Designer",
  },
  {
    label: "Timeline",
    body: "Q2 2025",
  },
];

export const introImpact: IntroImpactItem[] = [
  {
    badge: "0 → 1",
    heading: "Platform Expansion",
    body: "Designed end-to-end software module experience, extending the platform's lifecycle coverage from employees and devices into software and license intelligence.",
  },
  {
    heading: "Millions Reclaimed in License Spend",
    body: "Established foundation for automated software optimization enabling enterprise customers like Broadcom to surface and recover unused software costs at scale.",
  },
  {
    heading: "Revenue & Sales Enablement",
    body: "Software Observability became a consistent presence in enterprise sales demos, revealing the depth of XOPS' data model and system of intelligence.",
  },
];
