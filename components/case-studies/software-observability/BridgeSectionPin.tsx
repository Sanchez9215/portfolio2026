"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BRIDGE_PROGRESS_EVENT,
  SCROLL_VIEWPORTS_PER_CATEGORY,
  toP,
  totalUnits,
} from "./BridgeCards";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// Pins the whole host <section> with its top just below the nav and turns the
// scroll through the pin into BridgeCards' category progress (fed in through a
// window event; the cards are rendered with pinned={false} driven). Render it as
// the LAST child of the section — it draws nothing.
export default function BridgeSectionPin() {
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = markerRef.current?.closest("section");
    if (!section) return;
    const navHeight = () =>
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--nav-height",
        ),
      ) || 0;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: () => `top ${navHeight()}px`,
      end: () =>
        `+=${totalUnits * SCROLL_VIEWPORTS_PER_CATEGORY * window.innerHeight}`,
      pin: true,
      pinSpacing: true,
      refreshPriority: 1,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) =>
        window.dispatchEvent(
          new CustomEvent(BRIDGE_PROGRESS_EVENT, {
            detail: toP(self.progress * totalUnits),
          }),
        ),
    });
    // The pin adds scroll length below this section, so re-measure the page.
    scheduleScrollTriggerRefresh();
    return () => trigger.kill();
  }, []);

  return <div ref={markerRef} style={{ display: "none" }} aria-hidden="true" />;
}
