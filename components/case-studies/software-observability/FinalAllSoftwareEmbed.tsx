"use client";

import LiveEmbed from "@/components/LiveEmbed";
import { AllSoftwareScreen } from "@/app/work/software-observability/xops-all-software/AllSoftwareScreen";

// The final All Software design on its own — not connected to Overview or
// any other screen. Sidebar's onNavigate is a no-op (rather than left
// undefined) so nav items stay hoverable/clickable without falling back to
// real next/link routing and navigating the visitor off the case study.
export default function FinalAllSoftwareEmbed() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", isolation: "isolate" }}>
      <LiveEmbed nativeWidth={1440} scroll>
        <AllSoftwareScreen onNavigate={() => {}} />
      </LiveEmbed>
    </div>
  );
}
