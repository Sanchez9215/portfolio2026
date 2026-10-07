"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

export interface PlacementPoint {
  x: number;
  y: number;
}

// Shared manual-tuning primitive: direct-manipulation drag (grab an element,
// it follows the pointer, nothing snaps back) plus a console.log of the
// current set of positions after every drag, so the dev can copy that log
// and paste the final values back to hardcode as the real layout. Built for
// FrameworkAdaptationEyes' scatter eyes; same shape also fits SoftwareSystemMap/
// CmdbSystemMap's hub/leaf drag when their placement needs the same
// log-and-paste treatment.
export function useDragPlacementLogger<K extends string>(
  containerRef: RefObject<HTMLElement | null>,
  label: string,
  initialPositions: Partial<Record<K, PlacementPoint>> = {},
) {
  const [positions, setPositions] =
    useState<Partial<Record<K, PlacementPoint>>>(initialPositions);
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  function logPlacements() {
    // eslint-disable-next-line no-console
    console.log(`[${label}]`, JSON.stringify(positionsRef.current, null, 2));
  }

  function startDrag(key: K, e: ReactPointerEvent<Element>) {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const targetEl = e.currentTarget;
    targetEl.setPointerCapture(e.pointerId);

    const toLocal = (clientX: number, clientY: number) => {
      const rect = containerEl.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    // Grab offset between the pointer and the element's own real current
    // center (not its stored position, which may use a different
    // convention — e.g. a corner-based CSS placement that's never been
    // dragged before) — keeps the point you grabbed locked under the
    // cursor instead of the element jumping to center-under-cursor on the
    // first move.
    const targetRect = targetEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const initialCenter = {
      x: targetRect.left + targetRect.width / 2 - containerRect.left,
      y: targetRect.top + targetRect.height / 2 - containerRect.top,
    };
    const startLocal = toLocal(e.clientX, e.clientY);
    const grabDelta = {
      x: startLocal.x - initialCenter.x,
      y: startLocal.y - initialCenter.y,
    };

    const handleMove = (ev: PointerEvent) => {
      const p = toLocal(ev.clientX, ev.clientY);
      setPositions((prev) => ({
        ...prev,
        [key]: { x: p.x - grabDelta.x, y: p.y - grabDelta.y },
      }));
    };
    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      logPlacements();
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return { positions, startDrag, logPlacements };
}
