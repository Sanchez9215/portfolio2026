"use client";

import LiveEmbed from "@/components/LiveEmbed";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";

// The final Overview design with License Utilization, Top Non-Compliant Software,
// and Security Compliance hidden — isolates the two cards this section's copy
// speaks to (spend by licensing model, software by lifecycle stage). Sidebar's
// onNavigate is a no-op (rather than left undefined) so nav items stay
// hoverable/clickable without falling back to real next/link routing.
export default function OverviewSpendLifecycleEmbed() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", isolation: "isolate" }}>
      <LiveEmbed nativeWidth={1440} scroll>
        <OverviewScreen onNavigate={() => {}} showSecondaryCards={false} />
      </LiveEmbed>
    </div>
  );
}
