/**
 * introContent — Path Analysis's intro copy (title/description/meta/impact),
 * read by the Home page's WorkCaseStudyRow entry point and, once it exists,
 * the case study's own intro section — so the two can't drift.
 *
 * Shape is the site-wide `CaseStudyIntro` — one of these per case study.
 */

import type { CaseStudyIntro } from "@/components/case-studies/caseStudyIntro";

export const pathAnalysisIntro: CaseStudyIntro = {
  titleLines: ["Path Analysis"],

  description:
    "A user journey mapping tool that integrated session replay, error identification and frustration signals to reveal actionable friction points for product teams.",

  meta: [
    {
      label: "Company",
      body: "Auryc was a product analytics platform that helped teams understand user experience and product performance through session replay, analytics, and voice-of-customer feedback.",
    },
    {
      label: "Role",
      body: "Lead Product Designer",
    },
    {
      label: "Timeline",
      body: "Q2 2021",
    },
  ],

  companyLogo: {
    src: "/SVG/AurycLogo.svg",
    nativeWidth: 95,
    nativeHeight: 24,
    alt: "Auryc",
    height: 25,
  },

  impact: [
    {
      heading: "20% ARR Growth",
    },
    {
      heading: "78% Account Adoption",
    },
    {
      heading: "92% Retention Rate",
    },
  ],
};
