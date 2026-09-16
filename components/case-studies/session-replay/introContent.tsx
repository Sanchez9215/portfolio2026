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
  titleLines: ["Session Replay", " "],

  description: (
    <>
      Redesigned{" "}
      <a
        href="https://www.heap.io/platform/session-replay"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.inlineLink}
      >
        Heap&apos;s session player
      </a>{" "}
      from a passive video experience into a diagnostic hub by introducing
      searchable event logs, session details, and user history to accelerate
      issue resolution.
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

  impact: [
    {
      heading: "10% Usage Growth",
      body: "Contributed to a 10% increase in session replay usage following launch.",
    },
    {
      heading: "Competitive Retention & Acquisition",
      body: "Helped close new deals and retain existing customers against competing session replay tools, strengthening Heap's position ahead of its acquisition by Contentsquare.",
    },
  ],
};
