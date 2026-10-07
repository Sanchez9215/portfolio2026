"use client";

import { useEffect, useState } from "react";

// Pre-walkthrough countdown tick-down, shared by every card player (Overview
// Prototype 1/2, All Software Prototype 1, …). Ticks down by 1 every second
// while `active` and not `paused`, then holds at 0 — the caller decides what
// 0 means (usually: kick off the first card). Returns the raw state +
// setter so callers can start/restart/clear it (e.g. Replay resets to the
// full duration, Skip/Start Now null it out).
export function useCountdown(
  active: boolean,
  paused: boolean,
): [number | null, React.Dispatch<React.SetStateAction<number | null>>] {
  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (!active || countdown === null || countdown <= 0 || paused) return;
    const timer = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [active, countdown, paused]);

  return [countdown, setCountdown];
}
