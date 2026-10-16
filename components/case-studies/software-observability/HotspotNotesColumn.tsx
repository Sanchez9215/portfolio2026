"use client";

import styles from "./OverviewPrototype1QuestionsMap.module.css";
import { HotspotNote } from "./HotspotNotesRow";

// Title + body of each note stacked top-to-bottom in one column hugging an
// embed's outer edge — `side="left"` sits left of the embed, `"right"` right
// of it — at the tooltips' own level (above the dim overlay), same text styles
// as HotspotNotesRow/StageNotes. No connectors, so nothing can overlap however
// many notes share a target. Positioned against the container (which must be
// `position: relative`), so no measuring is needed.
export default function HotspotNotesColumn({
  notes,
  side,
  width = 200,
  gap = 24,
}: {
  notes: HotspotNote[];
  side: "left" | "right";
  /** Column width, px. */
  width?: number;
  /** Clear space between the embed's edge and the column, px. */
  gap?: number;
}) {
  return (
    <div
      className={styles.stageNotes}
      style={{
        top: 0,
        width,
        flexDirection: "column",
        gap: "var(--spacing-xl)",
        ...(side === "left"
          ? { right: `calc(100% + ${gap}px)` }
          : { left: `calc(100% + ${gap}px)` }),
      }}
    >
      {notes.map((note) => (
        <div key={note.title} className={styles.stageNote}>
          <p className={styles.stageNoteTitle}>{note.title}</p>
          <p className={styles.stageNoteBody}>{note.body}</p>
        </div>
      ))}
    </div>
  );
}
