"use client";

import { useState } from "react";
import LazyMount from "@/components/LazyMount";
import AllSoftwarePrototype1Hotspots, {
  ALL_SOFTWARE_PROTOTYPE_1_MILESTONES,
} from "./AllSoftwarePrototype1Hotspots";
import Timeline, { PlayerState } from "./Timeline";
import pageStyles from "@/app/work/software-observability/software-observability.module.css";

const ACTIVE_MILESTONE = ALL_SOFTWARE_PROTOTYPE_1_MILESTONES[0].key;

// Wraps the card player + its Timeline sidebar together, same relationship
// OverviewPrototypeSection has with its own player — page.tsx is a server
// component and can't itself hold the state the two need to share. Renders
// as a Fragment (not a wrapping div) so the center/sidebar columns stay
// direct children of the Section's own CSS grid.
export default function AllSoftwarePrototype1Section() {
  // Incremented on the Timeline row click — AllSoftwarePrototype1Hotspots
  // watches this token to jump back to the top (its only milestone).
  const [jumpToken, setJumpToken] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);

  return (
    <>
      <div className={pageStyles.allSoftwarePrototype1Center}>
        <LazyMount>
          <AllSoftwarePrototype1Hotspots
            jumpToken={jumpToken}
            onPlayerStateChange={setPlayerState}
          />
        </LazyMount>
      </div>
      <div className={pageStyles.allSoftwarePrototype1Right}>
        <Timeline
          milestones={ALL_SOFTWARE_PROTOTYPE_1_MILESTONES}
          activeMilestone={ACTIVE_MILESTONE}
          onSelectMilestone={() => setJumpToken((t) => t + 1)}
          player={playerState ?? undefined}
        />
      </div>
    </>
  );
}
