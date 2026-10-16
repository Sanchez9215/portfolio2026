"use client";

import { useMemo, useRef } from "react";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import { Table } from "@/design-systems/xops/components/Table";
import { softwareColumns } from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";
import { getDataset } from "@/design-systems/xops/data/generate";
import { productSummaries } from "@/design-systems/xops/data/metrics";
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
const NATIVE_WIDTH = 1440;

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

export default function RowAnatomyMap() {
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  const ds = useMemo(() => getDataset(), []);
  const rows = useMemo(() => productSummaries(ds).slice(0, 3), [ds]);

  return (
    <ImgCard variant="embed" allowOverflow>
      <div ref={embedWrapperRef} style={{ position: "relative" }}>
        <LiveEmbed nativeWidth={NATIVE_WIDTH} disableCanvasTransition>
          <Table
            columns={softwareColumns}
            data={rows}
            rowKey={(row) => row.sku}
            scrollFade={false}
            disableVerticalScroll
            disableHorizontalScroll
          />
        </LiveEmbed>
        <AnnotationConnectorHotspot
          containerRef={embedWrapperRef}
          nativeWidth={NATIVE_WIDTH}
          hotspots={[SPOTLIGHT]}
        />
        <HotspotNotesRow
          containerRef={embedWrapperRef}
          targetSelector="table"
          notes={NOTES}
        />
      </div>
    </ImgCard>
  );
}
