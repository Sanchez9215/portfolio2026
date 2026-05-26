"use client";

/**
 * BounceCanvas — DVD-screensaver SVG toy
 *
 * Auto-movement: slow gentle bounce via GSAP ticker
 * Drag:          GSAP Draggable — grab / grabbing cursor
 * Throw:         GSAP InertiaPlugin — momentum on release
 * Bounce:        onThrowUpdate detects edge hits, kills tween immediately,
 *                reflects velocity and hands control back to ticker — no delay
 * Resume:        onThrowComplete fallback when no edge is hit
 * Nudge:         onClick while bouncing → small random velocity kick
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import styles from "./BounceCanvas.module.css";

gsap.registerPlugin(Draggable, InertiaPlugin);

const SVG_W = 160;
const SVG_H = 160;
const AUTO_SPEED = 2.5; // px/frame at 60fps — set by user
const NUDGE_V = 1; // px/frame added per nudge axis

export default function BounceCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    /* ── state ────────────────────────────────────────────── */
    let x = Math.random() * Math.max(0, container.offsetWidth - SVG_W);
    let y = Math.random() * Math.max(0, container.offsetHeight - SVG_H);
    let vx = AUTO_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let vy = AUTO_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let paused = false;
    let prevThrowX = x;
    let prevThrowY = y;

    gsap.set(svg, { x, y });

    /* ── ticker — auto-bounce + post-throw friction ───────── */
    const tick = () => {
      if (paused) return;

      const maxX = container.offsetWidth - SVG_W;
      const maxY = container.offsetHeight - SVG_H;
      const dt = gsap.ticker.deltaRatio(60);

      // Gently settle post-throw speed back toward AUTO_SPEED
      const speed = Math.hypot(vx, vy);
      if (speed > AUTO_SPEED + 0.1) {
        vx *= 0.97;
        vy *= 0.97;
      } else if (speed < AUTO_SPEED * 0.9) {
        const s = AUTO_SPEED / Math.max(speed, 0.01);
        vx *= s;
        vy *= s;
      }

      x += vx * dt;
      y += vy * dt;

      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
      }
      if (x >= maxX) {
        x = maxX;
        vx = -Math.abs(vx);
      }
      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
      }
      if (y >= maxY) {
        y = maxY;
        vy = -Math.abs(vy);
      }

      gsap.set(svg, { x, y });
    };

    gsap.ticker.add(tick);

    /* ── Draggable + InertiaPlugin ────────────────────────── */
    Draggable.create(svg, {
      type: "x,y",
      bounds: container,
      inertia: true,
      cursor: "grab",
      activeCursor: "grabbing",

      onPress() {
        paused = true;
        prevThrowX = Number(gsap.getProperty(svg, "x"));
        prevThrowY = Number(gsap.getProperty(svg, "y"));
      },

      onThrowUpdate() {
        const cx = Number(gsap.getProperty(svg, "x"));
        const cy = Number(gsap.getProperty(svg, "y"));
        const maxX = container.offsetWidth - SVG_W;
        const maxY = container.offsetHeight - SVG_H;

        // Per-frame delta velocity from InertiaPlugin movement
        const dvx = cx - prevThrowX;
        const dvy = cy - prevThrowY;
        prevThrowX = cx;
        prevThrowY = cy;

        const hitX = cx <= 1 || cx >= maxX - 1;
        const hitY = cy <= 1 || cy >= maxY - 1;

        if (hitX || hitY) {
          // Reflect velocity and immediately hand to ticker — no delay
          vx = hitX ? -dvx : dvx;
          vy = hitY ? -dvy : dvy;
          x = Math.max(0, Math.min(maxX, cx));
          y = Math.max(0, Math.min(maxY, cy));
          gsap.set(svg, { x, y });
          gsap.killTweensOf(svg);
          paused = false;
        } else {
          x = cx;
          y = cy;
        }
      },

      onThrowComplete() {
        // Fallback: no edge hit — read final position, resume gently
        x = Number(gsap.getProperty(svg, "x"));
        y = Number(gsap.getProperty(svg, "y"));
        const angle = Math.atan2(vy || 1, vx || 1);
        vx = Math.cos(angle) * AUTO_SPEED;
        vy = Math.sin(angle) * AUTO_SPEED;
        paused = false;
      },

      onClick() {
        // Nudge in a random direction
        vx += (Math.random() - 0.5) * 2 * NUDGE_V;
        vy += (Math.random() - 0.5) * 2 * NUDGE_V;
        paused = false;
      },
    });

    return () => {
      gsap.ticker.remove(tick);
      Draggable.get(svg)?.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={svgRef}
        src="/SVG/happyAgents.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        width={SVG_W}
        height={SVG_H}
        className={styles.svg}
      />
    </div>
  );
}
