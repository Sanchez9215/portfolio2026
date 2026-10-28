import type { TagStatus } from "./Tag";
import type { StatusIconStatus } from "./StatusIcon";

export type RequestStatus =
  | "Open"
  | "In-Progress"
  | "Suspended"
  | "Closed-Complete"
  | "Closed-Incomplete"
  | "Closed-Canceled";

export type RequestStatusInputs = {
  /** Explicit terminal outcome — not derivable from items. */
  closure?: "incomplete" | "canceled";
  /** System-set suspension (e.g. SLA nearing breach, employee confirmation outstanding). */
  suspended?: boolean;
};

export const requestStatusTag: Record<RequestStatus, TagStatus> = {
  Open: "open",
  "In-Progress": "info",
  Suspended: "warning",
  "Closed-Complete": "success",
  "Closed-Incomplete": "danger",
  "Closed-Canceled": "neutral",
};

/** Derives a parent request's status from its items (rules: PLAN.md 17). */
export function deriveRequestStatus(
  items: { status: StatusIconStatus }[],
  { closure, suspended }: RequestStatusInputs = {},
): RequestStatus {
  if (closure === "canceled") return "Closed-Canceled";
  if (closure === "incomplete") return "Closed-Incomplete";
  if (items.length > 0 && items.every((item) => item.status === "complete")) return "Closed-Complete";

  const hasException = items.some((item) => item.status === "exception");
  const hasActive = items.some((item) => item.status === "open" || item.status === "in-progress");
  if (suspended || (hasException && !hasActive)) return "Suspended";

  const allOpen = items.every((item) => item.status === "open");
  return allOpen ? "Open" : "In-Progress";
}
