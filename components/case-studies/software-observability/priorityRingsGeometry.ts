import {
  FAR,
  HERO,
  HORIZON,
  NEAR_BASE,
  PEAK_PX,
  PLANE_HALF_WIDTH,
  heightAt,
} from "./terrain";

// Contour rings of the shared terrain, projected the way MountainTerrain does
// (same perspective, same peak height), so the rings read as slices of that
// mountain. Ring 1 is the tight loop around the summit; each next ring is a
// lower contour, the loop that still encloses the summit (foothills never
// split a ring in two).

const GRID_X = 201; // odd, so a column sits on x = 0
const GRID_Z = 201;
// The summit: the highest screen point of the terrain (found offline, row 25 of
// 50 at x = 0 — see MountainTerrain). Contours are the loops that enclose it.
export const SUMMIT = { x: 0, z: 25 / 49 };

type Point = { x: number; z: number };

let grid: Float32Array | null = null;
let maxHeight = 0;
function getGrid() {
  if (grid) return grid;
  grid = new Float32Array(GRID_X * GRID_Z);
  for (let j = 0; j < GRID_Z; j++) {
    const z = j / (GRID_Z - 1);
    for (let i = 0; i < GRID_X; i++) {
      const h = heightAt((i / (GRID_X - 1)) * 2 - 1, z);
      grid[j * GRID_X + i] = h;
      maxHeight = Math.max(maxHeight, h);
    }
  }
  return grid;
}

/** Height of the terrain's highest point (the 1.0 that ring levels scale). */
export function terrainMax() {
  getGrid();
  return maxHeight;
}

// Marching squares: one segment per crossed cell, endpoints named by the grid
// edge they sit on, so segments chain into loops by shared edge.
export type Contour = { points: Point[]; closed: boolean };

export function contourLoops(level: number): Contour[] {
  const g = getGrid();
  const at = (i: number, j: number) => g[j * GRID_X + i];
  const cross = (i0: number, j0: number, i1: number, j1: number) => {
    const a = at(i0, j0);
    const b = at(i1, j1);
    const t = (level - a) / (b - a);
    return {
      x: ((i0 + (i1 - i0) * t) / (GRID_X - 1)) * 2 - 1,
      z: (j0 + (j1 - j0) * t) / (GRID_Z - 1),
    };
  };
  // Edge ids: horizontal edge (i,j)-(i+1,j) = 2*(j*GRID_X+i); vertical edge
  // (i,j)-(i,j+1) = 2*(j*GRID_X+i)+1.
  const hId = (i: number, j: number) => 2 * (j * GRID_X + i);
  const vId = (i: number, j: number) => 2 * (j * GRID_X + i) + 1;
  const edgePoint = new Map<number, Point>();
  const links = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    (links.get(a) ?? links.set(a, []).get(a)!).push(b);
    (links.get(b) ?? links.set(b, []).get(b)!).push(a);
  };
  for (let j = 0; j < GRID_Z - 1; j++) {
    for (let i = 0; i < GRID_X - 1; i++) {
      const tl = at(i, j) >= level;
      const tr = at(i + 1, j) >= level;
      const bl = at(i, j + 1) >= level;
      const br = at(i + 1, j + 1) >= level;
      const code = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const top = hId(i, j);
      const bottom = hId(i, j + 1);
      const left = vId(i, j);
      const right = vId(i + 1, j);
      const need = (id: number, p: () => Point) => {
        if (!edgePoint.has(id)) edgePoint.set(id, p());
      };
      need(top, () => cross(i, j, i + 1, j));
      need(bottom, () => cross(i, j + 1, i + 1, j + 1));
      need(left, () => cross(i, j, i, j + 1));
      need(right, () => cross(i + 1, j, i + 1, j + 1));
      switch (code) {
        case 1: case 14: link(left, bottom); break;
        case 2: case 13: link(bottom, right); break;
        case 3: case 12: link(left, right); break;
        case 4: case 11: link(top, right); break;
        case 6: case 9: link(top, bottom); break;
        case 7: case 8: link(top, left); break;
        case 5: // saddle: tr + bl high
          link(top, left); link(bottom, right); break;
        case 10: // saddle: tl + br high
          link(top, right); link(left, bottom); break;
      }
    }
  }
  // Chains run from an open end when there is one (contours that leave the
  // terrain edge), so walk those first; whatever is left are closed loops.
  const loops: Contour[] = [];
  const seen = new Set<number>();
  const keys = Array.from(links.keys()).sort(
    (a, b) => (links.get(a)?.length ?? 0) - (links.get(b)?.length ?? 0),
  );
  for (const start of keys) {
    if (seen.has(start)) continue;
    const ids = [start];
    seen.add(start);
    let prev = -1;
    let cur = start;
    for (;;) {
      const next = (links.get(cur) ?? []).find((n) => n !== prev && !seen.has(n));
      if (next === undefined) break;
      ids.push(next);
      seen.add(next);
      prev = cur;
      cur = next;
    }
    loops.push({
      points: ids.map((id) => edgePoint.get(id)!),
      closed: (links.get(start)?.length ?? 0) > 1,
    });
  }
  return loops;
}

function encloses(loop: Point[], p: Point) {
  let inside = false;
  for (let a = 0, b = loop.length - 1; a < loop.length; b = a++) {
    const A = loop[a];
    const B = loop[b];
    if (
      A.z > p.z !== B.z > p.z &&
      p.x < ((B.x - A.x) * (p.z - A.z)) / (B.z - A.z) + A.x
    )
      inside = !inside;
  }
  return inside;
}

/** The contour loop at `level` (fraction of the terrain max) around the summit. */
export function ringLoop(levelFraction: number): Point[] | null {
  const level = levelFraction * terrainMax();
  return (
    contourLoops(level).find((l) => l.closed && encloses(l.points, SUMMIT))
      ?.points ?? null
  );
}

/** Plane point + height -> position in a W x H box (MountainTerrain's projection). */
export function project(
  p: Point,
  heightFraction: number,
  width: number,
  height: number,
) {
  const scale = 1 / (1 + p.z * FAR);
  const baselineY = height * (HORIZON + (NEAR_BASE - HORIZON) * scale);
  const lift = (height * PEAK_PX * scale) / terrainMax();
  return {
    x: width / 2 + p.x * width * PLANE_HALF_WIDTH * scale,
    y: baselineY - heightFraction * terrainMax() * lift,
  };
}

export { HERO };
