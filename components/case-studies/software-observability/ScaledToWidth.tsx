"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Renders children at a fixed native width and scales them down to fit the
// container's width (layout height follows, so nothing below overlaps). Like
// LiveEmbed but without its clipping, so shadows and lifted cards can spill.
export default function ScaledToWidth({
  nativeWidth,
  children,
}: {
  nativeWidth: number;
  children: ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const update = () => {
      const next = outer.clientWidth / nativeWidth;
      setScale(next);
      setHeight(inner.offsetHeight * next);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [nativeWidth]);

  return (
    <div ref={outerRef} style={{ width: "100%", height }}>
      <div
        ref={innerRef}
        style={{
          width: nativeWidth,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
