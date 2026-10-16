"use client";

import LiveEmbed from "@/components/LiveEmbed";
import { OverviewScreen } from "@/app/work/software-observability/xops-overview/OverviewScreen";

// The final Overview design with License Utilization, Top Non-Compliant Software,
// and Security Compliance hidden — isolates the two cards this section's copy
// speaks to (spend by licensing model, software by lifecycle stage). Sidebar's
// onNavigate is a no-op (rather than left undefined) so nav items stay
// hoverable/clickable without falling back to real next/link routing. Not in
// `scroll` mode and not height-capped — the embed hugs the full page height so
// it runs all the way down to the lifecycle table.
export default function OverviewSpendLifecycleEmbed() {
  return (
    <div style={{ position: "relative", width: "100%", isolation: "isolate" }}>
      <LiveEmbed nativeWidth={1440} disableCanvasTransition>
        <OverviewScreen onNavigate={() => {}} showSecondaryCards={false} />
      </LiveEmbed>
    </div>
  );
}
