// XOPS requests data model — an ITSM request (parent) fulfilled by items (one runbook each),
// narrated by an event log. Every event carries the system it would really come from, and
// item/parent statuses are DERIVED from events (see requestMetrics.ts), never stored.
//
//   itsm → ServiceNow-style request/item records and approvals
//   hr → HR system   identity → IAM   screening → background check   badge → physical access
//   device-management → MDM   software-distribution → endpoint/SaaS license tooling
//   telecom → carrier/phone system   logistics → carrier/shipping   procurement → inventory

export type EventSource =
  | "itsm"
  | "hr"
  | "identity"
  | "screening"
  | "badge"
  | "device-management"
  | "software-distribution"
  | "telecom"
  | "logistics"
  | "procurement";

export type EventActor = "system" | "employee" | "manager" | "agent";

export type EventType =
  | "milestone"
  | "automation"
  | "approval"
  | "human-task"
  | "notification"
  | "exception"
  | "resolution";

export type EventOutcome = "complete" | "in-progress" | "planned" | "warning" | "exception";

/** "employee" for the main trunk, otherwise the id of the item whose swim lane this is. */
export type EventLane = string;

export const EMPLOYEE_LANE = "employee";

export interface RequestEvent {
  id: string;
  requestId: string;
  lane: EventLane;
  title: string;
  /** ISO timestamp — past for happened events, future for planned/scheduled ones. */
  at: string;
  source: EventSource;
  actor: EventActor;
  type: EventType;
  outcome: EventOutcome;
  /** Id of the event in ANOTHER lane that caused this one. In-lane order is implicit. */
  triggeredBy?: string;
}

export type RequestTemplateKey = "vip-onboarding" | "remote-onboarding" | "executive-onboarding" | "offboarding";

/** The kind of work a runbook does — offboarding counterparts share their onboarding domain. */
export type RunbookDomain = "device" | "badge" | "software" | "mobile" | "email" | "remote-access" | "payroll" | "training";

export interface RequestItemRecord {
  id: string; // "ITM-01"
  requestId: string;
  runbookName: string; // "Device Deployment"
  domain: RunbookDomain;
}

export interface RequestRecord {
  id: string; // "REQ-232"
  templateKey: RequestTemplateKey;
  name: string; // "US VIP Onboarding"
  employeeName: string;
  /** Who raised the request (the hiring manager / HR partner) — deterministic per id. */
  requestorName: string;
  createdAt: string;
  /** Explicit terminal outcome — not derivable from items. */
  closure?: "incomplete" | "canceled";
  /** System-set suspension (e.g. SLA at risk, awaiting the employee). */
  suspended?: boolean;
  /** Target to complete, in hours from creation (the runbook's SLA). */
  slaTargetHours: number;
  items: RequestItemRecord[];
}

export interface RequestsDataset {
  generatedAt: string;
  seed: number;
  requests: RequestRecord[];
  events: RequestEvent[];
}
