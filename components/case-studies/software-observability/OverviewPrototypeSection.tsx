"use client";

import { useState } from "react";
import LazyMount from "@/components/LazyMount";
import OverviewPrototypeHotspots from "./OverviewPrototypeHotspots";
import Timeline, { PlayerState, TimelineMilestone } from "./Timeline";
import pageStyles from "@/app/work/software-observability/software-observability.module.css";

// Wraps the card player + its Timeline sidebar together, since page.tsx is a
// server component and can't itself hold the milestone state the two need to
// share. Renders as a Fragment (not a wrapping div) so .prototypeValidationCenter
// and .prototypeValidationRight stay direct children of the Section's own CSS
// grid, same as when page.tsx rendered them separately.
export default function OverviewPrototypeSection() {
  const [milestone, setMilestone] = useState<TimelineMilestone>("prototype1");
  // Incremented on each Timeline row/Prototype 02 thumbnail click —
  // OverviewPrototypeHotspots watches this token (not its value, paired with
  // jumpTarget) to jump straight to that milestone, so even clicking the
  // same target twice in a row (already there) re-triggers cleanly.
  const [jumpToken, setJumpToken] = useState(0);
  const [jumpTarget, setJumpTarget] = useState<TimelineMilestone>("prototype1");
  // Countdown/exited/started + the 3 handler functions — reported up from
  // OverviewPrototypeHotspots (the state's real owner) so the sidebar's
  // player block can read/drive it. null until that component's first
  // effect run.
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);

  const jumpTo = (target: TimelineMilestone) => {
    setJumpTarget(target);
    setJumpToken((t) => t + 1);
  };

  return (
    <>
      <div className={pageStyles.prototypeValidationCenter}>
        <LazyMount>
          <OverviewPrototypeHotspots
            disableHotspots
            onMilestoneChange={setMilestone}
            jumpToken={jumpToken}
            jumpTarget={jumpTarget}
            onPlayerStateChange={setPlayerState}
          />
        </LazyMount>
      </div>
      <div className={pageStyles.prototypeValidationRight}>
        <Timeline
          activeMilestone={milestone}
          onSelectMilestone={jumpTo}
          onSelectPrototype2={() => jumpTo("decisions")}
          player={playerState ?? undefined}
        />
      </div>
    </>
  );
}
