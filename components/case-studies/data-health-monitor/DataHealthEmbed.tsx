"use client";

import LiveEmbed from "@/components/LiveEmbed";
import { DataHealthScreen } from "@/app/work/data-health-monitor/prototype/DataHealthScreen";
import styles from "./DataHealthEmbed.module.css";

const NATIVE_WIDTH = 1440;

// Simple first pass: the real DataHealthScreen, scaled to fit the row —
// `scroll` mode matches SoftwareExperienceEmbed's own technique, giving the
// row's fixed 16/10 box (WorkCaseStudyRow's `fixedVisualRatio`) something to
// actually bound, with the real (much taller) page scrollable inside it. No
// scripted walkthrough, and non-interactive (pointer-events: none) — this is
// a static preview of the first page only, nothing clickable yet.
export default function DataHealthEmbed() {
  return (
    <div className={styles.inert}>
      <LiveEmbed nativeWidth={NATIVE_WIDTH} scroll>
        <DataHealthScreen />
      </LiveEmbed>
    </div>
  );
}
