"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { restingLabelLeft } from "./bridgeLabelLeft";

// Shifts its box sideways (CSS `translate`, so layout and the grid stay put) until
// the BridgeCards category label inside it starts at the same x as the element
// matching `targetSelector`. The label is centered text, so its left edge depends
// on the text's width — measured once at rest (bridgeLabelLeft), not live.
export default function ShiftLabelToTarget({
  targetSelector,
  className,
  children,
}: {
  targetSelector: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const observer = new ResizeObserver(() => align());

    function align() {
      const target = document.querySelector<HTMLElement>(targetSelector);
      if (cancelled || !target) return;
      // Measure unshifted, then apply the difference. The label's resting position
      // (see bridgeLabelLeft) never changes with the category or the arc ride, so
      // the box stays put for the whole scroll.
      el!.style.translate = "0px 0px";
      const labelLeft = restingLabelLeft(el!);
      if (labelLeft === null) return;
      el!.style.translate = `${target.getBoundingClientRect().left - labelLeft}px 0px`;
    }

    // Measure only once fonts are in (the label width depends on them).
    document.fonts.ready.then(align);
    // The cards mount a little after this box — look again shortly.
    const retry = window.setTimeout(align, 300);
    observer.observe(el);
    observer.observe(document.body);
    return () => {
      cancelled = true;
      window.clearTimeout(retry);
      observer.disconnect();
    };
  }, [targetSelector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
