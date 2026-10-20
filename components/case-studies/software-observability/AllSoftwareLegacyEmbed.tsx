"use client";

import ImgCard from "@/components/ImgCard";
import LiveEmbed from "@/components/LiveEmbed";
import AllSoftwareLegacy from "@/design-systems/xops/legacy/AllSoftwareLegacy";
import styles from "./OverviewEmbedRadius.module.css";

// The legacy All Software page as a bare live embed (no tooltips), same card
// and 16px rounding as the Overview embeds.
export default function AllSoftwareLegacyEmbed() {
  return (
    <ImgCard variant="embed" allowOverflow>
      <LiveEmbed
        nativeWidth={1440}
        disableCanvasTransition
        className={styles.liveEmbed}
      >
        <AllSoftwareLegacy hideRegionFilter finalFilterButton />
      </LiveEmbed>
    </ImgCard>
  );
}
