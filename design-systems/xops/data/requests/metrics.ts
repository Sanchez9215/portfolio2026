// The join-and-derive seam for requests — nothing is stored: item status comes from its
// lane's event outcomes, parent status from its items (rules: .claude/projects/xops PLAN.md 17).

import type { RequestListRequest } from "../../components/RequestList";
import type { StatusIconStatus } from "../../components/StatusIcon";
import type { EventLogEvent, EventLogLaneOption } from "../../components/EventLog";
import type { GraphEvent, GraphLane } from "../../components/OrchestrationGraph";
import { DOMAIN_LANE_COLOR, EMPLOYEE_LANE_COLOR } from "../../components/eventLaneColors";
import { deriveRequestStatus, type RequestStatus } from "../../components/requestStatus";
import { getDataset } from "../generate";
import { EMPLOYEE_LANE } from "./types";
import type { RequestEvent, RequestItemRecord, RequestRecord, RequestsDataset } from "./types";
import { deviceFor } from "./devices";

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
  /** Only requests last updated on this UTC calendar day. Omit for every day, newest first. */
  day?: Date;
  limit?: number;
}

const DAY_MS = 86_400_000;

/** The date group a request falls in, from its last update: "Today" and "Yesterday" relative to the dataset's as-of day,
 *  the full date before that. */
function dateGroupLabel(ds: RequestsDataset, updatedIso: string): string {
  const dayStart = (iso: string) => Date.UTC(new Date(iso).getUTCFullYear(), new Date(iso).getUTCMonth(), new Date(iso).getUTCDate());
  const daysAgo = Math.round((dayStart(ds.generatedAt) - dayStart(updatedIso)) / DAY_MS);
  return daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : formatDate(updatedIso);
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
    dateGroup: dateGroupLabel(ds, updated),
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

/** The event log's rows: first the planned events that are next up (one per lane, no time — a plan is not a record),
 *  then the history: in-progress events on top (lane order, dated today, no time), then complete / warning /
 *  exception events newest first under their own dates. Only finished events carry a time. */
export function eventLogEvents(ds: RequestsDataset, request: RequestRecord): EventLogEvent[] {
  const laneInfo = new Map<string, { label: string; color: string }>([[EMPLOYEE_LANE, { label: "Employee", color: EMPLOYEE_LANE_COLOR }]]);
  for (const item of request.items) {
    laneInfo.set(item.id, { label: item.runbookName, color: DOMAIN_LANE_COLOR[item.domain] });
  }
  const laneOrder = new Map([EMPLOYEE_LANE, ...request.items.map((item) => item.id)].map((id, index) => [id, index]));
  const all = requestEvents(ds, request.id);
  const today = formatDate(ds.generatedAt);
  // Only finished events have a time; anything not finished shows "-".
  const row = (event: RequestEvent, at: string | null) => {
    const lane = laneInfo.get(event.lane)!;
    const finished = at !== null && event.outcome !== "in-progress";
    return {
      id: event.id,
      lane: event.lane,
      laneLabel: lane.label,
      laneColor: lane.color,
      // An in-progress event is still going on, so it sits under today's date.
      date: event.outcome === "in-progress" ? today : at ? formatDate(at) : "",
      time: finished ? formatClock(at) : "-",
      title: event.title,
      status: EVENT_STATUS[event.outcome],
    };
  };
  const byLane = (a: RequestEvent, b: RequestEvent) => (laneOrder.get(a.lane) ?? 0) - (laneOrder.get(b.lane) ?? 0);

  // Up next: each lane's first planned event, in lane order.
  const laneHasNext = new Set<string>();
  const upNext = all
    .filter((event) => {
      if (event.outcome !== "planned" || laneHasNext.has(event.lane)) return false;
      laneHasNext.add(event.lane);
      return true;
    })
    .sort(byLane)
    .map((event) => row(event, null));

  // History: in-progress events lead (lane order, dated today), then finished events newest first under their own dates.
  const inProgress = all.filter((event) => event.outcome === "in-progress").sort(byLane).map((event) => row(event, event.at));
  const finished = all
    .filter((event) => event.outcome !== "planned" && event.outcome !== "in-progress")
    .sort((a, b) => b.at.localeCompare(a.at) || all.indexOf(b) - all.indexOf(a))
    .map((event) => row(event, event.at));

  return [...upNext, ...inProgress, ...finished];
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

export interface EmployeeInformationData {
  name: string;
  department: string;
  startDate: string;
  persona: string;
  employeeId: string;
  /** Usually one; more than one stacks on the card. */
  costCenters: string[];
}

// The persona is the device/software package the role gets; the roster has no such field, so it follows
// the department's org: engineering-type orgs are Engineers, go-to-market is Sales, the executive team is Executives.
const PERSONA_BY_ORG: Record<string, string> = {
  Technology: "Engineer",
  "Go-To-Market": "Sales",
  Corporate: "Knowledge Worker",
};

function personaFor(departmentId: string, parentOrg: string | undefined): string {
  return departmentId === "executive" ? "Executive" : (PERSONA_BY_ORG[parentOrg ?? ""] ?? "Knowledge Worker");
}

/** The employee a request is for, joined from the HR roster and org config. */
export function employeeInformation(request: RequestRecord): EmployeeInformationData | null {
  const { hr, config } = getDataset();
  const employee = hr.find((row) => row.employeeId === request.employeeId);
  if (!employee) return null;
  const department = config.departments.find((candidate) => candidate.departmentId === employee.department);
  const costCenter = config.costCenters.find((candidate) => candidate.code === employee.costCenter);
  return {
    name: employee.workerName,
    department: department?.departmentName ?? employee.department,
    startDate: formatDate(employee.hireDate),
    persona: personaFor(employee.department, department?.parentOrg),
    employeeId: employee.employeeId,
    costCenters: [costCenter?.name ?? employee.costCenter],
  };
}

export type DeviceRow = {
  id: string;
  assetTag: string;
  image: string;
  make: string;
  model: string;
  /** "Pending" until the shipment exists. */
  trackingNumber: string;
  /** Display date, plus the ISO value to sort on. */
  warrantyEnd: string;
  warrantyEndAt: string;
  serialNumber: string;
};

export interface ItemDevicesData {
  mode: "deployment" | "recovery";
  title: string;
  rows: DeviceRow[];
}

// The tracking number is known once the shipment event has happened: for a deployment when the number is
// issued, for a recovery when the return kit ships.
const TRACKING_EVENT: Record<ItemDevicesData["mode"], string> = {
  deployment: "Tracking Number Issued",
  recovery: "Return Kit Shipped",
};

/** The device an item is about: Device Deployment → the device being sent, Device Recovery → the one expected back.
 *  Other items have none. */
export function itemDevices(ds: RequestsDataset, request: RequestRecord, item: RequestItemRecord): ItemDevicesData | null {
  const mode = item.runbookName === "Device Deployment" ? "deployment" : item.runbookName === "Device Recovery" ? "recovery" : null;
  if (!mode) return null;
  const employee = employeeInformation(request);
  if (!employee) return null;
  const device = deviceFor(employee.employeeId, employee.persona, mode === "deployment" ? "deploy" : "recover");
  const shipped = requestEvents(ds, request.id).some(
    (event) => event.lane === item.id && event.title === TRACKING_EVENT[mode] && event.outcome === "complete",
  );
  return {
    mode,
    title: mode === "deployment" ? "Device Being Deployed" : "Device Expected Back",
    rows: [
      {
        id: device.assetTag,
        assetTag: device.assetTag,
        image: `/xops/images/${device.image}`,
        make: device.make,
        model: device.model,
        trackingNumber: shipped ? device.trackingNumber : "Pending",
        warrantyEnd: formatDate(device.warrantyEnd),
        warrantyEndAt: device.warrantyEnd,
        serialNumber: device.serialNumber,
      },
    ],
  };
}

export { EMPLOYEE_LANE, deriveRequestStatus };
