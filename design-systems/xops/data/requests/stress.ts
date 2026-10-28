import type { GraphEvent, GraphLane } from "../../components/OrchestrationGraph";

// Pressure-test data for the orchestration graph: 14 items that differ drastically in length and state,
// wired lane to lane (chains up to four deep, a lane feeding two others, a lane triggered from a
// lane below it, a single-event exception with no finished dot). Not a real request — only reachable
// through the All Requests screen's `?stress=1` switch and the graph's stories.

type Status = GraphEvent["status"];

const TRUNK = "employee";
const pad = (n: number) => String(n).padStart(2, "0");

const items: { key: string; label: string; status: NonNullable<GraphLane["status"]> }[] = [
  { key: "a", label: "Device Deployment", status: "complete" },
  { key: "b", label: "Badge Access", status: "complete" },
  { key: "c", label: "Software Deployment", status: "in-progress" },
  { key: "d", label: "Mobile Line Assignment", status: "in-progress" },
  { key: "e", label: "VPN Access", status: "complete" },
  { key: "f", label: "Email Provisioning", status: "in-progress" },
  { key: "g", label: "Payroll Setup", status: "warning" },
  { key: "h", label: "Benefits Enrollment", status: "exception" },
  { key: "i", label: "Training Assignment", status: "complete" },
  { key: "j", label: "Locker Assignment", status: "in-progress" },
  { key: "k", label: "Parking Permit", status: "in-progress" },
  { key: "l", label: "Security Briefing", status: "in-progress" },
  { key: "m", label: "Equipment Return", status: "open" },
  { key: "n", label: "Account Reclaim", status: "open" },
];

const laneId = (key: string) => `ITM-${pad(items.findIndex((item) => item.key === key) + 1)}`;

export const stressLanes: GraphLane[] = [
  { id: TRUNK, label: "Request Timeline", color: "var(--xops-brand-primary)" },
  ...items.map((item, i) => ({
    id: laneId(item.key),
    label: item.label,
    color: `var(--xops-chart-${(i % 7) + 1})`,
    status: item.status,
    code: laneId(item.key),
  })),
];

// [event id, lane key ("t" = trunk), status, trigger event id]. Global time order; a lane's number
// of events and where it starts are all different on purpose.
const script: [string, string, Status, string?][] = [
  ["t1", "t", "complete"],
  ["t2", "t", "complete"],
  ["a1", "a", "complete", "t2"],
  ["b1", "b", "complete", "t2"],
  ["t3", "t", "complete"],
  ["c1", "c", "complete", "t3"],
  ["a2", "a", "complete"],
  ["d1", "d", "complete", "a2"],
  ["b2", "b", "complete"],
  ["c2", "c", "complete"],
  ["f1", "f", "complete", "c2"],
  ["g1", "g", "complete", "d1"],
  ["a3", "a", "complete"],
  ["c3", "c", "complete"],
  ["f2", "f", "complete"],
  ["i1", "i", "complete", "a3"],
  ["t4", "t", "complete"],
  ["j1", "j", "complete", "t4"],
  ["d2", "d", "complete"],
  ["k1", "k", "complete", "f2"],
  ["a4", "a", "complete"],
  ["l1", "l", "complete", "k1"],
  ["e1", "e", "complete", "l1"],
  ["g2", "g", "warning"],
  ["h1", "h", "exception", "e1"],
  ["c4", "c", "complete"],
  ["i2", "i", "complete"],
  ["a5", "a", "complete"],
  ["j2", "j", "in-progress"],
  ["k2", "k", "in-progress"],
  ["i3", "i", "complete"],
  ["f3", "f", "in-progress"],
  ["l2", "l", "in-progress"],
  ["a6", "a", "complete"],
  ["d3", "d", "in-progress"],
  ["c5", "c", "in-progress"],
  ["m1", "m", "open"],
  ["n1", "n", "open"],
  ["t5", "t", "in-progress"],
];

const eventLane = (key: string) => (key === "t" ? TRUNK : laneId(key));
const titleOf = (key: string, id: string) => `${key === "t" ? "Request Timeline" : items.find((item) => item.key === key)!.label} step ${id.slice(1)}`;

export const stressEvents: GraphEvent[] = script.map(([id, key, status, triggeredBy]) => ({
  id,
  lane: eventLane(key),
  title: titleOf(key, id),
  time: "",
  status,
  triggeredBy,
}));
