"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_DISTANCE_PER_SLOT = 1200; // px of scroll pinned per sub-beat slot
const FADE_FRACTION = 0.15; // leading/trailing fraction of each slot spent fading the tooltip in/out
const REFRESH_DEBOUNCE_MS = 150; // window to coalesce layout-change signals into one refresh

// ── Shared page-height watcher ──────────────────────────────────────────────
// These sequences sit on a page whose sections mount lazily (see LazyMount), so
// the document keeps growing *underneath* already-created ScrollTriggers as the
// user scrolls. A trigger created while later sections are still unmounted
// measures its start/end against a page that's temporarily too short, and
// nothing in ScrollTrigger notices afterwards — it only auto-refreshes on
// window resize / load, not on arbitrary DOM insertion. That's what let two
// pinned sequences end up with overlapping scroll ranges and render stacked.
//
// Watching an individual pinned element's own height doesn't catch this: when a
// *sibling* section mounts, this element doesn't resize, it just moves down. The
// document's height is the signal that actually changes, so it's what's watched
// here — once, shared by every instance, rather than per-instance.
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
let lastDocumentHeight = 0;
let heightObserver: ResizeObserver | null = null;
let observerRefCount = 0;

// Every pinned sequence currently mounted, so refresh order can be reassigned
// from live document order (see reprioritize below).
const registry = new Set<{ el: HTMLElement; trigger: ScrollTrigger }>();

// A pin's spacer changes the scroll position of everything below it, so pinned
// triggers MUST be refreshed top-down. ScrollTrigger orders them by
// `refreshPriority` (higher = refreshed first), which by default assumes
// triggers were created in document order — and LazyMount breaks that
// assumption outright: a lower section can mount (and create its trigger)
// before a section above it exists at all. When that happens, the lower
// trigger gets measured before the upper one's pin distance is accounted for,
// so it resolves to a start position that sits *inside* the upper sequence's
// range — the two then pin simultaneously and render stacked. Because the
// order is wrong rather than the timing, a plain refresh() reproduces the same
// wrong numbers no matter when it runs; the order has to be corrected first.
//
// Priorities are reassigned from each element's real current position on every
// refresh (not once at creation) since creation-time positions are exactly the
// unreliable ones. Offsets are negative so these always refresh after the
// page's other pinned scenes, which sit above them and keep the default 0.
function reprioritize() {
  const entries = Array.from(registry).filter((entry) => entry.el.isConnected);
  entries.sort(
    (a, b) =>
      a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top
  );
  entries.forEach((entry, index) => {
    // ScrollTrigger.sort() reads this off `vars`, not the instance.
    entry.trigger.vars.refreshPriority = -(index + 1);
  });
  ScrollTrigger.sort();
}

// Debounced so a burst of near-simultaneous layout changes (several sections
// mounting, LiveEmbed resolving its scaled height) collapses into a single
// refresh() rather than several overlapping remeasure passes.
function scheduleSharedRefresh() {
  if (refreshTimeoutId !== null) clearTimeout(refreshTimeoutId);
  refreshTimeoutId = setTimeout(() => {
    refreshTimeoutId = null;
    reprioritize();
    ScrollTrigger.refresh();
    // refresh() resizes pin spacers, which changes document height and would
    // re-fire the observer forever. Recording the post-refresh height here
    // means that self-inflicted change reads as "no change" and stops the loop.
    lastDocumentHeight = document.documentElement.scrollHeight;
  }, REFRESH_DEBOUNCE_MS);
}

// Ref-counted so the observer exists only while at least one sequence is
// mounted, and is torn down with the last one.
function acquireHeightObserver() {
  observerRefCount += 1;
  if (heightObserver) return;
  lastDocumentHeight = document.documentElement.scrollHeight;
  heightObserver = new ResizeObserver(() => {
    const height = document.documentElement.scrollHeight;
    if (height === lastDocumentHeight) return;
    lastDocumentHeight = height;
    scheduleSharedRefresh();
  });
  heightObserver.observe(document.body);
}

function releaseHeightObserver() {
  observerRefCount -= 1;
  if (observerRefCount > 0) return;
  heightObserver?.disconnect();
  heightObserver = null;
  if (refreshTimeoutId !== null) {
    clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
}

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

    let entry: { el: HTMLElement; trigger: ScrollTrigger } | null = null;

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

      const trigger = ScrollTrigger.create({
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

      entry = { el, trigger };
      registry.add(entry);
    });

    // Keeps this trigger's start/end honest as the rest of the page grows around
    // it — see the shared page-height watcher above.
    acquireHeightObserver();
    // This sequence's own arrival changed the page height too; every other
    // trigger already on the page measured without it — and its position in the
    // refresh order has to be established before anything trusts its start/end.
    scheduleSharedRefresh();

    return () => {
      if (entry) registry.delete(entry);
      releaseHeightObserver();
      ctx.revert();
    };
  }, [pinRef, subBeatsList.join(",")]);

  return state;
}
