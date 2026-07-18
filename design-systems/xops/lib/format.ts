// Shared number-formatting convention for XOPS (DECISIONS.md 034).
// One Intl-backed utility, en-US fixed. Field-type presets, no per-call config beyond
// the compact/full surface switch: tables pass full digits, tiles/Legend/chart axes pass compact.

const COMPACT_THRESHOLD = 10_000;
export const EM_DASH = "—";

function compactParts(value: number): { divisor: number; suffix: string } {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return { divisor: 1_000_000_000, suffix: "B" };
  if (abs >= 1_000_000) return { divisor: 1_000_000, suffix: "M" };
  if (abs >= 1_000) return { divisor: 1_000, suffix: "K" };
  return { divisor: 1, suffix: "" };
}

function compactFormat(value: number): string {
  const { divisor, suffix } = compactParts(value);
  if (!suffix) return Math.round(value).toLocaleString("en-US");
  const scaled = (value / divisor).toFixed(1).replace(/\.0$/, "");
  return `${scaled}${suffix}`;
}

export type FormatOptions = { compact?: boolean };

/** Whole-number counts — grouped, 0 decimals; abbreviated (48K) when compact and >= 10,000. */
export function formatCount(value: number, options?: FormatOptions): string {
  if (options?.compact && Math.abs(value) >= COMPACT_THRESHOLD) return compactFormat(value);
  return Math.round(value).toLocaleString("en-US");
}

/** Whole-dollar currency — grouped, no cents; abbreviated ($3.4M) when compact and >= 10,000. */
export function formatCurrency(value: number, options?: FormatOptions): string {
  if (options?.compact && Math.abs(value) >= COMPACT_THRESHOLD) return `$${compactFormat(value)}`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/** A rate already expressed 0-100 (e.g. utilization) — whole-number percent. */
export function formatRate(value: number): string {
  return `${Math.round(value)}%`;
}

/** part/total as a whole-number percent; guards the zero-denominator case. */
export function formatPercent(part: number, total: number): string {
  if (total <= 0) return "0%";
  return formatRate((part / total) * 100);
}

/** "1,234 (56%)" — the seat-breakdown cell shape used across the lifecycle tables. */
export function formatCountWithPercent(count: number, total: number): string {
  return `${formatCount(count)} (${formatPercent(count, total)})`;
}
