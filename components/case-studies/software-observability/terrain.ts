import { createNoise2D } from "simplex-noise";

// Shared terrain for MountainTerrain and PriorityRings: a height field built
// from simplex noise (one tall pointed central peak, low foothills around it)
// on a ground plane. x/z in plane space: x -1..1 across, z 0 near .. 1 far.
// Heights are relative to the hero crest (~1).

const SEED = 7;
export const COLS = 241; // samples per line (odd, so one column sits on the center line)
export const FAR = 1.2; // how much smaller the farthest row is than the nearest
export const HORIZON = 0.2; // top of the ground plane, fraction of canvas height
export const NEAR_BASE = 0.93; // near edge of the ground plane, fraction of canvas height
export const PLANE_HALF_WIDTH = 0.45; // near edge half-width, fraction of canvas width
export const PEAK_PX = 0.8; // hero crest height, fraction of canvas height

// Heights are relative to the hero (1). The foothills are ~1/7 of it, as in the
// reference. x/z in plane space: x -1..1 across, z 0 near .. 1 far.
const FOOTHILL = 1 / 7;
// x is nudged off 0 so the highest screen point lands exactly on the center column
// (checked offline against heightAt) — the page center line ends there.
export const HERO = { x: 0.03, z: 0.5, r: 0.2, sharpness: 1.1 };
const FOOTHILLS = [
  { x: -0.72, z: 0.45, r: 0.3, amp: 1.0 },
  { x: 0.7, z: 0.55, r: 0.28, amp: 0.9 },
  { x: -0.4, z: 0.85, r: 0.26, amp: 0.8 },
  { x: 0.42, z: 0.18, r: 0.26, amp: 0.7 },
  { x: -0.55, z: 0.12, r: 0.24, amp: 0.6 },
  { x: 0.2, z: 0.9, r: 0.24, amp: 0.8 },
];

// Small deterministic PRNG so the terrain is identical on every load.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const noise = createNoise2D(mulberry32(SEED));

function fbm(x: number, y: number, octaves: number) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return sum;
}

// 0..1, sharp crests — gives the peak a rocky, eroded character.
function ridged(x: number, y: number, octaves: number) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise(x * freq, y * freq));
    sum += amp * n * n;
    freq *= 2;
    amp *= 0.5;
  }
  return sum;
}

// Height at a plane point, relative to the hero crest (~1).
export function heightAt(x: number, z: number) {
  // Domain warp, so nothing is a clean cone.
  const wx = x + 0.08 * fbm(x * 2 + 11, z * 2, 3);
  const wz = z + 0.08 * fbm(x * 2, z * 2 + 23, 3);

  const d = Math.hypot(wx - HERO.x, (wz - HERO.z) * 1.1) / HERO.r;
  const hero =
    Math.exp(-Math.pow(d, HERO.sharpness)) *
    (0.8 + 0.4 * ridged(wx * 3, wz * 3, 4));

  let foothills = 0;
  for (const p of FOOTHILLS) {
    const pd = Math.hypot(wx - p.x, (wz - p.z) * 1.1) / p.r;
    foothills += p.amp * Math.exp(-pd * pd);
  }
  foothills = FOOTHILL * (foothills + 0.5 * fbm(wx * 3, wz * 3, 4));
  return hero + foothills;
}

