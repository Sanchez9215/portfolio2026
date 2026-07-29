"use client";

import { useRef, useState } from "react";
import LiveEmbed from "@/components/LiveEmbed";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import AllSoftwareLegacy from "@/design-systems/xops/legacy/AllSoftwareLegacy";
import type { SoftwareSubKey } from "@/design-systems/xops/components/Sidebar";

// The live, navigable prototype for "Testing the Experience" — no hotspots, no
// spotlight, just the real connected flow: the finalized (non-legacy) Overview,
// same component Overview Prototype 2 embeds, connected to the legacy All Software
// -> Software Profile flow being tested together (per the section's own copy —
// "With the Overview finalized, I connected the All Software and Profile views").
// Overview <-> All Software is driven by screen state here (same onNavigate pattern
// as SoftwareExperienceEmbed); All Software -> Software Profile already works
// unchanged via AllSoftwareLegacy's own SidePanel state. Only the active top-level
// screen is mounted. Fully interactive on load — no ghost-cursor autoplay, no
// click-to-unlock gate.
export default function LegacyExperienceEmbed() {
  const [screen, setScreen] = useState<SoftwareSubKey>("overview");
  const embedWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={embedWrapperRef}
      style={{ position: "relative", width: "100%", height: "100%", isolation: "isolate" }}
    >
      <LiveEmbed nativeWidth={1440} scroll>
        {screen === "overview" ? (
          <OverviewScreen
            showLogos={false}
            showUtilizationTags={false}
            showOpportunity={false}
            onNavigate={setScreen}
          />
        ) : (
          <AllSoftwareLegacy onNavigate={setScreen} />
        )}
      </LiveEmbed>
    </div>
  );
}
