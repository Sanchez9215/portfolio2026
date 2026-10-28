"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { restingLabelLeft } from "./bridgeLabelLeft";

// A paragraph whose left edge lines up with the left edge of the BridgeCards
// category label inside the same parent (the label is centered text, so its left
// edge depends on the text's width — measured, not computed).
export default function LabelAlignedText({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    let cancelled = false;
    const observer = new ResizeObserver(() => align());

    function align() {
      if (cancelled) return;
      // Resting label position (see bridgeLabelLeft): stays put through the
      // category changes and the arc ride.
      const labelLeft = restingLabelLeft(parent!);
      if (labelLeft === null) return;
      el!.style.marginLeft = `${labelLeft - parent!.getBoundingClientRect().left}px`;
    }

    document.fonts.ready.then(align);
    // The cards mount after this element (lazy pixel grids) — look again shortly.
    const retry = window.setTimeout(align, 300);
    observer.observe(parent);
    return () => {
      cancelled = true;
      window.clearTimeout(retry);
      observer.disconnect();
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  );
}
