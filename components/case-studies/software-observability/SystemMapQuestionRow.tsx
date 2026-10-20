"use client";

import Label from "@/components/Label";
import { QUESTION_LABELS } from "./SoftwareSystemMap";
import tabStyles from "@/components/PrototypeTabs.module.css";
import styles from "./OverviewPrototype1QuestionsMap.module.css";

// The same four-question row the Overview/Profile embeds use (QUESTION_LABELS,
// Label size lg, the shared .questionRow/.question layout) — static here, since
// no embed is tied to it: plain labels at full color, no buttons or toggle state.
export default function SystemMapQuestionRow() {
  return (
    <div className={`${tabStyles.tabs} ${styles.tabsRow}`}>
      {QUESTION_LABELS.map((label) => (
        <div key={label} className={tabStyles.tab} style={{ cursor: "default" }}>
          <Label size="lg">{label}</Label>
        </div>
      ))}
    </div>
  );
}
