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
  body: string;
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
  /** Company / Role / Timeline. */
  meta: IntroMetaItem[];
  /** Kept to a consistent count across rows so the entry points line up. */
  impact: IntroImpactItem[];
}
