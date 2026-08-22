"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import HotspotOverlay, { Hotspot } from "@/components/HotspotOverlay";
import { Table } from "@/design-systems/xops/components/Table";
import { softwareColumns } from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";
import { getDataset } from "@/design-systems/xops/data/generate";
import { productSummaries } from "@/design-systems/xops/data/metrics";
import { useScrollHotspotSequence } from "@/hooks/useScrollHotspotSequence";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// section.row-anatomy — bare live Table (no Sidebar/GlobalHeader/PageHeader chrome),
// scaled up so only the header + 3 rows fill the card. Reuses the real `softwareColumns`
// definition from AllSoftwareScreen, so column order/rendering never drifts from the
// live app. Column order: 1 Software, 2 Vendor, 3 Category, 4 Utilization,
// 5 Opportunity, 6 Renewal, 7 Total Spend, 8 Licenses Purchased — targeted structurally
// via nth-child, same approach as AllSoftwareLegacyHotspots (Table.tsx is a shared
// component, left untouched). Body copy carried over verbatim from the old
// before/after CardRow cards.
const HOTSPOTS: Hotspot[] = [
  {
    id: "publisher-logo",
    title: "Publisher Logo",
    body: "Publisher logos created an immediate visual anchor, helping users recognize the product instantly without needing to read the full text.",
    targetSelectors: ["th:nth-child(1), td:nth-child(1)"],
  },
  {
    id: "vendor",
    title: "Vendor",
    body: "Vendor provides instant procurement context, helping teams link spend, renewals, and contracts without digging through external systems.",
    targetSelectors: ["th:nth-child(2), td:nth-child(2)"],
  },
  {
    id: "category",
    title: "Category",
    body: "Category gives clarity as to what the tool does, reducing interpretation effort and helping identify redundant software.",
    targetSelectors: ["th:nth-child(3), td:nth-child(3)"],
  },
  {
    id: "utilization-tag",
    title: "Utilization Tag",
    body: "Color-coded tags made usage status instantly scannable, without requiring interpretation of raw numbers.",
    targetSelectors: ["th:nth-child(4), td:nth-child(4)"],
  },
  {
    id: "opportunity",
    title: "Opportunity",
    body: 'Introducing a monetary "opportunity" value turned low usage into clear business impact, helping teams quickly understand where savings exist.',
    targetSelectors: ["th:nth-child(5), td:nth-child(5)"],
    placement: "left-top",
  },
  {
    id: "renewal",
    title: "Renewal Date + Countdown",
    body: "Pairing renewal dates with a countdown provided urgency at a glance, reducing the cognitive load of mentally calculating proximity.",
    targetSelectors: ["th:nth-child(6), td:nth-child(6)"],
    placement: "left-top",
  },
];

const SUB_BEATS_LIST = HOTSPOTS.map((h) => h.subBeats ?? 1);

// Reference width the bare table renders at before LiveEmbed scales it to fill the
// card — narrower than the columns' natural flex width so the scale-up reads as
// zoomed-in, not 1:1. First-guess value, not pixel-tuned — see progress.md.
const NATIVE_WIDTH = 1040;

export default function RowAnatomyHotspots() {
  const pinRef = useRef<HTMLDivElement>(null);
  const embedWrapperRef = useRef<HTMLDivElement>(null);
  const { activeIndex, settled } = useScrollHotspotSequence(pinRef, SUB_BEATS_LIST, "center");
  const active = activeIndex !== null ? HOTSPOTS[activeIndex] : null;

  const ds = useMemo(() => getDataset(), []);
  const rows = useMemo(() => productSummaries(ds).slice(0, 3), [ds]);

  // Fades section.table-anatomy's intro LabelBlock out as this card approaches its
  // centered pin, so the card is the only thing in focus once settled — separate,
  // short ScrollTrigger scoped to just the approach (top center → center center),
  // not the whole multi-hotspot pinned sequence below. `[class*="tableAnatomyLabel"]`
  // (not an exact classname, and not the outer section) because CSS Modules hash it
  // at build time, and this embed now lives inside that same section.
  useEffect(() => {
    const pinEl = pinRef.current;
    const introEl = document.querySelector<HTMLElement>('[class*="tableAnatomyLabel"]');
    if (!pinEl || !introEl) return;

    const fadeTrigger = ScrollTrigger.create({
      trigger: pinEl,
      start: "top center",
      end: "center center",
      scrub: true,
      onUpdate: (self) => gsap.set(introEl, { opacity: 1 - self.progress }),
      onLeaveBack: () => gsap.set(introEl, { opacity: 1 }),
    });

    // LiveEmbed resolves its real (scale-dependent) height asynchronously via
    // ResizeObserver, after this hook's + the pin hook's ScrollTriggers already
    // measured layout at mount — refreshing once more after the first paint
    // catches that final height, instead of the pin point silently drifting the
    // first time GSAP recalculates on its own (visible as a jump mid-scroll).
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => scheduleScrollTriggerRefresh());
    });

    return () => {
      fadeTrigger.kill();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={pinRef}>
      <ImgCard caption="All Software Final Design — Row Anatomy">
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
          <HotspotOverlay containerRef={embedWrapperRef} active={active} settled={settled} nativeWidth={NATIVE_WIDTH} />
        </div>
      </ImgCard>
    </div>
  );
}
