"use client";

import { useState } from "react";
import LiveEmbed from "@/components/LiveEmbed";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import { AllSoftwareScreen } from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";
import type { SoftwareSubKey } from "@/design-systems/xops/components/Sidebar";

// The live, navigable "final software experience" for the case-study hero.
// Renders the real (non-legacy) XOPS screens at desktop width inside LiveEmbed's
// free-scroll window. Overview <-> All Software is driven by screen state here
// (via each screen's Sidebar onNavigate) rather than routing, so the whole flow
// stays contained in the hero instead of navigating the portfolio page away.
// All Software -> Software Profile is the screen's own SidePanel state and works
// unchanged. Only the active screen is mounted.
export default function SoftwareExperienceEmbed() {
  const [screen, setScreen] = useState<SoftwareSubKey>("overview");

  return (
    <LiveEmbed nativeWidth={1440} scroll>
      {screen === "overview" ? (
        <OverviewScreen onNavigate={setScreen} showSecondaryCards={false} />
      ) : (
        <AllSoftwareScreen onNavigate={setScreen} />
      )}
    </LiveEmbed>
  );
}
