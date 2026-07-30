"use client";

import { useEffect, useRef, useState } from "react";

interface LazyMountProps {
  children: React.ReactNode;
  /** How far before entering the viewport to start mounting — avoids a visible pop-in. */
  rootMargin?: string;
}

// Defers mounting children until their wrapper is near the viewport.
// next/dynamic alone only defers a component's JS download — once page.tsx
// renders it, it still mounts and does its full render work immediately.
// For heavy sections far down a long case-study page, that competes for
// main-thread time with whatever's animating above the fold on load. This
// gates the actual mount, not just the code-split.
export default function LazyMount({ children, rootMargin = "600px" }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{visible ? children : null}</div>;
}
