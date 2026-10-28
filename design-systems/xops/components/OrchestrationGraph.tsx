import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
};

type Point = { x: number; y: number };

const readPx = (element: Element, name: string) => parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;

// Branches and merges are straight lines whose angle adapts to the data. Each row crossed needs at
// least this much horizontal run (a fraction of the row height), so no line gets too steep to read.
const MIN_RUN_PER_ROW = 0.75;

// Merge dots have no event of their own; hover identifies them by this prefix plus the merging lane's id.
const MERGE_PREFIX = "merge-";
const mergeIdOf = (laneId: string) => `${MERGE_PREFIX}${laneId}`;

// Exception and warning lanes share one mechanic: they run to a head on the problem event.
const isAlert = (status?: StatusIconStatus) => status === "exception" || status === "warning";

// useLayoutEffect warns during server render; measuring only matters in the browser.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Built state by state. Done so far: all open, in progress, complete (a finished lane
// merges back into the trunk's end), exception and warning (run to a head on the problem event,
// the line into it and the label tinted).
export function OrchestrationGraph({ lanes, events }: OrchestrationGraphProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  // The item lane under the pointer; every other item lane dims so it can be followed on its own.
  const [focusedLane, setFocusedLane] = useState<string | null>(null);
  // The point the pointer is nearest to in the lane under it: it gets the highlighter, a guide line and the tooltip.
  const [active, setActive] = useState<{ id: string; laneIndex: number; x: number; sourceLane: string } | null>(null);
  // Hidden = fading out (or waiting for the next point); the markers stay mounted meanwhile so they can glide and fade.
  const [hovering, setHovering] = useState(false);
  const unmountTimer = useRef<ReturnType<typeof setTimeout>>();
  const [tooltipAnchor, setTooltipAnchor] = useState<{ x: number; y: number } | null>(null);
  // Extra width given to the layout so a finished trunk's last point lands exactly on the limit (settled after measuring).
  const [stretch, setStretch] = useState(0);
  const settlePasses = useRef(0);
  const [size, setSize] = useState({ width: 0, height: 0, dot: 0, stub: 0, radius: 0, check: 0, plotLeft: 0, glide: 0, highlight: 0, halo: 0, tooltipGap: 0 });

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
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(plot);
    return () => observer.disconnect();
  }, []);

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
  const landXFor = (departX: number, dy: number) => departX + elbowRun + Math.abs(dy) * MIN_RUN_PER_ROW;
  const branchesPerTrigger = new Map<string, number>();
  lanes.forEach((lane, index) => {
    if (index === 0) return;
    const triggerId = events.filter((event) => event.lane === lane.id).map((event) => event.triggeredBy).find((id) => id && events.find((e) => e.id === id)?.lane !== lane.id);
    if (triggerId) branchesPerTrigger.set(triggerId, (branchesPerTrigger.get(triggerId) ?? 0) + 1);
  });
  const stagger = Math.max(0, ...Array.from(branchesPerTrigger.values()), 1) - 1;
  // Merges into the trunk are staggered too: each finished lane lands at least one margin after the previous, so the biggest crowd adds room.
  const mergeCount = lanes.filter((lane, index) => index > 0 && lane.status === "complete").length;
  const reserve = (lanes.length - 1) * rowHeight * MIN_RUN_PER_ROW + (stagger + Math.max(0, mergeCount - 1)) * margin + elbowRun + size.dot / 2;
  const step = events.length > 1 ? Math.max(available - reserve, 0) / (events.length - 1) : 0;
  const yOf = (laneIndex: number) => (laneIndex + 0.5) * rowHeight;
  const laneIndexOf = new Map(lanes.map((lane, index) => [lane.id, index]));
  const ordinalX = new Map(events.map((event, index) => [event.id, index * step]));
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
    /** Exception/warning only: the last stretch into the head, drawn in the alert tint. */
    tail?: string;
    /** Exception/warning with no finished event: the whole line into the head is the alert tint. */
    pathAlert?: boolean;
  };

  // Overlap avoidance. A branch descending to a lower lane can run right across a lane above it and
  // land on top of that lane's first dots. Plan every branch first, then nudge a lane's first dot
  // right until no lower branch passes within a margin of it.
  // Every branch runs at the same slope. Branches leaving one dot are staggered along the source lane
  // (deepest lane first, one margin apart), so their diagonals run parallel and never cross.
  type BranchPlan = { index: number; id: string; triggerId: string; srcX: number; srcY: number; y: number; offset: number; landX: number; firstX: number };
  const plans: BranchPlan[] = [];
  lanes.forEach((lane, index) => {
    if (index === 0 || (lane.status !== "in-progress" && lane.status !== "complete" && !isAlert(lane.status))) return;
    const laneEvents = events.filter((event) => event.lane === lane.id);
    const first = laneEvents.find((event) => event.status === "complete" || event.status === "in-progress" || isAlert(event.status));
    const triggerId = laneEvents.map((event) => event.triggeredBy).find((id) => id && events.find((e) => e.id === id)?.lane !== lane.id);
    if (!first || !triggerId) return;
    const sourceEvent = events.find((event) => event.id === triggerId)!;
    const srcX = ordinalX.get(triggerId) ?? 0;
    const srcY = yOf(laneIndexOf.get(sourceEvent.lane) ?? 0);
    const y = yOf(index);
    plans.push({ index, id: lane.id, triggerId, srcX, srcY, y, offset: 0, landX: 0, firstX: ordinalX.get(first.id) ?? 0 });
  });
  const byTrigger = new Map<string, BranchPlan[]>();
  plans.forEach((plan) => byTrigger.set(plan.triggerId, [...(byTrigger.get(plan.triggerId) ?? []), plan]));
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
        if (upper.y <= Math.min(lower.srcY, lower.y) || upper.y >= Math.max(lower.srcY, lower.y)) continue;
        const departX = lower.srcX + lower.offset;
        const x = departX + ((upper.y - lower.srcY) / (lower.y - lower.srcY)) * (lower.landX - departX);
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

  const layouts: Layout[] = lanes.map((lane, index) => {
    const laneEvents = events.filter((event) => event.lane === lane.id);
    const handled = lane.status === undefined || lane.status === "open" || lane.status === "in-progress" || isAlert(lane.status) || lane.status === "complete";
    const completed = laneEvents.filter((event) => event.status === "complete");
    const headEvent = laneEvents.find((event) => event.status === "in-progress" || isAlert(event.status)) ?? (index === 0 ? laneEvents.find((event) => event.status !== "complete") : undefined);
    const started = handled && (lane.status === "complete" ? completed.length > 0 : completed.length > 0 || ((lane.status === "in-progress" || isAlert(lane.status)) && !!headEvent));
    if (!started) return { lane, index, started: false, dots: [] };

    const y = yOf(index);
    const points: Point[] = [];
    let cursor = 0;
    let path = "";
    let source: Point | undefined;
    let landing: Point | undefined;

    // Branch: leaves the triggering event's dot (after its stagger along the source lane), runs at the shared slope to this lane's row, then on to its first dot.
    const trigger = laneEvents.map((event) => event.triggeredBy).find((id) => id && events.find((e) => e.id === id)?.lane !== lane.id);
    if (index > 0 && trigger) {
      const sourceEvent = events.find((event) => event.id === trigger)!;
      const sourceY = yOf(laneIndexOf.get(sourceEvent.lane) ?? 0);
      const sx = finalX.get(trigger) ?? ordinalX.get(trigger) ?? 0;
      const departX = sx + (plannedOffset.get(lane.id) ?? 0);
      const landX = landXFor(departX, y - sourceY);
      source = { x: departX, y: sourceY };
      landing = { x: landX, y };
      path = departX > sx ? `M ${sx} ${sourceY} L ${departX} ${sourceY}` : `M ${sx} ${sourceY}`;
      cursor = Math.max(plannedFirstX.get(lane.id) ?? 0, landX);
    } else {
      path = `M 0 ${y}`;
    }

    const dots = completed.map((event, i) => {
      const minX = i === 0 && index > 0 && trigger ? cursor : (points[points.length - 1]?.x ?? -step) + step;
      const x = Math.max(ordinalX.get(event.id) ?? 0, minX);
      points.push({ x, y });
      finalX.set(event.id, x);
      return { id: event.id, x };
    });

    let head: { x: number; id: string } | undefined;
    let tail: string | undefined;
    let pathAlert = false;
    if (headEvent) {
      const lastX = points[points.length - 1]?.x ?? cursor;
      const x = Math.max(ordinalX.get(headEvent.id) ?? 0, lastX + step);
      head = { x, id: headEvent.id };
      finalX.set(headEvent.id, x);
      // An exception lane stops its colored line at the last dot; the stretch into the head is drawn apart.
      if (isAlert(lane.status) && points.length > 0) tail = `M ${points[points.length - 1].x} ${y} L ${x} ${y}`;
      else {
        points.push({ x, y });
        pathAlert = isAlert(lane.status);
      }
    }
    if (source && landing) path += eased(source, landing);
    points.forEach((point) => {
      path += ` L ${point.x} ${point.y}`;
    });

    // Merge: a finished lane leaves its last dot and rises to the trunk, landing on its own trunk dot.
    if (index > 0 && lane.status === "complete") {
      const trunkY = yOf(0);
      const lastX = points[points.length - 1]?.x ?? cursor;
      // Nudge right until it is a margin clear of every merge already on the trunk.
      let landX = landXFor(lastX, y - trunkY);
      while (mergeLandings.some((taken) => Math.abs(taken - landX) < margin)) landX += margin;
      landX = Math.min(landX, available);
      mergeLandings.push(landX);
      path += eased({ x: lastX, y }, { x: landX, y: trunkY });
      mergeDots.push({ x: landX, y: trunkY, laneId: lane.id });
    }
    return { lane, index, started: true, dots, head, path, tail, pathAlert };
  });

  const trunk = layouts[0];
  const trunkMergeEnd = mergeDots.reduce((max, dot) => Math.max(max, dot.x), 0);
  const trunkProgressX = Math.max(trunk.dots[trunk.dots.length - 1]?.x ?? 0, trunk.head?.x ?? 0, trunkMergeEnd);
  const trunkY = yOf(0);
  // The trunk is done once every employee event has happened AND every item lane has finished and merged back.
  // Anything less (still running, closed incomplete, canceled) keeps the grey remainder after its last point.
  const trunkEnded = events.filter((event) => event.lane === trunk.lane.id).every((event) => event.status === "complete") && lanes.slice(1).every((lane) => lane.status === "complete");
  // The trunk's line stops at its last point (last event or last merge); once it is done it reaches the fixed end.
  const trunkEndX = trunkProgressX;

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
  const trunkPath = trunk.started ? `M 0 ${trunkY} L ${trunkEndX} ${trunkY}` : undefined;

  const dimmed = (laneId: string) => focusedLane !== null && laneId !== focusedLane && laneId !== trunk.lane.id;
  const dimClass = (laneId: string) => (dimmed(laneId) ? styles.dimmed : undefined);
  // The trunk is never an item lane: hovering it just clears the focus.
  const focusLane = (layout: Layout) => setFocusedLane(layout.index > 0 ? layout.lane.id : null);

  // Every point the pointer can land on, per lane: finished dots and the frontier head (the trunk has no head marker).
  // The trunk row also carries the merge dots, each belonging to the item lane that joined it there.
  type HoverPoint = { id: string; x: number; sourceLane: string };
  const pointsOf = (layout: Layout): HoverPoint[] => [
    ...layout.dots.map((dot) => ({ ...dot, sourceLane: layout.lane.id })),
    ...(layout.head && layout.index > 0 ? [{ ...layout.head, sourceLane: layout.lane.id }] : []),
    ...(layout.index === 0 ? mergeDots.map((dot) => ({ id: mergeIdOf(dot.laneId), x: dot.x, sourceLane: dot.laneId })) : []),
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
    const layout = layouts[Math.max(0, Math.min(Math.floor(y / rowHeight), layouts.length - 1))];
    const points = pointsOf(layout);
    if (points.length === 0) return clearActive();
    const nearest = points.reduce((best, point) => (Math.abs(point.x - x) < Math.abs(best.x - x) ? point : best));
    // A merge dot focuses the lane that merged there; a trunk event clears the focus.
    focusLane(layouts[laneIndexOf.get(nearest.sourceLane) ?? 0]);
    clearTimeout(unmountTimer.current);
    setHovering(true);
    setActive((current) => (current?.id === nearest.id ? current : { id: nearest.id, laneIndex: layout.index, x: nearest.x, sourceLane: nearest.sourceLane }));
    setTooltipAnchor({ x: rect.left + nearest.x, y: rect.top + yOf(layout.index) });
  };

  // The lane the active point belongs to (its color and name) — for a merge dot that is the item lane, not the trunk row it sits on.
  const activeLane = active ? lanes[laneIndexOf.get(active.sourceLane) ?? 0] : undefined;
  const activeMerge = active?.id.startsWith(MERGE_PREFIX);
  const activeEvent = active && !activeMerge ? events.find((candidate) => candidate.id === active.id) : undefined;
  // A merge dot reads "Completed" at the time of its lane's final event.
  const lastEventOf = (laneId: string) => [...events].reverse().find((candidate) => candidate.lane === laneId);
  const tooltipDetail = activeMerge && activeLane ? { title: "Completed", time: lastEventOf(activeLane.id)?.time ?? "" } : activeEvent ? { title: activeEvent.title, time: activeEvent.time } : undefined;

  return (
    <div
      className={styles.graph}
      style={{ ["--lane-count" as string]: lanes.length }}
      onMouseMove={trackPointer}
      onMouseLeave={() => {
        setFocusedLane(null);
        clearActive();
      }}
    >
      {active && <span className={[styles.guide, !hovering && styles.markerHidden].filter(Boolean).join(" ")} style={{ left: size.plotLeft + active.x }} />}
      <div ref={plotRef} className={styles.plot}>
        <svg className={styles.lines} width={size.width} height={size.height} aria-hidden="true">
          {trunkPath && <path d={trunkPath} className={styles.laneLine} style={{ stroke: trunk.lane.color }} />}
          {layouts.slice(1).map((layout) =>
            layout.tail ? <path key={`${layout.lane.id}-tail`} d={layout.tail} className={[styles.laneLine, layout.lane.status === "warning" ? styles.laneLineWarning : styles.laneLineException, dimClass(layout.lane.id)].filter(Boolean).join(" ")} /> : null,
          )}
          {layouts.slice(1).map((layout) =>
            layout.started && layout.path ? (
              <path
                key={layout.lane.id}
                d={layout.path}
                className={[styles.laneLine, layout.pathAlert && (layout.lane.status === "warning" ? styles.laneLineWarning : styles.laneLineException), dimClass(layout.lane.id)].filter(Boolean).join(" ")}
                style={layout.pathAlert ? undefined : { stroke: layout.lane.color }}
              />
            ) : null,
          )}
        </svg>
        {trunk.started && !trunkEnded && <span className={[styles.head, styles.trunkTrack].join(" ")} style={{ left: trunkEndX, top: trunkY }}><span className={styles.track} /></span>}
        {mergeDots.map((dot) => (
          <span key={mergeIdOf(dot.laneId)} className={[styles.slot, dimClass(dot.laneId)].filter(Boolean).join(" ")} style={{ left: dot.x, top: dot.y }}>
            <span className={styles.dot} style={{ backgroundColor: lanes[laneIndexOf.get(dot.laneId) ?? 0].color }} />
          </span>
        ))}
        {layouts.map((layout) =>
          layout.dots.map((dot) => (
            <span key={dot.id} className={[styles.slot, dimClass(layout.lane.id)].filter(Boolean).join(" ")} style={{ left: dot.x, top: yOf(layout.index) }} onMouseEnter={() => focusLane(layout)}>
              <span className={styles.dot} style={{ backgroundColor: layout.lane.color }} />
            </span>
          )),
        )}
        {layouts.slice(1).map((layout) =>
          layout.head ? (
            <span key={`${layout.lane.id}-head`} className={[styles.head, dimClass(layout.lane.id)].filter(Boolean).join(" ")} style={{ left: layout.head.x, top: yOf(layout.index) }} onMouseEnter={() => focusLane(layout)}>
              <StatusIcon status={isAlert(layout.lane.status) ? layout.lane.status : "in-progress"} className={styles.indicator} />
              <span className={[styles.label, layout.lane.status === "exception" ? styles.labelException : layout.lane.status === "warning" ? styles.labelWarning : styles.labelActive].join(" ")} title={layout.lane.label}>{layout.lane.label}</span>
              <span className={styles.track} />
            </span>
          ) : null,
        )}
        {active && activeLane && (
          <span className={[styles.highlighter, !hovering && styles.markerHidden].filter(Boolean).join(" ")} style={{ left: active.x, top: yOf(active.laneIndex), ["--highlight-color" as string]: activeLane.color }} />
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
          className={[styles.lane, layout.index === 0 && styles.trunk, dimClass(layout.lane.id)].filter(Boolean).join(" ")}
          style={{ gridRow: layout.index + 1 }}
          onMouseEnter={() => focusLane(layout)}
        >
          {/* The trunk reads Start → End: Start in the left gutter (live once the request has started), End at the check badges (live once the trunk has finished). */}
          {layout.index === 0 && <span className={[styles.code, styles.trunkStart, layout.started && styles.trunkLive].filter(Boolean).join(" ")}>Start</span>}
          <span className={styles.path}>
            {!layout.started && (
              <>
                {layout.index > 0 && <StatusIcon status="open" className={styles.indicator} />}
                {layout.index > 0 && <span className={styles.label}>{layout.lane.label}</span>}
                <span className={styles.track} />
              </>
            )}
          </span>
          {layout.index === 0 && <span className={[styles.code, styles.trunkEnd, layout.started && trunkEnded && styles.trunkLive].filter(Boolean).join(" ")}>End</span>}
          {layout.lane.code && (
            <span className={styles.code}>
              {/* The check only appears once the item is complete; it floats left of the code, so tracks end 8px before the text. */}
              <span className={[styles.check, layout.lane.status !== "complete" && styles.checkHidden].filter(Boolean).join(" ")}>
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
