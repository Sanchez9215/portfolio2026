/**
 * introContent — Session Replay's intro copy (title/description/meta/
 * impact), read by the Home page's WorkCaseStudyRow entry point and, once it
 * exists, the case study's own intro section — so the two can't drift.
 *
 * Shape is the site-wide `CaseStudyIntro` — one of these per case study.
 */

import type { CaseStudyIntro } from "@/components/case-studies/caseStudyIntro";
import styles from "./introContent.module.css";

export const sessionReplayIntro: CaseStudyIntro = {
  titleLines: ["Session Replay"],

  description: (
    <>
      Transformed{" "}
      <a
        href="https://www.heap.io/platform/session-replay"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.inlineLink}
      >
        Heap&apos;s player
      </a>{" "}
      from a passive experience into a diagnostic hub by introducing searchable
      event logs, session details, and user history to accelerate issue
      resolution.
    </>
  ),

  meta: [
    {
      label: "Company",
      body: "Heap is a digital insights platform that helps companies understand their users' digital journeys and identify friction points and opportunities.",
    },
    {
      label: "Role",
      body: "Lead Product Designer",
    },
    {
      label: "Timeline",
      body: "Q3 2022",
    },
  ],

  companyLogo: {
    src: "/SVG/HeapLogo.svg",
    nativeWidth: 65,
    nativeHeight: 26,
    alt: "Heap",
    height: 28,
  },

  impact: [
    {
      heading: "Competitive Retention & Acquisition",
      body: "The new player closed new deals and retained customers against competitors, strengthening Heap ahead of its Contentsquare acquisition.",
    },
    {
      heading: "10% Usage Growth",
    },
  ],
};
