"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import { Table } from "@/design-systems/xops/components/Table";
import { softwareColumns } from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";
import { getDataset } from "@/design-systems/xops/data/generate";
import {
  productSummaries,
  ProductSummary,
} from "@/design-systems/xops/data/metrics";
import AnnotationConnectorHotspot, {
  AnnotationHotspotData,
} from "./AnnotationConnectorHotspot";
import HotspotNotesRow, { HotspotNote } from "./HotspotNotesRow";

// Static Table Anatomy embed — bare live Table (header + 3 rows) at the full
// 1440 reference width so all 8 columns are fully visible, one spotlight over
// the whole table, and the annotations as a plain row above it with no
// connectors (same treatment as AllSoftwareIssuesMap). Titles/bodies carried
// over verbatim from RowAnatomyHotspots' HotspotOverlay copy, in column order:
// 1 Software, 2 Vendor, 3 Category, 4 Utilization, 5 Opportunity, 6 Renewal
// (Total Spend and Licenses Purchased have no annotation).
const NO_INSIGHT = { label: "", insightLabel: "", insight: "" };
const BASE_NATIVE_WIDTH = 1440;

// Five rows that show the range of states: one over-assigned, one with a
// critical renewal (≤30 days), one healthy (≥85% utilization, comfortable
// renewal), one underutilized (76-84%, renewal 31-180 days) and one critical
// utilization (≤74%). Each is a different title; if the data has no match for a slot, the
// next unused seat-based row fills it. The rows are then ranked by Opportunity,
// highest first, with that column showing the sort — All Software's default order.
function pickRows(all: ProductSummary[]): ProductSummary[] {
  const seat = all.filter((r) => r.seatBased);
  const picked: ProductSummary[] = [];
  const take = (match: (r: ProductSummary) => boolean) => {
    const row =
      seat.find((r) => !picked.includes(r) && match(r)) ??
      seat.find((r) => !picked.includes(r));
    if (row) picked.push(row);
  };
  take((r) => r.excessAssigned > 0);
  take((r) => r.renewalDays <= 30 && r.excessAssigned === 0);
  take(
    (r) => r.utilization >= 85 && r.renewalDays > 180 && r.excessAssigned === 0,
  );
  take(
    (r) =>
      r.utilization >= 76 &&
      r.utilization <= 84 &&
      r.renewalDays > 30 &&
      r.renewalDays <= 180 &&
      r.excessAssigned === 0,
  );
  take((r) => r.utilization <= 74 && r.excessAssigned === 0);
  // Ranked the way All Software's default view is: Opportunity, highest first.
  return picked.sort((a, b) => b.opportunity - a.opportunity);
}

const SPOTLIGHT: AnnotationHotspotData = {
  ...NO_INSIGHT,
  targetId: "row-anatomy-table",
  targetSelectors: ["table"],
  cutoutOnly: true,
  spotlightPadding: 0,
  spotlightRadius: 12,
  title: "",
  body: "",
};

const NOTES: HotspotNote[] = [
  {
    title: "Publisher Logo",
    body: "Publisher logos created an immediate visual anchor, helping users recognize the product instantly without needing to read the full text.",
  },
  {
    title: "Vendor",
    body: "Vendor provides instant procurement context, helping teams link spend, renewals, and contracts without digging through external systems.",
  },
  {
    title: "Category",
    body: "Category gives clarity as to what the tool does, reducing interpretation effort and helping identify redundant software.",
  },
  {
    title: "Utilization Tag",
    body: "Color-coded tags made usage status instantly scannable, without requiring interpretation of raw numbers.",
  },
  {
    title: "Opportunity",
    body: 'Introducing a monetary "opportunity" value turned low usage into clear business impact, helping teams quickly understand where savings exist.',
  },
  {
    title: "Renewal Date + Countdown",
    body: "Pairing renewal dates with a countdown provided urgency at a glance, reducing the cognitive load of mentally calculating proximity.",
  },
];

// The column descriptions under the table are hidden for now (flip to true to
// restore).
const SHOW_NOTES = false;

export default function RowAnatomyMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  const ds = useMemo(() => getDataset(), []);
  const rows = useMemo(() => pickRows(productSummaries(ds)), [ds]);

  // Every column must be visible: the table can't scroll sideways here, so if
  // its columns need more than the base width, the embed's native width grows by
  // exactly the overflow (the whole thing then scales down to fit the card).
  const tableRef = useRef<HTMLDivElement>(null);
  const [nativeWidth, setNativeWidth] = useState(BASE_NATIVE_WIDTH);
  useLayoutEffect(() => {
    const root = tableRef.current;
    if (!root) return;
    let overflow = 0;
    root.querySelectorAll<HTMLElement>("*").forEach((el) => {
      overflow = Math.max(overflow, el.scrollWidth - el.clientWidth);
    });
    if (overflow > 1) setNativeWidth((w) => w + Math.ceil(overflow));
  }, [nativeWidth, rows]);

  return (
    <ImgCard variant="embed" allowOverflow>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={nativeWidth} disableCanvasTransition>
          <div ref={tableRef}>
            <Table
              columns={softwareColumns}
              data={rows}
              rowKey={(row) => row.sku}
              sortKey="opportunity"
              sortDirection="desc"
              scrollFade={false}
              disableVerticalScroll
              disableHorizontalScroll
            />
          </div>
        </LiveEmbed>
        <AnnotationConnectorHotspot
          containerRef={embedWrapperRef}
          nativeWidth={nativeWidth}
          hotspots={[SPOTLIGHT]}
        />
        {SHOW_NOTES && (
          <HotspotNotesRow
            containerRef={embedWrapperRef}
            targetSelector="table"
            notes={NOTES}
          />
        )}
      </div>
    </ImgCard>
  );
}
