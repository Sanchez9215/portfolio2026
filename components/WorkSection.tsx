/**
 * WorkSection — the Home page's Work section: one WorkCaseStudyRow per case
 * study entry point, in display order.
 *
 * Client component because WorkCaseStudyRow takes `visual` as a render prop
 * (it calls back with `entranceReady`), and functions can't be passed across
 * the server/client boundary — so the composition lives here rather than in
 * app/page.tsx, which stays a Server Component.
 *
 * Rows without a real visual yet render WorkVisualPlaceholder.
 */

"use client";

import WorkCaseStudyRow from "@/components/WorkCaseStudyRow";
import WorkVisualPlaceholder from "@/components/WorkVisualPlaceholder";
import SoftwareExperienceEmbed from "@/components/case-studies/software-observability/SoftwareExperienceEmbed";
import { softwareObservabilityIntro } from "@/components/case-studies/software-observability/introContent";
import { dataHealthMonitorIntro } from "@/components/case-studies/data-health-monitor/introContent";
import { sessionReplayIntro } from "@/components/case-studies/session-replay/introContent";
import SessionReplayVideo from "@/components/case-studies/session-replay/SessionReplayVideo";
import { pathAnalysisIntro } from "@/components/case-studies/path-analysis/introContent";
import PathAnalysisVideo from "@/components/case-studies/path-analysis/PathAnalysisVideo";

// Overrides for this row's embed only — values match SoftwareExperienceEmbed's
// own defaults (cursorFadeInMarkMs/cursorFadeInDuration/sequenceStartMarkMs),
// unchanged until tuned. `entranceReady` comes from the row's own timeline.
const SW_OBSERVABILITY_EMBED_TIMING = {
  cursorFadeInMarkMs: 550,
  cursorFadeInDuration: 0.5,
  sequenceStartMarkMs: 650,
};

export default function WorkSection() {
  return (
    <main id="work">
      <WorkCaseStudyRow
        intro={softwareObservabilityIntro}
        visual={(entranceReady) => (
          <SoftwareExperienceEmbed
            entranceReady={entranceReady}
            cursorFadeInMarkMs={SW_OBSERVABILITY_EMBED_TIMING.cursorFadeInMarkMs}
            cursorFadeInDuration={
              SW_OBSERVABILITY_EMBED_TIMING.cursorFadeInDuration
            }
            sequenceStartMarkMs={
              SW_OBSERVABILITY_EMBED_TIMING.sequenceStartMarkMs
            }
            enableExpandedView
          />
        )}
        fixedVisualRatio
      />
      {/* Hidden until DHM's own outstanding work is done — see PLAN.md. */}
      {false && (
        <WorkCaseStudyRow
          intro={dataHealthMonitorIntro}
          visual={() => <WorkVisualPlaceholder />}
        />
      )}
      <WorkCaseStudyRow
        intro={sessionReplayIntro}
        visual={(_entranceReady, settled) => (
          <SessionReplayVideo play={settled} />
        )}
      />
      <WorkCaseStudyRow
        intro={pathAnalysisIntro}
        visual={(_entranceReady, settled) => (
          <PathAnalysisVideo play={settled} />
        )}
        impactItemHeight={64}
      />
    </main>
  );
}
