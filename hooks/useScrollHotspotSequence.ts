"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_DISTANCE_PER_SLOT = 1200; // px of scroll pinned per sub-beat slot
const FADE_FRACTION = 0.15; // leading/trailing fraction of each slot spent fading the tooltip in/out

interface HotspotSequenceState {
  activeIndex: number | null;
  subBeatIndex: number; // which sub-beat (0-based) within the active hotspot's own beats
  settled: boolean; // true during the hold phase — gates tooltip visibility
}

const IDLE_STATE: HotspotSequenceState = { activeIndex: null, subBeatIndex: 0, settled: false };

// Pins `pinRef` at the top of the viewport for a fixed scroll distance, then
// steps through hotspots in sequence as the user scrolls. Each hotspot occupies
// one or more consecutive "slots" (its `subBeats`, default 1). The spotlight itself
// stays full-size throughout — no grow/shrink — and smoothly tweens position/size
// between targets (see HotspotOverlay's rect smoothing); this hook only tracks which
// slot is active and gates the tooltip's fade in/out near each slot's edges.
export function useScrollHotspotSequence(
  pinRef: React.RefObject<HTMLElement>,
  subBeatsList: number[],
  /** Where the pinned element sits in the viewport while pinned — "top" (default,
   *  flush under the nav) or "center" (vertically centered, for shorter embeds). */
  pinAt: "top" | "center" = "top"
): HotspotSequenceState {
  const [state, setState] = useState<HotspotSequenceState>(IDLE_STATE);

  useEffect(() => {
    const el = pinRef.current;
    const slotCount = subBeatsList.reduce((sum, n) => sum + n, 0);
    if (!el || slotCount === 0) return;

    // Flatten hotspots into slots so each slot can be driven by the same
    // grow/hold/shrink math a single-beat hotspot already used.
    const slotToHotspot: { hotspotIndex: number; subBeatIndex: number }[] = [];
    subBeatsList.forEach((count, hotspotIndex) => {
      for (let b = 0; b < count; b++) {
        slotToHotspot.push({ hotspotIndex, subBeatIndex: b });
      }
    });

    const ctx = gsap.context(() => {
      const totalDistance = SCROLL_DISTANCE_PER_SLOT * slotCount;
      const navHeight = document.querySelector("nav")?.getBoundingClientRect().height ?? 0;

      // One snap point per slot (its hold-phase midpoint) — settles a
      // scroll gesture on the nearest slot once it ends, rather than
      // leaving the scroll mid-transition.
      const snapTo = [
        0,
        ...Array.from({ length: slotCount }, (_, i) => (i + 0.5) / slotCount),
        1,
      ];

      ScrollTrigger.create({
        trigger: el,
        start: pinAt === "center" ? "center center" : `top ${navHeight}`,
        end: `+=${totalDistance}`,
        pin: true,
        anticipatePin: 1, // GSAP's documented fix for the 1-frame jump when a scrub-pinned element's engage position is recalculated slightly stale
        scrub: 0.25,
        snap: {
          snapTo,
          delay: 0,
          duration: { min: 0.1, max: 0.3 },
          ease: "power1.inOut",
        },
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress <= 0 || progress >= 1) {
            setState(IDLE_STATE);
            return;
          }

          const scaled = progress * slotCount;
          const slotIndex = Math.min(slotCount - 1, Math.floor(scaled));
          const local = scaled - slotIndex;
          const { hotspotIndex, subBeatIndex } = slotToHotspot[slotIndex];
          const settled = local >= FADE_FRACTION && local < 1 - FADE_FRACTION;

          setState({ activeIndex: hotspotIndex, subBeatIndex, settled });
        },
        onLeaveBack: () => setState(IDLE_STATE),
        onLeave: () => setState(IDLE_STATE),
      });
    });

    return () => ctx.revert();
  }, [pinRef, subBeatsList.join(",")]);

  return state;
}
