// Presentational config for the LifecycleTimeline's stages — label, color, marker icon.
// Colors map each stage to its closest existing chart-palette token (confirmed). Icons are
// masked via the Icon primitive; the 5 SVGs live in public/xops/icons/.
import type { LifecycleEventStage } from "../data/lifecycle";

export type StageConfig = {
  label: string;
  color: string;
  icon: string;
};

export const STAGE_ORDER: LifecycleEventStage[] = [
  "procurement",
  "license-management",
  "installation",
  "security",
  "support",
];

export const STAGE_CONFIG: Record<LifecycleEventStage, StageConfig> = {
  procurement: { label: "Procurement", color: "var(--xops-chart-8)", icon: "procurement" },
  "license-management": { label: "License Management", color: "var(--xops-chart-6)", icon: "license_management" },
  installation: { label: "Installation & Activation", color: "var(--xops-chart-5)", icon: "activation" },
  security: { label: "Security & Compliance", color: "var(--xops-chart-3)", icon: "security" },
  support: { label: "Support", color: "var(--xops-chart-4)", icon: "support" },
};
