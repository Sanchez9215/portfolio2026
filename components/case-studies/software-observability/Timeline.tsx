"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import Button from "@/components/Button";
import TestButton from "@/components/TestButton";
import styles from "./Timeline.module.css";

export interface TimelineMilestoneRow {
  key: string;
  label: string;
}

// Optional "skip to…" thumbnail block below the milestone rows — e.g.
// Overview's live Prototype 02 mini-preview. A player with only one thing to
// preview (or nothing else to jump to) omits this entirely. `label` (e.g.
// "Prototype 02") drives both the visible "Skip to…" title and the derived
// aria-label ("Skip to Prototype 02") — the "Skip to…" prefix itself stays
// fixed component copy, same as the Timeline heading/hint below.
export interface TimelinePreview {
  label: string;
  node: ReactNode;
  onSelect?: () => void;
}

// Lifted out of OverviewPrototypeHotspots (the state's real owner) up to
// OverviewPrototypeSection so both it and this sidebar can read/drive the
// same countdown/exited/started state — same relationship the existing
// `onMilestoneChange`/`activeMilestone` pair already has, just for a few
// more fields plus the 3 handler functions themselves (which have to keep
// living wherever phase/cardStep live, so they're handed up as-is rather
// than reimplemented here).
export interface PlayerState {
  countdown: number | null;
  exited: boolean;
  /** True once actively playing — real cards (or the switching hold)
   *  running, or a countdown-tail silently ticking after the first visit
   *  (Replay, or a Timeline jump back to Prototype 01). False during the
   *  genuine first-visit countdown (Play Now/Skip only, no Pause). */
  started: boolean;
  paused: boolean;
  /** True once the countdown has been used up once (ran out naturally, or
   *  was skipped/started-early) — a first-visit-only beat. Timeline's own
   *  `displayCountdown` freezes the last real value so its fade-out has
   *  something to animate; without this flag that frozen number would
   *  satisfy `!started` again on a later jump back to Prototype 01 and
   *  incorrectly reappear. */
  countdownUsed: boolean;
  /** True once the walkthrough has played through to Decisions' last card
   *  and is holding there — gates the "Replay" label once exited; every
   *  other exit (Skip, or Leave mid-walkthrough) reads "Resume" instead. */
  completed: boolean;
  onStartNow: () => void;
  onExitWalkthrough: () => void;
  /** Full reset to the top, then plays from there. Only ever shown once
   *  `completed` (see below) — labeled "Replay". */
  onStartWalkthrough: () => void;
  /** Plays from wherever phase/cardStep already are (frozen since Leave/Skip/
   *  a Timeline jump-while-exited) — no reset. Labeled "Resume", shown for
   *  every exit except the completed case. */
  onResume: () => void;
  onTogglePause: () => void;
  onSkip: () => void;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6.66699 15.8337V4.16699L15.8337 10.0003L6.66699 15.8337Z" fill="currentColor" />
    </svg>
  );
}

// Path data from Figma node 941:785 ("pause"), its alpha mask dropped (the
// mask rect covers the full 32x32 viewBox, so it's a no-op) and fill swapped
// to currentColor — same convention as ReplayIcon below.
function PauseIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M18.6667 25.3331V6.66641H24V25.3331H18.6667ZM8 25.3331V6.66641H13.3333V25.3331H8Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Path data from /public/icons/replay.svg (its alpha mask dropped — the mask
// rect covers the full 24x24 viewBox, so it's a no-op — and fill swapped to
// currentColor, same convention as PlayIcon/PauseIcon above).
function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M8.4875 21.2875C7.39583 20.8125 6.44583 20.1708 5.6375 19.3625C4.82917 18.5542 4.1875 17.6042 3.7125 16.5125C3.2375 15.4208 3 14.25 3 13H5C5 14.95 5.67917 16.6042 7.0375 17.9625C8.39583 19.3208 10.05 20 12 20C13.95 20 15.6042 19.3208 16.9625 17.9625C18.3208 16.6042 19 14.95 19 13C19 11.05 18.3208 9.39583 16.9625 8.0375C15.6042 6.67917 13.95 6 12 6H11.85L13.4 7.55L12 9L8 5L12 1L13.4 2.45L11.85 4H12C13.25 4 14.4208 4.2375 15.5125 4.7125C16.6042 5.1875 17.5542 5.82917 18.3625 6.6375C19.1708 7.44583 19.8125 8.39583 20.2875 9.4875C20.7625 10.5792 21 11.75 21 13C21 14.25 20.7625 15.4208 20.2875 16.5125C19.8125 17.6042 19.1708 18.5542 18.3625 19.3625C17.5542 20.1708 16.6042 20.8125 15.5125 21.2875C14.4208 21.7625 13.25 22 12 22C10.75 22 9.57917 21.7625 8.4875 21.2875Z"
        fill="currentColor"
      />
    </svg>
  );
}

// The player button itself stays a single mounted <Button>/<TestButton> (see
// its two call sites below — primary uses TestButton, secondary Button) —
// only this inner icon+label content crossfades on every change to
// `swapKey` (Start Now ⇄ Exit ⇄ Restart). Outgoing content fades+slides up
// and out while incoming simultaneously fades+slides up from below
// (overlapping, both 0.185s); the previous icon+label is kept mounted as an
// absolutely-positioned overlay on top of the new (normal-flow) content
// until its own exit tween finishes, then dropped. Rendered as `children`
// (icon left unset on the host component's own icon prop, where it has one)
// so it lands inside its `.label` span either way — icon size/gap come from
// the same --button-icon-size/--button-gap vars .playerButtonRow already
// sets, inherited through the DOM regardless of which component renders it.
function PlayerButtonContent({
  swapKey,
  icon,
  label,
}: {
  swapKey: string;
  icon: React.ReactNode | null;
  label: string;
}) {
  const [outgoing, setOutgoing] = useState<{
    key: string;
    icon: React.ReactNode | null;
    label: string;
  } | null>(null);
  const prevKeyRef = useRef(swapKey);
  const prevContentRef = useRef({ icon, label });
  const currentRef = useRef<HTMLSpanElement>(null);
  const outgoingRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prevKeyRef.current !== swapKey) {
      setOutgoing({ key: prevKeyRef.current, ...prevContentRef.current });
      prevKeyRef.current = swapKey;
    }
    prevContentRef.current = { icon, label };
  }, [swapKey, icon, label]);

  useEffect(() => {
    const el = currentRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, yPercent: 100 },
      { opacity: 1, yPercent: 0, duration: 0.185, ease: "power1.out" },
    );
  }, [swapKey]);

  useEffect(() => {
    if (!outgoing) return;
    const el = outgoingRef.current;
    if (!el) return;
    gsap.to(el, {
      opacity: 0,
      yPercent: -100,
      duration: 0.185,
      ease: "power1.in",
      onComplete: () =>
        setOutgoing((cur) => (cur?.key === outgoing.key ? null : cur)),
    });
  }, [outgoing]);

  return (
    <span className={styles.playerButtonContentStack}>
      {outgoing && (
        <span ref={outgoingRef} className={styles.playerButtonContentOutgoing}>
          {outgoing.icon && (
            <span className={styles.playerButtonIcon}>{outgoing.icon}</span>
          )}
          {outgoing.label}
        </span>
      )}
      <span ref={currentRef} className={styles.playerButtonContentLayer}>
        {icon && <span className={styles.playerButtonIcon}>{icon}</span>}
        {label}
      </span>
    </span>
  );
}

interface TimelineProps {
  /** The rows to render — one per named phase/step a card player has. A
   *  player with only one step still passes a single-item array (see
   *  AllSoftwarePrototype1Hotspots) rather than omitting rows entirely, so
   *  the fixed "Click any step to skip to that point." hint stays accurate. */
  milestones: TimelineMilestoneRow[];
  /** Which milestone key is current — synced to the card player's own
   *  phase/step state (see page.tsx). Purely presentational otherwise — this
   *  component knows nothing about any card player's own mechanics. */
  activeMilestone: string;
  /** Fires when a milestone row is clicked — the card player jumps straight
   *  to that milestone. */
  onSelectMilestone?: (milestone: string) => void;
  /** Optional "skip to…" thumbnail block below the rows — see
   *  TimelinePreview. Omitted entirely when a player has nothing else to
   *  preview (e.g. All Software Prototype 1, a single embed). */
  preview?: TimelinePreview;
  /** Countdown/exited/started + the handler functions — see PlayerState
   *  above. Undefined until the card player reports its first state (its own
   *  onPlayerStateChange effect), so every field here is optional and the
   *  whole player block renders nothing until then. */
  player?: PlayerState;
}

// Sidebar stepper next to a card player (Figma node 941:774, Overview
// Prototype 1/2's original) — a "Timeline" label, a hint line, a dashed
// vertical connector, and one clickable row per milestone (the current one
// bolded) that jumps the card player straight to that part of the
// walkthrough. Below it, an optional live "skip to…" preview block (see
// `preview` prop) — Overview passes a second, non-interactive mount of
// OverviewScreen (the embed the main card player swaps to during its
// "switching"/"decisions" phases); a single-step player like All Software
// Prototype 1 has nothing else to preview and omits it.
export default function Timeline({
  milestones,
  activeMilestone,
  onSelectMilestone,
  preview,
  player,
}: TimelineProps) {
  // Which button occupies the shared slot right now (Figma node 941:810's
  // "Start Now" position) — a primary+secondary pair that swaps as the
  // walkthrough progresses.
  // - not started (genuine first visit — the only reachable not-started,
  //   not-exited state) → Play Now + Skip
  // - started, playing → Pause + Leave
  // - started, paused → Play + Leave
  // - completed (reached Decisions' last card and is holding there) →
  //   Replay alone, no Leave — checked before `exited` so it takes over the
  //   instant playback actually finishes, not only once Leave is clicked;
  //   there's nothing left to leave once it's the end.
  // - exited, not completed (Skip, a mid-walkthrough Leave, or a Timeline
  //   jump while already exited) → Resume (plays from wherever phase/
  //   cardStep already are — see PlayerState.onResume)
  const primaryConfig = player
    ? player.completed
      ? {
          key: "replay",
          icon: <ReplayIcon />,
          label: "Replay",
          onClick: player.onStartWalkthrough,
        }
      : player.exited
        ? {
            key: "resume",
            icon: <PlayIcon />,
            label: "Resume",
            onClick: player.onResume,
          }
        : player.started
          ? player.paused
            ? {
                key: "play",
                icon: <PlayIcon />,
                label: "Play",
                onClick: player.onTogglePause,
              }
            : {
                key: "pause",
                icon: <PauseIcon />,
                label: "Pause",
                onClick: player.onTogglePause,
              }
          : {
              key: "play-now",
              icon: <PlayIcon />,
              label: "Play Now",
              onClick: player.onStartNow,
            }
    : null;

  const secondaryConfig =
    player && !player.exited && !player.completed
      ? player.started
        ? { key: "leave", label: "Leave", onClick: player.onExitWalkthrough }
        : { key: "skip", label: "Skip", onClick: player.onSkip }
      : null;

  // Leave's own shortcut row (Escape) only makes sense once Leave is
  // actually showing — not during the countdown (Skip covers that state via
  // its own button, no keyboard shortcut), not once exited, and not once
  // completed (no Leave to trigger at all in either case).
  const leaveShortcutVisible =
    !!player && player.started && !player.exited && !player.completed;

  // Primary button's slot smoothly grows/shrinks between its two widths
  // (100% alone vs. 50% next to a secondary) instead of snapping instantly
  // with the flex recalculation. FLIP: gated on hasSecondary specifically
  // (not a bare no-deps effect) — this component re-renders once a second
  // from the countdown tick alone, and without that guard the effect fired
  // on every one of those too, re-measuring and firing a fresh competing
  // tween on the same element each time (no `overwrite`), which is what
  // actually produced the glitching. prevWidthRef holds the settled width
  // from the *previous* hasSecondary state (stored at the end of the effect
  // that handled that transition), so it's always a real "before" value —
  // not a mid-tween one — to animate from.
  const hasSecondary = !!secondaryConfig;
  const primarySlotRef = useRef<HTMLDivElement>(null);
  const prevWidthRef = useRef<number | null>(null);
  const prevHasSecondaryRef = useRef(hasSecondary);
  useLayoutEffect(() => {
    const el = primarySlotRef.current;
    if (!el) return;
    const newWidth = el.getBoundingClientRect().width;
    const secondaryChanged = prevHasSecondaryRef.current !== hasSecondary;
    const prevWidth = prevWidthRef.current;
    if (
      secondaryChanged &&
      prevWidth != null &&
      Math.abs(prevWidth - newWidth) > 0.5
    ) {
      // flexBasis takes a raw number without a unit GSAP won't infer for it
      // (unlike width, which it auto-units in px) — neutralize flex's own
      // sizing (grow/shrink off, basis:auto) and animate plain `width`
      // instead, which GSAP handles correctly.
      gsap.fromTo(
        el,
        { flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: prevWidth },
        {
          width: newWidth,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true,
          onComplete: () =>
            gsap.set(el, {
              clearProps: "flexGrow,flexShrink,flexBasis,width",
            }),
        },
      );
    }
    prevWidthRef.current = newWidth;
    prevHasSecondaryRef.current = hasSecondary;
  }, [hasSecondary]);

  // Freezes the last real countdown value once player.countdown goes back to
  // null (Start Now/Restart clear it immediately on click) — without this,
  // the exit fade below would have nothing left to render for its last
  // frame. Once a number has shown, this element stays mounted permanently;
  // visibility itself is driven by countdownVisible + GSAP, not unmounting,
  // so the fade-down-and-out actually has something to animate.
  const [displayCountdown, setDisplayCountdown] = useState<number | null>(
    null,
  );
  useEffect(() => {
    if (player?.countdown != null) setDisplayCountdown(player.countdown);
  }, [player?.countdown]);
  // `!player.started` alone is sufficient — every not-yet-`started`,
  // not-exited state is now a genuine first visit (see primaryConfig above),
  // so this text never reappears on a later Replay or Timeline jump back to
  // Prototype 01.
  const countdownVisible =
    !!player && displayCountdown != null && !player.started && !player.exited;
  const countdownRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = countdownRef.current;
    if (!el) return;
    gsap.to(el, {
      opacity: countdownVisible ? 1 : 0,
      yPercent: countdownVisible ? 0 : 100,
      duration: 0.185,
      ease: countdownVisible ? "power1.out" : "power1.in",
    });
  }, [countdownVisible]);

  return (
    <div className={styles.timeline}>
      <div className={styles.topGroup}>
        {player && (
          <div className={styles.player}>
            {displayCountdown != null && (
              <span ref={countdownRef} className={styles.countdown}>
                Walkthrough starts in{" "}
                <strong className={styles.countdownValue}>
                  {String(displayCountdown).padStart(2, "0")}
                </strong>
              </span>
            )}
            {primaryConfig && (
              <div className={styles.playerButtonRow}>
                <div ref={primarySlotRef} className={styles.playerButtonSlot}>
                  <TestButton onClick={primaryConfig.onClick}>
                    <PlayerButtonContent
                      swapKey={primaryConfig.key}
                      icon={primaryConfig.icon}
                      label={primaryConfig.label}
                    />
                  </TestButton>
                </div>
                {secondaryConfig && (
                  <div className={styles.playerButtonSlot}>
                    <Button
                      variant="secondary"
                      disableHoverSlide
                      size="medium"
                      onClick={secondaryConfig.onClick}
                      className={styles.playerButtonSecondary}
                    >
                      <PlayerButtonContent
                        swapKey={secondaryConfig.key}
                        icon={null}
                        label={secondaryConfig.label}
                      />
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className={styles.shortcuts}>
              <div className={styles.shortcutRow}>
                <span className={styles.shortcutLabel}>Play/Pause</span>
                <span className={styles.shortcutPill}>Space Bar</span>
              </div>
              <div className={styles.shortcutRow}>
                <span className={styles.shortcutLabel}>Tooltip Navigation</span>
                <span className={styles.shortcutIconGroup}>
                  <span className={styles.shortcutIconPill}>
                    <img src="/icons/arrow_left.svg" alt="" />
                  </span>
                  <span className={styles.shortcutIconPill}>
                    <img src="/icons/arrow_right.svg" alt="" />
                  </span>
                </span>
              </div>
              {leaveShortcutVisible && (
                <div className={styles.shortcutRow}>
                  <span className={styles.shortcutLabel}>Leave Walkthrough</span>
                  <span className={styles.shortcutPill}>esc</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className={styles.block}>
          <div className={styles.blockLabelGroup}>
            <span className={styles.heading}>Timeline</span>
            <p className={styles.hint}>Click any step to skip to that point.</p>
          </div>
          <div className={styles.rows}>
            {milestones.map((m) => {
              const active = m.key === activeMilestone;
              return (
                <div
                  key={m.key}
                  role="button"
                  tabIndex={0}
                  className={styles.row}
                  onClick={() => onSelectMilestone?.(m.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectMilestone?.(m.key);
                    }
                  }}
                  aria-label={`Jump to ${m.label}`}
                >
                  <span
                    className={`${styles.dot}${active ? ` ${styles.dotActive}` : ""}`}
                  />
                  <span
                    className={`${styles.labelWrap}${active ? ` ${styles.labelWrapActive}` : ""}`}
                  >
                    <span
                      className={`${styles.label}${active ? ` ${styles.labelActive}` : ""}`}
                    >
                      {m.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Not a real <button> — the preview content (e.g. OverviewScreen) may
          render its own real <button>s internally (nav, filters, etc.), and a
          <button> can't contain another <button> without breaking hydration.
          role="button" + keyboard handling gives the same semantics/a11y
          instead. */}
      {preview && (
        <div
          role="button"
          tabIndex={0}
          className={styles.preview}
          onClick={preview.onSelect}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              preview.onSelect?.();
            }
          }}
          aria-label={`Skip to ${preview.label}`}
        >
          <span className={styles.previewLabelWrap}>
            <span className={styles.previewSkipTo}>Skip to...</span>
            <span className={styles.previewLabel}>{preview.label}</span>
          </span>
          <div className={styles.previewBox}>
            <div className={styles.previewInteractionBlock}>{preview.node}</div>
          </div>
        </div>
      )}
    </div>
  );
}
