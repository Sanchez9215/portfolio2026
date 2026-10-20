"use client";

import { useState } from "react";
import ImgCard from "@/components/ImgCard";
import LazyMount from "@/components/LazyMount";
import PrototypeTabs from "@/components/PrototypeTabs";
import AllSoftwareLegacyEmbed from "./AllSoftwareLegacyEmbed";
import FinalAllSoftwareEmbed from "./FinalAllSoftwareEmbed";
import EmbedSwitch from "./EmbedSwitch";

// Prototype 01 (the legacy page) or the final design below the row, crossfaded.
// Prototype 01 is selected on load and one tab is always selected.
const TABS = ["Prototype 01", "Final Design"];

// Renders the tab row and the embed as two siblings so the section's grid
// places each one.
export default function AllSoftwareViewTabs() {
  const [index, setIndex] = useState(0);
  return (
    <>
      <PrototypeTabs
        items={TABS}
        value={index}
        onChange={(next) => next !== null && setIndex(next)}
        deselectable={false}
        data-prototype-tabs
      />
      <EmbedSwitch
        data-all-software-embed
        index={index}
        layers={[
          <LazyMount key="legacy">
            <AllSoftwareLegacyEmbed />
          </LazyMount>,
          <ImgCard key="final" variant="embed" allowOverflow height="100vh">
            <LazyMount>
              <FinalAllSoftwareEmbed hideRegionFilter rounded />
            </LazyMount>
          </ImgCard>,
        ]}
      />
    </>
  );
}
