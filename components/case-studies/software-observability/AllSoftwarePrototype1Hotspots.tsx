"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
  groupBySpotlight,
} from "./AnnotationConnectorHotspot";
import AllSoftwareLegacy from "@/design-systems/xops/legacy/AllSoftwareLegacy";
import { PlayerState, TimelineMilestoneRow } from "./Timeline";
import { useCountdown } from "@/hooks/useCountdown";
import pageStyles from "@/app/work/software-observability/software-observability.module.css";

// This player's own single milestone — unlike Overview (5 named phases),
// there's only one flat walkthrough here, so Timeline shows one row.
export const ALL_SOFTWARE_PROTOTYPE_1_MILESTONES: TimelineMilestoneRow[] = [
  { key: "design-intent", label: "Design Intent" },
];

// Prototype 01's All Software table has no `data-hotspot` attribute hooks
// (Table.tsx is a shared XOPS component, left untouched) — columns are
// targeted structurally by header/body position instead, via
// `targetSelectors` (see AnnotationHotspotData's own doc). Column order
// (AllSoftwareLegacy's `columns` array): 1 Software, 2 Publisher, 3 Vendor,
// 4 Category, 5 Total Spend, 6 Licenses Purchased, 7 Utilization,
// 8 Inactive, 9 Renewal. `targetId` is only used as this hotspot's stable
// key (spotlightId fallback) — targetSelectors does the real targeting.
// `flip`/`insight`/`insightLabel` — see the comment below CARD_GROUPS.
const HOTSPOTS: AnnotationHotspotData[] = [
  {
    targetId: "spend-first-prioritization",
    title: "Spend-first Prioritization",
    body: "The table is sorted by total spend to surface the highest financial exposure, helping teams focus effort where savings potential is greatest.",
    targetSelectors: ["th:nth-child(5), tbody tr:nth-child(-n+5) td:nth-child(5)"],
  },
  {
    targetId: "identification-columns",
    title: "Identification Columns",
    body: "Software name, Publisher and Vendor provide essential context for identifying what the product is, who created it, and who it was purchased through.",
    targetSelectors: ["th:nth-child(-n+3), tbody tr:nth-child(-n+5) td:nth-child(-n+3)"],
  },
  {
    targetId: "category",
    title: "Category",
    body: "Groups software by function, letting teams compare spend and utilization across similar tools and identify redundant tools for consolidation opportunities.",
    targetSelectors: ["th:nth-child(4)"],
  },
  {
    targetId: "total-spend",
    title: "Total Spend",
    body: "Quantifies what the organization is paying for each title, establishing the financial baseline every other signal gets measured against.",
    targetSelectors: ["th:nth-child(5), tbody tr:nth-child(-n+5) td:nth-child(5)"],
  },
  {
    targetId: "licenses-purchased",
    title: "Licenses Purchased",
    body: "Establishes the baseline for total licenses owned to support allocation decisions, onboarding planning, and renewal negotiations.",
    targetSelectors: ["th:nth-child(6)"],
    flip: true,
  },
  {
    targetId: "utilization-rate",
    title: "Utilization Rate",
    body: "Represents the percentage of licenses actively being used, allowing teams to identify reclamation opportunities, inform renewal decisions and negotiation strategy.",
    targetSelectors: ["th:nth-child(7)"],
    flip: true,
  },
  {
    targetId: "inactive",
    title: "Inactive",
    body: "Quantifies the number of assigned licenses not being actively used (no activity in last 90 days), identifying reclamation opportunities and wasted spend.",
    targetSelectors: ["th:nth-child(8)"],
    flip: true,
  },
  {
    targetId: "renewal",
    title: "Renewal",
    body: "Provides urgency context for renewal decisions before a contract renews.",
    targetSelectors: ["th:nth-child(9)"],
    flip: true,
  },
// `insight`/`insightLabel`/`label` are required by AnnotationHotspotData but
// never actually rendered by AnnotationConnectorHotspot (dead fields on the
// type today — confirmed nothing reads them) — this player also never sets
// `showInsight`. Mirrored from title/body below rather than left empty, so
// nothing depends on the specific placeholder value.
].map((h) => ({ ...h, label: h.title, insightLabel: h.title, insight: h.body }));

// `flip` (columns 6–9, past the horizontal-scroll trigger below) is a first-
// pass guess — attach top-left so the connector runs left instead of
// potentially off the embed's right edge — not yet visually confirmed.
const CARD_GROUPS: AnnotationHotspotData[][] = groupBySpotlight(HOTSPOTS);
const UTILIZATION_GROUP_INDEX = CARD_GROUPS.findIndex(
  (g) => g[0].targetId === "utilization-rate",
);

const CARD_DURATION_MS = 3000;
const COUNTDOWN_DURATION_MS = 8000;

export interface AllSoftwarePrototype1HotspotsProps {
  /** Bumped to jump back to the top (the only milestone this player has) —
   *  e.g. clicking Timeline's single "Design Intent" row. */
  jumpToken?: number;
  onPlayerStateChange?: (state: PlayerState) => void;
}

export default function AllSoftwarePrototype1Hotspots({
  jumpToken,
  onPlayerStateChange,
}: AllSoftwarePrototype1HotspotsProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  // Paused via Space — freezes auto-advance and the countdown tick alike;
  // resuming restarts the current card's/countdown's full duration rather
  // than tracking remaining time (same simplification Overview's player
  // has). Declared above the countdown hook since it depends on this.
  const [paused, setPaused] = useState(false);
  const handleTogglePause = () => setPaused((p) => !p);

  const [countdown, setCountdown] = useCountdown(true, paused);

  // True once the countdown has been used up once, by any path — a
  // "first-visit only" get-ready beat, not something to replay every time
  // the Timeline row jumps back to the top.
  const [countdownUsed, setCountdownUsed] = useState(false);

  // -1 = no active card (still counting down); 0..7 = active hotspot group.
  const [cardStep, setCardStep] = useState(-1);
  useEffect(() => {
    if (countdown === 0 && cardStep === -1) {
      setCardStep(0);
      setCountdownUsed(true);
    }
  }, [countdown, cardStep]);

  // True once actively playing — a real card running, or a countdown-tail
  // silently ticking after the first visit (Replay, or the Timeline row
  // jumping back while already playing/paused). False during the genuine
  // first-visit countdown (Play Now/Skip only, no Pause) — same model as
  // Overview's player.
  const started =
    cardStep >= 0 || (countdownUsed && countdown !== null);
  const completed = cardStep >= CARD_GROUPS.length - 1;

  const [exited, setExited] = useState(false);
  const handleExitWalkthrough = () => setExited(true);
  // Replay — always resets fully to the top and starts playing from there.
  const handleStartWalkthrough = () => {
    setExited(false);
    setPaused(false);
    setCardStep(-1);
    setCountdown(COUNTDOWN_DURATION_MS / 1000);
  };
  // Resume — un-exits and plays from wherever cardStep already is (frozen
  // since Leave/Skip/a Timeline jump-while-exited). The one exception: if
  // that position is the pre-walkthrough spot (cardStep -1), there's no
  // card to resume into, so this kicks off a fresh real countdown-tail
  // there instead, same mechanic Replay uses.
  const handleResume = () => {
    setExited(false);
    setPaused(false);
    if (cardStep < 0) {
      setCountdown(COUNTDOWN_DURATION_MS / 1000);
    }
  };
  const handleStartNow = () => {
    setCardStep(0);
    setCountdown(null);
    setCountdownUsed(true);
  };
  const handleSkip = () => {
    setExited(true);
    setCountdown(null);
    setCountdownUsed(true);
  };

  useEffect(() => {
    onPlayerStateChange?.({
      countdown,
      exited,
      started,
      paused,
      countdownUsed,
      completed,
      onStartNow: handleStartNow,
      onExitWalkthrough: handleExitWalkthrough,
      onStartWalkthrough: handleStartWalkthrough,
      onResume: handleResume,
      onTogglePause: handleTogglePause,
      onSkip: handleSkip,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, exited, started, paused, countdownUsed, completed, onPlayerStateChange]);

  // Jump back to the top — the only milestone this player has, so unlike
  // Overview there's no jumpTarget to branch on. Same "don't auto-play while
  // exited" rule: jumping while playing/paused restarts the countdown-tail
  // and keeps going; jumping while exited moves the frozen position to the
  // top without auto-playing (Resume/Replay is what actually starts it).
  const lastJumpToken = useRef(jumpToken);
  useEffect(() => {
    if (jumpToken === undefined || jumpToken === lastJumpToken.current) return;
    lastJumpToken.current = jumpToken;
    setCardStep(-1);
    if (exited) {
      setCountdown(null);
      return;
    }
    setCountdown(COUNTDOWN_DURATION_MS / 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToken]);

  const activeStepDurationMs = useMemo(() => {
    if (cardStep < 0 || cardStep >= CARD_GROUPS.length) return undefined;
    return CARD_DURATION_MS;
  }, [cardStep]);

  // Advances automatically, one card at a time; holds forever once the last
  // card is reached.
  useEffect(() => {
    if (exited || paused || !activeStepDurationMs) return;
    if (cardStep >= CARD_GROUPS.length - 1) return;
    const timer = setTimeout(() => setCardStep((s) => s + 1), activeStepDurationMs);
    return () => clearTimeout(timer);
  }, [exited, paused, activeStepDurationMs, cardStep]);

  // Section-in-view gating for keyboard controls — Left/Right/Space/Escape
  // should only respond while this section is actually on screen.
  const [sectionInView, setSectionInView] = useState(false);
  useEffect(() => {
    const el = pinRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionInView || exited) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (cardStep >= 0 && cardStep < CARD_GROUPS.length - 1) {
          setCardStep(cardStep + 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (cardStep > 0) setCardStep(cardStep - 1);
      } else if (e.code === "Space") {
        if (!started) return;
        e.preventDefault();
        handleTogglePause();
      } else if (e.key === "Escape") {
        if (!started || completed) return;
        e.preventDefault();
        handleExitWalkthrough();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sectionInView, exited, started, completed, cardStep]);

  const activeCardHotspots = useMemo(
    () => (cardStep >= 0 ? CARD_GROUPS[cardStep] : []),
    [cardStep],
  );

  // Utilization Rate's column onward sits past the fold — auto-scrolls the
  // table right the moment cardStep reaches it, concurrent with that card's
  // own reveal (the old scroll-pin version had a dedicated pre-beat for
  // this scroll; the card player has no sub-beat concept, so this is a
  // known, visible behavior change — scroll and tooltip now happen at the
  // same time instead of scroll-then-reveal).
  const scrolledRight = cardStep >= UTILIZATION_GROUP_INDEX;

  // Fills the space below the nav, minus ImgCard's own chrome (caption +
  // padding), measured directly — same approach as the Overview embeds.
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const pinEl = pinRef.current;
      const embedWrapper = embedWrapperRef.current;
      if (!pinEl || !embedWrapper) return;
      const navHeight = document.querySelector("nav")?.getBoundingClientRect().height ?? 0;
      const chrome = pinEl.offsetHeight - embedWrapper.offsetHeight;
      setViewportHeight(Math.max(window.innerHeight - navHeight - chrome, 200));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Fade-in + countdown start, gated on scroll — same convention as
  // Overview's own entrance (1s, power2.out, y 500 → 0), triggered once the
  // preceding "All Software View" text block scrolls fully out of sight.
  useEffect(() => {
    const container = pinRef.current;
    const labelBlock = document.querySelector<HTMLElement>(
      `.${CSS.escape(pageStyles.allSoftwareViewTextBlock)}`,
    );
    if (!container || !labelBlock) return;

    let overflowLocked = false;
    let prevOverflow = "";

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(container, { opacity: 0, y: 500 });
        ScrollTrigger.create({
          trigger: labelBlock,
          start: "bottom top",
          once: true,
          onEnter: () => {
            prevOverflow = document.documentElement.style.overflow;
            document.documentElement.style.overflow = "hidden";
            overflowLocked = true;
            gsap.to(container, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              onComplete: () => {
                document.documentElement.style.overflow = prevOverflow;
                overflowLocked = false;
              },
            });
            setCountdown(COUNTDOWN_DURATION_MS / 1000);
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(container, { opacity: 1 });
        ScrollTrigger.create({
          trigger: labelBlock,
          start: "bottom top",
          once: true,
          onEnter: () => setCountdown(COUNTDOWN_DURATION_MS / 1000),
        });
      });
    });

    return () => {
      if (overflowLocked) document.documentElement.style.overflow = prevOverflow;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Header progress track — one continuous segment during the countdown,
  // reverting to the familiar per-hotspot segmented track once cards are
  // actually stepping. Never reset on `exited` — stays frozen at its last
  // position instead of disappearing (same as Overview's track).
  const isCountdown = cardStep < 0 && countdown !== null;
  const trackProgressSteps = isCountdown ? 1 : CARD_GROUPS.length;
  const trackActiveStep = isCountdown ? 0 : cardStep;
  const trackActiveStepDurationMs = isCountdown
    ? COUNTDOWN_DURATION_MS
    : activeStepDurationMs;
  const trackPaused = paused || exited;

  return (
    <div ref={pinRef} className={pageStyles.prototypeEmbedFade}>
      <ImgCard
        variant="embed"
        caption="All Software Prototype 01"
        allowOverflow
        progressSteps={trackProgressSteps}
        activeStep={trackActiveStep}
        activeStepDurationMs={trackActiveStepDurationMs}
        paused={trackPaused}
      >
        <div ref={embedWrapperRef} style={{ position: "relative" }}>
          <LiveEmbed
            nativeWidth={1440}
            className={pageStyles.prototypeEmbedRounded}
            viewportHeight={viewportHeight ?? undefined}
            disableCanvasTransition
          >
            <AllSoftwareLegacy
              disableVerticalScroll
              disableHorizontalScroll
              scrollToX={scrolledRight ? "end" : "start"}
            />
          </LiveEmbed>
          {!exited && activeCardHotspots.length > 0 && (
            <AnnotationConnectorHotspot
              containerRef={embedWrapperRef}
              nativeWidth={1440}
              hotspots={activeCardHotspots}
            />
          )}
        </div>
      </ImgCard>
    </div>
  );
}
