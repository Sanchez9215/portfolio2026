"use client";

import React, { useMemo } from "react";
import { Card } from "../components/Card";
import { Stat } from "../components/Stat";
import { Legend } from "../components/Legend";
import { DonutChart } from "../components/DonutChart";
import { getDataset } from "../data/generate";
import { complianceTotals, atRiskInstances } from "../data/complianceMetrics";
import { formatCount, formatPercent } from "../lib/format";

// "Compliance" card — non-compliant stat, donut and legend. Extracted from
// OverviewLegacy so it can also render on its own (the case study's small
// compliance card). Same markup and hotspot ids as when it was inline;
// OverviewLegacy keeps the `compliance-granularity` wrapper around it.

export function CompliancePanel() {
  const ds = useMemo(() => getDataset(), []);
  const compliance = useMemo(() => complianceTotals(ds), [ds]);
  const atRisk = useMemo(() => atRiskInstances(ds), [ds]);
  // Prototype-one taxonomy: 3 buckets, not the detailed 5-state model later prototypes
  // use (see complianceMetrics.ts's atRiskInstances comment). Generic categorical
  // ordering — largest slice first, so the donut and legend always match regardless of
  // which bucket happens to be biggest this run.
  const complianceSegments = useMemo(
    () =>
      [
        { label: "Compliant", value: compliance.compliantInstances - atRisk, color: "var(--xops-status-success-solid)" },
        { label: "At Risk", value: atRisk, color: "var(--xops-status-warning-solid)" },
        { label: "Non-Compliant", value: compliance.nonCompliantInstances, color: "var(--xops-status-danger-solid)" },
      ].sort((a, b) => b.value - a.value),
    [compliance, atRisk],
  );

  return (
    <Card title="Compliance">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--xops-spacing-24)" }}>
        <Stat
          label="Non-Compliant Instances"
          value={formatCount(compliance.nonCompliantInstances)}
          meta={`across ${compliance.nonCompliantTitles} titles`}
        />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DonutChart
            segments={complianceSegments.map((s) => ({
              value: s.value,
              color: s.color,
              tooltip: {
                category: s.label,
                rows: [
                  { label: "Instances", value: formatCount(s.value) },
                  { label: "% of Total", value: formatPercent(s.value, compliance.totalAssessed) },
                ],
              },
            }))}
          />
        </div>
        <Legend
          items={complianceSegments.map((s) => ({
            label: s.label,
            value: formatCount(s.value, { compact: true }),
            meta: formatPercent(s.value, compliance.totalAssessed),
            color: s.color,
            hotspotId: s.label === "Compliant" ? "compliant-legend" : undefined,
          }))}
        />
      </div>
    </Card>
  );
}
