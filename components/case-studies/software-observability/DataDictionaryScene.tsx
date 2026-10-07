"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  EYES_HUB_UPDATED,
  FAN_DROP_LINE_UPDATED,
} from "./frameworkAdaptationSync";
import Block from "@/components/Block";
import LabelBlock from "@/components/LabelBlock";
import ProcessConnector from "@/components/ProcessConnector";
import styles from "./DataDictionaryScene.module.css";

// Full rebuild (old pinned scaffold-build scene scrapped, see progress.md/
// PLAN.md) — a static section: an SVG connector line runs from the
// section's top edge, wraps around the display block, and attaches to a
// table rendered at a fixed angle (a "tabletop" tilt, via CSS 3D
// perspective — not the flat skew() the Figma mock uses, see PLAN.md for
// why). Figma node 1715:6961, "Portfolio Cleaning" file — structure/tokens
// only, no screenshot pulled.

interface DictionaryRow {
  term: string;
  definition: string;
  criticality: string;
  calculation: string;
  painPointsSolved: string;
  source: string;
}

const COLUMNS: { key: keyof DictionaryRow; label: string }[] = [
  { key: "term", label: "Data Point" },
  { key: "definition", label: "Definition" },
  { key: "criticality", label: "Criticality" },
  { key: "calculation", label: "Calculation" },
  { key: "painPointsSolved", label: "Pain Points Solved" },
  { key: "source", label: "Source" },
];

// 10 terms, deliberately using SoftwareSystemMap's own leaf names (not
// DataGlossaryTable's differently-worded rows) so this table reads as an
// excerpt of the actual system map — chosen for what a Fortune 500
// software asset manager would consider load-bearing: baseline
// entitlement, reclaimable spend, the reclaim thesis, renewal urgency,
// and audit/compliance risk. Copy is a first-pass illustrative draft
// (some reused/reworded from DataGlossaryTable's closest equivalent row,
// some authored fresh where no equivalent exists) — not yet reviewed.
const ROWS: DictionaryRow[] = [
  {
    term: "Total Purchased",
    definition: "The total number of licenses legally owned under contract.",
    criticality:
      "Critical: establishes the baseline every other utilization and compliance figure is measured against.",
    calculation:
      "Direct value from procurement/vendor entitlement (no calculation)",
    painPointsSolved:
      "Eliminates entitlement uncertainty for SAM and enables accurate budgeting for Finance.",
    source: "Procurement, Vendor portal",
  },
  {
    term: "Unassigned",
    definition: "Licenses remaining to assign.",
    criticality:
      "Critical: prevents onboarding delays and unnecessary spending.",
    calculation: "Total Purchased − Assigned",
    painPointsSolved:
      "Removes onboarding blockers and avoids unnecessary purchasing.",
    source: "Derived",
  },
  {
    term: "Inactive",
    definition:
      "Licenses assigned to a user with no activity within a defined period (30/60/90 days).",
    criticality:
      "Critical: establishes the reclaim opportunity baseline — this case study's core thesis.",
    calculation: "Users with no activity > 30 / 60 / 90 days",
    painPointsSolved:
      "Enables reclaiming unused licenses and improves spend efficiency.",
    source: "Telemetry, Analytics",
  },
  {
    term: "Auto-Renew Status",
    definition:
      "Whether the contract renews automatically or requires manual action at term end.",
    criticality: "Critical: determines urgency of the renewal review.",
    calculation: "Direct value from contract terms (no calculation)",
    painPointsSolved:
      "Flags contracts needing proactive negotiation before spend continues passively.",
    source: "Procurement",
  },
  {
    term: "Renewal Date",
    definition:
      "Contract expiration date and the cancel-by deadline before auto-renewal locks in.",
    criticality: "Critical: prevents unwanted auto-renewal spend.",
    calculation: "Contract Expiration Date − Notice Period Deadline",
    painPointsSolved:
      "Avoids surprise renewals and creates negotiation lead time.",
    source: "Procurement",
  },
  {
    term: "Duplicate Assignment",
    definition:
      "The same license assigned to more than one active user or device at once.",
    criticality:
      "Critical: signals a provisioning error that inflates assigned-seat counts and risks audit exposure.",
    calculation: "Count(assignments) > 1 per license instance",
    painPointsSolved:
      "Surfaces provisioning errors before an audit does and corrects inflated utilization figures.",
    source: "Identity provisioning, Config",
  },
  {
    term: "Cost per License",
    definition: "Per-seat spend.",
    criticality: "High: enables pricing validation and negotiation leverage.",
    calculation: "Total Contract Cost ÷ Total Purchased",
    painPointsSolved:
      "Informs pricing negotiations for Procurement and helps Finance evaluate spend efficiency.",
    source: "Procurement",
  },
  {
    term: "Licensing Model",
    definition:
      "How the software is licensed: enterprise, perpetual, open-source, or consumption.",
    criticality:
      "Critical: determines which cost and utilization calculations apply.",
    calculation: "Direct value from procurement record (no calculation)",
    painPointsSolved:
      "Routes each title through the correct governance model and prevents misapplied cost formulas.",
    source: "Procurement",
  },
  {
    term: "Total Annual Spend",
    definition:
      "Total software spend attributed to a title over a 12-month period.",
    criticality:
      "High: the number Finance actually budgets and forecasts against.",
    calculation: "Sum(invoiced spend) over trailing 12 months",
    painPointsSolved:
      "Gives Finance a normalized figure comparable across titles with different contract terms.",
    source: "Procurement, Billing",
  },
  {
    term: "Expired License",
    definition:
      "A license instance still showing as assigned or active after its contract term has ended.",
    criticality: "Critical: direct audit and compliance exposure.",
    calculation:
      "Contract Expiration Date < Today AND Assignment Status = Active",
    painPointsSolved:
      "Flags accounts that must be deprovisioned immediately to avoid unlicensed use.",
    source: "Procurement + Identity",
  },
];

interface Point {
  x: number;
  y: number;
}

interface RakeSegment {
  from: Point;
  to: Point;
}

// Corner radius for the connector's rounded joints — confirmed 32px.
const CONNECTOR_RADIUS = 32;

// Builds ONE continuous path through a polyline's points, rounding each
// internal joint with a quadratic curve (same technique ProcessConnector's
// own "elbow" shape uses for its single corner) — needed because the
// connector is 4 straight segments sharing exact joint coordinates, not a
// single shape ProcessConnector already knows how to round across 3 corners.
function buildRoundedPolylinePath(points: Point[], radius: number): string {
  if (points.length < 2) return "";
  const commands = [`M${points[0].x},${points[0].y}`];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y) || 1;
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y) || 1;
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const before = {
      x: curr.x + ((prev.x - curr.x) / d1) * r,
      y: curr.y + ((prev.y - curr.y) / d1) * r,
    };
    const after = {
      x: curr.x + ((next.x - curr.x) / d2) * r,
      y: curr.y + ((next.y - curr.y) / d2) * r,
    };
    commands.push(`L${before.x},${before.y}`, `Q${curr.x},${curr.y} ${after.x},${after.y}`);
  }
  const last = points[points.length - 1];
  commands.push(`L${last.x},${last.y}`);
  return commands.join(" ");
}

// Same fixed-angle trapezoid shape as DataCertificationTriggers'
// buildFanTrapezoid (PLAN.md's "Process Diagram / Connector System"),
// rotated 90°: that diagram's targets share one Y (a horizontal row of
// cards) with a horizontal shoulder bar above/below them; ours stack at
// different Y down the table, so the shoulder bar runs VERTICAL instead,
// offset horizontally (BRANCH_WIDTH) from the targets, with each
// diagonal leg still built at the same fixed LEG_ANGLE_DEG (now measured
// from vertical instead of horizontal). Confirmed values: 30deg / 32px,
// matching the reference diagram for visual consistency.
const LEG_ANGLE_DEG = 30;
const LEG_ANGLE_RAD = (LEG_ANGLE_DEG * Math.PI) / 180;
const LEG_TAN = Math.tan(LEG_ANGLE_RAD);
const LEG_SIN = Math.sin(LEG_ANGLE_RAD);
const BRANCH_WIDTH = 64;
// Real breathing-room clearance at every real anchor (a row's own corner,
// or the lead-in point) — same CARD_GAP convention as the reference.
const CARD_GAP = 8;
const CARD_GAP_ALONG_LINE = CARD_GAP / LEG_SIN;
// Vertical run (in LOCAL/untransformed table space) each outer row's own
// shoulder marker is shifted toward center by, on top of its horizontal
// BRANCH_WIDTH offset — applied BEFORE the table's transform so the
// browser's own perspective math projects the resulting diagonal
// correctly, rather than this component hand-computing it in flat
// screen space afterward.
const SHOULDER_DY = BRANCH_WIDTH / LEG_TAN;

// Moves `to` toward `from` by `amount` px along their line — gives a
// segment breathing room at ONE real end while leaving its other end (a
// synthetic joint shared with another segment) exact.
function insetEnd(from: Point, to: Point, amount: number): Point {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: to.x + (dx / len) * amount, y: to.y + (dy / len) * amount };
}

export default function DataDictionaryScene({
  className,
}: {
  className?: string;
}) {
  const perspectiveWrapRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const connectorSvgRef = useRef<SVGSVGElement>(null);
  const [connectorPoints, setConnectorPoints] = useState<Point[]>([]);
  const [fanDropSegment, setFanDropSegment] = useState<RakeSegment | null>(
    null,
  );
  const fanDropSegmentRef = useRef<RakeSegment | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  // One invisible marker per row, a real DOM child of that row — so
  // measuring it gives the TRUE perspective-projected position of a
  // BRANCH_WIDTH-offset point on the table's own tilted plane, instead of
  // a flat 2D pixel offset applied after the fact (which ignored that
  // rotateX makes farther-down rows sit deeper in Z, so the same local
  // offset should project to FEWER screen px the further down the table
  // it is — flat math can't reproduce that, only the browser's own
  // transform math can).
  const shoulderMarkerRefs = useRef<(HTMLDivElement | null)[]>([]);
  // One zero-size marker per column boundary (6 total, one per column's
  // own grid cell) — reads the table's TRUE rendered column widths for the
  // bottom column-divider fan, same measured-not-guessed approach as
  // shoulderMarkerRefs above.
  const columnDividerMarkerRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Nested inside each columnDividerMarker — its inline transform offset
  // (BRANCH_WIDTH down, ±SHOULDER_DY for the two outer dividers) is applied
  // pre-transform, same real-perspective technique as shoulderMarkerRefs.
  const columnShoulderMarkerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [rakeSegments, setRakeSegments] = useState<RakeSegment[]>([]);

  // Rake geometry is MEASURED (each row's real on-screen bottom-left
  // corner via getBoundingClientRect, which reflects the table's actual
  // rendered position — including whatever rotateX/perspective is
  // currently dialed in on .table) rather than hand-drawn — so it always
  // attaches exactly to each row's border-bottom no matter how the
  // perspective gets tuned afterward. Re-measures on mount and on window
  // resize; a pure CSS edit to the tilt (no JS state change) won't
  // retrigger this on its own — reload the page after tuning
  // rotateX/perspective to see the rake re-align.
  useLayoutEffect(() => {
    function measure() {
      const wrapEl = perspectiveWrapRef.current;
      const tableEl = tableRef.current;
      if (!wrapEl || !tableEl) return;

      const wrapRect = wrapEl.getBoundingClientRect();
      const toLocal = (x: number, y: number) => ({
        x: x - wrapRect.left,
        y: y - wrapRect.top,
      });

      // Last row excluded — no rake line drawn to it (per earlier ask).
      // Each entry pairs a row's real bottom-left corner with its own
      // shoulder marker's real measured position — both are actual DOM
      // points under the table's transform, so their relationship (a
      // straight line between them) is the correct perspective-projected
      // version of whatever offset the marker was given in LOCAL space.
      const rows = rowRefs.current
        .slice(0, -1)
        .map((rowEl, i) => {
          const markerEl = shoulderMarkerRefs.current[i];
          if (!rowEl || !markerEl) return null;
          const r = rowEl.getBoundingClientRect();
          const m = markerEl.getBoundingClientRect();
          return {
            target: toLocal(r.left, r.bottom),
            shoulder: toLocal(m.left, m.top),
          };
        })
        .filter((p): p is { target: Point; shoulder: Point } => p !== null);

      if (rows.length < 2) return;

      const top = rows[0];
      const bottom = rows[rows.length - 1];

      // The bar must bound EVERY row's shoulder point, not just the two
      // outer (pulled-in) ones — a mid row's un-shifted shoulder can sit
      // past top.shoulder/bottom.shoulder once SHOULDER_DY pulls those two
      // inward, which would leave its stub attaching outside the drawn bar
      // and crossing the outer diagonal leg. Extend the bar's endpoints to
      // the real min/max across all rows when that happens.
      const topY = Math.min(top.shoulder.y, ...rows.map((r) => r.shoulder.y));
      const bottomY = Math.max(
        bottom.shoulder.y,
        ...rows.map((r) => r.shoulder.y),
      );
      // The bar's SLOPE is fit from two representative mid rows (not raw
      // top/bottom) — top/bottom are pulled in by SHOULDER_DY before the
      // table's 3D transform, which can project them as outliers far off
      // every other row's actual x, dragging the whole bar (and anything
      // anchored to it, e.g. the lead-in) into a stray diagonal. Falls back
      // to top/bottom only when there aren't enough distinct mid rows.
      const refA = rows.length > 3 ? rows[1] : top;
      const refB = rows.length > 3 ? rows[rows.length - 2] : bottom;
      const lineXAt = (y: number) => {
        const t = (y - refA.shoulder.y) / (refB.shoulder.y - refA.shoulder.y || 1);
        return refA.shoulder.x + t * (refB.shoulder.x - refA.shoulder.x);
      };
      const barTop = { x: lineXAt(topY), y: topY };
      const barBottom = { x: lineXAt(bottomY), y: bottomY };
      // Point on the bar's own straight line at a given y — used to anchor
      // every stub exactly ON the bar, since a mid row's real shoulder.x
      // (perspective-projected) drifts off the bar's 2-point line the
      // farther it sits from barTop/barBottom.
      const barPointAt = (y: number) => {
        const t = (y - barTop.y) / (barBottom.y - barTop.y || 1);
        return { x: barTop.x + t * (barBottom.x - barTop.x), y };
      };

      const segments: RakeSegment[] = [
        // The shoulder bar itself — spans the full extent of every row's
        // shoulder marker (see barTop/barBottom above), not just the two
        // outer rows' pulled-in points.
        { from: barTop, to: barBottom },
        // Diagonal legs to the two outermost real rows — must start from
        // the bar's actual drawn endpoint (barTop/barBottom), not the
        // pulled-in top.shoulder/bottom.shoulder, or they'd leave a gap
        // where the bar was just extended past that point.
        {
          from: barTop,
          to: insetEnd(top.shoulder, top.target, CARD_GAP_ALONG_LINE),
        },
        {
          from: barBottom,
          to: insetEnd(bottom.shoulder, bottom.target, CARD_GAP_ALONG_LINE),
        },
      ];

      // Plain stub for every row BETWEEN the two outer ones.
      for (const mid of rows.slice(1, -1)) {
        segments.push({
          from: barPointAt(mid.shoulder.y),
          to: insetEnd(mid.shoulder, mid.target, CARD_GAP),
        });
      }

      // Set below once the fan's bar geometry is known — the wrap-local
      // point where the CENTER mid stub (the true center divider) meets the
      // bar, used to anchor the section-bottom vertical connector built in
      // the Connector block further down.
      let columnFanCenterBarPoint: Point | null = null;

      // Bottom column-divider fan — same trapezoid shape as the row rake
      // above (shoulder bar + fixed-angle diagonal legs + straight mid
      // stubs), but in buildFanTrapezoid's un-rotated "up" orientation
      // (PLAN.md/DataCertificationTriggers): shoulder bar BELOW the table's
      // bottom edge, legs/stubs reaching UP into the 5 real inner
      // column-divider points. Ends at the bar — no further lead-out yet.
      // Shoulder points come from columnShoulderMarkerRefs (a real marker
      // offset BRANCH_WIDTH/SHOULDER_DY pre-transform, same technique as
      // the row rake's own shoulderMarkerRefs) — NOT flat post-hoc math —
      // so the bar/legs pick up the table's true perspective distortion.
      const dividerTargets = columnDividerMarkerRefs.current
        .slice(1)
        .map((el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return toLocal(r.left, r.bottom);
        })
        .filter((p): p is Point => p !== null);
      const dividerShoulders = columnShoulderMarkerRefs.current
        .slice(1)
        .map((el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return toLocal(r.left, r.top);
        })
        .filter((p): p is Point => p !== null);

      if (
        dividerTargets.length >= 2 &&
        dividerShoulders.length === dividerTargets.length
      ) {
        const dOuterLeftShoulder = dividerShoulders[0];
        const dOuterRightShoulder =
          dividerShoulders[dividerShoulders.length - 1];
        const dMidShoulders = dividerShoulders.slice(1, -1);
        const dOuterLeft = dividerTargets[0];
        const dOuterRight = dividerTargets[dividerTargets.length - 1];
        const dMids = dividerTargets.slice(1, -1);

        const barLeftX = Math.min(
          dOuterLeftShoulder.x,
          ...dividerShoulders.map((s) => s.x),
        );
        const barRightX = Math.max(
          dOuterRightShoulder.x,
          ...dividerShoulders.map((s) => s.x),
        );
        // Fit the bar's slope from representative mid shoulder markers (not
        // the raw outer two) — same reasoning as barTop/barBottom above:
        // the outer two are pulled in by SHOULDER_DY before the table's 3D
        // transform, which can project them as outliers and drag the
        // whole bar off.
        const dRefA =
          dividerShoulders.length > 3
            ? dividerShoulders[1]
            : dOuterLeftShoulder;
        const dRefB =
          dividerShoulders.length > 3
            ? dividerShoulders[dividerShoulders.length - 2]
            : dOuterRightShoulder;
        const lineYAt = (x: number) => {
          const t = (x - dRefA.x) / (dRefB.x - dRefA.x || 1);
          return dRefA.y + t * (dRefB.y - dRefA.y);
        };
        const dBarLeft = { x: barLeftX, y: lineYAt(barLeftX) };
        const dBarRight = { x: barRightX, y: lineYAt(barRightX) };
        const barPointAtX = (x: number) => {
          const t = (x - dBarLeft.x) / (dBarRight.x - dBarLeft.x || 1);
          return { x, y: dBarLeft.y + t * (dBarRight.y - dBarLeft.y) };
        };

        segments.push(
          { from: dBarLeft, to: dBarRight },
          {
            from: dBarLeft,
            to: insetEnd(dOuterLeftShoulder, dOuterLeft, CARD_GAP_ALONG_LINE),
          },
          {
            from: dBarRight,
            to: insetEnd(
              dOuterRightShoulder,
              dOuterRight,
              CARD_GAP_ALONG_LINE,
            ),
          },
        );
        dMids.forEach((mid, i) => {
          const shoulder = dMidShoulders[i];
          segments.push({
            from: barPointAtX(shoulder.x),
            to: insetEnd(shoulder, mid, CARD_GAP),
          });
        });

        // Drop point is the Calculation column's own right edge (not the
        // table's center divider anymore, per request) — its real target
        // point (the table's own bottom edge), not the bar, so the drop
        // line below starts flush against the table instead of at the
        // (now-hidden) fan's bar distance away from it. dividerTargets[k]
        // is marker k+1's real position (slice(1) above dropped marker 0,
        // term's own left edge) — marker k+1 sits at column (k+1)'s LEFT
        // edge, i.e. column k's right edge, so the Calculation column's
        // (index 3) right edge is dividerTargets[3].
        const calculationColIndex = COLUMNS.findIndex(
          (c) => c.key === "calculation",
        );
        columnFanCenterBarPoint =
          dividerTargets[calculationColIndex] ??
          dMids[Math.floor(dMids.length / 2)];
      }

      setRakeSegments(segments);

      // Connector — a sharp-cornered "C": center-top down through the
      // section's own top padding, left along its inner top-padding edge,
      // down along its inner left-padding edge past the text block, then
      // right to meet the table's own real left edge (flush — the rake
      // that used to carry the last stretch is now hidden) at that same
      // height. Computed from real measurements (section padding, text
      // block height, the row's own target point) instead of a traced
      // SVG asset, so it always matches whatever the section/table/text
      // actually measure as.
      const connectorSvgEl = connectorSvgRef.current;
      const textBlockEl = textBlockRef.current;
      const sectionEl = connectorSvgEl?.parentElement;
      if (connectorSvgEl && textBlockEl && sectionEl) {
        const svgRect = connectorSvgEl.getBoundingClientRect();
        const sectionStyle = getComputedStyle(sectionEl);
        const topPad = parseFloat(sectionStyle.paddingTop) || 0;
        const leftPad = parseFloat(sectionStyle.paddingLeft) || 0;
        const centerX = svgRect.width / 2;

        // Segment 3/4's bottom turn lands level with the Renewal Date
        // row's own real left edge (not the fan's bar, now hidden) — same
        // row index used by the rake's own mid-row loop above, so this
        // reuses its exact target point for a flush connection straight
        // onto the table.
        const renewalDateIndex = ROWS.findIndex(
          (r) => r.term === "Renewal Date",
        );
        const landingRow = rows[renewalDateIndex];
        const rowTargetLocal = {
          x: landingRow.target.x + wrapRect.left - svgRect.left,
          y: landingRow.target.y + wrapRect.top - svgRect.top,
        };
        const landingLocal = {
          x: leftPad,
          y: rowTargetLocal.y,
        };

        setConnectorPoints([
          { x: centerX, y: 0 },
          { x: centerX, y: topPad },
          { x: leftPad, y: topPad },
          landingLocal,
          rowTargetLocal,
        ]);

        // Vertical connector flush to the table's own real bottom edge —
        // starts at the center column divider's real target point (the
        // fan that used to carry this stretch is now hidden), grows
        // straight down past this section's own bottom edge, stopping
        // flush at the TOP of FrameworkAdaptationEyes' hub eye (its own
        // data-eyes-hub marker — that eye's x is in turn pinned to this
        // same line, see FrameworkAdaptationEyes.tsx) rather than at the
        // section's bottom.
        if (columnFanCenterBarPoint) {
          const dropX =
            columnFanCenterBarPoint.x + wrapRect.left - svgRect.left;
          const dropStartY =
            columnFanCenterBarPoint.y + wrapRect.top - svgRect.top;
          const hubEl = document.querySelector("[data-eyes-hub]");
          const dropEndY = hubEl
            ? hubEl.getBoundingClientRect().top - svgRect.top
            : svgRect.height;
          const nextSegment = {
            from: { x: dropX, y: dropStartY },
            to: { x: dropX, y: dropEndY },
          };
          const prevSegment = fanDropSegmentRef.current;
          const changed =
            !prevSegment ||
            prevSegment.from.x !== nextSegment.from.x ||
            prevSegment.from.y !== nextSegment.from.y ||
            prevSegment.to.x !== nextSegment.to.x ||
            prevSegment.to.y !== nextSegment.to.y;
          if (changed) {
            fanDropSegmentRef.current = nextSegment;
            setFanDropSegment(nextSegment);
          }
        }
      }
    }

    measure();
    // The hub's position (read above via [data-eyes-hub]) is pinned by
    // FrameworkAdaptationEyes' own layout effect, which settles and
    // announces itself via EYES_HUB_UPDATED — re-measure in response
    // instead of guessing how many frames that takes. document.fonts.ready
    // covers a webfont swap reflowing the table/fan after first paint.
    window.addEventListener("resize", measure);
    window.addEventListener(EYES_HUB_UPDATED, measure);
    document.fonts?.ready?.then(measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener(EYES_HUB_UPDATED, measure);
    };
  }, []);

  // Announce the drop-line's settled position only once it's actually
  // committed and painted (plain useEffect runs after paint, unlike the
  // layout effect above) — FrameworkAdaptationEyes' hub reads this line's
  // real x for its own position, so dispatching any earlier would hand it
  // a position that isn't on screen yet.
  useEffect(() => {
    if (fanDropSegment) window.dispatchEvent(new Event(FAN_DROP_LINE_UPDATED));
  }, [fanDropSegment]);

  return (
    <>
      {/* Connector — computed sharp-cornered "C" (see the measure() effect
          above), not a traced SVG asset. Rendered as a SIBLING of .scene
          (not nested inside it) so its absolute positioning resolves
          against the section's own padding box, not .scene's narrower
          7-column box — an abs-positioned grid child with no explicit
          grid-column/row uses the grid CONTAINER's padding box as its
          containing block, per spec. */}
      <svg
        ref={connectorSvgRef}
        className={styles.tableConnector}
        fill="none"
        aria-hidden="true"
      >
        {connectorPoints.length > 0 && (
          <path
            d={buildRoundedPolylinePath(connectorPoints, CONNECTOR_RADIUS)}
            stroke="var(--color-grey-650)"
            strokeWidth={1}
            className={styles.rakeLine}
          />
        )}
        {fanDropSegment && (
          <path
            data-fan-drop-line="true"
            d={`M${fanDropSegment.from.x},${fanDropSegment.from.y} L${fanDropSegment.to.x},${fanDropSegment.to.y}`}
            stroke="var(--color-grey-650)"
            strokeWidth={1}
            className={styles.rakeLine}
          />
        )}
      </svg>

      <div className={`${styles.scene}${className ? ` ${className}` : ""}`}>
        <div className={styles.textBlock} ref={textBlockRef}>
          <LabelBlock
            size="display"
            label="Driving Alignment"
            body="The data dictionary."
          />
          <Block
            size="lg"
            color="secondary"
            className={styles.dataDictionaryDetailBlock}
          >
            I created a living document containing term and data point
            definitions along with possible calculations and data sources to get
            my team up to speed.
          </Block>
        </div>

        <div className={styles.perspectiveWrap} ref={perspectiveWrapRef}>
          {/* Rake — a real fan-out trapezoid (shoulder bar + fixed-angle
            diagonal legs + straight mid-row stubs), same shape vocabulary
            as DataCertificationTriggers' branch, rotated 90° since our
            targets stack vertically instead of sharing one Y. See the
            measurement effect above.
            Hidden for now (both the row rake / "side" fan and the bottom
            column-divider fan render through this one combined segment
            list) — per request, table/card/connector-C/drop-line stay. */}
          {false && (
          <svg className={styles.rake} aria-hidden="true">
            {rakeSegments.map((seg, i) => (
              <ProcessConnector
                key={i}
                from={seg.from}
                to={seg.to}
                shape="straight"
                gap={0}
                color="var(--color-grey-650)"
                className={styles.rakeLine}
              />
            ))}
          </svg>
          )}

          <div className={styles.card}>
            <p className={styles.cardTitle}>Document Intent</p>
            <p className={styles.cardBody}>
              This document introduces the core pain points in software
              lifecycle management and establishes shared terminology,
              best-practice definitions, and the data elements needed to support
              the Overview, Software Portfolio, and Software Asset Profile
              experiences. Its goal is to align teams around the calculations,
              system sources, and decision-driving insights that power Software
              Observability.
            </p>
          </div>

          <div className={styles.table} role="table" ref={tableRef}>
            <div className={styles.headerRow} role="row">
              {COLUMNS.map((col) => (
                <div
                  key={col.key}
                  className={styles.headerCell}
                  role="columnheader"
                >
                  {col.label}
                </div>
              ))}
            </div>
            {ROWS.map((row, i) => {
              // The rake excludes the last row entirely (per earlier ask),
              // so "top"/"bottom" of the fan are index 0 and ROWS.length-2.
              const isTopRow = i === 0;
              const isBottomRow = i === ROWS.length - 2;
              const verticalOffset = isTopRow
                ? SHOULDER_DY
                : isBottomRow
                  ? -SHOULDER_DY
                  : 0;
              return (
                <div
                  key={row.term}
                  className={styles.bodyRow}
                  role="row"
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                >
                  {COLUMNS.map((col) => (
                    <div key={col.key} className={styles.bodyCell} role="cell">
                      {row[col.key]}
                    </div>
                  ))}
                  <div
                    className={styles.shoulderMarker}
                    aria-hidden="true"
                    ref={(el) => {
                      shoulderMarkerRefs.current[i] = el;
                    }}
                    style={{
                      transform: `translate(-${BRANCH_WIDTH}px, ${verticalOffset}px)`,
                    }}
                  />
                </div>
              );
            })}
            <div className={styles.columnDividerRow} aria-hidden="true">
              {COLUMNS.map((col, i) => {
                const isOuterLeftDivider = i === 1;
                const isOuterRightDivider = i === COLUMNS.length - 1;
                const shoulderOffsetX = isOuterLeftDivider
                  ? SHOULDER_DY
                  : isOuterRightDivider
                    ? -SHOULDER_DY
                    : 0;
                return (
                  <div
                    key={col.key}
                    className={styles.columnDividerMarker}
                    ref={(el) => {
                      columnDividerMarkerRefs.current[i] = el;
                    }}
                  >
                    <div
                      className={styles.columnShoulderMarker}
                      ref={(el) => {
                        columnShoulderMarkerRefs.current[i] = el;
                      }}
                      style={{
                        transform: `translate(${shoulderOffsetX}px, ${BRANCH_WIDTH}px)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
