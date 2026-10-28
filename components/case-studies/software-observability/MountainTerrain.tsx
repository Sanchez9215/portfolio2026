"use client";

import { useEffect, useRef, useState } from "react";
import {
  COLS,
  FAR,
  HORIZON,
  NEAR_BASE,
  PEAK_PX,
  PLANE_HALF_WIDTH,
  heightAt,
} from "./terrain";
import styles from "./MountainTerrain.module.css";

// Ridgeline terrain in perspective: a height field built from simplex noise
// (one tall pointed central peak, low foothills around it) on a ground plane,
// drawn as horizontal lines from the far rows to the near ones. Each row is
// filled with the page background before it is stroked, so nearer ridges hide
// the lines behind them. Static — drawn on mount, on resize and when the line
// detail changes. All the numbers below are first-pass look tunables.

export const DEFAULT_LINES = 50; // how many ridge lines the mountain has (more = denser)
const MIN_LINES = 30; // lowest the "Line detail" slider goes
const MAX_LINES = 220; // highest the "Line detail" slider goes
// How fast the lines fade from grey-500 to grey-1000 below the MVP box.
// 1 = steady fade. Lower (0.3) = goes dark right away, more contrast.
// Higher (2) = stays light, then goes dark near the bottom.
const GRADIENT_FALLOFF = 0.2;
const GRADIENT_STOPS = 10; // smoothness of the fade (more = smoother, no visible effect past ~24)

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const LINE_ALPHA_FAR = 0.45; // stroke opacity of the farthest row (nearest = 1)

// Terrain samples depend on the line count, not the canvas size, so they are
// cached per line count (and computed on first use, not at import).
const cache = new Map<number, { rows: Float32Array[]; max: number }>();
export function getSamples(lines: number) {
  const hit = cache.get(lines);
  if (hit) return hit;
  const rows: Float32Array[] = [];
  let max = 0;
  for (let r = 0; r < lines; r++) {
    const z = r / (lines - 1); // 0 near .. 1 far
    const row = new Float32Array(COLS);
    for (let c = 0; c < COLS; c++) {
      const x = (c / (COLS - 1)) * 2 - 1;
      const h = heightAt(x, z);
      max = Math.max(max, h);
      row[c] = h;
    }
    rows.push(row);
  }
  const result = { rows, max };
  cache.set(lines, result);
  return result;
}

interface MountainTerrainProps {
  /** Shows a "Line detail" slider under the canvas, for tuning. */
  controls?: boolean;
  /** Canvas-height fraction down to which the lines stay solid grey-500; below
   *  it they ease to grey-1000 at the lowest ridge, and the far-to-near opacity
   *  fade is off (the gradient carries the visibility change). */
  solidUntil?: number;
}

export default function MountainTerrain({
  controls = false,
  solidUntil,
}: MountainTerrainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState(DEFAULT_LINES);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const css = getComputedStyle(canvas);
      // Body color of the mountain: --mountain-fill (opt-in hook) or the page surface.
      const background =
        css.getPropertyValue("--mountain-fill").trim() ||
        css.getPropertyValue("--surface-base").trim();
      // Transparent sky, so the page center line shows down to the summit.
      ctx.clearRect(0, 0, width, height);
      const lineColor = css.getPropertyValue("--color-grey-500").trim();
      if (solidUntil === undefined) {
        ctx.strokeStyle = lineColor;
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, height * NEAR_BASE);
        // The MVP zone (top → the MVP box's bottom) can take its own color via
        // --mountain-mvp-line-color (opt-in hook); below it the lines fade out.
        const mvpColor =
          css.getPropertyValue("--mountain-mvp-line-color").trim() || lineColor;
        const from = hexToRgb(mvpColor);
        // The lines fade toward --mountain-line-end (opt-in hook) near the base;
        // default grey-1000. Setting it to the line color keeps them constant.
        const to = hexToRgb(
          css.getPropertyValue("--mountain-line-end").trim() ||
            css.getPropertyValue("--color-grey-1000").trim(),
        );
        const solid = Math.min(solidUntil / NEAR_BASE, 1);
        gradient.addColorStop(0, mvpColor);
        gradient.addColorStop(solid, mvpColor);
        for (let i = 1; i <= GRADIENT_STOPS; i++) {
          const t = i / GRADIENT_STOPS;
          const mix = Math.pow(t, GRADIENT_FALLOFF);
          const [r, g, b] = from.map((v, k) =>
            Math.round(v + (to[k] - v) * mix),
          );
          gradient.addColorStop(solid + (1 - solid) * t, `rgb(${r} ${g} ${b})`);
        }
        ctx.strokeStyle = gradient;
      }
      ctx.lineWidth = 1;
      ctx.lineJoin = "round";

      // Far rows fade to LINE_ALPHA_FAR; --mountain-line-far-alpha (opt-in hook, 1 =
      // no fade) overrides it.
      const farAlpha =
        parseFloat(css.getPropertyValue("--mountain-line-far-alpha")) ||
        LINE_ALPHA_FAR;
      const { rows, max } = getSamples(lines);
      const cx = width / 2;
      const horizonY = height * HORIZON;
      const nearY = height * NEAR_BASE;
      let tipX = cx;
      let tipY = Infinity;
      // Far rows first, so nearer rows paint over them.
      for (let r = lines - 1; r >= 0; r--) {
        const t = r / (lines - 1);
        const scale = 1 / (1 + t * FAR);
        const baselineY = horizonY + (nearY - horizonY) * scale;
        const lift = (height * PEAK_PX * scale) / max;
        const halfWidth = width * PLANE_HALF_WIDTH * scale;
        const row = rows[r];

        const trace = () => {
          for (let c = 0; c < COLS; c++) {
            const x = cx + ((c / (COLS - 1)) * 2 - 1) * halfWidth;
            const y = baselineY - row[c] * lift;
            if (y < tipY) {
              tipY = y;
              tipX = x;
            }
            if (c === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        };

        // Fill below this row (inside the plane) with the background to hide
        // the rows behind it, then stroke just the ridge.
        ctx.beginPath();
        trace();
        ctx.lineTo(cx + halfWidth, height);
        ctx.lineTo(cx - halfWidth, height);
        ctx.closePath();
        ctx.fillStyle = background;
        ctx.fill();

        ctx.beginPath();
        trace();
        ctx.globalAlpha =
          solidUntil === undefined
            ? farAlpha + (1 - farAlpha) * (1 - t)
            : 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Marks the summit for PageCenterLine's endAbove (the canvas is the
      // wrap's first child, so canvas coordinates are wrap coordinates).
      const tip = tipRef.current;
      if (tip) {
        tip.style.left = `${tipX}px`;
        tip.style.top = `${tipY}px`;
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [lines, solidUntil]);

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="Line illustration of a tall central mountain over low foothills"
      />
      <span ref={tipRef} data-peak-tip className={styles.tip} aria-hidden />
      {controls && (
        <label className={styles.control}>
          Line detail
          <input
            type="range"
            min={MIN_LINES}
            max={MAX_LINES}
            step={5}
            value={lines}
            onChange={(e) => setLines(Number(e.target.value))}
          />
          <span>{lines}</span>
        </label>
      )}
    </div>
  );
}
