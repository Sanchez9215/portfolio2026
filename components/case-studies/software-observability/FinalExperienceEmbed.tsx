"use client";

import { useState } from "react";
import LiveEmbed from "@/components/LiveEmbed";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";
import { AllSoftwareScreen } from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";
import type { SoftwareSubKey } from "@/design-systems/xops/components/Sidebar";

// The final connected experience as its own embed: the final Overview and the
// final All Software, switched through the Sidebar (same onNavigate pattern as
// SoftwareExperienceEmbed). Fully interactive on load — no ghost-cursor
// autoplay and no click-to-unlock gate. Height-bounded parent required (LiveEmbed
// `scroll` fills it and scrolls natively).
export default function FinalExperienceEmbed() {
  const [screen, setScreen] = useState<SoftwareSubKey>("overview");

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        isolation: "isolate",
      }}
    >
      <LiveEmbed nativeWidth={1440} scroll>
        {screen === "overview" ? (
          <OverviewScreen
            onNavigate={setScreen}
            showSecondaryCards={false}
            embedded
          />
        ) : (
          <AllSoftwareScreen onNavigate={setScreen} embedded />
        )}
      </LiveEmbed>
    </div>
  );
}
