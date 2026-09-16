/**
 * introContent — Data Health Monitor's intro copy (title/description/meta/
 * impact), read by the Home page's WorkCaseStudyRow entry point and, once it
 * exists, the case study's own intro section — so the two can't drift.
 *
 * Shape is the site-wide `CaseStudyIntro` — one of these per case study.
 */

import type { CaseStudyIntro } from "@/components/case-studies/caseStudyIntro";

export const dataHealthMonitorIntro: CaseStudyIntro = {
  titleLines: ["Data Health", "Monitor"],

  description:
    "Continuous monitoring of enterprise configuration data to surface health and certification status, reducing operational risk and powering reliable AI automation for Fortune 500 teams.",

  meta: [
    {
      // Same company sentence as Software Observability — same company, and
      // the row hides everything after the first word at the ≤480px tier.
      label: "Company",
      body: "XOPS enables autonomous IT operations for Fortune 500 organizations.",
    },
    {
      label: "Role",
      body: "Lead Product Designer",
    },
    {
      label: "Timeline",
      body: "Q3 2025",
    },
  ],

  impact: [
    {
      badge: "0 → 1",
      heading: "Platform Expansion",
      body: "DHM provided the data trust layer that autonomous outcomes depended on. This first step into data governance directly contributed to XOPS' mission of unifying enterprise systems.",
    },
    {
      heading: "99%+ Data Accuracy",
      body: "DHM continuously validated contractor data accuracy for a pharmaceutical leader, driving employee data accuracy to 99%+ across a seasonal workforce of 3,000–5,000.",
    },
  ],
};
