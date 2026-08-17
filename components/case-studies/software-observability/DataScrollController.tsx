"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// Extra scroll distance the section stays stuck AFTER the last hub is fully
// scrolled into view, before it releases into the next section.
const HOLD = 500;

// With centerFade: extra scroll distance each hub stays parked at dead
// center (fully opaque, not moving) before continuing upward — so it's
// legible rather than just passing through center instantaneously.
const CENTER_HOLD = 500;

/**
 * Pins the data section (via a sticky stage inside a tall track — not GSAP's
 * `pin`, matching this project's other pinned scene) and drives the hub
 * column's scroll from the page scroll: as you scroll through the runway the
 * hubs scroll 1:1, then hold at the bottom for HOLD px, then the section
 * releases. Reduced-motion users keep the plain native-scroll hub column.
 */
export default function DataScrollController({
  children,
  fadeIn = false,
  centerFade = false,
}: {
  children: React.ReactNode;
  /** Fade the scroll column in as the section approaches (so it's fully in by
   *  the time it pins — meant to run alongside a left-side text reveal). */
  fadeIn?: boolean;
  /** Instead of the scroll column staying opaque once in, each direct child
   *  fades in as it nears the stuck stage's vertical center and fades back
   *  out as it continues past — opacity derived from that child's own
   *  distance from center relative to the stage's half-height. */
  centerFade?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const scroller = track.querySelector<HTMLElement>("[data-scroll-body]");
    if (!scroller) return;
    const section = scroller.closest("section");

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // JS drives the hub scroll while the stage is stuck, so turn off native
      // scrolling — overflow:hidden still allows programmatic scrollTop.
      const prevOverflow = scroller.style.overflowY;
      scroller.style.overflowY = "hidden";

      // With centerFade, each hub's centered scrollTop gets its own
      // CENTER_HOLD-px plateau spliced into the runway — computed fresh
      // whenever the track is (re)sized, since it depends on layout.
      let centerStops: number[] = [];
      let max = 0;

      const sizeTrack = () => {
        max = scroller.scrollHeight - scroller.clientHeight;
        let holdDistance = 0;
        if (centerFade) {
          const mid = scroller.clientHeight / 2;
          centerStops = Array.from(scroller.children).map((child) => {
            const el = child as HTMLElement;
            return Math.min(
              max,
              Math.max(0, el.offsetTop + el.offsetHeight / 2 - mid),
            );
          });
          holdDistance = centerStops.length * CENTER_HOLD;
        }
        // The runway only travels as far as the LAST hub's centered stop —
        // once it holds there, the section releases rather than continuing
        // to scroll/fade the last hub back out. One viewport (the stuck
        // stage) + that travel distance + the center holds + the final
        // release hold.
        const travel = centerFade
          ? (centerStops[centerStops.length - 1] ?? max)
          : max;
        track.style.height =
          window.innerHeight + travel + holdDistance + HOLD + "px";
      };
      sizeTrack();

      // Maps a virtual scroll distance (0 → lastStop + centerHolds + HOLD) to
      // the hub column's actual scrollTop: moves 1:1 between stops, parks
      // flat for CENTER_HOLD at each one, then holds flat at the last stop
      // for HOLD (the last hub never continues past its own center).
      const virtualToScrollTop = (v: number) => {
        let prevStop = 0;
        let consumed = 0;
        for (const stop of centerStops) {
          const moveLen = stop - prevStop;
          if (v < consumed + moveLen) return prevStop + (v - consumed);
          consumed += moveLen;
          if (v < consumed + CENTER_HOLD) return stop;
          consumed += CENTER_HOLD;
          prevStop = stop;
        }
        return prevStop;
      };

      const applyCenterFade = () => {
        const mid = scroller.clientHeight / 2;
        Array.from(scroller.children).forEach((child) => {
          const el = child as HTMLElement;
          const elMid = el.offsetTop + el.offsetHeight / 2 - scroller.scrollTop;
          const distance = Math.abs(elMid - mid);
          el.style.opacity = String(Math.max(0, 1 - distance / mid));
        });
      };

      const st = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (centerFade) {
            const travel = centerStops[centerStops.length - 1] ?? max;
            const total = travel + centerStops.length * CENTER_HOLD + HOLD;
            scroller.scrollTop = virtualToScrollTop(self.progress * total);
            applyCenterFade();
          } else {
            // 1:1 scroll → hub scrollTop over `max`, then held at the bottom
            // through the final HOLD px of the runway.
            scroller.scrollTop = Math.min(max, self.progress * (max + HOLD));
          }
        },
      });
      if (centerFade) applyCenterFade();

      // Fade the scroll column in as the section approaches, finishing right as
      // it pins — so it lands ready alongside the left-side text reveal.
      let fadeSt: ScrollTrigger | undefined;
      if (fadeIn && section) {
        gsap.set(scroller, { opacity: 0 });
        fadeSt = ScrollTrigger.create({
          trigger: section,
          start: "top 67%",
          end: "top top",
          scrub: true,
          onUpdate: (self) => gsap.set(scroller, { opacity: self.progress }),
        });
      }

      // The track just grew the page height — refresh so any ScrollTriggers
      // created earlier (e.g. a LabelBlock reveal inside this section) recompute
      // against the new layout.
      scheduleScrollTriggerRefresh();

      const onResize = () => sizeTrack();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        st.kill();
        fadeSt?.kill();
        track.style.height = "";
        scroller.style.overflowY = prevOverflow;
        scroller.scrollTop = 0;
        gsap.set(scroller, { clearProps: "opacity" });
        if (centerFade) {
          Array.from(scroller.children).forEach((child) =>
            gsap.set(child, { clearProps: "opacity" }),
          );
        }
      };
    });

    return () => mm.revert();
  }, []);

  return <div ref={trackRef}>{children}</div>;
}
