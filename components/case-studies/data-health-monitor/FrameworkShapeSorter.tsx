"use client";

import { useEffect, useRef } from "react";
import * as Zdog from "zdog";
import styles from "./FrameworkShapeSorter.module.css";

// Real Zdog 3D solids, not hand-projected 2D SVG geometry. Square/
// triangle/circle are true 3D shapes sharing one SIZE for every dimension
// (Box's width/height/depth; the prism's equilateral base and its
// vertical extrusion height; the cylinder's diameter and length), so
// height/width consistency holds by construction instead of shared-span
// math reverse-engineered by hand. Every shape's footprint (what touches
// its socket) is its own true shape — square, triangle, circle — not a
// lying-down silhouette. All 3 render through their own Illustration/SVG
// but share the exact same SIZE, PEG_GAP, and camera rotation, so
// perspective and scale can't drift between them.
//
// Dashed-vs-solid stroke styling isn't a native Zdog feature (stroke is
// just a width + one color, no dasharray) — every body shape/socket is
// built with a FACE_MARKER/SOCKET_MARKER placeholder color, then right
// after the one-time static render, every generated SVG element carrying
// that marker color gets it stripped and swapped for the real
// styles.face/styles.socket CSS class (which carry the dashed/solid
// stroke), matching this codebase's existing wireframe convention: every
// body face dashed, only the floor/socket outline solid.
const SIZE = 288;
const PEG_GAP = 16;
const STROKE = 3;
const ROTATE_X = -Zdog.TAU / 8;
const ROTATE_Y = Zdog.TAU / 8;
const VIEW = 480;
const FACE_MARKER = "#ff00ff";
const SOCKET_MARKER = "#00ffff";

// True equilateral triangle, base = SIZE — matching the cube's edge/the
// cylinder's diameter exactly, same as every other shape's footprint
// width. Standing the prism upright (triangular footprint, vertical
// walls) rather than lying it on its side decouples the footprint's own
// in-plane proportions from the vertical extrusion height, so both width
// and height can match exactly with no equilateral-ratio conflict.
const TRIANGLE_BASE = SIZE;
const TRIANGLE_DEPTH = (TRIANGLE_BASE * Math.sqrt(3)) / 2;

interface Point2D {
  x: number;
  z: number;
}

// Same real polygon-offset technique the old 2D version used for its
// sockets, now applied to true, untransformed ground-plane (x/z)
// coordinates before any camera projection — exact, with no projection
// distortion left to approximate around.
const growXZ = (points: Point2D[], distance: number): Point2D[] => {
  const offsetWithSign = (sign: 1 | -1): Point2D[] => {
    const n = points.length;
    const edges = points.map((p, i) => {
      const q = points[(i + 1) % n];
      const dx = q.x - p.x;
      const dz = q.z - p.z;
      const len = Math.hypot(dx, dz) || 1;
      const nx = (sign * dz) / len;
      const nz = (-sign * dx) / len;
      return {
        p: { x: p.x + nx * distance, z: p.z + nz * distance },
        q: { x: q.x + nx * distance, z: q.z + nz * distance },
      };
    });
    const lineIntersect = (
      a1: Point2D,
      a2: Point2D,
      b1: Point2D,
      b2: Point2D,
    ): Point2D => {
      const d1x = a2.x - a1.x;
      const d1z = a2.z - a1.z;
      const d2x = b2.x - b1.x;
      const d2z = b2.z - b1.z;
      const denom = d1x * d2z - d1z * d2x;
      const t = ((b1.x - a1.x) * d2z - (b1.z - a1.z) * d2x) / denom;
      return { x: a1.x + d1x * t, z: a1.z + d1z * t };
    };
    return edges.map((edge, i) => {
      const prev = edges[(i - 1 + n) % n];
      return lineIntersect(prev.p, prev.q, edge.p, edge.q);
    });
  };
  const shoelace = (pts: Point2D[]): number => {
    let sum = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      sum += a.x * b.z - b.x * a.z;
    }
    return Math.abs(sum) / 2;
  };
  const candidate = offsetWithSign(1);
  return shoelace(candidate) > shoelace(points)
    ? candidate
    : offsetWithSign(-1);
};

const socketPath = (footprint: Point2D[]) =>
  growXZ(footprint, PEG_GAP).map((p) => ({ x: p.x, y: SIZE / 2, z: p.z }));

// Swaps every marker-colored SVG element for the real dashed/solid CSS
// classes, once, right after the static render.
const applyWireframeStyles = (svg: SVGSVGElement) => {
  svg.querySelectorAll("[fill], [stroke]").forEach((el) => {
    const fill = el.getAttribute("fill");
    const stroke = el.getAttribute("stroke");
    const isFace = fill === FACE_MARKER || stroke === FACE_MARKER;
    const isSocket = fill === SOCKET_MARKER || stroke === SOCKET_MARKER;
    if (!isFace && !isSocket) return;
    el.removeAttribute("fill");
    el.removeAttribute("stroke");
    el.classList.add(isFace ? styles.face : styles.socket);
  });
};

function useIllustration(build: (illo: Zdog.Illustration) => void) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const illo = new Zdog.Illustration({
      element: svg,
      zoom: 1,
      dragRotate: false,
      rotate: { x: ROTATE_X, y: ROTATE_Y },
    });
    build(illo);
    illo.updateRenderGraph();
    applyWireframeStyles(svg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return svgRef;
}

function CubeScene() {
  const svgRef = useIllustration((illo) => {
    new Zdog.Box({
      addTo: illo,
      width: SIZE,
      height: SIZE,
      depth: SIZE,
      color: FACE_MARKER,
      stroke: STROKE,
      fill: true,
    });

    const footprint: Point2D[] = [
      { x: -SIZE / 2, z: -SIZE / 2 },
      { x: SIZE / 2, z: -SIZE / 2 },
      { x: SIZE / 2, z: SIZE / 2 },
      { x: -SIZE / 2, z: SIZE / 2 },
    ];
    new Zdog.Shape({
      addTo: illo,
      path: socketPath(footprint),
      closed: true,
      color: SOCKET_MARKER,
      stroke: STROKE,
      fill: false,
    });
  });

  return (
    <svg ref={svgRef} className={styles.scene} width={VIEW} height={VIEW} />
  );
}

function PrismScene() {
  const svgRef = useIllustration((illo) => {
    // Standing upright — true equilateral triangle as both the top and
    // bottom face, 3 vertical rectangular walls between them. The peg's
    // footprint (what touches the socket) IS the triangle itself, same as
    // the cube's square footprint and the cylinder's round one — not a
    // tent lying on its side with a rectangular underside.
    const apexXZ: Point2D = { x: 0, z: 0 };
    const backLeftXZ: Point2D = { x: -TRIANGLE_BASE / 2, z: TRIANGLE_DEPTH };
    const backRightXZ: Point2D = { x: TRIANGLE_BASE / 2, z: TRIANGLE_DEPTH };
    const topY = -SIZE / 2;
    const bottomY = SIZE / 2;

    const apexTop = { ...apexXZ, y: topY };
    const backLeftTop = { ...backLeftXZ, y: topY };
    const backRightTop = { ...backRightXZ, y: topY };
    const apexBottom = { ...apexXZ, y: bottomY };
    const backLeftBottom = { ...backLeftXZ, y: bottomY };
    const backRightBottom = { ...backRightXZ, y: bottomY };

    const face = (path: Zdog.VectorOptions[]) =>
      new Zdog.Shape({
        addTo: illo,
        path,
        closed: true,
        color: FACE_MARKER,
        stroke: STROKE,
        fill: true,
      });

    face([apexTop, backLeftTop, backRightTop]);
    face([apexBottom, backLeftBottom, backRightBottom]);
    face([apexTop, apexBottom, backLeftBottom, backLeftTop]);
    face([apexTop, apexBottom, backRightBottom, backRightTop]);
    face([backLeftTop, backLeftBottom, backRightBottom, backRightTop]);

    // Footprint — the real triangle itself, grown by PEG_GAP the exact
    // same way the square's socket is grown, not a separate shape family.
    new Zdog.Shape({
      addTo: illo,
      path: socketPath([apexXZ, backLeftXZ, backRightXZ]),
      closed: true,
      color: SOCKET_MARKER,
      stroke: STROKE,
      fill: false,
    });
  });

  return (
    <svg ref={svgRef} className={styles.scene} width={VIEW} height={VIEW} />
  );
}

function CylinderScene() {
  const svgRef = useIllustration((illo) => {
    // Not Zdog's native Cylinder — it draws its side surface as a single
    // fat stroked line between the two cap centers (a stroke-width-as-
    // diameter trick), which has no real edge path to apply the dashed
    // .face stroke to and renders as a broken blob once dashed. Built
    // manually instead: 2 real Ellipse caps (exact 3D circles, correctly
    // projected under the shared camera) + an explicit flat quad for the
    // front-facing side, whose own left/right edges ARE the cylinder's
    // vertical sides.
    const R = SIZE / 2;
    const topY = -SIZE / 2;
    const bottomY = SIZE / 2;

    const leftTop = { x: -R, y: topY, z: 0 };
    const rightTop = { x: R, y: topY, z: 0 };
    const leftBottom = { x: -R, y: bottomY, z: 0 };
    const rightBottom = { x: R, y: bottomY, z: 0 };

    new Zdog.Shape({
      addTo: illo,
      path: [leftTop, leftBottom, rightBottom, rightTop],
      closed: true,
      color: FACE_MARKER,
      stroke: STROKE,
      fill: true,
    });

    new Zdog.Ellipse({
      addTo: illo,
      diameter: SIZE,
      translate: { y: topY },
      rotate: { x: -Zdog.TAU / 4 },
      color: FACE_MARKER,
      stroke: STROKE,
      fill: true,
    });
    new Zdog.Ellipse({
      addTo: illo,
      diameter: SIZE,
      translate: { y: bottomY },
      rotate: { x: -Zdog.TAU / 4 },
      color: FACE_MARKER,
      stroke: STROKE,
      fill: true,
    });

    new Zdog.Ellipse({
      addTo: illo,
      diameter: SIZE + PEG_GAP * 2,
      translate: { y: bottomY },
      rotate: { x: -Zdog.TAU / 4 },
      color: SOCKET_MARKER,
      stroke: STROKE,
      fill: false,
    });
  });

  return (
    <svg ref={svgRef} className={styles.scene} width={VIEW} height={VIEW} />
  );
}

export default function FrameworkShapeSorter() {
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <CubeScene />
        <PrismScene />
        <CylinderScene />
      </div>
    </div>
  );
}
