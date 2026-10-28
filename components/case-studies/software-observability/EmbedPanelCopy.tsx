"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import styles from "./EmbedPanelCopy.module.css";

// A panel from the Overview Prototype 1 embed (e.g. the lifecycle or compliance
// card), shown on its own at exactly the size it has inside that embed (same native
// width, same scale), anchored top-left and clipped by its host card. Size is read
// off the live panel in the main embed (`hotspotId`) rather than recomputed, so the
// two always match.

interface Measure {
  nativeWidth: number;
  scale: number;
}

export default function EmbedPanelCopy({
  hotspotId,
  fillWidth = false,
  children,
}: {
  /** `data-hotspot` of the panel inside the main embed whose size this copy mirrors. */
  hotspotId: string;
  /** Scale up (keeping its proportions) until the panel spans the host card's width
   *  minus the same 32px inset on the right as on the left, instead of matching the
   *  source panel's on-screen size. */
  fillWidth?: boolean;
  children: ReactNode;
}) {
  const [measure, setMeasure] = useState<Measure | null>(null);
  const [fillScale, setFillScale] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // fillWidth: scale = (host width − left inset − right inset) / native width.
  useEffect(() => {
    const card = cardRef.current;
    const host = card?.parentElement;
    if (!fillWidth || !card || !host || !measure) return;
    const update = () => {
      const inset = parseFloat(getComputedStyle(card).left) || 0;
      setFillScale((host.clientWidth - 2 * inset) / measure.nativeWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [fillWidth, measure]);

  useEffect(() => {
    const SOURCE_SELECTOR = `[data-prototype-embed] [data-hotspot="${hotspotId}"]`;
    let observer: ResizeObserver | null = null;
    let poll: number | null = null;

    const attach = (source: HTMLElement) => {
      const update = () => {
        const nativeWidth = source.offsetWidth;
        if (!nativeWidth) return;
        setMeasure({
          nativeWidth,
          scale: source.getBoundingClientRect().width / nativeWidth,
        });
      };
      update();
      observer = new ResizeObserver(update);
      observer.observe(source);
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    };

    // The main embed mounts lazily — wait for its panel to exist.
    let detach: (() => void) | undefined;
    const find = () => {
      const source = document.querySelector<HTMLElement>(SOURCE_SELECTOR);
      if (!source) return;
      if (poll !== null) window.clearInterval(poll);
      poll = null;
      detach = attach(source);
    };
    find();
    if (!observer) poll = window.setInterval(find, 250);

    return () => {
      if (poll !== null) window.clearInterval(poll);
      observer?.disconnect();
      detach?.();
    };
  }, [hotspotId]);

  if (!measure) return null;

  const scale = fillWidth ? (fillScale ?? measure.scale) : measure.scale;

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        width: measure.nativeWidth,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}
