// The join-and-derive seam for requests — nothing is stored: item status comes from its
// lane's event outcomes, parent status from its items (rules: .claude/projects/xops PLAN.md 17).

import type { RequestListRequest } from "../../components/RequestList";
import type { StatusIconStatus } from "../../components/StatusIcon";
import type { EventLogEvent, EventLogLaneOption } from "../../components/EventLog";
import type { GraphEvent, GraphLane } from "../../components/OrchestrationGraph";
import { DOMAIN_LANE_COLOR, EMPLOYEE_LANE_COLOR } from "../../components/eventLaneColors";
import { deriveRequestStatus, type RequestStatus } from "../../components/requestStatus";
import { EMPLOYEE_LANE } from "./types";
import type { RequestEvent, RequestRecord, RequestsDataset } from "./types";

/** Item status derived from its swim lane's events. */
export function itemStatusFromEvents(laneEvents: RequestEvent[]): StatusIconStatus {
  if (laneEvents.some((e) => e.outcome === "exception")) return "exception";
  if (laneEvents.some((e) => e.outcome === "warning")) return "warning";
  if (laneEvents.length > 0 && laneEvents.every((e) => e.outcome === "complete")) return "complete";
  if (laneEvents.some((e) => e.outcome === "complete" || e.outcome === "in-progress")) return "in-progress";
  return "open";
}

const eventsByRequest = new WeakMap<RequestsDataset, Map<string, RequestEvent[]>>();

function indexFor(ds: RequestsDataset): Map<string, RequestEvent[]> {
  let index = eventsByRequest.get(ds);
  if (!index) {
    index = new Map();
    for (const event of ds.events) {
      const list = index.get(event.requestId) ?? [];
      list.push(event);
      index.set(event.requestId, list);
    }
    index.forEach((list) => list.sort((a, b) => a.at.localeCompare(b.at)));
    eventsByRequest.set(ds, index);
  }
  return index;
}

export function requestEvents(ds: RequestsDataset, requestId: string): RequestEvent[] {
  return indexFor(ds).get(requestId) ?? [];
}

export function requestItems(ds: RequestsDataset, request: RequestRecord) {
  const events = requestEvents(ds, request.id);
  return request.items.map((item) => ({
    id: item.id,
    runbookName: item.runbookName,
    status: itemStatusFromEvents(events.filter((e) => e.lane === item.id)),
  }));
}

/** Most recent event that has actually happened. */
export function lastUpdatedAt(ds: RequestsDataset, requestId: string): string {
  const happened = requestEvents(ds, requestId).filter((e) => e.outcome !== "planned" && e.outcome !== "in-progress");
  return happened.length ? happened[happened.length - 1].at : "";
}

const pad = (n: number) => String(n).padStart(2, "0");

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours();
  return `${pad(h % 12 === 0 ? 12 : h % 12)}:${pad(d.getUTCMinutes())} ${h < 12 ? "am" : "pm"}`;
}

export interface ListRequestsOptions {
  /** Only requests last updated on this UTC calendar day (the list's "Today" group). */
  day?: Date;
  limit?: number;
}

export function listRequests(ds: RequestsDataset, options: ListRequestsOptions = {}): RequestListRequest[] {
  const dayKey = options.day?.toISOString().slice(0, 10);
  const rows = ds.requests
    .map((request) => ({ request, updated: lastUpdatedAt(ds, request.id) }))
    .filter(({ updated }) => updated && (!dayKey || updated.slice(0, 10) === dayKey))
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, options.limit);

  return rows.map(({ request, updated }) => ({
    id: request.id,
    lastUpdated: formatTime(updated),
    runbookName: request.name,
    items: requestItems(ds, request),
    closure: request.closure,
    suspended: request.suspended,
  }));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function formatClock(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours();
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(d.getUTCMinutes())} ${h < 12 ? "AM" : "PM"}`;
}

const EVENT_STATUS: Record<RequestEvent["outcome"], StatusIconStatus> = {
  complete: "complete",
  "in-progress": "in-progress",
  planned: "open",
  warning: "warning",
  exception: "exception",
};

/** The event log's rows, newest first, with each lane's label and color resolved. Only what has happened
 *  (complete, in progress, warning, exception) plus the next planned event in each lane — never the whole plan. */
export function eventLogEvents(ds: RequestsDataset, request: RequestRecord): EventLogEvent[] {
  const laneInfo = new Map<string, { label: string; color: string }>([[EMPLOYEE_LANE, { label: "Employee", color: EMPLOYEE_LANE_COLOR }]]);
  for (const item of request.items) {
    laneInfo.set(item.id, { label: item.runbookName, color: DOMAIN_LANE_COLOR[item.domain] });
  }
  const laneHasNext = new Set<string>();
  const shown = requestEvents(ds, request.id).filter((event) => {
    if (event.outcome !== "planned") return true;
    if (laneHasNext.has(event.lane)) return false;
    laneHasNext.add(event.lane);
    return true;
  });
  return [...shown]
    .reverse()
    .map((event) => {
      const lane = laneInfo.get(event.lane)!;
      return {
        id: event.id,
        lane: event.lane,
        laneLabel: lane.label,
        laneColor: lane.color,
        date: formatDate(event.at),
        time: formatClock(event.at),
        title: event.title,
        status: EVENT_STATUS[event.outcome],
      };
    });
}

export function eventLogLaneOptions(request: RequestRecord): EventLogLaneOption[] {
  return [
    { value: EMPLOYEE_LANE, label: "Employee" },
    ...request.items.map((item) => ({ value: item.id, label: `${item.id} · ${item.runbookName}` })),
  ];
}

/** The orchestration graph's lanes (employee trunk first, then items) and events in time order. */
export function orchestrationGraph(ds: RequestsDataset, request: RequestRecord): { lanes: GraphLane[]; events: GraphEvent[] } {
  const events = requestEvents(ds, request.id);
  const lanes: GraphLane[] = [
    { id: EMPLOYEE_LANE, label: "Request Timeline", color: EMPLOYEE_LANE_COLOR },
    ...request.items.map((item) => ({
      id: item.id,
      label: item.runbookName,
      color: DOMAIN_LANE_COLOR[item.domain],
      status: itemStatusFromEvents(events.filter((e) => e.lane === item.id)),
      code: item.id,
    })),
  ];
  return {
    lanes,
    events: events.map((event) => ({
      id: event.id,
      lane: event.lane,
      title: event.title,
      time: `${formatDate(event.at)} ${formatClock(event.at)}`,
      status: EVENT_STATUS[event.outcome],
      triggeredBy: event.triggeredBy,
    })),
  };
}

export interface RequestHeaderData {
  id: string;
  runbookName: string;
  dateOpened: string;
  /** null while the request is still open. */
  dateClosed: string | null;
  requestor: string;
  status: RequestStatus;
}

export function requestHeader(ds: RequestsDataset, request: RequestRecord): RequestHeaderData {
  const status = deriveRequestStatus(requestItems(ds, request), { closure: request.closure, suspended: request.suspended });
  const closed = status === "Closed-Complete" || status === "Closed-Incomplete" || status === "Closed-Canceled";
  return {
    id: request.id,
    runbookName: request.name,
    dateOpened: formatDate(request.createdAt),
    dateClosed: closed ? formatDate(lastUpdatedAt(ds, request.id)) : null,
    requestor: request.requestorName,
    status,
  };
}

export { EMPLOYEE_LANE, deriveRequestStatus };
