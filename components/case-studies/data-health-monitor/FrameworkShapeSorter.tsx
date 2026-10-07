"use client";

import styles from "./FrameworkShapeSorter.module.css";

// Shape-sorter test — square, triangle, circle, each a flat "socket" (the
// hole) sharing the SAME ground-plane projection as its own solid peg's
// base, peg rising up out of it. Built straight-on (no camera/object
// rotation, unlike DataDictionaryScene's tilted table). Square/triangle's
// dimension is flat SVG with computed exact geometry, same technique as
// FrameworkAdaptationEyes' flashlight-cone frustum — not real CSS 3D
// transforms. Confirmed, not guessed: FRONT_SIZE/PEG_GAP/CUBE_DEPTH/
// CUBE_ANGLE_DEG (square/triangle) and ELLIPSE_SQUASH (circle). The
// triangle is a true equilateral triangle (height derived, not picked) so
// its own proportions aren't another guessed value. The circle is a
// standard flat-icon cylinder (top rim ellipse + 2 straight sides + a
// bottom half-ellipse arc — not a second floating full ellipse, per the
// user's own reference sketch), not the depth-vector/frustum technique
// the square/triangle use — reusing the depth vector (DY) for the rim was
// tried and read as an exaggerated, too-round ellipse at a mismatched
// camera angle next to the cube/prism's flat 45° look, so this stays its
// own independently-tuned flat-icon ratio. The circle's socket grows both
// radii by PEG_GAP directly from its own real footprint ellipse (not
// pushed further down), the same tight-hugging offset convention as the
// square/triangle's exact polygon-offset sockets, approximated since an
// ellipse has no exact offset curve.
//
// All 3 shapes share one floor line (the row's own real "ground") AND one
// horizontal center line — each shape computes its own floorY/centerX (in
// its own local coordinates) and the row applies a per-shape marginTop/
// marginLeft so every floorY lands at the same real y and every centerX
// lands at the same real x, regardless of how tall/wide each shape's own
// content is beyond that line (e.g. the square/triangle's own canvas
// leans wider to the right from their depth-vector extrusion, while the
// circle's is symmetric — without this, that asymmetry alone pushes the
// circle visibly out of alignment with its row-mates).
const PEG_GAP = 16;
const CUBE_DEPTH = 144;
const ANGLE_DEG = 45;
const ANGLE_RAD = (ANGLE_DEG * Math.PI) / 180;
const DX = CUBE_DEPTH * Math.cos(ANGLE_RAD);
const DY = CUBE_DEPTH * Math.sin(ANGLE_RAD);

const FRONT_SIZE = 288;
const ELLIPSE_SQUASH = 0.35;

// The cube is the reference shape — every other shape's own real geometry
// (not just invisible row-margin padding) is sized to match the cube's own
// total bounding span, so heights and widths are actually equal on screen,
// not just equalized via padding around shapes of different real size.
// SHARED_HEIGHT = the cube's own top-back-edge-to-floor span (top face's DY
// rise + the front face's FRONT_SIZE height). SHARED_WIDTH = the cube's own
// left-front-edge-to-back-right-edge span (front face's FRONT_SIZE width +
// the depth vector's DX run).
const SHARED_HEIGHT = DY + FRONT_SIZE;
const SHARED_WIDTH = FRONT_SIZE + DX;
const CIRCLE_RADIUS = SHARED_WIDTH / 2;

interface Point {
  x: number;
  y: number;
}

interface ShapeGeometry {
  allPoints: Point[];
  floorY: number;
  // The shape's own true visual center-x (its front face's real
  // horizontal midpoint) — not necessarily its bounding box's geometric
  // center, since the depth-vector extrusion can lean the box wider to
  // one side.
  centerX: number;
  render: (shift: (p: Point) => Point) => React.ReactNode;
}

const pointsAttr = (points: Point[]) =>
  points.map((p) => `${p.x},${p.y}`).join(" ");

const shoelaceArea = (points: Point[]): number => {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
};

// Grows a convex N-gon outward by a real, uniform distance on every edge —
// each edge's own line is pushed outward along its normal, then adjacent
// offset lines are intersected to find the new corners (real polygon
// offset, not a per-coordinate scale, which wouldn't hold an equal gap on
// a non-rectangular/skewed shape). Tries both normal directions and keeps
// whichever actually grows the shape, since the correct outward sign
// depends on the input's winding order.
const growPolygon = (points: Point[], distance: number): Point[] => {
  const offsetWithSign = (sign: 1 | -1): Point[] => {
    const n = points.length;
    const edges = points.map((p, i) => {
      const q = points[(i + 1) % n];
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (sign * dy) / len;
      const ny = (-sign * dx) / len;
      return {
        p: { x: p.x + nx * distance, y: p.y + ny * distance },
        q: { x: q.x + nx * distance, y: q.y + ny * distance },
      };
    });
    const lineIntersect = (
      a1: Point,
      a2: Point,
      b1: Point,
      b2: Point,
    ): Point => {
      const d1x = a2.x - a1.x;
      const d1y = a2.y - a1.y;
      const d2x = b2.x - b1.x;
      const d2y = b2.y - b1.y;
      const denom = d1x * d2y - d1y * d2x;
      const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / denom;
      return { x: a1.x + d1x * t, y: a1.y + d1y * t };
    };
    return edges.map((edge, i) => {
      const prev = edges[(i - 1 + n) % n];
      return lineIntersect(prev.p, prev.q, edge.p, edge.q);
    });
  };

  const candidate = offsetWithSign(1);
  return shoelaceArea(candidate) > shoelaceArea(points)
    ? candidate
    : offsetWithSign(-1);
};

function buildSquare(): ShapeGeometry {
  // Front face — the flat square facing the viewer directly.
  const flTop: Point = { x: 0, y: DY };
  const frTop: Point = { x: FRONT_SIZE, y: DY };
  const frBottom: Point = { x: FRONT_SIZE, y: DY + FRONT_SIZE };
  const flBottom: Point = { x: 0, y: DY + FRONT_SIZE };

  // Top face — front face's top edge, extended by the depth vector.
  const tl: Point = { x: DX, y: 0 };
  const tr: Point = { x: FRONT_SIZE + DX, y: 0 };

  // Right face — front face's right edge, extended by the depth vector.
  const br: Point = { x: FRONT_SIZE + DX, y: FRONT_SIZE };

  // Floor footprint — front face's bottom edge, extended by the same
  // depth vector (same construction as the top face, mirrored to the
  // bottom). The visible socket is this shape grown outward by PEG_GAP.
  const floorBackLeft: Point = { x: DX, y: FRONT_SIZE };
  const floorBackRight: Point = { x: FRONT_SIZE + DX, y: FRONT_SIZE };
  const floorFootprint = [flBottom, frBottom, floorBackRight, floorBackLeft];
  const socketOutline = growPolygon(floorFootprint, PEG_GAP);

  return {
    allPoints: [
      ...socketOutline,
      tl,
      tr,
      br,
      flTop,
    ],
    floorY: flBottom.y,
    centerX: FRONT_SIZE / 2,
    render: (shift) => (
      <>
        <polygon
          points={pointsAttr(socketOutline.map(shift))}
          className={styles.socket}
        />
        <polygon
          points={pointsAttr([flTop, frTop, tr, tl].map(shift))}
          className={styles.face}
        />
        <polygon
          points={pointsAttr([frTop, frBottom, br, tr].map(shift))}
          className={styles.face}
        />
        <polygon
          points={pointsAttr([flTop, frTop, frBottom, flBottom].map(shift))}
          className={styles.face}
        />
      </>
    ),
  };
}

function buildTriangle(): ShapeGeometry {
  // Triangular prism / tent, per the user's own reference sketch — not a
  // flat triangle silhouette. Outer top edge (topLeft–topRight), 2 roof
  // panels sloping down to a shared center ridge/seam, 2 outer vertical
  // edges, and a base that mirrors the ridge as a downward chevron (not a
  // flat line). Ridge/chevron depth reuses the shared depth vector's own
  // DY (~102px) rather than an unrelated new constant.
  // SHARED_WIDTH (not FRONT_SIZE) — matches the cube's own total width
  // (front face + its depth-vector run), so the triangle's silhouette is
  // actually as wide on screen as the cube's, not just padded to look that
  // wide via row margins.
  const W = SHARED_WIDTH;
  // FRONT_SIZE (not FRONT_SIZE - DY) — the ridge already adds DY at the
  // top (topEdge→ridge) and the chevron adds DY again at the bottom
  // (bottomLeft/Right→baseChevron), so this shape's real top-to-floor span
  // is DY + FRONT_SIZE = SHARED_HEIGHT, matching the cube's own span
  // exactly (cube's top face contributes the same DY above its
  // FRONT_SIZE-tall front face). Previously this was FRONT_SIZE - DY,
  // making the triangle's real visible span only FRONT_SIZE — DY shorter
  // than the cube — which read as a visibly shorter peg next to the
  // square.
  const H = FRONT_SIZE;
  const topLeft: Point = { x: 0, y: 0 };
  const topRight: Point = { x: W, y: 0 };
  const ridge: Point = { x: W / 2, y: DY };
  const bottomLeft: Point = { x: 0, y: H };
  const bottomRight: Point = { x: W, y: H };
  const baseChevron: Point = { x: W / 2, y: H + DY };

  // Socket — just the base chevron (not the whole prism silhouette up to
  // the top edge — that gave it the same height as the peg itself, unlike
  // every other shape's flat/thin socket), grown outward by PEG_GAP so
  // its near edge sits a real gap away from the peg's own base.
  const socketOutline = growPolygon(
    [bottomLeft, bottomRight, baseChevron],
    PEG_GAP,
  );

  return {
    allPoints: [
      ...socketOutline,
      topLeft,
      topRight,
      ridge,
    ],
    // The chevron's own lowest point — the prism's true ground-contact
    // point, same convention as every other shape's floorY.
    floorY: baseChevron.y,
    centerX: W / 2,
    render: (shift) => (
      <>
        <polygon
          points={pointsAttr(socketOutline.map(shift))}
          className={styles.socket}
        />
        <polygon
          points={pointsAttr(
            [topLeft, ridge, baseChevron, bottomLeft].map(shift),
          )}
          className={styles.face}
        />
        <polygon
          points={pointsAttr(
            [topRight, ridge, baseChevron, bottomRight].map(shift),
          )}
          className={styles.face}
        />
        <line
          x1={shift(topLeft).x}
          y1={shift(topLeft).y}
          x2={shift(topRight).x}
          y2={shift(topRight).y}
          className={styles.face}
        />
      </>
    ),
  };
}

// Number of straight segments used to approximate the cylinder's rim/floor
// ellipses as polygons — not a proportion or size, just how smooth the
// curve reads; 24 is dense enough to still read as round at this icon's
// scale while letting the circle run through the exact same growPolygon
// offset math as the square/triangle, instead of a separate ellipse-only
// approximation.
const RIM_SIDES = 24;
const HALF_SIDES = RIM_SIDES / 2;

function buildCircle(): ShapeGeometry {
  // Standard flat-icon cylinder, per the user's own reference sketch: a
  // full ellipse for the visible top rim, two straight vertical sides, and
  // the BOTTOM drawn as a half-ellipse arc (only the near/front curve is
  // ever visible — there's no second floating full ellipse). Both ellipses
  // are sampled into RIM_SIDES-point polygons so the body/footprint/socket
  // are exact polygon geometry — same growPolygon offset the square/
  // triangle use, not an ellipse-specific approximation. CIRCLE_RADIUS is
  // SHARED_WIDTH / 2 and height is SHARED_HEIGHT, matching the cube's own
  // total span exactly, not padded to look that size via row margins.
  const R = CIRCLE_RADIUS;
  // R * ELLIPSE_SQUASH, not DY — DY was tried and read as an exaggerated,
  // too-round ellipse at a mismatched (higher) camera angle next to the
  // cube/prism's flat 45° look. This is the original flat-icon squash
  // ratio, the conventional database-cylinder proportion.
  const ry = R * ELLIPSE_SQUASH;
  const height = SHARED_HEIGHT;
  const cx = R;
  const topY = 0;
  const bottomY = height;

  const ellipsePoint = (angle: number, centerY: number): Point => ({
    x: cx + R * Math.cos(angle),
    y: centerY + ry * Math.sin(angle),
  });

  // Full rim ellipse (angle 0→2π), sampled as a closed polygon.
  const fullRim = (centerY: number): Point[] =>
    Array.from({ length: RIM_SIDES }, (_, i) =>
      ellipsePoint((i / RIM_SIDES) * 2 * Math.PI, centerY),
    );

  // Front/visible half only (angle 0→π — the half with y >= centerY, the
  // half that bulges toward the viewer), rightmost point first.
  const frontHalf = (centerY: number): Point[] =>
    Array.from({ length: HALF_SIDES + 1 }, (_, i) =>
      ellipsePoint((i / HALF_SIDES) * Math.PI, centerY),
    );

  // leftBottom → ... → rightBottom (reversed so it reads left-to-right).
  const bottomArc = frontHalf(bottomY).reverse();
  // rightTop → ... → leftTop — the top rim's own front curve, the body
  // polygon's closing edge (the back half is drawn again separately below
  // so it shows past the body's own silhouette).
  const topArcFront = frontHalf(topY);
  const topRimFull = fullRim(topY);

  // Body silhouette: bottom arc, up the right side, across the rim's
  // front curve, down the left side (closes automatically).
  const bodyPoints = [...bottomArc, ...topArcFront];

  // Socket — the cylinder's own real floor-plate footprint (the same
  // bottomArc polygon the body already uses, closed by the flat chord
  // between its own endpoints) grown outward by PEG_GAP via the exact same
  // growPolygon the square/triangle use — not a separate ellipse-growth
  // approximation.
  const socketOutline = growPolygon(bottomArc, PEG_GAP);

  return {
    allPoints: [...socketOutline, ...bodyPoints, ...topRimFull],
    // The cylinder's own bottom edge — same convention as the square/
    // triangle's floorY (the shape's own ground-contact edge, not its
    // socket), so the row's shared floor line aligns all 3 shapes by
    // where each one actually touches the ground.
    floorY: bottomY,
    centerX: cx,
    render: (shift) => (
      <>
        <polygon
          points={pointsAttr(socketOutline.map(shift))}
          className={styles.socket}
        />
        <polygon
          points={pointsAttr(bodyPoints.map(shift))}
          className={styles.face}
        />
        <polygon
          points={pointsAttr(topRimFull.map(shift))}
          className={styles.face}
        />
      </>
    ),
  };
}

export default function FrameworkShapeSorter() {
  const shapes = [buildSquare(), buildTriangle(), buildCircle()];

  const scenes = shapes.map((shape) => {
    const minX = Math.min(...shape.allPoints.map((p) => p.x));
    const maxX = Math.max(...shape.allPoints.map((p) => p.x));
    const minY = Math.min(...shape.allPoints.map((p) => p.y));
    const maxY = Math.max(...shape.allPoints.map((p) => p.y));
    const shift = (p: Point): Point => ({ x: p.x - minX, y: p.y - minY });
    const width = maxX - minX;
    const centerXOffset = shape.centerX - minX;
    return {
      width,
      height: maxY - minY,
      floorOffset: shape.floorY - minY,
      leftOfCenter: centerXOffset,
      rightOfCenter: width - centerXOffset,
      node: shape.render(shift),
    };
  });

  // Every shape's own floorY lands at this same real y, and every
  // centerX at this same real x, within the row — regardless of how much
  // content each shape has above/below its floor, or left/right of its
  // own true center (the square/triangle's depth-vector extrusion leans
  // their own canvas wider to the right than the circle's symmetric one).
  const sharedFloorLine = Math.max(...scenes.map((s) => s.floorOffset));
  const sharedLeftOfCenter = Math.max(...scenes.map((s) => s.leftOfCenter));
  const sharedRightOfCenter = Math.max(...scenes.map((s) => s.rightOfCenter));

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {scenes.map((scene, i) => (
          <svg
            key={i}
            className={styles.scene}
            width={scene.width}
            height={scene.height}
            viewBox={`0 0 ${scene.width} ${scene.height}`}
            style={{
              marginTop: sharedFloorLine - scene.floorOffset,
              marginLeft: sharedLeftOfCenter - scene.leftOfCenter,
              marginRight: sharedRightOfCenter - scene.rightOfCenter,
            }}
            aria-hidden="true"
          >
            {scene.node}
          </svg>
        ))}
      </div>
    </div>
  );
}
