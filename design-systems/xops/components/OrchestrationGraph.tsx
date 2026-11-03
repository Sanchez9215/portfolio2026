import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChartTooltip } from "./ChartTooltip";
import { StatusIcon, StatusIconStatus } from "./StatusIcon";
import styles from "./OrchestrationGraph.module.css";

export type GraphLane = {
  id: string;
  label: string;
  color: string;
  /** Item status; omit for the employee trunk. */
  status?: StatusIconStatus;
  /** Right-hand legend code (e.g. "ITM-01"). */
  code?: string;
};

export type GraphEvent = {
  id: string;
  lane: string;
  title: string;
  time: string;
  status: StatusIconStatus;
  /** Event in another lane that caused this one — a branch starts from its dot. */
  triggeredBy?: string;
};

export type OrchestrationGraphProps = {
  /** Top to bottom: the employee trunk first, then one lane per item. */
  lanes: GraphLane[];
  /** In global time order. */
  events: GraphEvent[];
  /** Waiting for events: shows only what is known up front (lane rows, codes, names, status icons on empty grey tracks). */
  loading?: boolean;
  /** Play the staged draw-in (trunk first, then lanes top to bottom) once the graph is ready, then start the motion. */
  entrance?: boolean;
  /** Called when the draw-in has finished. */
  onEntranceComplete?: () => void;
};

type Point = { x: number; y: number };

const readPx = (element: Element, name: string) =>
  parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;

// A time custom property ("1s" or "250ms") in milliseconds.
const readMs = (element: Element, name: string) => {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  return (parseFloat(value) || 0) * (value.endsWith("ms") ? 1 : 1000);
};

// Branches and merges are straight lines whose angle adapts to the data. Each row crossed needs at
// least this much horizontal run (a fraction of the row height), so no line gets too steep to read.
const MIN_RUN_PER_ROW = 0.75;

// Trial: a finished item lane's connectors (branch and merge) step down the brand ramp from the live trunk's primary.
const CONNECTOR_COMPLETE = "var(--xops-brand-300)";

// Merge dots have no event of their own; hover identifies them by this prefix plus the merging lane's id.
const MERGE_PREFIX = "merge-";
const mergeIdOf = (laneId: string) => `${MERGE_PREFIX}${laneId}`;

// Exception and warning lanes share one mechanic: they run to a head on the problem event.
const isAlert = (status?: StatusIconStatus) =>
  status === "exception" || status === "warning";

// Trial: a stuck lane's last event is a diamond in its status color.
const alertSolid = (status?: StatusIconStatus) =>
  status === "warning" ? "var(--xops-status-warning-solid)" : "var(--xops-status-danger-solid)";

// useLayoutEffect warns during server render; measuring only matters in the browser.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// A dash that follows a lane's whole path — out of the trigger dot, down the branch, along the row — once per mount.
// Being strokes on the same path, it bends round every curve exactly. Only the dash offset animates, in its own SVG layer,
// so the static lines never repaint.
// A solid core, then FLOW_LAYERS translucent dashes of stepped lengths centered on the same point: only the outer stretch
// at each end is covered by fewer of them, so the ends fade out to transparent while the middle stays solid.
// Figma's gradient stops: transparent at 0%, opaque from 35% to 65%, transparent at 100% — so 35% of the length fades at each end.
const FLOW_FADE_FRACTION = 0.35;
const FLOW_LAYERS = 8;
// How opaque the solid middle is; applied to the whole stack as a group, so the fade keeps its shape, scaled down.
const FLOW_CENTER_OPACITY = 0.5;
// The opacity a layer needs so the stack's total ramps linearly: band m (counted from the tip) is covered by m layers and
// should read (m - 0.5) / FLOW_LAYERS, so each layer adds the step from the band before it.
const rampAlpha = (band: number) => (band === 0 ? 0 : (band - 0.5) / FLOW_LAYERS);
const flowLayerOpacity = (k: number) => 1 - (1 - rampAlpha(k + 1)) / (1 - rampAlpha(k));

function FlowLens({
  path,
  dash,
  width,
  pass,
  easing,
  className,
  color = "var(--xops-brand-primary)",
}: {
  path: string;
  dash: number;
  width: number;
  pass: number;
  easing: string;
  className?: string;
  /** The dash's stroke; brand for an in-progress lane, the status color for a stuck one. */
  color?: string;
}) {
  const layerRefs = useRef<(SVGPathElement | null)[]>([]);

  // Every layer is the full width. The fade layers run from the full length down to the core's length plus one step; the core is last and opaque.
  const fade = dash * FLOW_FADE_FRACTION;
  const core = dash - 2 * fade;
  const layers = [
    ...Array.from({ length: FLOW_LAYERS }, (_, k) => ({
      strokeWidth: width,
      length: core + (2 * fade * (FLOW_LAYERS - k)) / FLOW_LAYERS,
      opacity: flowLayerOpacity(k),
    })),
    { strokeWidth: width, length: core, opacity: 1 },
  ];

  useEffect(() => {
    const first = layerRefs.current[0];
    if (!first || !path || dash <= 0 || pass <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const total = first.getTotalLength();
    if (total <= 0) return;
    const animations = layerRefs.current.flatMap((layer, k) => {
      if (!layer) return [];
      const { length } = layers[k];
      // One window `length` long, then a gap longer than the path so the pattern never repeats on it.
      layer.style.strokeDasharray = `${length} ${total + dash}`;
      // The window's center travels from half a lens before the origin to half a lens past the head; its start is length/2 behind the center.
      return [
        layer.animate(
          [
            { strokeDashoffset: length / 2 + dash / 2, visibility: "visible" },
            { strokeDashoffset: length / 2 - total - dash / 2, visibility: "visible" },
          ],
          { duration: pass, easing: easing || "ease-out" },
        ),
      ];
    });
    return () => animations.forEach((animation) => animation.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, dash, width, pass, easing]);

  return (
    <g opacity={FLOW_CENTER_OPACITY}>
      {layers.map((layer, k) => (
        <path
          key={k}
          ref={(element) => {
            layerRefs.current[k] = element;
          }}
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={layer.strokeWidth}
          strokeOpacity={layer.opacity}
          className={className}
        />
      ))}
    </g>
  );
}

// Built state by state. Done so far: all open, in progress, complete (a finished lane
// merges back into the trunk's end), exception and warning (run to a head on the problem event,
// the line into it and the label tinted).
export function OrchestrationGraph({
  lanes: lanesProp,
  events: eventsProp,
  loading = false,
  entrance = false,
  onEntranceComplete,
}: OrchestrationGraphProps) {
  // While loading, every item lane reads as not started and no event is known.
  const lanes = useMemo(
    () => (loading ? lanesProp.map((lane) => ({ ...lane, status: lane.status === undefined ? undefined : ("open" as const) })) : lanesProp),
    [loading, lanesProp],
  );
  const events = useMemo(() => (loading ? [] : eventsProp), [loading, eventsProp]);
  const plotRef = useRef<HTMLDivElement>(null);
  // The whole graph, for the draw-in: Start and End live in the lane rows, outside the plot.
  const graphRef = useRef<HTMLDivElement>(null);
  // The plot stays hidden until it has measured itself (so nothing is ever drawn bunched up at the origin), then fades in.
  const [ready, setReady] = useState(false);
  // The draw-in: pending until the graph is ready and loaded, running while it plays, done after. Flow, pulse and shimmer wait for done.
  const [entranceState, setEntranceState] = useState<"pending" | "running" | "done">(entrance ? "pending" : "done");
  const entranceAnimations = useRef<Animation[]>([]);
  const entranceTimer = useRef<ReturnType<typeof setTimeout>>();
  // The item lane under the pointer; every other item lane dims so it can be followed on its own.
  const [focusedLane, setFocusedLane] = useState<string | null>(null);
  // The point the pointer is nearest to in the lane under it: it gets the highlighter, a guide line and the tooltip.
  const [active, setActive] = useState<{
    id: string;
    laneIndex: number;
    x: number;
    sourceLane: string;
  } | null>(null);
  // Hidden = fading out (or waiting for the next point); the markers stay mounted meanwhile so they can glide and fade.
  const [hovering, setHovering] = useState(false);
  const unmountTimer = useRef<ReturnType<typeof setTimeout>>();
  const [tooltipAnchor, setTooltipAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // Extra width given to the layout so a finished trunk's last point lands exactly on the limit (settled after measuring).
  const [stretch, setStretch] = useState(0);
  const settlePasses = useRef(0);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
    dot: 0,
    stub: 0,
    radius: 0,
    check: 0,
    plotLeft: 0,
    glide: 0,
    highlight: 0,
    halo: 0,
    tooltipGap: 0,
    flowDash: 0,
    flowWidth: 0,
    flowCycle: 0,
    headGap: 0,
    badgeGap: 0,
    badgePad: 0,
    outline: 0,
    flowPass: 0,
    flowEasing: "",
  });
  // Bumped once per flow cycle so the dash paths remount and play one pass again.
  const [flowRun, setFlowRun] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const measure = () =>
      setSize({
        width: plot.clientWidth,
        height: plot.clientHeight,
        dot: readPx(plot, "--graph-dot-size"),
        stub: readPx(plot, "--graph-elbow-stub"),
        radius: readPx(plot, "--graph-elbow-radius"),
        check: readPx(plot, "--graph-check-size"),
        plotLeft: plot.offsetLeft,
        glide: readPx(plot, "--graph-dim-duration"),
        highlight: readPx(plot, "--graph-highlight-size"),
        halo: readPx(plot, "--graph-highlight-halo"),
        tooltipGap: readPx(plot, "--graph-tooltip-gap"),
        flowDash: readPx(plot, "--graph-flow-dash"),
        flowWidth: readPx(plot, "--graph-flow-width"),
        headGap: readPx(plot, "--graph-head-gap"),
        badgeGap: readPx(plot, "--xops-spacing-8"),
        badgePad: readPx(plot, "--xops-spacing-12"),
        outline: readPx(plot, "--xops-border-width-1"),
        flowPass: readMs(plot, "--graph-flow-duration"),
        flowEasing: getComputedStyle(plot).getPropertyValue("--graph-flow-easing").trim(),
        flowCycle:
          readMs(plot, "--graph-flow-duration") +
          readMs(plot, "--graph-flow-interval"),
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(plot);
    return () => observer.disconnect();
    // A different lane count changes the plot's height: measure again before paint so rows never use the old one.
  }, [lanes.length]);

  // Reveal once measured. A frame later, so the settle passes below have landed the trunk first.
  useIsomorphicLayoutEffect(() => {
    if (ready || size.width === 0 || size.height === 0) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [ready, size.width, size.height]);

  useEffect(
    () => () => {
      clearTimeout(entranceTimer.current);
      entranceAnimations.current.forEach((animation) => animation.cancel());
    },
    [],
  );

  // A finished trunk's last point sits on the centre of the check badges below it, which fill the last badge-width of the plot.
  const trunkLimit = size.width - size.check / 2;
  const available = trunkLimit + stretch;
  // From a point's center to the tooltip: the highlighter's radius, its halo, then a gap.
  const highlightReach = size.highlight / 2 + size.halo + size.tooltipGap;
  const rowHeight = size.height / lanes.length;
  // Reserve the width a merge from the right-most dot needs to reach the trunk, so merges never run out of room.
  // Branches that leave the same dot are staggered along the source lane, so the biggest group adds room too.
  const margin = size.dot * 2;
  // Where a branch leaving at departX lands in a lane `rows` away. The two elbows each use a stub and a
  // corner of horizontal room, so add them on top of the run: the straight part between them then always
  // has the same slope, whatever the depth, and every branch runs parallel.
  const elbowRun = 2 * (size.stub + size.radius);
  const landXFor = (departX: number, dy: number) =>
    departX + elbowRun + Math.abs(dy) * MIN_RUN_PER_ROW;
  const branchesPerTrigger = new Map<string, number>();
  lanes.forEach((lane, index) => {
    if (index === 0) return;
    const triggerId = events
      .filter((event) => event.lane === lane.id)
      .map((event) => event.triggeredBy)
      .find((id) => id && events.find((e) => e.id === id)?.lane !== lane.id);
    if (triggerId)
      branchesPerTrigger.set(
        triggerId,
        (branchesPerTrigger.get(triggerId) ?? 0) + 1,
      );
  });
  const stagger =
    Math.max(0, ...Array.from(branchesPerTrigger.values()), 1) - 1;
  // Merges into the trunk are staggered too: each finished lane lands at least one margin after the previous, so the biggest crowd adds room.
  const mergeCount = lanes.filter(
    (lane, index) => index > 0 && lane.status === "complete",
  ).length;
  // A lane started from another item lane (not the trunk) begins right of that lane's own dots, so the climbs chain:
  // the extra room a lane needs is its trigger lane's extra room plus this branch's elbows and run. Walk the chain once per lane.
  const reserveLaneIndex = new Map(lanes.map((lane, index) => [lane.id, index]));
  const chainClimbMemo = new Map<number, number>();
  const chainClimb = (index: number, seen: Set<number> = new Set()): number => {
    if (index === 0 || seen.has(index)) return 0;
    const cached = chainClimbMemo.get(index);
    if (cached !== undefined) return cached;
    const triggerLane = events
      .filter((event) => event.lane === lanes[index].id)
      .map((event) => (event.triggeredBy ? events.find((e) => e.id === event.triggeredBy)?.lane : undefined))
      .find((laneId) => laneId && laneId !== lanes[index].id);
    const from = triggerLane ? (reserveLaneIndex.get(triggerLane) ?? 0) : 0;
    const climb =
      from === 0
        ? 0
        : chainClimb(from, new Set(seen).add(index)) +
          elbowRun +
          Math.abs(index - from) * rowHeight * MIN_RUN_PER_ROW;
    chainClimbMemo.set(index, climb);
    return climb;
  };
  // Each lane's merge needs its own run to the trunk on top of its chain; the deepest lane's run is the floor.
  const mergeRun = (index: number) => elbowRun + index * rowHeight * MIN_RUN_PER_ROW;
  const reserve =
    Math.max(
      mergeRun(lanes.length - 1),
      ...lanes.map((_, index) => (index === 0 ? 0 : chainClimb(index) + mergeRun(index))),
    ) +
    (stagger + Math.max(0, mergeCount - 1)) * margin +
    size.dot / 2;
  const yOf = (laneIndex: number) => (laneIndex + 0.5) * rowHeight;
  const laneIndexOf = new Map(lanes.map((lane, index) => [lane.id, index]));
  // Trial: a lane's x is its own progress, not the request's event order. Its n events (planned ones included) split the
  // width evenly, so event k sits k/n of the way along and the head's distance to the edge is that lane's remaining share.
  // Causality can still push a dot right (a branch must land after the event that triggered it), and dots never sit
  // closer than one margin.
  const eventSpan = Math.max(available - reserve, 0);
  const minStep = margin;
  const ordinalX = new Map<string, number>();
  lanes.forEach((lane) => {
    const laneEvents = events.filter((event) => event.lane === lane.id);
    laneEvents.forEach((event, k) =>
      ordinalX.set(event.id, (k / laneEvents.length) * eventSpan),
    );
  });
  const finalX = new Map<string, number>();
  const mergeDots: (Point & { laneId: string })[] = [];
  const mergeLandings: number[] = [];

  // A line that leaves a dot along the lane for a short stub, eases round a small corner, runs
  // straight, then mirrors the same corner and stub on the way into the target.
  const eased = (from: Point, to: Point): string => {
    const dx = to.x - from.x;
    if (dx <= 0 || size.radius === 0) return ` L ${to.x} ${to.y}`;
    // Keep room for both corners and at least a corner's worth of straight line between them.
    const r = Math.min(size.radius, Math.max(dx - 2 * size.stub, 0) / 4);
    const outX = from.x + size.stub + r;
    const inX = to.x - size.stub - r;
    const vx = inX - outX;
    const vy = to.y - from.y;
    const length = Math.hypot(vx, vy) || 1;
    const ux = vx / length;
    const uy = vy / length;
    return ` L ${from.x + size.stub} ${from.y} Q ${outX} ${from.y} ${outX + r * ux} ${from.y + r * uy} L ${inX - r * ux} ${to.y - r * uy} Q ${inX} ${to.y} ${to.x - size.stub} ${to.y} L ${to.x} ${to.y}`;
  };

  type Layout = {
    lane: GraphLane;
    index: number;
    started: boolean;
    dots: { id: string; x: number }[];
    head?: { x: number; id: string };
    path?: string;
    /** The branch connector (trigger dot → lane's first dot), drawn grey apart from the lane's colored line. */
    branch?: string;
    /** The line joining the lane's events: `path` without its connectors. */
    rowPath?: string;
    /** Where that line starts along x: the branch's landing, or 0 for a lane with no trigger. */
    rowStartX?: number;
    /** A finished lane's merge connector (last dot → trunk). */
    merge?: string;
    /** Exception/warning only: the last stretch into the head. */
    tail?: string;
    /** Exception/warning only: the whole lane from its origin to the head, for the status-colored dash. */
    alertFlowPath?: string;
    /** In-progress item lane only: the last stretch (last finished point → head), where the flowing dash runs. */
    frontier?: {
      d: string;
      length: number;
      x: number;
      y: number;
      /** The whole lane from its origin (the trigger dot) down the branch and along the row to the head: the path the flowing lens follows. */
      flowPath: string;
    };
  };

  // Overlap avoidance. A branch descending to a lower lane can run right across a lane above it and
  // land on top of that lane's first dots. Plan every branch first, then nudge a lane's first dot
  // right until no lower branch passes within a margin of it.
  // Every branch runs at the same slope. Branches leaving one dot are staggered along the source lane
  // (deepest lane first, one margin apart), so their diagonals run parallel and never cross.
  type BranchPlan = {
    index: number;
    id: string;
    triggerId: string;
    srcX: number;
    srcY: number;
    y: number;
    offset: number;
    landX: number;
    firstX: number;
  };
  const plans: BranchPlan[] = [];
  lanes.forEach((lane, index) => {
    if (
      index === 0 ||
      (lane.status !== "in-progress" &&
        lane.status !== "complete" &&
        !isAlert(lane.status))
    )
      return;
    const laneEvents = events.filter((event) => event.lane === lane.id);
    const first = laneEvents.find(
      (event) =>
        event.status === "complete" ||
        event.status === "in-progress" ||
        isAlert(event.status),
    );
    const triggerId = laneEvents
      .map((event) => event.triggeredBy)
      .find((id) => id && events.find((e) => e.id === id)?.lane !== lane.id);
    if (!first || !triggerId) return;
    const sourceEvent = events.find((event) => event.id === triggerId)!;
    const srcX = ordinalX.get(triggerId) ?? 0;
    const srcY = yOf(laneIndexOf.get(sourceEvent.lane) ?? 0);
    const y = yOf(index);
    plans.push({
      index,
      id: lane.id,
      triggerId,
      srcX,
      srcY,
      y,
      offset: 0,
      landX: 0,
      firstX: ordinalX.get(first.id) ?? 0,
    });
  });
  const byTrigger = new Map<string, BranchPlan[]>();
  plans.forEach((plan) =>
    byTrigger.set(plan.triggerId, [
      ...(byTrigger.get(plan.triggerId) ?? []),
      plan,
    ]),
  );
  byTrigger.forEach((group) =>
    group
      .sort((a, b) => b.index - a.index)
      .forEach((plan, rank) => {
        plan.offset = rank * margin;
        plan.landX = landXFor(plan.srcX + plan.offset, plan.y - plan.srcY);
        plan.firstX = Math.max(plan.firstX, plan.landX);
      }),
  );
  for (let pass = 0; pass < plans.length; pass++) {
    let changed = false;
    for (const lower of plans) {
      for (const upper of plans) {
        if (upper.index >= lower.index) continue;
        // Only a lower lane whose line actually crosses the upper lane's row can collide with it.
        if (
          upper.y <= Math.min(lower.srcY, lower.y) ||
          upper.y >= Math.max(lower.srcY, lower.y)
        )
          continue;
        const departX = lower.srcX + lower.offset;
        const x =
          departX +
          ((upper.y - lower.srcY) / (lower.y - lower.srcY)) *
            (lower.landX - departX);
        if (Math.abs(x - upper.firstX) < margin) {
          upper.firstX = x + margin;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  const plannedFirstX = new Map(plans.map((plan) => [plan.id, plan.firstX]));
  const plannedOffset = new Map(plans.map((plan) => [plan.id, plan.offset]));

  const computeLayout = (lane: GraphLane, index: number): Layout => {
    const laneEvents = events.filter((event) => event.lane === lane.id);
    const handled =
      lane.status === undefined ||
      lane.status === "open" ||
      lane.status === "in-progress" ||
      isAlert(lane.status) ||
      lane.status === "complete";
    const completed = laneEvents.filter((event) => event.status === "complete");
    const headEvent =
      laneEvents.find(
        (event) => event.status === "in-progress" || isAlert(event.status),
      ) ??
      (index === 0
        ? laneEvents.find((event) => event.status !== "complete")
        : undefined);
    const started =
      handled &&
      (lane.status === "complete"
        ? completed.length > 0
        : completed.length > 0 ||
          ((lane.status === "in-progress" || isAlert(lane.status)) &&
            !!headEvent));
    if (!started) return { lane, index, started: false, dots: [] };

    const y = yOf(index);
    const points: Point[] = [];
    let cursor = 0;
    let path = "";
    let source: Point | undefined;
    let landing: Point | undefined;

    // Branch: leaves the triggering event's dot (after its stagger along the source lane), runs at the shared slope to this lane's row, then on to its first dot.
    const trigger = laneEvents
      .map((event) => event.triggeredBy)
      .find((id) => id && events.find((e) => e.id === id)?.lane !== lane.id);
    if (index > 0 && trigger) {
      const sourceEvent = events.find((event) => event.id === trigger)!;
      const sourceY = yOf(laneIndexOf.get(sourceEvent.lane) ?? 0);
      const sx = finalX.get(trigger) ?? ordinalX.get(trigger) ?? 0;
      const departX = sx + (plannedOffset.get(lane.id) ?? 0);
      const landX = landXFor(departX, y - sourceY);
      source = { x: departX, y: sourceY };
      landing = { x: landX, y };
      path =
        departX > sx
          ? `M ${sx} ${sourceY} L ${departX} ${sourceY}`
          : `M ${sx} ${sourceY}`;
      cursor = Math.max(plannedFirstX.get(lane.id) ?? 0, landX);
    } else {
      path = `M 0 ${y}`;
    }

    const dots = completed.map((event, i) => {
      const minX =
        i === 0 && index > 0 && trigger
          ? cursor
          : (points[points.length - 1]?.x ?? -minStep) + minStep;
      const x = Math.max(ordinalX.get(event.id) ?? 0, minX);
      points.push({ x, y });
      finalX.set(event.id, x);
      return { id: event.id, x };
    });

    let head: { x: number; id: string } | undefined;
    let tail: string | undefined;
    let frontier: Layout["frontier"];
    if (headEvent) {
      const lastX = points[points.length - 1]?.x ?? cursor;
      // The head keeps its own, wider gap from the last dot. Stuck lanes now end on their own
      // colored diamond like in-progress lanes, so every head sits the same distance from the last finished event.
      const headDistance = Math.max(minStep, size.headGap);
      const x = Math.max(ordinalX.get(headEvent.id) ?? 0, lastX + headDistance);
      head = { x, id: headEvent.id };
      if (index > 0 && lane.status === "in-progress")
        frontier = {
          d: `M ${lastX} ${y} L ${x} ${y}`,
          length: x - lastX,
          x: lastX,
          y,
          flowPath: "",
        };
      finalX.set(headEvent.id, x);
      // An exception lane's line stops at the last dot; the stretch into the head is drawn apart.
      if (isAlert(lane.status) && points.length > 0)
        tail = `M ${points[points.length - 1].x} ${y} L ${x} ${y}`;
      // An in-progress lane's line stops at its last finished point; the stretch into the head is the track the dash runs on.
      else if (!frontier) points.push({ x, y });
    }
    if (source && landing) path += eased(source, landing);
    const branchEnd = path.length;
    points.forEach((point) => {
      path += ` L ${point.x} ${point.y}`;
    });
    // A stuck lane's dash follows the same route as an in-progress one: the whole lane, ending on the head.
    // (Not tied to `tail`: a lane whose first event is the problem has no finished dot, so no tail, but still gets the dash.)
    const alertFlowPath = isAlert(lane.status) && head ? `${path} L ${head.x} ${y}` : undefined;
    if (frontier)
      frontier = {
        ...frontier,
        flowPath: `${path} L ${frontier.x + frontier.length} ${y}`,
      };

    // Merge: a finished lane leaves its last dot and rises to the trunk, landing on its own trunk dot.
    const rowEnd = path.length;
    let mergeFrom: Point | undefined;
    if (index > 0 && lane.status === "complete") {
      const trunkY = yOf(0);
      const lastX = points[points.length - 1]?.x ?? cursor;
      mergeFrom = { x: lastX, y };
      // Nudge right until it is a margin clear of every merge already on the trunk.
      let landX = landXFor(lastX, y - trunkY);
      while (mergeLandings.some((taken) => Math.abs(taken - landX) < margin))
        landX += margin;
      landX = Math.min(landX, available);
      mergeLandings.push(landX);
      // A pushed landing slides the departure along the lane instead of tilting the line, so every merge keeps the shared slope and none cross.
      const departX = Math.max(
        lastX,
        landX - elbowRun - Math.abs(y - trunkY) * MIN_RUN_PER_ROW,
      );
      if (departX > lastX) path += ` L ${departX} ${y}`;
      path += eased({ x: departX, y }, { x: landX, y: trunkY });
      mergeDots.push({ x: landX, y: trunkY, laneId: lane.id });
    }
    return {
      lane,
      index,
      started: true,
      dots,
      head,
      path,
      branch: landing ? path.slice(0, branchEnd) : undefined,
      rowStartX: landing?.x ?? 0,
      rowPath: landing ? `M ${landing.x} ${landing.y}${path.slice(branchEnd, rowEnd)}` : path.slice(0, rowEnd),
      merge: mergeFrom ? `M ${mergeFrom.x} ${mergeFrom.y}${path.slice(rowEnd)}` : undefined,
      tail,
      alertFlowPath,
      frontier,
    };
  };

  // A branch starts from its trigger's final dot, so the lane holding that dot is laid out first — even when it sits further down.
  const layoutCache = new Map<number, Layout>();
  const layoutInProgress = new Set<number>();
  const buildLayout = (index: number): Layout => {
    const cached = layoutCache.get(index);
    if (cached) return cached;
    layoutInProgress.add(index);
    const lane = lanes[index];
    const triggerLaneId = events
      .filter((event) => event.lane === lane.id)
      .map((event) => (event.triggeredBy ? events.find((e) => e.id === event.triggeredBy)?.lane : undefined))
      .find((laneId) => laneId && laneId !== lane.id);
    const triggerIndex = triggerLaneId ? laneIndexOf.get(triggerLaneId) : undefined;
    if (triggerIndex !== undefined && !layoutInProgress.has(triggerIndex)) buildLayout(triggerIndex);
    const layout = computeLayout(lane, index);
    layoutCache.set(index, layout);
    return layout;
  };
  const layouts: Layout[] = lanes.map((_, index) => buildLayout(index));

  // Trial: the rest of every unfinished lane, drawn as it would end — along the row to the lane's last planned event, then
  // rising to its own landing on the trunk. Landings are placed like the real merges (a margin clear of every other one, the
  // finished lanes' first), assuming the unfinished lanes finish in lane order. The end is a prediction: it is by event order,
  // and resolving an open exception or warning adds an event, which shifts it.
  const trunkRowY = yOf(0);
  const predictedLandings = [...mergeLandings];
  const remaining = layouts.flatMap(({ lane, index, head }) => {
    if (index === 0 || !head) return [];
    const laneEvents = events.filter((event) => event.lane === lane.id);
    const y = yOf(index);
    const endX = Math.max(head.x, ordinalX.get(laneEvents[laneEvents.length - 1].id) ?? head.x);
    let landX = landXFor(endX, y - trunkRowY);
    while (predictedLandings.some((taken) => Math.abs(taken - landX) < margin)) landX += margin;
    landX = Math.min(landX, available);
    predictedLandings.push(landX);
    // As with a real merge, a pushed landing slides the departure along the lane instead of tilting the line.
    const departX = Math.max(head.x, landX - elbowRun - Math.abs(y - trunkRowY) * MIN_RUN_PER_ROW);
    const path =
      `M ${head.x} ${y}` +
      (departX > head.x ? ` L ${departX} ${y}` : "") +
      eased({ x: departX, y }, { x: landX, y: trunkRowY });
    return [{ laneId: lane.id, path }];
  });

  const trunk = layouts[0];
  const trunkMergeEnd = mergeDots.reduce((max, dot) => Math.max(max, dot.x), 0);
  const trunkProgressX = Math.max(
    trunk.dots[trunk.dots.length - 1]?.x ?? 0,
    trunk.head?.x ?? 0,
    trunkMergeEnd,
  );
  const trunkY = yOf(0);
  // The trunk is done once every employee event has happened AND every item lane has finished and merged back.
  // Anything less (still running, closed incomplete, canceled) keeps the grey remainder after its last point.
  const trunkEnded =
    events
      .filter((event) => event.lane === trunk.lane.id)
      .every((event) => event.status === "complete") &&
    lanes.slice(1).every((lane) => lane.status === "complete");
  // The trunk's line stops at its last point (last event or last merge); once it is done it reaches the fixed end.
  const trunkEndX = trunkProgressX;

  // One pass of the flowing dash per cycle (pass + rest). Only ticks while an item lane is in progress.
  // Everything that moves (dash, pulse, shimmer) waits for the draw-in to finish.
  const motionOn = ready && !loading && entranceState === "done";
  const anyFlowing =
    motionOn &&
    lanes.some((lane, index) => index > 0 && (lane.status === "in-progress" || isAlert(lane.status)));
  useEffect(() => {
    if (!anyFlowing || size.flowCycle <= 0) return;
    const timer = setInterval(
      () => setFlowRun((run) => run + 1),
      size.flowCycle,
    );
    return () => clearInterval(timer);
  }, [anyFlowing, size.flowCycle]);

  // A new request (or a resize) gets a fresh set of correction passes.
  useIsomorphicLayoutEffect(() => {
    settlePasses.current = 0;
  }, [events, lanes, size.width]);

  // Measure-and-correct: the last point moves one-for-one with the available width, so a couple of passes land it on the limit.
  const wanted = trunkEnded && trunk.started ? trunkLimit : undefined;
  useIsomorphicLayoutEffect(() => {
    if (wanted === undefined || size.width === 0) {
      settlePasses.current = 0;
      if (stretch !== 0) setStretch(0);
      return;
    }
    const error = wanted - trunkProgressX;
    if (Math.abs(error) < 0.5 || settlePasses.current >= 4) return;
    settlePasses.current += 1;
    setStretch(stretch + error);
  }, [wanted, trunkProgressX, size.width, stretch]);
  const trunkPath = trunk.started
    ? `M 0 ${trunkY} L ${trunkEndX} ${trunkY}`
    : undefined;

  // The draw-in, once the graph is measured and loaded. Every timing comes from the --graph-enter-* custom properties.
  // Trunk line draws first, its events scaling in as the line reaches them; then each item lane in turn, nearest the trunk first:
  // branch, row (events scale in along it), then either its merge back to the trunk or its head (diamond, badge and the
  // grey track still to come). Nothing here changes layout — only opacity, scale and stroke offset, played from the first frame.
  useIsomorphicLayoutEffect(() => {
    if (!ready || loading || entranceState !== "pending") return;
    const plot = plotRef.current;
    if (!plot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntranceState("done");
      return;
    }
    const trunkDuration = readMs(plot, "--graph-enter-trunk");
    const laneStart = readMs(plot, "--graph-enter-lane-start");
    const laneSpread = readMs(plot, "--graph-enter-spread");
    const laneDuration = readMs(plot, "--graph-enter-lane");
    const pop = readMs(plot, "--graph-enter-pop");
    // Start fades in first; everything else waits this long, so the trunk begins drawing once Start is there.
    const lead = readMs(plot, "--graph-enter-start");
    const find = (id: string) => graphRef.current?.querySelector(`[data-enter-id="${id}"]`);
    const run = (element: Element | null | undefined, keyframes: Keyframe[], at: number, duration: number, easing = "ease-out") => {
      if (!element) return;
      entranceAnimations.current.push(element.animate(keyframes, { delay: lead + at, duration, easing, fill: "backwards" }));
    };
    // A line draws by its dash offset (the paths are normalised to length 1); linear, so events can be timed against the front.
    const draw = (id: string, from: number, to: number) =>
      run(
        find(id),
        [
          { strokeDasharray: "1 1", strokeDashoffset: 1, opacity: 0 },
          { strokeDasharray: "1 1", strokeDashoffset: 1, opacity: 1, offset: 0.02 },
          { strokeDasharray: "1 1", strokeDashoffset: 0, opacity: 1 },
        ],
        from,
        Math.max(to - from, 1),
        "linear",
      );
    // An event's diamond scales in from nothing (it keeps its 45° turn).
    const scaleIn = (id: string, at: number) =>
      run(
        find(id)?.firstElementChild,
        [{ transform: "rotate(45deg) scale(0)" }, { transform: "rotate(45deg) scale(1)" }],
        at,
        pop,
      );
    const fade = (id: string, at: number) => run(find(id), [{ opacity: 0 }, { opacity: 1 }], at, pop);

    entranceAnimations.current.forEach((animation) => animation.cancel());
    entranceAnimations.current = [];

    const start = find("trunk-start");
    if (start) entranceAnimations.current.push(start.animate([{ opacity: 0 }, { opacity: 1 }], { duration: lead, easing: "ease-out", fill: "backwards" }));
    draw("trunk-line", 0, trunkDuration);
    trunk.dots.forEach((dot) =>
      scaleIn(`dot:${dot.id}`, (trunkEndX > 0 ? dot.x / trunkEndX : 0) * Math.max(trunkDuration - pop, 0)),
    );
    fade("trunk-track", Math.max(trunkDuration - pop, 0));
    // End follows as the trunk finishes.
    fade("trunk-end", Math.max(trunkDuration - pop, 0));

    const laneCount = lanes.length - 1;
    layouts.slice(1).forEach((layout) => {
      if (!layout.started) return;
      const id = layout.lane.id;
      const t0 = laneStart + (layout.index - 1) * (laneSpread / Math.max(laneCount, 1));
      // Within its window: branch 0–20%, row 20–65% (no branch: from 0), then the merge or the head until the end.
      const rowFrom = t0 + (layout.branch ? 0.2 : 0) * laneDuration;
      const rowTo = t0 + 0.65 * laneDuration;
      if (layout.branch) draw(`branch:${id}`, t0, rowFrom);
      draw(`row:${id}`, rowFrom, rowTo);
      const x0 = layout.rowStartX ?? 0;
      const x1 = layout.dots[layout.dots.length - 1]?.x ?? x0;
      layout.dots.forEach((dot) => {
        const f = x1 > x0 ? Math.min(Math.max((dot.x - x0) / (x1 - x0), 0), 1) : 0;
        scaleIn(`dot:${dot.id}`, rowFrom + f * Math.max(rowTo - rowFrom - pop, 0));
      });
      // Right after the last event: the head's diamond and badge, and the grey track still to come.
      scaleIn(`head-dot:${id}`, rowTo);
      fade(`head:${id}`, rowTo);
      fade(`tail:${id}`, rowTo);
      fade(`frontier:${id}`, rowTo);
      fade(`remaining:${id}`, rowTo);
      // A finished lane merges back instead, its dot landing as the line does.
      draw(`merge:${id}`, rowTo, t0 + laneDuration);
      scaleIn(`merge-dot:${id}`, t0 + laneDuration - pop);
    });

    const end = entranceAnimations.current.reduce((latest, animation) => {
      const timing = animation.effect?.getComputedTiming();
      return Math.max(latest, Number(timing?.endTime ?? 0));
    }, 0);
    setEntranceState("running");
    entranceTimer.current = setTimeout(() => {
      setEntranceState("done");
      onEntranceComplete?.();
    }, end + 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, loading, entranceState]);

  const dimmed = (laneId: string) =>
    focusedLane !== null && laneId !== focusedLane && laneId !== trunk.lane.id;
  const dimClass = (laneId: string) =>
    dimmed(laneId) ? styles.dimmed : undefined;
  // The trunk is never an item lane: hovering it just clears the focus.
  const focusLane = (layout: Layout) =>
    setFocusedLane(layout.index > 0 ? layout.lane.id : null);

  // Every point the pointer can land on, per lane: finished dots and the frontier head (the trunk has no head marker).
  // The trunk row also carries the merge dots, each belonging to the item lane that joined it there.
  type HoverPoint = { id: string; x: number; sourceLane: string };
  const pointsOf = (layout: Layout): HoverPoint[] => [
    ...layout.dots.map((dot) => ({ ...dot, sourceLane: layout.lane.id })),
    ...(layout.head && layout.index > 0
      ? [{ ...layout.head, sourceLane: layout.lane.id }]
      : []),
    ...(layout.index === 0
      ? mergeDots.map((dot) => ({
          id: mergeIdOf(dot.laneId),
          x: dot.x,
          sourceLane: dot.laneId,
        }))
      : []),
  ];

  // Leaving fades everything out, then unmounts it once the fade is done so the next entry starts fresh at its own point.
  const clearActive = () => {
    if (!hovering) return;
    setHovering(false);
    clearTimeout(unmountTimer.current);
    unmountTimer.current = setTimeout(() => {
      setActive(null);
      setTooltipAnchor(null);
    }, size.glide);
  };

  // The lane is the row band under the pointer; the point is the nearest one in that lane along x.
  const trackPointer = (event: React.MouseEvent) => {
    const plot = plotRef.current;
    if (!plot || rowHeight === 0) return;
    const rect = plot.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || x > rect.width) return clearActive();
    // Above or below the lanes, the pointer still belongs to the nearest lane (the first or the last).
    const layout =
      layouts[
        Math.max(0, Math.min(Math.floor(y / rowHeight), layouts.length - 1))
      ];
    const points = pointsOf(layout);
    if (points.length === 0) return clearActive();
    const nearest = points.reduce((best, point) =>
      Math.abs(point.x - x) < Math.abs(best.x - x) ? point : best,
    );
    // A merge dot focuses the lane that merged there; a trunk event clears the focus.
    focusLane(layouts[laneIndexOf.get(nearest.sourceLane) ?? 0]);
    clearTimeout(unmountTimer.current);
    setHovering(true);
    setActive((current) =>
      current?.id === nearest.id
        ? current
        : {
            id: nearest.id,
            laneIndex: layout.index,
            x: nearest.x,
            sourceLane: nearest.sourceLane,
          },
    );
    setTooltipAnchor({
      x: rect.left + nearest.x,
      y: rect.top + yOf(layout.index),
    });
  };

  // The lane the active point belongs to (its color and name) — for a merge dot that is the item lane, not the trunk row it sits on.
  const activeLane = active
    ? lanes[laneIndexOf.get(active.sourceLane) ?? 0]
    : undefined;
  const activeMerge = active?.id.startsWith(MERGE_PREFIX);
  // On an exception or warning lane the head badge replaces the event diamond: hovering it focuses the badge (tinted) instead of drawing the indicator.
  const activeAlertLane = active && !activeMerge
    ? layouts.find((layout) => layout.index > 0 && layout.head?.id === active.id && isAlert(layout.lane.status))?.lane.id
    : undefined;
  // The in-progress placeholder diamond is white with a disabled outline; its hover indicator follows.
  const activePlaceholderLane =
    active && !activeMerge
      ? layouts.find((layout) => layout.index > 0 && layout.head?.id === active.id && !isAlert(layout.lane.status))?.lane.id
      : undefined;
  const activePlaceholder = !!activePlaceholderLane;
  const activeEvent =
    active && !activeMerge
      ? events.find((candidate) => candidate.id === active.id)
      : undefined;
  // A merge dot reads "Completed" at the time of its lane's final event.
  const lastEventOf = (laneId: string) =>
    [...events].reverse().find((candidate) => candidate.lane === laneId);
  const tooltipDetail =
    activeMerge && activeLane
      ? { title: "Completed", time: lastEventOf(activeLane.id)?.time ?? "" }
      : activeEvent
        ? {
            title: activeEvent.title,
            // An in-progress event is the lane's next step and has no recorded start, so it says so instead of showing its scheduled time.
            time: activeEvent.status === "in-progress" ? "Up Next" : activeEvent.time,
          }
        : undefined;

  return (
    <div
      ref={graphRef}
      className={styles.graph}
      style={{ ["--lane-count" as string]: lanes.length }}
      onMouseMove={trackPointer}
      onMouseLeave={() => {
        setFocusedLane(null);
        clearActive();
      }}
    >
      {active && (
        <span
          className={[styles.guide, !hovering && styles.markerHidden]
            .filter(Boolean)
            .join(" ")}
          style={{ left: size.plotLeft + active.x }}
        />
      )}
      <div ref={plotRef} className={[styles.plot, !ready && styles.plotPending].filter(Boolean).join(" ")}>
        <svg
          className={styles.lines}
          width={size.width}
          height={size.height}
          aria-hidden="true"
        >
          {trunkPath && (
            <path
              d={trunkPath}
              pathLength={1}
              data-enter-id="trunk-line"
              className={styles.laneLine}
              style={{ stroke: trunk.lane.color }}
            />
          )}
          {layouts
            .slice(1)
            .map((layout) =>
              layout.tail ? (
                <path
                  key={`${layout.lane.id}-tail`}
                  data-enter-id={`tail:${layout.lane.id}`}
                  d={layout.tail}
                  className={[styles.frontierTrack, dimClass(layout.lane.id)]
                    .filter(Boolean)
                    .join(" ")}
                />
              ) : null,
            )}
          {layouts
            .slice(1)
            .map((layout) =>
              layout.frontier ? (
                <path
                  key={`${layout.lane.id}-frontier`}
                  data-enter-id={`frontier:${layout.lane.id}`}
                  d={layout.frontier.d}
                  className={[styles.frontierTrack, dimClass(layout.lane.id)]
                    .filter(Boolean)
                    .join(" ")}
                />
              ) : null,
            )}
          {remaining.map((rest) => (
            <path
              key={`${rest.laneId}-remaining`}
              data-enter-id={`remaining:${rest.laneId}`}
              d={rest.path}
              className={[styles.frontierTrack, styles.remainingTrack, dimClass(rest.laneId)]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
          {layouts
            .slice(1)
            .map((layout) =>
              layout.branch ? (
                <path
                  key={`${layout.lane.id}-branch`}
                  pathLength={1}
                  data-enter-id={`branch:${layout.lane.id}`}
                  d={layout.branch}
                  className={[styles.frontierTrack, dimClass(layout.lane.id)]
                    .filter(Boolean)
                    .join(" ")}
                  style={layout.lane.status === "complete" ? { stroke: CONNECTOR_COMPLETE } : undefined}
                />
              ) : null,
            )}
          {layouts
            .slice(1)
            .map((layout) =>
              layout.merge ? (
                <path
                  key={`${layout.lane.id}-merge`}
                  pathLength={1}
                  data-enter-id={`merge:${layout.lane.id}`}
                  d={layout.merge}
                  className={[styles.frontierTrack, dimClass(layout.lane.id)]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ stroke: CONNECTOR_COMPLETE }}
                />
              ) : null,
            )}
          {layouts
            .slice(1)
            .map((layout) =>
              layout.started && layout.rowPath ? (
                <path
                  key={layout.lane.id}
                  pathLength={1}
                  data-enter-id={`row:${layout.lane.id}`}
                  d={layout.rowPath}
                  className={[
                    // Only the events carry the lane color; the line joining them is the track, alert lanes included.
                    styles.frontierTrack,
                    dimClass(layout.lane.id),
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  // A finished lane's line matches its connectors.
                  style={layout.lane.status === "complete" ? { stroke: CONNECTOR_COMPLETE } : undefined}
                />
              ) : null,
            )}
        </svg>
        {/* Its own layer, so the animated dashes repaint without touching the static lines. */}
        <svg
          className={styles.lines}
          width={size.width}
          height={size.height}
          aria-hidden="true"
        >
          {layouts.slice(1).map((layout) =>
            motionOn && (layout.frontier || layout.alertFlowPath) ? (
              <FlowLens
                key={`${layout.lane.id}-flow-${flowRun}`}
                path={layout.frontier?.flowPath ?? layout.alertFlowPath ?? ""}
                color={isAlert(layout.lane.status) ? alertSolid(layout.lane.status) : undefined}
                dash={size.flowDash}
                width={size.flowWidth}
                pass={size.flowPass}
                easing={size.flowEasing}
                className={[styles.flow, dimClass(layout.lane.id)]
                  .filter(Boolean)
                  .join(" ")}
              />
            ) : null,
          )}
        </svg>
        {trunk.started && !trunkEnded && (
          <span
            className={[styles.head, styles.trunkTrack].join(" ")}
            data-enter-id="trunk-track"
            style={{ left: trunkEndX, top: trunkY }}
          >
            <span className={styles.track} />
          </span>
        )}
        {mergeDots.map((dot) => (
          <span
            key={mergeIdOf(dot.laneId)}
            data-enter-id={`merge-dot:${dot.laneId}`}
            className={[styles.slot, dimClass(dot.laneId)]
              .filter(Boolean)
              .join(" ")}
            style={{ left: dot.x, top: dot.y }}
          >
            <span
              className={styles.dot}
              style={{
                backgroundColor: lanes[laneIndexOf.get(dot.laneId) ?? 0].color,
              }}
            />
          </span>
        ))}
        {layouts.map((layout) =>
          layout.dots.map((dot) => (
            <span
              key={dot.id}
              data-enter-id={`dot:${dot.id}`}
              className={[styles.slot, dimClass(layout.lane.id)]
                .filter(Boolean)
                .join(" ")}
              style={{ left: dot.x, top: yOf(layout.index) }}
              onMouseEnter={() => focusLane(layout)}
            >
              <span
                className={styles.dot}
                style={{ backgroundColor: layout.lane.color }}
              />
            </span>
          )),
        )}
        {/* The head event's diamond: an in-progress event is a white diamond with a disabled-color outline (placeholder until it has a color of its own); a stuck lane's is solid in its status color. */}
        {layouts.slice(1).map((layout) =>
          layout.head ? (
            <span
              key={`${layout.lane.id}-head-dot`}
              data-enter-id={`head-dot:${layout.lane.id}`}
              className={[styles.slot, dimClass(layout.lane.id)]
                .filter(Boolean)
                .join(" ")}
              style={{ left: layout.head.x, top: yOf(layout.index) }}
              onMouseEnter={() => focusLane(layout)}
            >
              <span
                // Trial: an in-progress Up Next diamond remounts each flow cycle so its pulse (CSS animation) replays as the dash lands.
                key={layout.lane.status === "in-progress" || isAlert(layout.lane.status) ? `pulse-${flowRun}` : undefined}
                className={[styles.dot, motionOn && (layout.lane.status === "in-progress" || isAlert(layout.lane.status)) && styles.dotPulse]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  isAlert(layout.lane.status)
                    ? { backgroundColor: alertSolid(layout.lane.status) }
                    : {
                        boxSizing: "border-box",
                        backgroundColor: "var(--xops-surface-page)",
                        border: "var(--xops-border-width-1) solid var(--xops-text-disabled)",
                      }
                }
              />
            </span>
          ) : null,
        )}
        {layouts.slice(1).map((layout) =>
          layout.head ? (
            <span
              key={`${layout.lane.id}-head`}
              data-enter-id={`head:${layout.lane.id}`}
              className={[
                styles.head,
                // Trial: no head carries an icon now; every head's badge starts just after its event diamond.
                styles.headPlain,
                dimClass(layout.lane.id),
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ left: layout.head.x, top: yOf(layout.index) }}
              onMouseEnter={() => focusLane(layout)}
            >
              <span
                className={[
                  styles.headLabel,
                  // On a stuck lane the badge stands in for the event diamond, so its focus is the Tag's tint, shown while hovered.
                  // Trial: the fill shows whenever the lane is focused, not only when the pointer is on the head itself.
                  focusedLane === layout.lane.id && isAlert(layout.lane.status) && (layout.lane.status === "warning" ? styles.headLabelWarning : styles.headLabelException),
                  // An in-progress badge's focus is a fill in its lane's color.
                  focusedLane === layout.lane.id && !isAlert(layout.lane.status) && styles.headLabelFocused,
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ ["--badge-color" as string]: layout.lane.color }}
              >
                {isAlert(layout.lane.status) && (
                  <StatusIcon
                    status={layout.lane.status}
                    className={styles.indicator}
                  />
                )}
                <span
                  // Trial: an in-progress label remounts each flow cycle so its shimmer (CSS animation) replays in step with the dash.
                  key={layout.lane.status === "in-progress" ? `shimmer-${flowRun}` : undefined}
                  className={[
                    styles.label,
                    layout.lane.status === "exception"
                      ? styles.labelException
                      : layout.lane.status === "warning"
                        ? styles.labelWarning
                        : styles.labelActive,
                    motionOn && layout.lane.status === "in-progress" && styles.labelShimmer,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  title={layout.lane.label}
                >
                  {layout.lane.label}
                </span>
              </span>
              <span className={styles.track} />
            </span>
          ) : null,
        )}
        {active && activeLane && (
          <span
            className={[styles.highlighter, activePlaceholder && styles.highlighterPlaceholder, !hovering && styles.markerHidden]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: active.x,
              top: yOf(active.laneIndex),
              ["--highlight-color" as string]: activeAlertLane
                ? alertSolid(activeLane.status)
                : activePlaceholder
                  ? "var(--xops-text-disabled)"
                  : activeLane.color,
            }}
          />
        )}
      </div>
      {tooltipDetail && activeLane && tooltipAnchor && (
        <ChartTooltip
          variant="event"
          color={activeLane.color}
          code={activeLane.code}
          name={activeLane.label}
          title={tooltipDetail.title}
          time={tooltipDetail.time}
          anchorX={tooltipAnchor.x}
          anchorY={tooltipAnchor.y}
          offset={highlightReach}
          hidden={!hovering}
          glideDuration={size.glide}
        />
      )}

      {layouts.map((layout) => (
        <div
          key={layout.lane.id}
          className={[
            styles.lane,
            layout.index === 0 && styles.trunk,
            dimClass(layout.lane.id),
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ gridRow: layout.index + 1 }}
          onMouseEnter={() => focusLane(layout)}
        >
          {/* The trunk reads Start → End: Start in the left gutter (live once the request has started), End at the check badges (live once the trunk has finished). */}
          {layout.index === 0 && (
            <span
              data-enter-id="trunk-start"
              className={[
                styles.code,
                styles.trunkStart,
                layout.started && styles.trunkLive,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Start
            </span>
          )}
          <span className={styles.path}>
            {!layout.started && (
              <>
                {layout.index > 0 && (
                  <StatusIcon status="open" className={styles.indicator} />
                )}
                {layout.index > 0 && (
                  <span className={styles.label}>{layout.lane.label}</span>
                )}
                <span className={styles.track} />
              </>
            )}
          </span>
          {layout.index === 0 && (
            <span
              data-enter-id="trunk-end"
              className={[
                styles.code,
                styles.trunkEnd,
                layout.started && trunkEnded && styles.trunkLive,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              End
            </span>
          )}
          {layout.lane.code && (
            <span className={styles.code}>
              {/* The check only appears once the item is complete; it floats left of the code, so tracks end 8px before the text. */}
              <span
                className={[
                  styles.check,
                  layout.lane.status !== "complete" && styles.checkHidden,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <StatusIcon status="complete" color={layout.lane.color} />
              </span>
              {layout.lane.code}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default OrchestrationGraph;
