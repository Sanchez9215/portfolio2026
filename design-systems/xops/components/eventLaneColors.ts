// Swim-lane colors, shared by the EventLog (and later the orchestration graph) — keyed by the
// kind of work, not by position, so the same color means the same thing on every request.
// Offboarding runbooks reuse their onboarding counterpart's domain (and so its color).
// Chart-palette tokens, confirmed.
import type { RunbookDomain } from "../data/requests/types";

export const EMPLOYEE_LANE_COLOR = "var(--xops-brand-primary)";

export const DOMAIN_LANE_COLOR: Record<RunbookDomain, string> = {
  device: "var(--xops-chart-7)",
  badge: "var(--xops-chart-1)",
  software: "var(--xops-chart-2)",
  mobile: "var(--xops-chart-3)",
  email: "var(--xops-chart-4)",
  "remote-access": "var(--xops-chart-5)",
  payroll: "var(--xops-chart-8)",
  training: "var(--xops-chart-3)",
};
