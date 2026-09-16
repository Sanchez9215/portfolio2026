"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import LiveEmbed from "@/components/LiveEmbed";
import Button from "@/components/Button";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import styles from "./Timeline.module.css";

export type TimelineMilestone =
  | "prototype1"
  | "intent"
  | "insights"
  | "prototype2"
  | "decisions";

const MILESTONES: { key: TimelineMilestone; label: string }[] = [
  { key: "prototype1", label: "Prototype 01" },
  { key: "intent", label: "Design Intent" },
  { key: "insights", label: "Learnings" },
  { key: "prototype2", label: "Prototype 02" },
  { key: "decisions", label: "Decisions" },
];

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
  started: boolean;
  onStartNow: () => void;
  onExitWalkthrough: () => void;
  onStartWalkthrough: () => void;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6.66699 15.8337V4.16699L15.8337 10.0003L6.66699 15.8337Z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Path data from /public/icons/replay.svg (its alpha mask dropped — the mask
// rect covers the full 24x24 viewBox, so it's a no-op — and fill swapped to
// currentColor, same convention as CloseIcon/PlayIcon above).
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

// The player button itself stays a single mounted <Button> (see its one
// call site below) — only this inner icon+label content crossfades on every
// change to `swapKey` (Start Now ⇄ Exit ⇄ Restart). Outgoing content
// fades+slides up and out while incoming simultaneously fades+slides up
// from below (overlapping, both 0.185s); the previous icon+label is kept
// mounted as an absolutely-positioned overlay on top of the new (normal-
// flow) content until its own exit tween finishes, then dropped. Rendered
// as Button's `children` (icon left unset) so it lands inside Button's own
// `.label` span — icon size/gap come from the same --button-icon-size/
// --button-gap vars .m/.playerButton already set, inherited through the DOM.
function PlayerButtonContent({
  swapKey,
  icon,
  label,
}: {
  swapKey: string;
  icon: React.ReactNode;
  label: string;
}) {
  const [outgoing, setOutgoing] = useState<{
    key: string;
    icon: React.ReactNode;
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
          <span className={styles.playerButtonIcon}>{outgoing.icon}</span>
          {outgoing.label}
        </span>
      )}
      <span ref={currentRef} className={styles.playerButtonContentLayer}>
        <span className={styles.playerButtonIcon}>{icon}</span>
        {label}
      </span>
    </span>
  );
}

interface TimelineProps {
  /** Which milestone is current — synced to OverviewPrototypeHotspots' own
   *  phase/cardStep state (see page.tsx). Purely presentational otherwise —
   *  this component knows nothing about the card player's own mechanics. */
  activeMilestone: TimelineMilestone;
  /** Fires when a milestone row is clicked — the card player jumps straight
   *  to that milestone. */
  onSelectMilestone?: (milestone: TimelineMilestone) => void;
  /** Fires when the Prototype 02 thumbnail is clicked — the card player jumps
   *  straight to the Decisions phase. */
  onSelectPrototype2?: () => void;
  /** Countdown/exited/started + the 3 handler functions — see PlayerState
   *  above. Undefined until OverviewPrototypeHotspots reports its first
   *  state (its own onPlayerStateChange effect), so every field here is
   *  optional and the whole player block renders nothing until then. */
  player?: PlayerState;
}

// Sidebar stepper next to the Overview Prototype 1/2 card player (Figma node
// 941:774) — a "Timeline" label, a hint line, a dashed vertical connector,
// and 5 clickable milestone rows (the current one bolded) that jump the card
// player straight to that part of the walkthrough. Below it, a live (but
// non-interactive) mini preview of Prototype 02 itself — a second real mount
// of OverviewScreen, same component the main card player swaps to during the
// "switching"/"decisions" phases, just scaled down. No viewportHeight passed
// to LiveEmbed, so it hugs the content's real scaled height exactly — no
// fixed-aspect crop, no extra empty space below it.
export default function Timeline({
  activeMilestone,
  onSelectMilestone,
  onSelectPrototype2,
  player,
}: TimelineProps) {
  // Which button occupies the shared slot right now (Figma node 941:810's
  // "Start Now" position) — swaps as the walkthrough progresses: counting
  // down/not yet started → Start Now, started → Exit, exited → Restart.
  const buttonConfig = player
    ? player.exited
      ? {
          key: "restart",
          icon: <ReplayIcon />,
          label: "Restart",
          onClick: player.onStartWalkthrough,
        }
      : player.started
        ? {
            key: "exit",
            icon: <CloseIcon />,
            label: "Exit",
            onClick: player.onExitWalkthrough,
          }
        : {
            key: "start-now",
            icon: <PlayIcon />,
            label: "Start Now",
            onClick: player.onStartNow,
          }
    : null;

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
            {buttonConfig && (
              <Button
                variant="secondary"
                disableHoverSlide
                size="m"
                onClick={buttonConfig.onClick}
                className={styles.playerButton}
              >
                <PlayerButtonContent
                  swapKey={buttonConfig.key}
                  icon={buttonConfig.icon}
                  label={buttonConfig.label}
                />
              </Button>
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
            </div>
          </div>
        )}
        <div className={styles.block}>
          <div className={styles.blockLabelGroup}>
            <span className={styles.heading}>Timeline</span>
            <p className={styles.hint}>Click any step to skip to that point.</p>
          </div>
          <div className={styles.rows}>
            {MILESTONES.map((m) => {
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
      {/* Not a real <button> — OverviewScreen renders its own real <button>s
          internally (nav, filters, etc.), and a <button> can't contain
          another <button> without breaking hydration. role="button" +
          keyboard handling gives the same semantics/a11y instead. */}
      <div
        role="button"
        tabIndex={0}
        className={styles.preview}
        onClick={onSelectPrototype2}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectPrototype2?.();
          }
        }}
        aria-label="Skip to Prototype 02"
      >
        <span className={styles.previewLabelWrap}>
          <span className={styles.previewSkipTo}>Skip to...</span>
          <span className={styles.previewLabel}>Prototype 02</span>
        </span>
        <div className={styles.previewBox}>
          <div className={styles.previewInteractionBlock}>
            <LiveEmbed nativeWidth={1440} disableCanvasTransition>
              <OverviewScreen
                showLogos={false}
                showUtilizationTags={false}
                showScrollFade={false}
                showOpportunity={false}
                lockTableScroll
              />
            </LiveEmbed>
          </div>
        </div>
      </div>
    </div>
  );
}
