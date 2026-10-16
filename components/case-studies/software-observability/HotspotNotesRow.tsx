"use client";

import { useLayoutEffect, useState } from "react";
import styles from "./OverviewPrototype1QuestionsMap.module.css";

export interface HotspotNote {
  title: string;
  body: string;
}

// Title + body of each note as a plain row of equal columns across a target
// element's width, `offset` px above its top edge, at the tooltips' own level
// (above the dim overlay) — same text styles and layer as the Overview's
// StageNotes. No connectors; used where the annotation pointers are hidden.
export default function HotspotNotesRow({
  containerRef,
  targetSelector,
  notes,
  offset = 32,
}: {
  containerRef: React.RefObject<HTMLElement>;
  /** Measured inside the container; the row spans this element's width and
   *  sits `offset` px above its top edge. */
  targetSelector: string;
  notes: HotspotNote[];
  offset?: number;
}) {
  const [box, setBox] = useState<{
    left: number;
    bottom: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const target = container.querySelector<HTMLElement>(targetSelector);
      if (!target) return;
      const c = container.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      setBox({
        left: r.left - c.left,
        bottom: c.bottom - r.top + offset,
        width: r.width,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, targetSelector, offset]);

  if (!box) return null;
  return (
    <div
      className={styles.stageNotes}
      style={{ left: box.left, bottom: box.bottom, width: box.width }}
    >
      {notes.map((note) => (
        <div
          key={note.title}
          className={styles.stageNote}
          style={{ flex: "1 1 0", minWidth: 0 }}
        >
          <p className={styles.stageNoteTitle}>{note.title}</p>
          <p className={styles.stageNoteBody}>{note.body}</p>
        </div>
      ))}
    </div>
  );
}
