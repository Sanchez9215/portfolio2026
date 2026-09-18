/**
 * caseStudyIntro — the shared shape of a case study's intro content.
 *
 * One `introContent.ts` per case study (under
 * `components/case-studies/<slug>/`) exports a `CaseStudyIntro` matching
 * this, and both the Home page's `WorkCaseStudyRow` entry point and the
 * case study's own intro section read from it so the two can't drift.
 *
 * Lives here rather than inside any one case study's folder so the generic
 * row doesn't have to import types out of a specific case study.
 */

export interface IntroMetaItem {
  label: string;
  /** For the "Company" item specifically, this is no longer displayed
   *  directly (see `CaseStudyIntro.companyLogo`) — it's the tooltip content
   *  shown on hovering the info icon next to the "Company" label instead. */
  body: string;
}

export interface CompanyLogo {
  src: string;
  /** The logo's own real SVG viewBox dimensions — drives its rendered
   *  aspect ratio, never an invented size. */
  nativeWidth: number;
  nativeHeight: number;
  alt: string;
}

export interface IntroImpactItem {
  badge?: string;
  heading: string;
  /** Omit to show just the heading (+ badge) — no body line. */
  body?: string;
}

import type { ReactNode } from "react";

export interface CaseStudyIntro {
  /** Title, pre-broken into the lines it should render as. */
  titleLines: string[];
  /** Usually a plain string — ReactNode so a case study can link a phrase
   *  inline (e.g. Session Replay's link to Heap's own product page). */
  description: ReactNode;
  /** Company / Role / Timeline. Company's own display value is
   *  `companyLogo` below, not this array's "Company" body text. */
  meta: IntroMetaItem[];
  /** Replaces the meta row's old plain-text Company value. */
  companyLogo: CompanyLogo;
  /** Kept to a consistent count across rows so the entry points line up. */
  impact: IntroImpactItem[];
}
