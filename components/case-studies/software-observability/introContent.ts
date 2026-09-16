/**
 * introContent — Software Observability's intro copy (title/description/
 * meta/impact), shared by the case study page's own SectionIntroduction and
 * the Home page's WorkCaseStudyRow entry point so the two can't drift.
 *
 * Shape is the site-wide `CaseStudyIntro` — one of these per case study.
 */

import type { CaseStudyIntro } from "@/components/case-studies/caseStudyIntro";

export const softwareObservabilityIntro: CaseStudyIntro = {
  titleLines: ["Software", "Observability"],

  description:
    "Real-time visibility into license ownership, spend, and utilization to identify waste and drive cost optimization for the Fortune 500.",

  meta: [
    {
      label: "Company",
      body: "XOPS enables autonomous IT operations for Fortune 500 organizations.",
    },
    {
      label: "Role",
      body: "Lead Designer",
    },
    {
      label: "Timeline",
      body: "Q2 2025",
    },
  ],

  impact: [
    {
      badge: "0 → 1",
      heading: "Platform Expansion",
      body: "Designed end-to-end software module experience, extending the platform's coverage from employees and devices into software.",
    },
    {
      heading: "Millions Reclaimed",
      body: "Established foundation for automated software optimization enabling customers like Broadcom to surface and recover waste at scale.",
    },
    {
      heading: "Revenue & Sales Driver",
      body: "Software Observability became a consistent presence in enterprise sales demos, revealing the depth of XOPS' system of intelligence.",
    },
  ],
};
