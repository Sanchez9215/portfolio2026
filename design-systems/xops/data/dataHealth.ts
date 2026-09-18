// Data Health Monitor's threshold model. Real-world basis: a ServiceNow-style CMDB
// observability layer — see .claude/projects/data-health-monitor/PLAN.md's Goal section.
// Each domain configures its own Completeness/Quality/Recency thresholds independently
// (no shared default to inherit/override) — Employee's target for a metric has nothing to
// do with Infrastructure's. "Overall" is not its own domain: the displayed value is the
// average of the domain values for that metric, compared against Overall's own configured
// threshold (also independent, not derived from the domain thresholds) to pick a status.
//
// target = admin-configured floor. warning = admin-configured early-warning line above the
// floor (Datadog SLO model: value >= warning -> healthy, target <= value < warning -> at-risk,
// value < target -> critical). PREVIEW ONLY: every `warning` below is target+3 (capped at
// 100) as a placeholder gap, not a confirmed admin-set value.

export type DataHealthMetricKey = "completeness" | "quality" | "recency";

export type DataHealthState = "healthy" | "at-risk" | "critical";

export type DataHealthThreshold = {
  target: number;
  warning: number;
};

export type DataHealthMetric = DataHealthThreshold & {
  value: number;
};

export type DataHealthDomainRow = {
  domain: string;
  icon: string;
  completeness: DataHealthMetric;
  quality: DataHealthMetric;
  recency: DataHealthMetric;
};

function withWarning(target: number): number {
  return Math.min(target + 3, 100);
}

export const domainHealthRows: DataHealthDomainRow[] = [
  {
    domain: "Employee",
    icon: "group",
    completeness: { value: 89, target: 90, warning: withWarning(90) },
    quality: { value: 91, target: 92, warning: withWarning(92) },
    recency: { value: 86, target: 85, warning: withWarning(85) },
  },
  {
    domain: "Infrastructure",
    icon: "storage",
    completeness: { value: 79, target: 75, warning: withWarning(75) },
    quality: { value: 71, target: 68, warning: withWarning(68) },
    recency: { value: 67, target: 65, warning: withWarning(65) },
  },
  {
    domain: "Worksite",
    icon: "domain",
    completeness: { value: 94, target: 88, warning: withWarning(88) },
    quality: { value: 88, target: 82, warning: withWarning(82) },
    recency: { value: 41, target: 40, warning: withWarning(40) },
  },
  {
    domain: "Software",
    icon: "code_blocks",
    completeness: { value: 99, target: 96, warning: withWarning(96) },
    quality: { value: 94, target: 88, warning: withWarning(88) },
    recency: { value: 98, target: 92, warning: withWarning(92) },
  },
];

// Overall's own thresholds — independent of any domain's, compared against the average
// domain value for that metric (see overallMetric below).
export const overallThresholds: Record<DataHealthMetricKey, DataHealthThreshold> = {
  completeness: { target: 85, warning: withWarning(85) },
  quality: { target: 80, warning: withWarning(80) },
  recency: { target: 75, warning: withWarning(75) },
};

export function overallMetric(metricKey: DataHealthMetricKey): DataHealthMetric {
  const sum = domainHealthRows.reduce((total, row) => total + row[metricKey].value, 0);
  const value = Math.round(sum / domainHealthRows.length);
  return { value, ...overallThresholds[metricKey] };
}

export function metricState(metric: DataHealthThreshold & { value: number }): DataHealthState {
  if (metric.value < metric.target) return "critical";
  if (metric.value < metric.warning) return "at-risk";
  return "healthy";
}

// worst-of: critical beats at-risk beats healthy — status-page/SRE rollup convention,
// never averaged (an average can mask a genuinely critical metric). Only for status
// rollups (e.g. a domain's single Tag from its 3 metrics) — the Overall value itself is
// an explicit average per the model above, not this rollup.
export function worstState(states: DataHealthState[]): DataHealthState {
  if (states.includes("critical")) return "critical";
  if (states.includes("at-risk")) return "at-risk";
  return "healthy";
}

export function domainRowState(row: DataHealthDomainRow): DataHealthState {
  return worstState([row.completeness, row.quality, row.recency].map(metricState));
}

export interface DataHealthLegendRange {
  state: DataHealthState;
  range: string;
}

// Ranges never share a printed boundary number: critical tops out at target-1, at-risk
// runs target..warning-1, healthy starts at warning. ≤/≥ + hyphen match the ≤/≥ + hyphen
// convention All Software's renewalTooltip legend already established (e.g. "≤30 days",
// "31-89 days", "≥181 days").
export function metricLegend(metric: DataHealthThreshold): DataHealthLegendRange[] {
  return [
    { state: "critical", range: `≤${metric.target - 1}%` },
    { state: "at-risk", range: `${metric.target}-${metric.warning - 1}%` },
    { state: "healthy", range: `≥${metric.warning}%` },
  ];
}
