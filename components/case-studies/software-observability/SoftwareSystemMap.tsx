"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { HubNode } from "@/components/ContentHub";
import styles from "./SoftwareSystemMap.module.css";

interface Hub {
  title: string;
  nodes: HubNode[];
}

// Ported 1:1 from CmdbSystemMap (Data Health Monitor) — same circular
// ring layout, drag mechanics, and connector/label placement logic.
// Only the hub/leaf/connection data below is specific to Software
// Observability. First-pass settings (radius/arc/gap constants) are
// shared verbatim with CmdbSystemMap per direction — tune independently
// once this is visually reviewed.

// Placed evenly around a circle in array order (see CIRCLE_RADIUS below) —
// order here is what determines each hub's position around the ring.
const HUBS: Hub[] = [
  {
    title: "Software Identification",
    nodes: [
      { name: "Title" },
      { name: "Vendor" },
      { name: "Publisher" },
      { name: "Version" },
      { name: "Licensing Model" },
      { name: "Lifecycle State" },
    ],
  },
  {
    title: "Record Integrity",
    nodes: [
      {
        name: "Internal Records",
        children: [
          { name: "Total Purchased Licenses" },
          { name: "Total Assigned Licenses" },
        ],
      },
      {
        name: "Vendor Records",
        children: [{ name: "Total Purchased Licenses" }],
      },
      {
        name: "Publisher Records",
        children: [
          { name: "Total Purchased Licenses" },
          { name: "Total Assigned Licenses" },
        ],
      },
    ],
  },
  {
    title: "Utilization",
    nodes: [
      {
        name: "Total Purchased",
        children: [
          {
            name: "Assigned",
            children: [{ name: "Active" }, { name: "Inactive" }],
          },
        ],
      },
      { name: "Assigned to Offboarded Employee" },
      { name: "Unassigned" },
    ],
  },
  {
    title: "Financial",
    nodes: [
      {
        name: "Source Data",
        children: [
          { name: "Contract Value" },
          { name: "Cost per License" },
          { name: "Purchase Date" },
          { name: "Renewal Date" },
          { name: "Auto-Renew Status" },
          { name: "Total Annual Spend" },
          { name: "Spend by Department" },
        ],
      },
      {
        name: "Contract Terms",
        children: [
          { name: "True-Up Rights" },
          { name: "Audit Clause" },
          { name: "Termination/Downgrade Terms" },
          { name: "Volume Tier / Discount Structure" },
        ],
      },
      {
        name: "Derived Data",
        children: [
          { name: "Inactive License Dollar Value" },
          { name: "Unused License Dollar Value" },
        ],
      },
    ],
  },
  {
    title: "Compliance",
    nodes: [
      { name: "Over-Assignment" },
      { name: "Unassigned License" },
      { name: "Duplicate Assignment" },
      { name: "Expired License" },
      { name: "Unauthorized Installation" },
      { name: "Unsanctioned Software (Shadow IT)" },
      { name: "At Risk / Unverified Title" },
    ],
  },
  {
    title: "Deployment & Discovery",
    nodes: [
      { name: "Installed Software Inventory" },
      { name: "Endpoint Usage Telemetry" },
      { name: "Discovery Coverage Gaps" },
      { name: "SaaS/Cloud Usage Signals" },
    ],
  },
  {
    title: "Governance & Ownership",
    nodes: [
      { name: "Software Asset Manager" },
      { name: "Financial Specialist" },
      { name: "IT Operations Manager" },
      { name: "Escalation Path per Compliance Flag" },
      { name: "Renewal Decision" },
    ],
  },
  {
    title: "Trend & History",
    nodes: [
      { name: "Spend Trend (period over period)" },
      { name: "Utilization Trend (period over period)" },
      { name: "Compliance Drift" },
    ],
  },
];

// Real max leaf-nesting depth across all hubs — derived from the actual
// HUBS data (e.g. Financial's Source Data -> Contract Value is 2 levels),
// not a guessed constant.
function nodesDepth(nodes: HubNode[]): number {
  return nodes.reduce(
    (max, node) =>
      Math.max(max, 1 + (node.children ? nodesDepth(node.children) : 0)),
    0,
  );
}
// Each hub's OWN real leaf-nesting depth (e.g. Utilization's Total
// Purchased -> Assigned -> Active/Inactive is 3 levels deep; most hubs are
// only 1-2) — used below so the ring-sizing math gives each hub only the
// clearance IT actually needs, rather than shrinking every hub's position
// uniformly to fit the single deepest one anywhere on the ring.
const HUB_DEPTHS = HUBS.map((hub) => nodesDepth(hub.nodes));

// Indices into HUBS above: 0=Software Identification, 1=Record Integrity,
// 2=Utilization, 3=Financial, 4=Compliance, 5=Deployment & Discovery,
// 6=Governance & Ownership, 7=Trend & History.
//
// Which hub sits fixed at the circle's center instead of on the ring —
// Compliance has the most connections of any hub (same rule CmdbSystemMap
// used to pick its own center hub).
const CENTER_HUB_INDEX = 4;

// Clockwise ring order (starting at top), by hub index — separate from
// HUBS' own array order/definitions above, so CONNECTIONS' indices never
// need renumbering when this changes. First-pass grouping: the
// data-collection cluster (Record Integrity, Software Identification,
// Deployment & Discovery) sits together, feeding into Utilization, which
// sits next to the financial/trend cluster (Trend & History, Financial,
// Governance & Ownership) — Utilization's own 5 direct connections can't
// all be ring-adjacent at once, so some chords still cross; drag to
// adjust.
const RING_ORDER = [1, 0, 5, 2, 7, 3, 6];

// The MAX distance the ring hubs sit from the center hub, in px — a cap,
// not the literal value used: the actual ring is an ellipse sized to fill
// the real available container box on both axes (see the layout effect
// below), and only pulls in tighter than that if CIRCLE_RADIUS is lower
// than what the available space would otherwise allow. Raise it past
// whatever the container provides and it has no further effect (already
// filling the space); lower it to intentionally leave a gap around the
// ring instead of filling edge-to-edge.
const CIRCLE_RADIUS = 600;
// A hub dot's own radius, in px — sized to hold its own label INSIDE the
// circle (title centered, dot filled, label text set to --surface-base
// for contrast) rather than beside it. Each hub hugs its OWN wrapped
// title's real size, so a hub with a short title renders smaller than one
// with a long title. This constant is only the fallback used for the very
// first layout pass, before that real measurement lands (see hubRadii
// state) — swapped out immediately once known.
const DOT_RADIUS = 8;

// How far a leaf sits from its own hub (the leaf spoke's length), in px.
// Nested children fan out one further LEAF_RADIUS each level deep (see
// leafPositions below), so a given hub's real max reach is
// LEAF_RADIUS * that hub's OWN depth (HUB_DEPTHS below), not LEAF_RADIUS
// alone — used to size the ring so each hub's own deepest-nested leaves
// (e.g. Utilization's Total Purchased -> Assigned -> Active/Inactive, 3
// levels deep) never overflow past the section's own padding.
const LEAF_RADIUS = 100;
// How wide a fan a hub's own direct leaves spread across, in degrees —
// centered on the direction pointing away from the diagram's center.
// Also used for a leaf's own children (one level deep, e.g. Financial's
// Source Data -> Contract Value) — CHILD_LEAF_ARC_DEG below is the
// separate control for anything nested past that (children OF children,
// e.g. Utilization's Assigned -> Active/Inactive).
const LEAF_ARC_DEG = 360;
// How wide a fan spreads for a nested child's OWN children (two levels
// deep from the hub or further) — separate from LEAF_ARC_DEG so the
// two tiers can be tuned independently. Defaulted to the same value so
// nothing changes visually until this is tuned on its own. Only
// Utilization currently nests this deep.
const CHILD_LEAF_ARC_DEG = 180;
// A leaf dot's own radius, in px.
const LEAF_DOT_RADIUS = 2;
// Gap between a leaf dot's edge and the start of its label text, in px.
const LEAF_LABEL_GAP = 16;

// Extra gap between a connector line's end and the dot it points to, in
// px — added on top of that dot's own radius, for every connector
// (hub-to-hub and leaf spokes alike). 0 = the line touches the dot
// exactly; raise it to stop the line short of the dot.
const CONNECTOR_GAP = 8;

// Perpendicular offset (px) applied to a connector when more than one
// connection exists between the same two hubs (e.g. Financial <->
// Governance & Ownership: "informs" one way, "closes loop on" the
// other) — otherwise both lines draw on the identical segment and fully
// overlap. Each connector in the group is spread symmetrically around
// the true center line, this many px apart per step. Directly tunable.
const PARALLEL_CONNECTOR_OFFSET = 8;

// Toggled off for now — hub-to-hub connector lines/labels hidden while
// the map is worked on without them. Code kept intact, not deleted, same
// convention as Nav's SHOW_MENU_TOGGLE / CmdbSunburst's SHOW_CALLOUTS.
const SHOW_CONNECTIONS = false;

const CONNECTIONS: {
  from: number;
  to: number;
  label: string;
}[] = [
  { from: 5, to: 2, label: "feeds" },
  { from: 5, to: 4, label: "feeds" },
  { from: 1, to: 2, label: "feeds" },
  { from: 1, to: 4, label: "feeds" },
  { from: 0, to: 4, label: "defines terms for" },
  { from: 0, to: 2, label: "defines terms for" },
  { from: 2, to: 4, label: "feeds" },
  { from: 2, to: 3, label: "feeds" },
  { from: 2, to: 7, label: "feeds" },
  { from: 3, to: 4, label: "informs" },
  { from: 3, to: 7, label: "feeds" },
  { from: 3, to: 6, label: "informs" },
  { from: 4, to: 7, label: "feeds" },
  { from: 4, to: 6, label: "routes to" },
  { from: 6, to: 1, label: "owns" },
  { from: 6, to: 4, label: "owns" },
  { from: 6, to: 3, label: "closes loop on" },
];

// Same word-wrap heuristic ContentHub uses for its own labels — wraps a
// hub title onto multiple lines by real character count rather than
// letting a long title run wide as a single line.
function wrapWords(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LineGeometry {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
  label: string;
}

// Point on a circle's boundary (center cx,cy, radius r) where the line
// toward (tx, ty) exits it.
function circleEdge(
  cx: number,
  cy: number,
  r: number,
  tx: number,
  ty: number,
): { x: number; y: number } {
  const dx = tx - cx;
  const dy = ty - cy;
  const dist = Math.hypot(dx, dy) || 1;
  return { x: cx + (dx / dist) * r, y: cy + (dy / dist) * r };
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Shared by both hub labels and leaf labels — places a label beside its
// dot on whichever side (dx, dy) points to: left/right of the dot when
// the direction is mostly horizontal, above/below (stacking multi-line
// text upward when above) when it's mostly vertical. (dx, dy) of (0, 0)
// (e.g. the center hub, which has no single outward direction) falls
// through to "below", which is the same default a real near-zero vector
// would land closest to anyway.
function placeLabel(
  pos: { x: number; y: number },
  dx: number,
  dy: number,
  dotR: number,
  gap: number,
  lineCount: number,
  lineH: number,
): { anchor: "start" | "middle" | "end"; baseX: number; baseY: number } {
  if (Math.abs(dx) > Math.abs(dy)) {
    const anchor = dx < 0 ? "end" : "start";
    const baseX = pos.x + (dx < 0 ? -1 : 1) * (dotR + gap);
    return { anchor, baseX, baseY: pos.y };
  }
  if (dy < 0) {
    return {
      anchor: "middle",
      baseX: pos.x,
      baseY: pos.y - (dotR + gap) - (lineCount - 1) * lineH,
    };
  }
  return { anchor: "middle", baseX: pos.x, baseY: pos.y + dotR + gap };
}

function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function SoftwareSystemMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);
  // One hidden, off-layout <text> per hub (see the render below) — measured
  // once for their real rendered size, purely to derive hubRadii. Never
  // shown; the visible hub labels are separate elements once hubRadii is
  // known.
  const hubMeasureRefs = useRef<(SVGTextElement | null)[]>([]);

  const [hubPositions, setHubPositions] = useState<
    { x: number; y: number }[] | null
  >(null);
  // Connection-focus interaction: hoverKey (mouse hover, "hub-<i>" or
  // "leaf-<key>") and pinnedKey (tap-to-pin, same shape) — pinning wins
  // over hover so a touch tap locks the highlight until the same node is
  // tapped again or the background is tapped.
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [pinnedKey, setPinnedKey] = useState<string | null>(null);
  const activeKey = pinnedKey ?? hoverKey;
  // Keyed by leaf key, each value is an (x, y) OFFSET from the leaf's own
  // parent position at the moment of drag — not an absolute page
  // coordinate. That's what lets a dragged leaf keep following its parent
  // (hub or ancestor leaf) if the parent is moved afterward: every position
  // below is always parentPos + offset, so nothing is ever pinned to a
  // frame that can shift out from under it.
  const [leafOverrides, setLeafOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});
  // Real measured container box — the ring is laid out as an ELLIPSE
  // sized directly from this (see the layout effect below), rather than
  // drawn as a circle and stretched afterward: stretching the whole
  // scene (e.g. via preserveAspectRatio="none") warps every individual
  // shape and letterform along with the composition, which is why that
  // approach looked distorted. Computing the ellipse's own rx/ry directly
  // keeps every dot a true circle and every label undistorted, while the
  // overall ring still spans the full available box.
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [arrowSize, setArrowSize] = useState(0);
  const [labelSizes, setLabelSizes] = useState<
    { width: number; height: number }[] | null
  >(null);
  // Each hub's own dot radius, hugging its own wrapped title (not the
  // largest title across all hubs) — measured from that hub's real
  // rendered label bbox (hubMeasureRefs), not guessed. Null until that
  // measurement lands; DOT_RADIUS is the fallback used for the very first
  // layout pass only, and for any hub whose measurement hasn't landed yet.
  const [hubRadii, setHubRadii] = useState<number[] | null>(null);

  // Measures every hub's real rendered title size once (content/font are
  // static) and derives that hub's OWN radius — half its label's own
  // diagonal, plus a real spacing-token pad (--spacing-sm-md, 12px), so its
  // own title's corners just clear its own circle's edge. Runs once on
  // mount.
  useLayoutEffect(() => {
    if (hubRadii !== null) return;
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const pad = 8;

    const radii = hubMeasureRefs.current.map((el) => {
      if (!el) return 0;
      const box = el.getBBox();
      return Math.hypot(box.width / 2, box.height / 2) + pad;
    });
    if (radii.some((r) => r > 0)) setHubRadii(radii);
  }, [hubRadii]);

  // Each ring hub sits at its OWN radius from center, along its own angle
  // — not on one shared ellipse curve applied to every hub. A single
  // shared rx/ry (tried before) still lets the single deepest-nested hub
  // (Utilization, 3 levels) throttle every other hub's distance from
  // center, even though 6 of the 8 hubs only nest 1-2 levels and could sit
  // much further out. Computing each hub's own max radius independently —
  // capped by CIRCLE_RADIUS and by how far ITS OWN reach (dot radius +
  // LEAF_RADIUS * that hub's real depth, from HUB_DEPTHS) lets it go
  // before clipping the container's real width/height along its own
  // angle — means shallow hubs use nearly all the available space, and
  // only Utilization pulls in tighter to protect its own leaves. Hubs no
  // longer lie on a perfect ellipse, but the section's real height/width
  // gets used. Recomputes on a real container size change (e.g. window
  // resize) or once hubRadii lands.
  useLayoutEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const reachOf = (hubIndex: number) =>
      (hubRadii?.[hubIndex] ?? DOT_RADIUS) + LEAF_RADIUS * HUB_DEPTHS[hubIndex];

    const layout = () => {
      const rect = containerEl.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!width || !height) return;

      const computed = getComputedStyle(containerEl);
      setArrowSize(parseFloat(computed.getPropertyValue("--spacing-sm")));

      const cx = width / 2;
      const cy = height / 2;
      const ringCount = RING_ORDER.length;

      const positions: { x: number; y: number }[] = new Array(HUBS.length);
      positions[CENTER_HUB_INDEX] = { x: cx, y: cy };
      RING_ORDER.forEach((hubIndex, slot) => {
        const angle = (slot / ringCount) * 2 * Math.PI - Math.PI / 2;
        const reach = reachOf(hubIndex);
        const cosA = Math.abs(Math.cos(angle));
        const sinA = Math.abs(Math.sin(angle));

        // Largest radius this hub can sit at along its own angle without
        // its own reach clipping the container's real width/height —
        // CIRCLE_RADIUS is still the manual cap, same as before.
        let r = CIRCLE_RADIUS;
        if (cosA > 0.01) {
          r = Math.min(r, Math.max(0, width / 2 - reach) / cosA);
        }
        if (sinA > 0.01) {
          r = Math.min(r, Math.max(0, height / 2 - reach) / sinA);
        }

        positions[hubIndex] = {
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
        };
      });

      setHubPositions(positions);
      setContainerSize({ width, height });
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [hubRadii]);

  // Small square rects around each dot — used only to keep connector
  // labels (the mid-line "feeds"/"informs" text) from overlapping a dot.
  // Each hub uses its OWN radius now, not one shared size.
  const hubDotRects = useMemo<Rect[] | null>(() => {
    if (!hubPositions) return null;
    return hubPositions.map((p, i) => {
      const dotRadius = hubRadii?.[i] ?? DOT_RADIUS;
      return {
        x: p.x - dotRadius,
        y: p.y - dotRadius,
        width: dotRadius * 2,
        height: dotRadius * 2,
      };
    });
  }, [hubPositions, hubRadii]);

  // Each leaf is fanned out from its own hub, across an arc centered on
  // the direction pointing away from the diagram's center (so leaves grow
  // outward, away from the rest of the graph, rather than back into it).
  // Top-level nodes only — nested children (e.g. Financial's Source
  // Data/Contract Terms/Derived Data groups) fan out one further tier
  // each, at the same angle bias as their own parent — same
  // LEAF_RADIUS/LEAF_ARC_DEG controls apply at every depth, there's no
  // separate per-level constant to keep in sync.
  const leafPositions = useMemo(() => {
    const center = hubPositions?.[CENTER_HUB_INDEX];
    if (!hubPositions || !center) return [];
    const arc = (LEAF_ARC_DEG * Math.PI) / 180;
    const childArc = (CHILD_LEAF_ARC_DEG * Math.PI) / 180;

    const out: {
      key: string;
      name: string;
      parentPos: { x: number; y: number };
      parentRadius: number;
      x: number;
      y: number;
    }[] = [];

    function place(
      nodes: HubNode[],
      parentPos: { x: number; y: number },
      parentRadius: number,
      outwardAngle: number,
      keyPrefix: string,
      depth: number,
    ) {
      // depth 0 = a hub's own direct leaves, depth 1 = their children —
      // both use LEAF_ARC_DEG. depth 2+ (children OF children) switches
      // to CHILD_LEAF_ARC_DEG.
      const arcForDepth = depth >= 2 ? childArc : arc;
      const count = nodes.length;
      nodes.forEach((node, i) => {
        const key = `${keyPrefix}-${i}`;
        const t = count === 1 ? 0 : i / (count - 1) - 0.5;
        const angle = outwardAngle + t * arcForDepth;
        const computed = {
          x: parentPos.x + Math.cos(angle) * LEAF_RADIUS,
          y: parentPos.y + Math.sin(angle) * LEAF_RADIUS,
        };
        const offset = leafOverrides[key];
        const p = offset
          ? { x: parentPos.x + offset.x, y: parentPos.y + offset.y }
          : computed;
        out.push({
          key,
          name: node.name,
          parentPos,
          parentRadius,
          x: p.x,
          y: p.y,
        });
        if (node.children?.length) {
          place(node.children, p, LEAF_DOT_RADIUS, angle, key, depth + 1);
        }
      });
    }

    HUBS.forEach((hub, hi) => {
      if (hub.nodes.length === 0) return;
      const pos = hubPositions[hi];
      const dotRadius = hubRadii?.[hi] ?? DOT_RADIUS;
      const outwardAngle =
        hi === CENTER_HUB_INDEX
          ? Math.PI / 2
          : Math.atan2(pos.y - center.y, pos.x - center.x);
      place(hub.nodes, pos, dotRadius, outwardAngle, `${hi}`, 0);
    });

    return out;
  }, [hubPositions, leafOverrides, hubRadii]);

  // Exclusion rects around each LEAF's position — without these, connector
  // label placement (below) only avoided hub dots and other connector
  // labels, so a connector terminating at a busy hub (e.g. Governance &
  // Ownership, 5 leaves) could land its label directly on top of a nearby
  // leaf label. A leaf's real label text isn't measured, so this is a
  // generous fixed clearance approximating typical wrapped-label extent —
  // a heuristic, same as this file's other first-pass constants
  // (CIRCLE_RADIUS/LEAF_RADIUS), not a measured value.
  const LEAF_LABEL_CLEARANCE = 48;
  const leafDotRects = useMemo<Rect[]>(
    () =>
      leafPositions.map((leaf) => ({
        x: leaf.x - LEAF_LABEL_CLEARANCE,
        y: leaf.y - LEAF_LABEL_CLEARANCE,
        width: LEAF_LABEL_CLEARANCE * 2,
        height: LEAF_LABEL_CLEARANCE * 2,
      })),
    [leafPositions],
  );

  // Each connector draws real dot-edge-to-dot-edge — its length is just
  // whatever the actual distance between the two hubs is. Moving hubs
  // closer (via CIRCLE_RADIUS or a drag) directly shortens it.
  const lines = useMemo<LineGeometry[]>(() => {
    if (!hubPositions) return [];

    // Group connection indices by their unordered hub pair (direction
    // ignored) so any connections sharing the same two hubs get spread
    // apart below instead of drawing on top of each other.
    const pairGroups = new Map<string, number[]>();
    CONNECTIONS.forEach((c, i) => {
      const key = [c.from, c.to].sort((x, y) => x - y).join("-");
      const group = pairGroups.get(key) ?? [];
      group.push(i);
      pairGroups.set(key, group);
    });

    return CONNECTIONS.map(({ from, to, label }, i) => {
      const a = hubPositions[from];
      const b = hubPositions[to];
      const aRadius = hubRadii?.[from] ?? DOT_RADIUS;
      const bRadius = hubRadii?.[to] ?? DOT_RADIUS;
      const p1raw = circleEdge(a.x, a.y, aRadius + CONNECTOR_GAP, b.x, b.y);
      const p2raw = circleEdge(b.x, b.y, bRadius + CONNECTOR_GAP, a.x, a.y);

      // Slide both endpoints sideways (perpendicular to the connector's
      // own direction) by this connector's slot within its hub-pair
      // group — the touch points stay anchored near each hub's real
      // boundary, only the line itself shifts, so parallel connections
      // between the same pair read as distinct lines.
      const key = [from, to].sort((x, y) => x - y).join("-");
      const group = pairGroups.get(key)!;
      let p1 = p1raw;
      let p2 = p2raw;
      if (group.length > 1) {
        const dx = p2raw.x - p1raw.x;
        const dy = p2raw.y - p1raw.y;
        const len = Math.hypot(dx, dy) || 1;
        const perpX = -dy / len;
        const perpY = dx / len;
        const slot = group.indexOf(i);
        const mid = (group.length - 1) / 2;
        const offset = (slot - mid) * PARALLEL_CONNECTOR_OFFSET;
        p1 = { x: p1raw.x + perpX * offset, y: p1raw.y + perpY * offset };
        p2 = { x: p2raw.x + perpX * offset, y: p2raw.y + perpY * offset };
      }

      return {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        labelX: (p1.x + p2.x) / 2,
        labelY: (p1.y + p2.y) / 2,
        label,
      };
    });
  }, [hubPositions, hubRadii]);

  // Measure each connector label's real text size once (content is
  // static) — repositioning after that is pure math, no repeated DOM reads.
  useLayoutEffect(() => {
    if (labelSizes || lines.length === 0) return;
    const sizes = labelRefs.current.map((el) => {
      if (!el) return { width: 0, height: 0 };
      const box = el.getBBox();
      return { width: box.width, height: box.height };
    });
    if (sizes.some((s) => s.width > 0)) setLabelSizes(sizes);
  }, [lines, labelSizes]);

  // Connector label placement — padded pill around each measured size,
  // slid clear of every hub dot and every other pill along its own
  // connector's perpendicular.
  const labelBoxes = useMemo<Rect[]>(() => {
    if (!labelSizes || !hubDotRects) return [];
    const containerEl = containerRef.current;
    if (!containerEl) return [];
    const computed = getComputedStyle(containerEl);
    const padX = parseFloat(computed.getPropertyValue("--spacing-sm"));
    const padY = parseFloat(computed.getPropertyValue("--spacing-xs"));
    const step = parseFloat(computed.getPropertyValue("--spacing-xs"));
    const MAX_STEPS = 40;

    const placed: Rect[] = [];
    return lines.map((line, i) => {
      const size = labelSizes[i] ?? { width: 0, height: 0 };
      const raw: Rect = {
        x: line.labelX - size.width / 2 - padX,
        y: line.labelY - size.height / 2 - padY,
        width: size.width + padX * 2,
        height: size.height + padY * 2,
      };

      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const len = Math.hypot(dx, dy) || 1;
      const perpX = -dy / len;
      const perpY = dx / len;

      const clearOf = (box: Rect) =>
        !hubDotRects.some((r) => rectsOverlap(box, r)) &&
        !leafDotRects.some((r) => rectsOverlap(box, r)) &&
        !placed.some((p) => rectsOverlap(box, p));

      let finalBox = raw;
      if (!clearOf(raw)) {
        search: for (let s = 1; s <= MAX_STEPS; s++) {
          for (const sign of [1, -1]) {
            const off = step * s * sign;
            const candidate: Rect = {
              ...raw,
              x: raw.x + perpX * off,
              y: raw.y + perpY * off,
            };
            if (clearOf(candidate)) {
              finalBox = candidate;
              break search;
            }
          }
        }
      }

      placed.push(finalBox);
      return finalBox;
    });
  }, [lines, labelSizes, hubDotRects, leafDotRects]);

  // Drag — pure direct manipulation. Grabbing a dot just moves that one
  // dot to the pointer; nothing else reacts, nothing snaps back. Shared by
  // both hub dots (setHubPositions) and leaf dots (setLeafOverrides) below.
  // Also doubles as the tap-to-pin gesture for touch: if the pointer never
  // moves past a small threshold before release, it's a tap rather than a
  // drag, and onTap fires instead of having moved anything.
  function startDrag(
    e: ReactPointerEvent<SVGGraphicsElement>,
    onMove: (p: { x: number; y: number }) => void,
    onTap: () => void,
  ) {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    const TAP_THRESHOLD = 6;

    const toLocal = (clientX: number, clientY: number) => {
      const rect = containerEl.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleMove = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > TAP_THRESHOLD)
        moved = true;
      onMove(toLocal(ev.clientX, ev.clientY));
    };
    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      if (!moved) onTap();
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  // Tap toggles the pin: tapping the already-pinned node clears it, tapping
  // a different node re-pins to that one.
  function togglePin(key: string) {
    setPinnedKey((prev) => (prev === key ? null : key));
  }

  // Tapping the diagram background (not a hub/leaf) clears an active pin —
  // e.target === e.currentTarget only when the pointerdown landed directly
  // on the <svg>, not bubbled up from a hub/leaf circle.
  function handleBackgroundPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (e.target === e.currentTarget) setPinnedKey(null);
  }

  function handleHubPointerDown(
    i: number,
    e: ReactPointerEvent<SVGGraphicsElement>,
  ) {
    startDrag(
      e,
      (p) => {
        setHubPositions((prev) => {
          if (!prev) return prev;
          const next = [...prev];
          next[i] = p;
          return next;
        });
      },
      () => togglePin(`hub-${i}`),
    );
  }

  // Leaf positions are otherwise fully computed (fanned out from their
  // hub) — a drag records the offset from the leaf's own parent position
  // (captured at drag-start; parentPos doesn't shift mid-drag in practice
  // since only one node is dragged at a time) so the leaf keeps following
  // that parent if it's moved later, same direct-manipulation feel as hub
  // dragging.
  function handleLeafPointerDown(
    key: string,
    parentPos: { x: number; y: number },
    e: ReactPointerEvent<SVGGraphicsElement>,
  ) {
    startDrag(
      e,
      (p) => {
        setLeafOverrides((prev) => ({
          ...prev,
          [key]: { x: p.x - parentPos.x, y: p.y - parentPos.y },
        }));
      },
      () => togglePin(`leaf-${key}`),
    );
  }

  const center = hubPositions?.[CENTER_HUB_INDEX];

  // Connection-focus highlight sets, derived from activeKey (hover or pin).
  // Hub hover/pin → ego-network: the hub itself, every hub it's directly
  // connected to via CONNECTIONS (+ those connector lines), and its own
  // top-level+nested leaves. Leaf hover/pin → ancestor-path: the leaf's own
  // hub plus every leaf between it and that hub (its own spoke chain), no
  // neighbor hubs or connectors.
  const highlight = useMemo(() => {
    const hubs = new Set<number>();
    const leaves = new Set<string>();
    const connectors = new Set<number>();
    if (activeKey?.startsWith("hub-")) {
      const i = Number(activeKey.slice(4));
      hubs.add(i);
      CONNECTIONS.forEach((c, ci) => {
        if (c.from === i || c.to === i) {
          hubs.add(c.from === i ? c.to : c.from);
          connectors.add(ci);
        }
      });
      leafPositions.forEach((leaf) => {
        if (leaf.key.startsWith(`${i}-`)) leaves.add(leaf.key);
      });
    } else if (activeKey?.startsWith("leaf-")) {
      const parts = activeKey.slice(5).split("-");
      hubs.add(Number(parts[0]));
      for (let len = 2; len <= parts.length; len++) {
        leaves.add(parts.slice(0, len).join("-"));
      }
    }
    return { hubs, leaves, connectors };
  }, [activeKey, leafPositions]);

  return (
    <div ref={containerRef} className={styles.container}>
      <svg
        className={styles.overlay}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        aria-hidden="true"
        onPointerDown={handleBackgroundPointerDown}
      >
        <defs>
          <marker
            id="software-map-connector-arrow"
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

        {SHOW_CONNECTIONS && (
          <>
            {lines.map((line, i) => (
              <line
                key={`connector-${i}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                className={cx(
                  styles.connector,
                  highlight.connectors.has(i) && styles.active,
                )}
                markerEnd="url(#software-map-connector-arrow)"
              />
            ))}
            {lines.map((line, i) => {
              const box = labelBoxes[i];
              return (
                <g key={`label-${i}`}>
                  {box && (
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      className={styles.connectorLabelBg}
                    />
                  )}
                  <text
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                    x={line.labelX}
                    y={line.labelY}
                    className={styles.connectorLabel}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {line.label}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {leafPositions.map((leaf) => {
          const dx = leaf.x - leaf.parentPos.x;
          const dy = leaf.y - leaf.parentPos.y;
          const leafLines = wrapWords(leaf.name, 18);
          const lineH = 14;
          const { anchor, baseX, baseY } = placeLabel(
            leaf,
            dx,
            dy,
            LEAF_DOT_RADIUS,
            LEAF_LABEL_GAP,
            leafLines.length,
            lineH,
          );
          const p1 = circleEdge(
            leaf.parentPos.x,
            leaf.parentPos.y,
            leaf.parentRadius + CONNECTOR_GAP,
            leaf.x,
            leaf.y,
          );
          const p2 = circleEdge(
            leaf.x,
            leaf.y,
            LEAF_DOT_RADIUS + CONNECTOR_GAP,
            leaf.parentPos.x,
            leaf.parentPos.y,
          );
          const leafActive = highlight.leaves.has(leaf.key);
          const leafDimmed = !!activeKey && !leafActive;
          return (
            <g key={`leaf-${leaf.key}`}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                className={cx(styles.leafSpoke, leafActive && styles.active)}
              />
              <circle
                cx={leaf.x}
                cy={leaf.y}
                r={LEAF_DOT_RADIUS}
                className={cx(
                  styles.leafDot,
                  leafActive && styles.active,
                  leafDimmed && styles.dimmed,
                )}
                onPointerDown={(e) =>
                  handleLeafPointerDown(leaf.key, leaf.parentPos, e)
                }
                onPointerEnter={() => setHoverKey(`leaf-${leaf.key}`)}
                onPointerLeave={() =>
                  setHoverKey((prev) =>
                    prev === `leaf-${leaf.key}` ? null : prev,
                  )
                }
              />
              <text
                x={baseX}
                textAnchor={anchor}
                className={cx(
                  styles.leafLabel,
                  leafActive && styles.active,
                  leafDimmed && styles.dimmed,
                )}
                onPointerDown={(e) =>
                  handleLeafPointerDown(leaf.key, leaf.parentPos, e)
                }
                onPointerEnter={() => setHoverKey(`leaf-${leaf.key}`)}
                onPointerLeave={() =>
                  setHoverKey((prev) =>
                    prev === `leaf-${leaf.key}` ? null : prev,
                  )
                }
              >
                {leafLines.map((lineText, li) => (
                  <tspan
                    key={li}
                    x={baseX}
                    y={baseY + li * lineH}
                    dominantBaseline={
                      anchor === "middle" ? undefined : "middle"
                    }
                  >
                    {lineText}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {hubPositions &&
          center &&
          HUBS.map((hub, i) => {
            const pos = hubPositions[i];
            const titleLines = wrapWords(hub.title, 18);
            const lineH = 16;
            const dotRadius = hubRadii?.[i] ?? DOT_RADIUS;
            const hubActive = highlight.hubs.has(i);
            const hubDimmed = !!activeKey && !hubActive;

            return (
              <g key={hub.title}>
                {/* Outlined hit-area — doubles as the hub's visible
                    clearance-radius outline and its drag/hover target. */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={dotRadius}
                  className={cx(styles.hubHitArea, hubActive && styles.active)}
                  onPointerDown={(e) => handleHubPointerDown(i, e)}
                  onPointerEnter={() => setHoverKey(`hub-${i}`)}
                  onPointerLeave={() =>
                    setHoverKey((prev) => (prev === `hub-${i}` ? null : prev))
                  }
                />
                <text
                  x={pos.x}
                  textAnchor="middle"
                  className={cx(
                    styles.hubLabel,
                    hubActive && styles.active,
                    hubDimmed && styles.dimmed,
                  )}
                  onPointerDown={(e) => handleHubPointerDown(i, e)}
                  onPointerEnter={() => setHoverKey(`hub-${i}`)}
                  onPointerLeave={() =>
                    setHoverKey((prev) => (prev === `hub-${i}` ? null : prev))
                  }
                  {...(i === CENTER_HUB_INDEX
                    ? { "data-hub-center": "true" }
                    : {})}
                >
                  {titleLines.map((lineText, li) => (
                    <tspan
                      key={li}
                      x={pos.x}
                      y={pos.y + (li - (titleLines.length - 1) / 2) * lineH}
                      dominantBaseline="middle"
                    >
                      {lineText}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}

        {/* Hidden measurement pass — real rendered size of every hub's
            own wrapped title, used once to derive hubRadii above. Never
            painted (visibility:hidden keeps getBBox working, unlike
            display:none). */}
        <g visibility="hidden" aria-hidden="true">
          {HUBS.map((hub, i) => {
            const titleLines = wrapWords(hub.title, 18);
            const lineH = 16;
            return (
              <text
                key={hub.title}
                ref={(el) => {
                  hubMeasureRefs.current[i] = el;
                }}
                className={styles.hubLabel}
                textAnchor="middle"
              >
                {titleLines.map((lineText, li) => (
                  <tspan key={li} x={0} y={li * lineH}>
                    {lineText}
                  </tspan>
                ))}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
