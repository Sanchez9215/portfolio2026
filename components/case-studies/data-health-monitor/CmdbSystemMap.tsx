"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { HubNode } from "@/components/ContentHub";
import styles from "./CmdbSystemMap.module.css";

interface Hub {
  title: string;
  nodes: HubNode[];
}

// Placed evenly around a circle in array order (see CIRCLE_RADIUS below) —
// order here is what determines each hub's position around the ring.
const HUBS: Hub[] = [
  {
    title: "Data Sources & Discovery",
    nodes: [
      { name: "Automated Discovery Tools" },
      { name: "Manual Entry / Data Import" },
      { name: "Synced from Other Systems" },
      { name: "Conflict Resolution Rules" },
    ],
  },
  {
    title: "CI Structure",
    nodes: [
      {
        name: "Domain",
        children: [
          {
            name: "CI Type / CI Class",
            children: [
              {
                name: "Configuration Item (CI)",
                children: [{ name: "CI Attributes" }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Relationships",
    nodes: [
      {
        name: "Relationship Types",
        children: [
          { name: "Depends On" },
          { name: "Runs On" },
          { name: "Hosts" },
          { name: "Connects To" },
          { name: "Parent/Child or Peer" },
        ],
      },
      { name: "Dependency Mapping" },
    ],
  },
  {
    title: "CMDB Users & Governance",
    nodes: [
      { name: "Data Health Ownership" },
      { name: "Key Stakeholders & Roles" },
      { name: "Governance Authority" },
      { name: "Domain Ownership Scope" },
    ],
  },
  {
    title: "Maintenance & Data Health",
    nodes: [
      { name: "Process Status Lifecycle" },
      { name: "Certification Workflow" },
      { name: "Current Health Metrics" },
      { name: "Maintenance Cadence" },
      { name: "Process Duration & SLA" },
      { name: "Existing Tooling Landscape" },
    ],
  },
  {
    title: "Consumers / Use Cases",
    nodes: [
      { name: "Change Impact Analysis" },
      { name: "Incident Triage & Root Cause" },
      { name: "Asset Lifecycle & Compliance Reporting" },
      { name: "Cost/FinOps Reporting" },
    ],
  },
];

// Indices into HUBS above: 0=Data Sources, 1=CI Structure, 2=Relationships,
// 3=Governance, 4=Maintenance, 5=Consumers.
//
// Which hub sits fixed at the circle's center instead of on the ring
// (currently CI Structure — it has the most connections of any hub).
const CENTER_HUB_INDEX = 1;

// Clockwise ring order (starting at top), by hub index — separate from
// HUBS' own array order/definitions above, so CONNECTIONS' indices never
// need renumbering when this changes. Chosen so every non-center
// connection below falls between ring-neighbors (no chord crosses the
// middle): Data Sources(0) → Relationships(2) → Consumers(5) →
// Governance(3) → Maintenance(4) → back to Data Sources.
const RING_ORDER = [0, 2, 5, 3, 4];

// How far the ring hubs sit from the center hub, in px. Raise it and
// every ring hub moves further out (and from each other); lower it and
// they move closer. Connectors are drawn dot-edge-to-dot-edge, so their
// drawn length is just a direct result of this — no separate control.
const CIRCLE_RADIUS = 320;

// A hub dot's own radius, in px.
const DOT_RADIUS = 8;
// Gap between a hub dot's edge and the start of its label text, in px.
const LABEL_GAP = 20;

// How far a leaf sits from its own hub (the leaf spoke's length), in px.
const LEAF_RADIUS = 172;
// How wide a fan a hub's leaves spread across, in degrees — centered on
// the direction pointing away from the diagram's center.
const LEAF_ARC_DEG = 160;
// A leaf dot's own radius, in px.
const LEAF_DOT_RADIUS = 4;
// Gap between a leaf dot's edge and the start of its label text, in px.
const LEAF_LABEL_GAP = 16;

// A "convergence leaf" (any leaf that's the `to` of a LEAF_CONNECTIONS
// entry, e.g. "Parent/Child or Peer") skips the normal even-fan-with-
// siblings placement — it's centered on the parent's outward angle instead,
// pushed out this multiple of LEAF_RADIUS so it clears the sibling fan and
// their cross-connector lines funnel cleanly into it from below.
const CONVERGENCE_RADIUS_MULTIPLIER = 1.6;

// Extra gap between a connector line's end and the dot it points to, in
// px — added on top of that dot's own radius, for every connector
// (hub-to-hub and leaf spokes alike). 0 = the line touches the dot
// exactly; raise it to stop the line short of the dot.
const CONNECTOR_GAP = 8;

// Extra leaf-to-leaf lines, independent of the parent/child fan tree above —
// for relationships between sibling leaves that aren't a parent/child pair
// (e.g. all four Relationship-Types leaves connecting to the shared
// Parent/Child-or-Peer leaf). Keys match leafPositions' own key scheme:
// "<hubIndex>-<childIndex>-<grandchildIndex>-...".
const LEAF_CONNECTIONS: { from: string; to: string }[] = [
  { from: "2-0-0", to: "2-0-4" },
  { from: "2-0-1", to: "2-0-4" },
  { from: "2-0-2", to: "2-0-4" },
  { from: "2-0-3", to: "2-0-4" },
];

const CONNECTIONS: {
  from: number;
  to: number;
  label: string;
}[] = [
  { from: 0, to: 1, label: "populates" },
  { from: 0, to: 2, label: "populates" },
  { from: 1, to: 2, label: "has" },
  { from: 3, to: 4, label: "defines policy for" },
  { from: 3, to: 1, label: "owns" },
  { from: 4, to: 1, label: "validates/corrects" },
  { from: 4, to: 2, label: "validates/corrects" },
  { from: 4, to: 0, label: "audits" },
  { from: 1, to: 5, label: "feeds" },
  { from: 2, to: 5, label: "feeds" },
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

export default function CmdbSystemMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);

  const [hubPositions, setHubPositions] = useState<
    { x: number; y: number }[] | null
  >(null);
  const [leafOverrides, setLeafOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [arrowSize, setArrowSize] = useState(0);
  const [labelSizes, setLabelSizes] = useState<
    { width: number; height: number }[] | null
  >(null);

  // Circular layout — no physics, no simulation, no grid/scale math. Hubs
  // sit evenly spaced around a ring of radius CIRCLE_RADIUS, centered in
  // the container. Recomputes only on a real container width change (e.g.
  // window resize), so the ring re-centers but never rescales itself.
  useLayoutEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const layout = () => {
      const width = containerEl.getBoundingClientRect().width;
      if (!width) return;

      const computed = getComputedStyle(containerEl);
      setArrowSize(parseFloat(computed.getPropertyValue("--spacing-sm")));

      const cx = width / 2;
      const cy = CIRCLE_RADIUS + DOT_RADIUS + LEAF_RADIUS;
      const ringCount = RING_ORDER.length;
      const positions: { x: number; y: number }[] = new Array(HUBS.length);
      positions[CENTER_HUB_INDEX] = { x: cx, y: cy };
      RING_ORDER.forEach((hubIndex, slot) => {
        const angle = (slot / ringCount) * 2 * Math.PI - Math.PI / 2;
        positions[hubIndex] = {
          x: cx + Math.cos(angle) * CIRCLE_RADIUS,
          y: cy + Math.sin(angle) * CIRCLE_RADIUS,
        };
      });

      setHubPositions(positions);
      setContainerSize({
        width,
        height: CIRCLE_RADIUS * 2 + DOT_RADIUS * 2 + LEAF_RADIUS * 2,
      });
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, []);

  // Small square rects around each dot — used only to keep connector
  // labels (the mid-line "populates"/"feeds" text) from overlapping a dot.
  const hubDotRects = useMemo<Rect[] | null>(() => {
    if (!hubPositions) return null;
    return hubPositions.map((p) => ({
      x: p.x - DOT_RADIUS,
      y: p.y - DOT_RADIUS,
      width: DOT_RADIUS * 2,
      height: DOT_RADIUS * 2,
    }));
  }, [hubPositions]);

  // Each leaf is fanned out from its own hub, across an arc centered on
  // the direction pointing away from the diagram's center (so leaves grow
  // outward, away from the rest of the graph, rather than back into it).
  // Top-level nodes only — nested children (e.g. CI Structure's Domain
  // chain) fan out one further tier each, at the same angle bias as their
  // own parent — same LEAF_RADIUS/LEAF_ARC_DEG controls apply at every
  // depth, there's no separate per-level constant to keep in sync.
  const leafPositions = useMemo(() => {
    const center = hubPositions?.[CENTER_HUB_INDEX];
    if (!hubPositions || !center) return [];
    const arc = (LEAF_ARC_DEG * Math.PI) / 180;

    const out: {
      key: string;
      name: string;
      parentPos: { x: number; y: number };
      parentRadius: number;
      x: number;
      y: number;
    }[] = [];

    const convergenceKeys = new Set(LEAF_CONNECTIONS.map((c) => c.to));

    function place(
      nodes: HubNode[],
      parentPos: { x: number; y: number },
      parentRadius: number,
      outwardAngle: number,
      keyPrefix: string,
    ) {
      const normalCount = nodes.filter(
        (_, i) => !convergenceKeys.has(`${keyPrefix}-${i}`),
      ).length;
      let normalIdx = 0;
      nodes.forEach((node, i) => {
        const key = `${keyPrefix}-${i}`;
        const isConvergence = convergenceKeys.has(key);
        let angle: number;
        let radius: number;
        if (isConvergence) {
          angle = outwardAngle;
          radius = LEAF_RADIUS * CONVERGENCE_RADIUS_MULTIPLIER;
        } else {
          const t =
            normalCount === 1 ? 0 : normalIdx / (normalCount - 1) - 0.5;
          angle = outwardAngle + t * arc;
          radius = LEAF_RADIUS;
          normalIdx++;
        }
        const computed = {
          x: parentPos.x + Math.cos(angle) * radius,
          y: parentPos.y + Math.sin(angle) * radius,
        };
        const p = leafOverrides[key] ?? computed;
        out.push({
          key,
          name: node.name,
          parentPos,
          parentRadius,
          x: p.x,
          y: p.y,
        });
        if (node.children?.length) {
          place(node.children, p, LEAF_DOT_RADIUS, angle, key);
        }
      });
    }

    HUBS.forEach((hub, hi) => {
      if (hub.nodes.length === 0) return;
      const pos = hubPositions[hi];
      const outwardAngle =
        hi === CENTER_HUB_INDEX
          ? Math.PI / 2
          : Math.atan2(pos.y - center.y, pos.x - center.x);
      place(hub.nodes, pos, DOT_RADIUS, outwardAngle, `${hi}`);
    });

    return out;
  }, [hubPositions, leafOverrides]);

  // Extra leaf-to-leaf lines (LEAF_CONNECTIONS) — same dot-edge-to-dot-edge
  // approach as hub connectors, just looked up by leaf key instead of index.
  const leafConnectorLines = useMemo(() => {
    if (leafPositions.length === 0) return [];
    const byKey = new Map(leafPositions.map((l) => [l.key, l]));
    return LEAF_CONNECTIONS.flatMap(({ from, to }) => {
      const a = byKey.get(from);
      const b = byKey.get(to);
      if (!a || !b) return [];
      const p1 = circleEdge(
        a.x,
        a.y,
        LEAF_DOT_RADIUS + CONNECTOR_GAP,
        b.x,
        b.y,
      );
      const p2 = circleEdge(
        b.x,
        b.y,
        LEAF_DOT_RADIUS + CONNECTOR_GAP,
        a.x,
        a.y,
      );
      return [{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }];
    });
  }, [leafPositions]);

  // Each connector draws real dot-edge-to-dot-edge — its length is just
  // whatever the actual distance between the two hubs is. Moving hubs
  // closer (via CIRCLE_RADIUS or a drag) directly shortens it.
  const lines = useMemo<LineGeometry[]>(() => {
    if (!hubPositions) return [];
    return CONNECTIONS.map(({ from, to, label }) => {
      const a = hubPositions[from];
      const b = hubPositions[to];
      const p1 = circleEdge(a.x, a.y, DOT_RADIUS + CONNECTOR_GAP, b.x, b.y);
      const p2 = circleEdge(b.x, b.y, DOT_RADIUS + CONNECTOR_GAP, a.x, a.y);
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
  }, [hubPositions]);

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
  }, [lines, labelSizes, hubDotRects]);

  // Drag — pure direct manipulation. Grabbing a dot just moves that one
  // dot to the pointer; nothing else reacts, nothing snaps back. Shared by
  // both hub dots (setHubPositions) and leaf dots (setLeafOverrides) below.
  function startDrag(
    e: ReactPointerEvent<SVGCircleElement>,
    onMove: (p: { x: number; y: number }) => void,
  ) {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    const toLocal = (clientX: number, clientY: number) => {
      const rect = containerEl.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleMove = (ev: PointerEvent) =>
      onMove(toLocal(ev.clientX, ev.clientY));
    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleHubPointerDown(
    i: number,
    e: ReactPointerEvent<SVGCircleElement>,
  ) {
    startDrag(e, (p) => {
      setHubPositions((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        next[i] = p;
        return next;
      });
    });
  }

  // Leaf positions are otherwise fully computed (fanned out from their
  // hub) — a drag just records a per-leaf override that wins over the
  // computed position, same direct-manipulation feel as hub dragging.
  function handleLeafPointerDown(
    key: string,
    e: ReactPointerEvent<SVGCircleElement>,
  ) {
    startDrag(e, (p) => {
      setLeafOverrides((prev) => ({ ...prev, [key]: p }));
    });
  }

  const center = hubPositions?.[CENTER_HUB_INDEX];

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ height: containerSize.height || undefined }}
    >
      <svg
        className={styles.overlay}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        aria-hidden="true"
      >
        <defs>
          <marker
            id="cmdb-connector-arrow"
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

        {leafConnectorLines.map((line, i) => (
          <line
            key={`leaf-connector-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className={styles.leafSpoke}
          />
        ))}

        {lines.map((line, i) => (
          <line
            key={`connector-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className={styles.connector}
            markerEnd="url(#cmdb-connector-arrow)"
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
          return (
            <g key={`leaf-${leaf.key}`}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                className={styles.leafSpoke}
              />
              <circle
                cx={leaf.x}
                cy={leaf.y}
                r={LEAF_DOT_RADIUS}
                className={styles.leafDot}
                onPointerDown={(e) => handleLeafPointerDown(leaf.key, e)}
              />
              <text x={baseX} textAnchor={anchor} className={styles.leafLabel}>
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
            const dx = pos.x - center.x;
            const dy = pos.y - center.y;
            const titleLines = wrapWords(hub.title, 18);
            const lineH = 16;
            const { anchor, baseX, baseY } = placeLabel(
              pos,
              dx,
              dy,
              DOT_RADIUS,
              LABEL_GAP,
              titleLines.length,
              lineH,
            );

            return (
              <g key={hub.title}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={DOT_RADIUS}
                  className={styles.hubDot}
                  onPointerDown={(e) => handleHubPointerDown(i, e)}
                />
                <text x={baseX} textAnchor={anchor} className={styles.hubLabel}>
                  {titleLines.map((lineText, li) => (
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
      </svg>
    </div>
  );
}
