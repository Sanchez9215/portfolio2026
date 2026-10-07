"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import AnnotationCallout from "../AnnotationCallout";
import CompanyLogo from "../../CompanyLogo";
import {
  getCmdbData,
  ALL_RELATIONSHIP_LABELS,
  type CmdbCategory,
  type CmdbRelationship,
} from "./cmdbData";
import styles from "./CmdbSunburst.module.css";

// Stable empty-array identity — used wherever a hovered CI has no
// relationships, so useMemo/useLayoutEffect dependencies don't see a new
// array reference on every render and re-trigger themselves.
const EMPTY_RELATIONSHIPS: CmdbRelationship[] = [];

// Full-sunburst geometry — ring widths are relative shares of the total
// radius (a "baseline" design at 332px total, see below). Sweeps the full
// 360°: angle 0° = east (right), 90° = south (bottom), 180° = west (left),
// 270° = north (top) — same convention point() has always used, just no
// longer clipped to the top half.
// Each BASELINE_* below is a proportional share of BASELINE_TOTAL, not an
// absolute size — ringsForRadius scales every one of them by
// totalRadius / BASELINE_TOTAL, where totalRadius is the real, measured
// radius the container actually has room for (see CmdbSunburst() below).
// Bumping one of these up without also growing totalRadius itself just
// gives that ring a bigger slice of the same total pie — it shrinks every
// other ring's real px, it doesn't add net space to the chart. These have
// been hand-tuned live across several sessions (Category/Class/Type grown
// repeatedly to read bigger, CI most recently bumped 120→160 to stop its
// labels overflowing their ring) — treat the numbers below as the current
// live-tuned state, not a fixed design spec.
// BASELINE_INNER doubled (72→144) to fit the fixed-height ServiceNow mark
// (see CENTER_LOGO_HEIGHT below) — paired with a matching height-cap grow
// in data-health-monitor.module.css (100vh → ~111vh, the same 728/656
// ratio BASELINE_TOTAL grew by) so Category/Class/Type/CI keep their exact
// current real px size instead of shrinking to make room for the hole.
const BASELINE_INNER = 144;
const BASELINE_CATEGORY = 96;
const BASELINE_CLASS = 164;
const BASELINE_TYPE = 164;
const BASELINE_CI = 160;
const BASELINE_TOTAL =
  BASELINE_INNER +
  BASELINE_CATEGORY +
  BASELINE_CLASS +
  BASELINE_TYPE +
  BASELINE_CI;

// Callout tooltip width — and the chart's own left start position — is
// derived from the page's own 12-column grid (.cs-grid in globals.css: 12
// columns, column-gap var(--spacing-xl)) rather than a fixed px.
// CmdbSunburst's container spans the section's full grid content width
// (cmdbSunburstContent is grid-column: 1 / -1), so its own measured width is
// that same 12-column row. The callouts occupy columns 1–4; the chart itself
// starts at column 5.
const GRID_COLUMNS = 12;
const GRID_GAP = 32; // matches --spacing-xl, .cs-grid's column-gap
const CALLOUT_COLUMN_SPAN = 4;
// Toggled off while the chart's flat edge orientation is being reworked —
// see the render usage below.
const SHOW_CALLOUTS = false;

interface Rings {
  categoryInner: number;
  categoryOuter: number;
  classInner: number;
  classOuter: number;
  typeInner: number;
  typeOuter: number;
  ciInner: number;
  ciOuter: number;
}

// Space between adjacent rings, real px (not baseline-scaled — same
// convention as OUTER_CORNER_RADIUS/INNER_CORNER_RADIUS). Off (0) by
// default. 3 gaps total (category↔class, class↔type, type↔ci), so that much
// real px comes off what's left for the rings themselves before scaling.
const RING_GAP = 0;
function ringsForRadius(totalRadius: number): Rings {
  const scale = Math.max(0, totalRadius - RING_GAP * 3) / BASELINE_TOTAL;
  const categoryInner = BASELINE_INNER * scale;
  const categoryOuter = categoryInner + BASELINE_CATEGORY * scale;
  const classInner = categoryOuter + RING_GAP;
  const classOuter = classInner + BASELINE_CLASS * scale;
  const typeInner = classOuter + RING_GAP;
  const typeOuter = typeInner + BASELINE_TYPE * scale;
  const ciInner = typeOuter + RING_GAP;
  const ciOuter = ciInner + BASELINE_CI * scale;
  return {
    categoryInner,
    categoryOuter,
    classInner,
    classOuter,
    typeInner,
    typeOuter,
    ciInner,
    ciOuter,
  };
}

type Depth = 0 | 1 | 2 | 3;

interface Arc {
  key: string;
  name: string;
  depth: Depth;
  // Which top-level Category this arc belongs to (its own index for a
  // depth-0 arc, inherited from its ancestor otherwise) — every arc in one
  // category's branch shares that category's hue, shaded by depth.
  categoryIndex: number;
  // classIndex/typeIndex: set from depth 1/2 down respectively (undefined
  // above that depth) — together with categoryIndex, these let hover
  // determine exact ancestry (isInHoveredBranch below) without relying on
  // angular containment, which SEGMENT_GAP/RING_GAP now make imprecise.
  classIndex?: number;
  typeIndex?: number;
  startAngle: number;
  endAngle: number;
  r0: number;
  r1: number;
  // Context shown in the hover tooltip for arcs too small to label inline.
  parentPath?: string;
}

// True when `arc` is the hovered segment itself or one of its descendants
// (never an ancestor or an unrelated sibling) — used to decide which
// segments get their fill back on hover.
function isInHoveredBranch(hoveredArc: Arc, arc: Arc): boolean {
  if (arc.categoryIndex !== hoveredArc.categoryIndex) return false;
  if (hoveredArc.depth >= 1) {
    if (arc.depth < 1 || arc.classIndex !== hoveredArc.classIndex) return false;
  }
  if (hoveredArc.depth >= 2) {
    if (arc.depth < 2 || arc.typeIndex !== hoveredArc.typeIndex) return false;
  }
  if (hoveredArc.depth >= 3) {
    return arc.key === hoveredArc.key;
  }
  return true;
}

function countClass(cls: CmdbCategory["classes"][number]): number {
  return cls.types.reduce((sum, t) => sum + t.cis.length, 0);
}

function countCategory(category: CmdbCategory): number {
  return category.classes.reduce((sum, cls) => sum + countClass(cls), 0);
}

function point(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

// Outer corner radius, px — matches --border-radius-lg (globals.css). Only
// a segment's two outer corners (where the outer arc meets its straight
// radial edges) round; the inner corners stay sharp. Clamped per-segment so
// thin slivers (e.g. a small CI wedge) never request a fillet bigger than
// the space available — half the segment's own outer arc length, or the
// ring's own thickness, whichever is tighter.
const OUTER_CORNER_RADIUS = 0;
function outerCornerRadius(
  r0: number,
  r1: number,
  a0: number,
  a1: number,
): number {
  const byRingThickness = r1 - r0;
  const byArcLength = (r1 * (a1 - a0)) / 2;
  return Math.max(
    0,
    Math.min(OUTER_CORNER_RADIUS, byRingThickness, byArcLength * 0.9),
  );
}

// Inner corner radius, px — same idea as OUTER_CORNER_RADIUS but for the
// two corners where the INNER arc meets a segment's straight radial edges.
// Off (0) by default; the stroke doesn't need updating for this — only the
// outer edge is ever stroked (see outerArcPath's comment), so inner
// rounding only affects the fill's own silhouette. radialLinesPath still
// recedes its inner endpoint to match, same as it already does for cr.
const INNER_CORNER_RADIUS = 0;
function innerCornerRadius(
  r0: number,
  r1: number,
  a0: number,
  a1: number,
): number {
  if (r0 <= 0) return 0;
  const byRingThickness = r1 - r0;
  const byArcLength = (r0 * (a1 - a0)) / 2;
  return Math.max(
    0,
    Math.min(INNER_CORNER_RADIUS, byRingThickness, byArcLength * 0.9),
  );
}

// Annular-sector path (a "pie slice" when r0 is 0, a ring segment otherwise)
// — same edge-to-edge SVG arc math CmdbSystemMap uses for its own connectors,
// just closed into a filled wedge instead of an open line. Each of the four
// corners (where a straight radial edge meets the outer or inner curve) can
// independently fillet — outer via cr (OUTER_CORNER_RADIUS), inner via crIn
// (INNER_CORNER_RADIUS). A corner whose radius rounds to ~0 just omits its
// fillet command entirely, degenerating cleanly to a sharp corner there
// (rather than branching the whole function per corner).
function arcPath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
): string {
  const cr = outerCornerRadius(r0, r1, a0, a1);
  const hasOuterFillet = cr > 0.01;
  const phiOuter = hasOuterFillet ? cr / r1 : 0;
  const outerA0 = a0 + phiOuter;
  const outerA1 = a1 - phiOuter;
  const pStart = hasOuterFillet
    ? point(cx, cy, r1 - cr, a0)
    : point(cx, cy, r1, a0);
  const pOuterA = point(cx, cy, r1, outerA0);
  const pOuterB = point(cx, cy, r1, outerA1);
  const pEnd = hasOuterFillet
    ? point(cx, cy, r1 - cr, a1)
    : point(cx, cy, r1, a1);
  const largeMidOuter = outerA1 - outerA0 > Math.PI ? 1 : 0;

  let d = `M${pStart.x},${pStart.y}`;
  if (hasOuterFillet) d += ` A${cr},${cr} 0 0 1 ${pOuterA.x},${pOuterA.y}`;
  d += ` A${r1},${r1} 0 ${largeMidOuter} 1 ${pOuterB.x},${pOuterB.y}`;
  if (hasOuterFillet) d += ` A${cr},${cr} 0 0 1 ${pEnd.x},${pEnd.y}`;

  if (r0 <= 0) {
    return `${d} L${cx},${cy} Z`;
  }

  const crIn = innerCornerRadius(r0, r1, a0, a1);
  const hasInnerFillet = crIn > 0.01;
  const phiInner = hasInnerFillet ? crIn / r0 : 0;
  const innerA1 = a1 - phiInner;
  const innerA0 = a0 + phiInner;
  const qStart = hasInnerFillet
    ? point(cx, cy, r0 + crIn, a1)
    : point(cx, cy, r0, a1);
  const qInnerA = point(cx, cy, r0, innerA1);
  const qInnerB = point(cx, cy, r0, innerA0);
  const qEnd = hasInnerFillet
    ? point(cx, cy, r0 + crIn, a0)
    : point(cx, cy, r0, a0);
  const largeMidInner = innerA1 - innerA0 > Math.PI ? 1 : 0;

  d += ` L${qStart.x},${qStart.y}`;
  if (hasInnerFillet) d += ` A${crIn},${crIn} 0 0 1 ${qInnerA.x},${qInnerA.y}`;
  d += ` A${r0},${r0} 0 ${largeMidInner} 0 ${qInnerB.x},${qInnerB.y}`;
  if (hasInnerFillet) d += ` A${crIn},${crIn} 0 0 1 ${qEnd.x},${qEnd.y}`;
  return `${d} Z`;
}

// Just the outer curve of a ring segment (open path, no fill) — used for the
// stroke instead of arcPath's full closed perimeter. Mirrors arcPath's own
// corner rounding (see outerCornerRadius) so the stroke never overshoots
// past the filled wedge's now-receded corners. Paired with innerArcPath
// below — together the two trace each ring's full outline, at the cost of
// doubling up the line at every shared ring boundary (each ring strokes its
// own inner edge, and the ring inside it strokes that same radius as its
// own outer edge) — accepted so inner-corner rounding (see
// INNER_CORNER_RADIUS) has a visible border of its own instead of a gap.
function outerArcPath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const cr = outerCornerRadius(r0, r1, a0, a1);
  if (cr <= 0.01) {
    const p0 = point(cx, cy, r1, a0);
    const p1 = point(cx, cy, r1, a1);
    return `M${p0.x},${p0.y} A${r1},${r1} 0 ${large} 1 ${p1.x},${p1.y}`;
  }
  const phi = cr / r1;
  const pA = point(cx, cy, r1 - cr, a0);
  const pB = point(cx, cy, r1, a0 + phi);
  const pC = point(cx, cy, r1, a1 - phi);
  const pD = point(cx, cy, r1 - cr, a1);
  const largeMid = a1 - phi - (a0 + phi) > Math.PI ? 1 : 0;
  return `M${pA.x},${pA.y} A${cr},${cr} 0 0 1 ${pB.x},${pB.y} A${r1},${r1} 0 ${largeMid} 1 ${pC.x},${pC.y} A${cr},${cr} 0 0 1 ${pD.x},${pD.y}`;
}

// Just the inner curve of a ring segment (open path, no fill) — see
// outerArcPath's comment. No inner edge exists when r0 is 0 (the Category
// ring's own hole boundary has nothing further in).
function innerArcPath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
): string {
  if (r0 <= 0) return "";
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const crIn = innerCornerRadius(r0, r1, a0, a1);
  if (crIn <= 0.01) {
    const p2 = point(cx, cy, r0, a1);
    const p3 = point(cx, cy, r0, a0);
    return `M${p2.x},${p2.y} A${r0},${r0} 0 ${large} 0 ${p3.x},${p3.y}`;
  }
  const phi = crIn / r0;
  const qD = point(cx, cy, r0 + crIn, a1);
  const qC = point(cx, cy, r0, a1 - phi);
  const qB = point(cx, cy, r0, a0 + phi);
  const qA = point(cx, cy, r0 + crIn, a0);
  const largeMid = a1 - phi - (a0 + phi) > Math.PI ? 1 : 0;
  return `M${qD.x},${qD.y} A${crIn},${crIn} 0 0 1 ${qC.x},${qC.y} A${r0},${r0} 0 ${largeMid} 0 ${qB.x},${qB.y} A${crIn},${crIn} 0 0 1 ${qA.x},${qA.y}`;
}

// The two straight radial sides of a ring segment (open path, no fill) —
// every ring's slices sit flush against each other (no angular padding, so
// pixel gap width wouldn't stay consistent across rings at different radii);
// this stroke is every ring's only slice separator. Recedes at both ends
// (by cr at the outer end, crIn at the inner end) to match arcPath's own
// fillets, so the line never overshoots past a rounded corner.
function radialLinesPath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
): string {
  const cr = outerCornerRadius(r0, r1, a0, a1);
  const crIn = r0 > 0 ? innerCornerRadius(r0, r1, a0, a1) : 0;
  const s0 = point(cx, cy, r0 + crIn, a0);
  const s1 = point(cx, cy, r1 - cr, a0);
  const e0 = point(cx, cy, r0 + crIn, a1);
  const e1 = point(cx, cy, r1 - cr, a1);
  return `M${s0.x},${s0.y} L${s1.x},${s1.y} M${e0.x},${e0.y} L${e1.x},${e1.y}`;
}

// Space between sibling segments within a ring, real px (not
// baseline-scaled — same convention as RING_GAP/the corner radii). Off (0)
// by default. Converted to an angular shrink per-arc from that arc's own
// mid-radius (not a flat degree value) so the visual gap width stays
// consistent across rings instead of varying with radius — same reasoning
// that led to dropping the old flat-degree PAD_ANGLE_DEG. Clamped to at
// most 80% of the arc's own span so a thin CI sliver never collapses to
// nothing.
const SEGMENT_GAP = 0;

function applySegmentGap(
  a0: number,
  a1: number,
  r0: number,
  r1: number,
): [number, number] {
  if (SEGMENT_GAP <= 0) return [a0, a1];
  const rMid = (r0 + r1) / 2;
  if (rMid <= 0) return [a0, a1];
  const span = a1 - a0;
  const shrink = Math.min(SEGMENT_GAP / rMid, span * 0.8);
  return [a0 + shrink / 2, a1 - shrink / 2];
}

function buildArcs(data: CmdbCategory[], rings: Rings): Arc[] {
  const total = data.reduce((sum, c) => sum + countCategory(c), 0);
  const arcs: Arc[] = [];

  let catAngle = 0;
  data.forEach((category, ci) => {
    const catCount = countCategory(category);
    const catSpan = (catCount / total) * 2 * Math.PI;
    const catStart = catAngle;
    const catEnd = catAngle + catSpan;
    const [catA0, catA1] = applySegmentGap(
      catStart,
      catEnd,
      rings.categoryInner,
      rings.categoryOuter,
    );
    arcs.push({
      key: `cat-${ci}`,
      name: category.name,
      depth: 0,
      categoryIndex: ci,
      startAngle: catA0,
      endAngle: catA1,
      r0: rings.categoryInner,
      r1: rings.categoryOuter,
    });

    let clsAngle = catStart;
    category.classes.forEach((cls, cli) => {
      const clsCount = countClass(cls);
      const clsSpan = (clsCount / catCount) * catSpan;
      const clsStart = clsAngle;
      const clsEnd = clsAngle + clsSpan;
      const [clsA0, clsA1] = applySegmentGap(
        clsStart,
        clsEnd,
        rings.classInner,
        rings.classOuter,
      );
      arcs.push({
        key: `cls-${ci}-${cli}`,
        name: cls.name,
        depth: 1,
        categoryIndex: ci,
        classIndex: cli,
        startAngle: clsA0,
        endAngle: clsA1,
        r0: rings.classInner,
        r1: rings.classOuter,
        parentPath: category.name,
      });

      let typeAngle = clsStart;
      cls.types.forEach((type, ti) => {
        const typeCount = type.cis.length;
        const typeSpan = (typeCount / clsCount) * clsSpan;
        const typeStart = typeAngle;
        const typeEnd = typeAngle + typeSpan;
        const [typeA0, typeA1] = applySegmentGap(
          typeStart,
          typeEnd,
          rings.typeInner,
          rings.typeOuter,
        );
        arcs.push({
          key: `type-${ci}-${cli}-${ti}`,
          name: type.name,
          depth: 2,
          categoryIndex: ci,
          classIndex: cli,
          typeIndex: ti,
          startAngle: typeA0,
          endAngle: typeA1,
          r0: rings.typeInner,
          r1: rings.typeOuter,
          parentPath: `${category.name} / ${cls.name}`,
        });

        const ciSpan = typeSpan / typeCount;
        type.cis.forEach((record, cii) => {
          const s = typeStart + cii * ciSpan;
          const e = s + ciSpan;
          const [ciA0, ciA1] = applySegmentGap(
            s,
            e,
            rings.ciInner,
            rings.ciOuter,
          );
          arcs.push({
            key: `ci-${ci}-${cli}-${ti}-${cii}`,
            name: record.id,
            depth: 3,
            categoryIndex: ci,
            classIndex: cli,
            typeIndex: ti,
            startAngle: ciA0,
            endAngle: ciA1,
            r0: rings.ciInner,
            r1: rings.ciOuter,
            parentPath: type.name,
          });
        });

        typeAngle = typeEnd;
      });
      clsAngle = clsEnd;
    });
    catAngle = catEnd;
  });

  return arcs;
}

// One hue per Category (index matches cmdbData.ts's TAXONOMY order:
// Hardware, Software, People), 4 steps each — Category (boldest, the hue's
// own 500) shading out to CI (lightest). Blue and Yellow reuse the existing
// primitive ramps (--color-blue-500/400/300/200, --color-yellow-500/400/
// 300/200); Green is a new ramp local to this component, derived at the
// same lighten-toward-white percentages as the Blue ramp's steps (~20/40/
// 60%) applied to its own 500 base (#33BA34), since no green ramp exists in
// the shared token set yet.
const CATEGORY_RAMPS = [
  ["#0F8FFF", "#3FA5FF", "#6FBCFF", "#9FD2FF"], // Hardware — Blue
  ["#FFD53C", "#FFDD63", "#FFE68A", "#FFEEB1"], // Software — Yellow
  ["#33BA34", "#5CC85D", "#85D685", "#ADE3AE"], // People — Green (new local ramp)
] as const;

// A segment's own hover-outline color — its category's 500 step (the same
// base each category's own CATEGORY_RAMPS row starts from), applied at
// every depth. Blue/Yellow reference the real --color-blue-500/
// --color-yellow-500 tokens; Green has no token ramp, so this is just its
// own base hex (#33BA34), unscaled.
const CATEGORY_HOVER_STROKE = [
  "var(--color-blue-500)",
  "var(--color-yellow-500)",
  "#33BA34",
] as const;

// Inline-label overrides for names whose best line break isn't "one word
// per line" (the default for any 2-word name) — either a different break
// point, or no break at all.
const LINE_BREAK_OVERRIDES: Record<string, string[]> = {
  "End User Computing": ["End User", "Computing"],
  "Data Center Infrastructure": ["Data Center", "Infrastructure"],
  "Access & Identity": ["Access & Identity"],
};

const LEGEND: { title: string; body: string }[] = [
  {
    title: "Category",
    body: "The highest level of organization within a CMDB, grouping IT assets, such as Hardware, Software, or People, into a top-level structure that everything else sits within.",
  },
  {
    title: "Class",
    body: "A subdivision within a Category that defines a specific asset grouping. A Hardware Category contains Classes like Data Center Infrastructure or End User Computing, for example.",
  },
  {
    title: "Type",
    body: "A further subdivision within Classes, defining a specific kind of CI being tracked. Within End User Computing, Types can include Laptop, Mobile Device, and Desktop.",
  },
  {
    title: "Configuration Item (CI)",
    body: "A specific, identifiable asset within the system, with its own set of attributes capturing identity, ownership, location, status, and relationships to other CIs.",
  },
  {
    title: "Relationships",
    body: "Connections recorded between CIs that capture how assets depend on and interact with each other. A server runs on a rack, an employee is assigned a laptop, an application runs on a virtual machine.",
  },
];

export default function CmdbSunburst() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{
    arc: Arc;
    x: number;
    y: number;
  } | null>(null);
  // The section gives this component a fixed 100vh (minus its own 32px
  // top/bottom padding) — measured directly rather than assumed, so the
  // sunburst always fills exactly that real height, whatever it turns out
  // to be at a given viewport size.
  const [height, setHeight] = useState<number | null>(null);
  // Real rendered width of this container — the same 12-column grid content
  // width the section's cs-grid gives it (see CALLOUT_COLUMN_SPAN above).
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  // Real measured size of the whole component (definitions row + chart) —
  // the relationship-connector overlay SVG below needs this as an explicit
  // width/height/viewBox, same as CmdbSystemMap's own .overlay svg, so its
  // coordinate system maps 1:1 to real px instead of relying on CSS
  // percentage sizing alone to establish it.
  const [wrapSize, setWrapSize] = useState({ width: 0, height: 0 });

  const data = useMemo(() => getCmdbData(), []);

  useLayoutEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const ro = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, []);

  // Full circle needs the full diameter in both dimensions, so the radius
  // is whichever measured dimension is the tighter constraint — half the
  // width or half the height.
  const totalRadius =
    containerWidth != null && height != null
      ? Math.min(containerWidth, height) / 2
      : 0;
  const rings = useMemo(() => ringsForRadius(totalRadius), [totalRadius]);
  const arcs = useMemo(() => buildArcs(data, rings), [data, rings]);
  const columnWidth =
    containerWidth != null
      ? (containerWidth - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS
      : null;
  const tooltipWidth =
    columnWidth != null
      ? columnWidth * CALLOUT_COLUMN_SPAN + GRID_GAP * (CALLOUT_COLUMN_SPAN - 1)
      : undefined;
  // Callouts hidden for now (see SHOW_CALLOUTS below) — chart is simply
  // centered in the available width instead of leaving a gutter for them.
  const sunburstCx = containerWidth != null ? containerWidth / 2 : 0;
  const sunburstCy = totalRadius;
  const width = containerWidth ?? totalRadius * 2;
  const svgHeight = totalRadius * 2;
  const ringScale = totalRadius / BASELINE_TOTAL;

  // Fixed height, not derived from the hole — the hole was grown
  // (BASELINE_INNER) specifically to fit this fixed size instead.
  const CENTER_LOGO_HEIGHT = 24;

  // Anchor point for each ring's static annotation callout — a corner of the
  // ring's own "back" (flat, straight-cut) edge, i.e. where that flat edge
  // meets one of the ring's curved boundaries (x = sunburstCx, y = sunburstCy
  // ± r), not the flat edge's own midpoint. Replaces the old stacked Legend +
  // dashed-pointer-line UI (same Category/Class/Type/CI copy, same
  // ring-explains-itself intent) with AnnotationCallout's connector+tooltip
  // visual instead.
  // Category sits on the bottom flat edge (bottom = anchor position) while
  // Class/Type/CI stay on top — spaces the anchor points apart so they don't
  // cluster near the inner rings' smaller radii. Category anchors to its own
  // inner-edge corner (categoryInner) instead of the outer one (*Outer)
  // Class/Type/CI use. `flipDir` is the connector's rise/descend direction —
  // independent of `bottom` (anchor position): Class keeps its top-edge
  // anchor but descends instead of rising, so its card lands in the same
  // place while the line itself is flipped.
  const CALLOUTS = [
    { ...LEGEND[0], r: rings.categoryInner, bottom: true, flipDir: true },
    { ...LEGEND[1], r: rings.classOuter, bottom: false, flipDir: true },
    { ...LEGEND[2], r: rings.typeOuter, bottom: false, flipDir: false },
    { ...LEGEND[3], r: rings.ciOuter, bottom: false, flipDir: false },
  ];

  function handleArcMove(arc: Arc, e: React.MouseEvent<SVGPathElement>) {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    setHovered({
      arc,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  // Breadcrumb — the hovered arc's ancestor chain, one name per layer
  // (Category/Class/Type/CI), read off `data` via the arc's own
  // categoryIndex/classIndex/typeIndex rather than re-parsing parentPath.
  // A layer deeper than the hovered arc's own depth stays undefined (no
  // value to show yet). Colored with that layer's own category ramp step
  // (CATEGORY_RAMPS[categoryIndex][depth]) so it reads as the "live" value
  // against the plain grey definition copy above it.
  const hoveredCategory = hovered ? data[hovered.arc.categoryIndex] : null;
  const hoveredClass =
    hoveredCategory && hovered!.arc.depth >= 1 && hovered!.arc.classIndex != null
      ? hoveredCategory.classes[hovered!.arc.classIndex]
      : null;
  const hoveredType =
    hoveredClass && hovered!.arc.depth >= 2 && hovered!.arc.typeIndex != null
      ? hoveredClass.types[hovered!.arc.typeIndex]
      : null;
  const breadcrumbValues: (string | undefined)[] = [
    hoveredCategory?.name,
    hoveredClass?.name,
    hoveredType?.name,
    hovered && hovered.arc.depth === 3 ? hovered.arc.name : undefined,
    // Relationships isn't a sunburst ring — no hover-driven value.
    undefined,
  ];
  const breadcrumbColors = hovered
    ? CATEGORY_RAMPS[hovered.arc.categoryIndex]
    : null;

  // Hovered CI's real relationships (up to 3, see cmdbData.ts's
  // RELATIONSHIP_RULES) — looked up off hoveredType.cis by id, since arc.name
  // at depth 3 is the CI's own id. hoveredType is a stable object reference
  // across renders (same `data` array, same indices), so this is safe as a
  // useMemo/useLayoutEffect dependency below.
  const hoveredCi =
    hovered && hovered.arc.depth === 3 && hoveredType
      ? hoveredType.cis.find((ci) => ci.id === hovered.arc.name)
      : undefined;
  const hoveredRelationships = hoveredCi?.relationships ?? EMPTY_RELATIONSHIPS;

  // Connector geometry — same mechanism as CmdbSystemMap: real DOM rects
  // (not computed math), straight lines dot/edge-to-edge, arrowhead marker
  // at the end. Two segments per relationship: CI value → pill, pill →
  // target id text. Measured in `wrapRef`'s local coordinate space (the
  // overlay SVG's own containing element) so it stays correct regardless of
  // where the row sits on the page.
  const wrapRef = useRef<HTMLDivElement>(null);
  const ciValueRef = useRef<HTMLSpanElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [relLines, setRelLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);
  // Arrowhead marker size — measured off the real --spacing-sm token (same
  // convention CmdbSystemMap's own arrow marker uses), not an invented
  // pixel value.
  const [arrowSize, setArrowSize] = useState(0);

  // Every relationship pill gets the SAME width — the widest of all
  // possible labels (ALL_RELATIONSHIP_LABELS), measured once via a hidden
  // row rendered with the exact .relationshipPill class (same font/padding
  // as the real ones) — so hovering between CIs whose relationships use
  // different-length labels ("connects to" vs "uses") never changes pill
  // width and never shifts the connector geometry.
  const pillMeasureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pillWidth, setPillWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const wrapEl = wrapRef.current;
    if (!wrapEl) return;
    const ro = new ResizeObserver(([entry]) => {
      setWrapSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    ro.observe(wrapEl);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const wrapEl = wrapRef.current;
    if (wrapEl) {
      setArrowSize(
        parseFloat(getComputedStyle(wrapEl).getPropertyValue("--spacing-sm")),
      );
    }
    const widths = pillMeasureRefs.current.map(
      (el) => el?.getBoundingClientRect().width ?? 0,
    );
    if (widths.length > 0) setPillWidth(Math.max(...widths));
  }, []);

  useLayoutEffect(() => {
    const wrapEl = wrapRef.current;
    const ciEl = ciValueRef.current;
    if (!wrapEl || !ciEl || hoveredRelationships.length === 0) {
      setRelLines([]);
      return;
    }
    const wrapRect = wrapEl.getBoundingClientRect();
    const toLocal = (r: DOMRect, side: "left" | "right") => ({
      x: (side === "left" ? r.left : r.right) - wrapRect.left,
      y: r.top + r.height / 2 - wrapRect.top,
    });
    // Recede both ends of a segment along its own direction by `gap`, so
    // the line stops short of the text/pill it points at instead of
    // touching it exactly — same CONNECTOR_GAP convention CmdbSystemMap
    // uses for its own dot-edge-to-dot-edge connectors, reusing the same
    // measured --spacing-sm value (arrowSize) rather than a second literal.
    const shorten = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      gap: number,
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      return {
        x1: x1 + ux * gap,
        y1: y1 + uy * gap,
        x2: x2 - ux * gap,
        y2: y2 - uy * gap,
      };
    };
    const ciPoint = toLocal(ciEl.getBoundingClientRect(), "right");
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    hoveredRelationships.forEach((_, ri) => {
      const pillEl = pillRefs.current[ri];
      const targetEl = targetRefs.current[ri];
      if (!pillEl || !targetEl) return;
      const pillRect = pillEl.getBoundingClientRect();
      const pillLeft = toLocal(pillRect, "left");
      const pillRight = toLocal(pillRect, "right");
      const targetLeft = toLocal(targetEl.getBoundingClientRect(), "left");
      lines.push(
        shorten(ciPoint.x, ciPoint.y, pillLeft.x, pillLeft.y, arrowSize),
      );
      // pill → target: the .relationshipRow flex gap (--spacing-sm, same
      // value as arrowSize) IS the 8px of clear space already — drawn
      // edge-to-edge, no additional shortening. Insetting both ends by
      // arrowSize again here would double-count that gap and collapse this
      // (much shorter than the CI→pill segment) line to near-zero length.
      lines.push({
        x1: pillRight.x,
        y1: pillRight.y,
        x2: targetLeft.x,
        y2: targetLeft.y,
      });
    });
    setRelLines(lines);
    // pillWidth/arrowSize: recompute once they resolve, so lines drawn on
    // the very first hover (before those measuring passes commit) aren't
    // stale.
  }, [hoveredRelationships, pillWidth, arrowSize]);

  return (
    <div className={styles.sunburstWrap} ref={wrapRef}>
      <div className={styles.definitionsRow}>
        {LEGEND.map((item, i) => {
          // Relationships (i === 4) isn't a sunburst ring — it has no
          // single breadcrumb value. Instead, while a CI is hovered, it
          // shows that CI's own relationships as pill rows, connected back
          // to the CI's id (in the CI column) via the same real-DOM-rect,
          // straight-line + arrowhead mechanism CmdbSystemMap uses for its
          // hub connectors — allowed to overflow past this column's own
          // width (see .relationshipRows/.container's overflow: visible).
          if (i === 4) {
            return (
              <div key={item.title} className={styles.definitionItem}>
                <span className={styles.definitionTitle}>{item.title}</span>
                <p className={styles.definitionText}>{item.body}</p>
                <div className={styles.relationshipAnchor}>
                <div className={styles.relationshipRows}>
                  {hoveredRelationships.map((rel, ri) => (
                    <div key={rel.label} className={styles.relationshipRow}>
                      <div
                        className={styles.relationshipPill}
                        style={pillWidth != null ? { width: pillWidth } : undefined}
                        ref={(el) => {
                          pillRefs.current[ri] = el;
                        }}
                      >
                        {rel.label}
                      </div>
                      <span
                        className={styles.relationshipTarget}
                        ref={(el) => {
                          targetRefs.current[ri] = el;
                        }}
                        style={
                          breadcrumbColors
                            ? { color: breadcrumbColors[3] }
                            : undefined
                        }
                      >
                        {rel.targetId}
                      </span>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            );
          }
          return (
            <div key={item.title} className={styles.definitionItem}>
              <span className={styles.definitionTitle}>{item.title}</span>
              <p className={styles.definitionText}>{item.body}</p>
              <span
                className={styles.definitionValue}
                ref={i === 3 ? ciValueRef : undefined}
                style={
                  breadcrumbColors
                    ? { color: breadcrumbColors[i] }
                    : undefined
                }
              >
                {breadcrumbValues[i] ?? ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hidden measuring row — one .relationshipPill per possible label,
          off-screen, never removed. Real widths read off these size
          pillWidth (see the mount-only useLayoutEffect above). */}
      <div className={styles.pillMeasureRow} aria-hidden="true">
        {ALL_RELATIONSHIP_LABELS.map((label, i) => (
          <div
            key={label}
            className={styles.relationshipPill}
            ref={(el) => {
              pillMeasureRefs.current[i] = el;
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {relLines.length > 0 && (
        <svg
          className={styles.relationshipOverlay}
          width={wrapSize.width}
          height={wrapSize.height}
          viewBox={`0 0 ${wrapSize.width} ${wrapSize.height}`}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="cmdb-relationship-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth={arrowSize}
              markerHeight={arrowSize}
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 Z" className={styles.arrowhead} />
            </marker>
          </defs>
          {relLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={styles.connector}
              markerEnd="url(#cmdb-relationship-arrow)"
            />
          ))}
        </svg>
      )}

      <div ref={containerRef} className={styles.container}>
        {height != null && (
        <>
          <svg
            className={styles.overlay}
            width={width}
            height={svgHeight}
            viewBox={`0 0 ${width} ${svgHeight}`}
            aria-hidden="true"
          >
            {arcs.map((arc) => (
              <path
                key={arc.key}
                d={arcPath(
                  sunburstCx,
                  sunburstCy,
                  arc.r0,
                  arc.r1,
                  arc.startAngle,
                  arc.endAngle,
                )}
                className={`${styles.arcSegment} ${
                  hovered?.arc.key === arc.key ? styles.arcHovered : ""
                }`}
                fill={
                  hovered && isInHoveredBranch(hovered.arc, arc)
                    ? CATEGORY_RAMPS[arc.categoryIndex][arc.depth]
                    : "none"
                }
                pointerEvents="all"
                onMouseMove={(e) => handleArcMove(arc, e)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}

            {/* Outer + inner edge borders — see outerArcPath's comment for
                why these are separate from the filled wedge above. Each
                stroke reads that arc's own category color, EXCEPT for a
                segment in the hovered branch — its outline goes back to
                its own category's darker 800 shade (CATEGORY_HOVER_STROKE)
                so it reads against its own now-lit fill. */}
            {arcs.map((arc) => (
              <path
                key={`outer-${arc.key}`}
                d={outerArcPath(
                  sunburstCx,
                  sunburstCy,
                  arc.r0,
                  arc.r1,
                  arc.startAngle,
                  arc.endAngle,
                )}
                className={styles.arcStroke}
                style={{
                  stroke:
                    hovered && isInHoveredBranch(hovered.arc, arc)
                      ? CATEGORY_HOVER_STROKE[arc.categoryIndex]
                      : CATEGORY_RAMPS[arc.categoryIndex][arc.depth],
                }}
                pointerEvents="none"
              />
            ))}
            {arcs.map((arc) => (
              <path
                key={`inner-${arc.key}`}
                d={innerArcPath(
                  sunburstCx,
                  sunburstCy,
                  arc.r0,
                  arc.r1,
                  arc.startAngle,
                  arc.endAngle,
                )}
                className={styles.arcStroke}
                style={{
                  stroke:
                    hovered && isInHoveredBranch(hovered.arc, arc)
                      ? CATEGORY_HOVER_STROKE[arc.categoryIndex]
                      : CATEGORY_RAMPS[arc.categoryIndex][arc.depth],
                }}
                pointerEvents="none"
              />
            ))}

            {/* Slice separators, every ring — see radialLinesPath's comment. */}
            {arcs.map((arc) => (
              <path
                key={`radial-${arc.key}`}
                d={radialLinesPath(
                  sunburstCx,
                  sunburstCy,
                  arc.r0,
                  arc.r1,
                  arc.startAngle,
                  arc.endAngle,
                )}
                className={styles.arcStroke}
                style={{
                  stroke:
                    hovered && isInHoveredBranch(hovered.arc, arc)
                      ? CATEGORY_HOVER_STROKE[arc.categoryIndex]
                      : CATEGORY_RAMPS[arc.categoryIndex][arc.depth],
                }}
                pointerEvents="none"
              />
            ))}

            {/* Inline labels — every ring, including Type and CI. */}
            {arcs.map((arc) => {
              const mid = (arc.startAngle + arc.endAngle) / 2;
              const r = (arc.r0 + arc.r1) / 2;
              const p = point(sunburstCx, sunburstCy, r, mid);
              // Two-word names (e.g. "Business Apps") wrap one word
              // per line; a single-word name stays on one line. A few names
              // read better broken somewhere other than every word, or not
              // broken at all — LINE_BREAK_OVERRIDES wins when a name
              // matches it. Each tspan gets its own absolute y (not a
              // relative dy chain) so the stack centers correctly on p.y
              // regardless of dominant-baseline behavior.
              const words = arc.name.split(" ");
              const lines =
                LINE_BREAK_OVERRIDES[arc.name] ??
                (words.length > 1 ? words : [arc.name]);
              const lineHeight = 16; // matches --text-body-xs-lh
              // CI labels follow the slice's own radial angle (like a
              // standard sunburst's outermost ring) instead of staying
              // horizontal. mid is in the same radians convention point()
              // uses (0° = east, 90° = south, 180° = west, 270° = north) —
              // a plain rotation would render upside down across the whole
              // left half (90°–270°), so those slices get +180° and flip to
              // end-anchored text, keeping every label reading left-to-right,
              // pointing away from center.
              const midDeg = ((((mid * 180) / Math.PI) % 360) + 360) % 360;
              const flipped = midDeg > 90 && midDeg < 270;
              const rotationDeg =
                arc.depth === 3 ? midDeg + (flipped ? 180 : 0) : undefined;
              return (
                <text
                  key={`label-${arc.key}`}
                  x={p.x}
                  className={
                    arc.depth === 0
                      ? styles.categoryLabel
                      : arc.depth === 3
                        ? styles.ciLabel
                        : styles.classLabel
                  }
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                  style={
                    hovered && isInHoveredBranch(hovered.arc, arc)
                      ? { fill: "var(--surface-base)" }
                      : undefined
                  }
                  transform={
                    rotationDeg != null
                      ? `rotate(${rotationDeg}, ${p.x}, ${p.y})`
                      : undefined
                  }
                >
                  {lines.map((line, i) => (
                    <tspan
                      key={line}
                      x={p.x}
                      y={p.y + (i - (lines.length - 1) / 2) * lineHeight}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            })}
          </svg>

          {/* ServiceNow mark, centered in the hole — the CMDB's real host
              platform, sitting at the sunburst's own root. Fixed height
              (CENTER_LOGO_HEIGHT, see above) — the hole itself
              (BASELINE_INNER) was grown to fit this fixed size instead of
              the other way around. */}
          <CompanyLogo
            src="/SVG/ServiceNow.svg"
            nativeWidth={181}
            nativeHeight={28}
            height={CENTER_LOGO_HEIGHT}
            alt="ServiceNow"
            className={styles.centerLogo}
            style={{
              left: sunburstCx,
              top: sunburstCy,
            }}
          />

          {/* Hidden for now (chart rotated to a horizontal flat edge — these
              anchor coordinates assume the old vertical-edge orientation and
              need re-deriving before turning back on). */}
          {SHOW_CALLOUTS &&
            CALLOUTS.map((callout) => (
              <AnnotationCallout
                key={callout.title}
                x={sunburstCx}
                y={
                  callout.bottom
                    ? sunburstCy + callout.r
                    : sunburstCy - callout.r
                }
                scale={ringScale}
                title={callout.title}
                body={callout.body}
                tooltipWidth={tooltipWidth}
                flip
                flipVertical={callout.flipDir}
              />
            ))}

          {hovered && (
            <div
              className={styles.tooltip}
              style={{ left: hovered.x + 16, top: hovered.y + 16 }}
            >
              <span className={styles.tooltipName}>{hovered.arc.name}</span>
              {hovered.arc.parentPath && (
                <span className={styles.tooltipPath}>
                  {hovered.arc.parentPath}
                </span>
              )}
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );
}
