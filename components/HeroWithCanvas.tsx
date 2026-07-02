"use client";

/**
 * HeroWithCanvas — client boundary that owns the exclusion zone refs
 * shared between BounceCanvas (measures them) and HeroSection (attaches them).
 *
 * Lives at the page level so BounceCanvas can be a full-page fixed layer
 * and eventually extend down to the footer as new sections are added.
 */

import { useRef } from "react";
import BounceCanvas from "./BounceCanvas";
import HeroSection from "./HeroSection";

export default function HeroWithCanvas() {
  const heroZoneRef       = useRef<HTMLElement>(null);
  const imgZoneRef        = useRef<HTMLDivElement>(null);
  const heroTopContentRef = useRef<HTMLDivElement>(null);
  const sublineZoneRef    = useRef<HTMLParagraphElement>(null);

  return (
    <>
      <BounceCanvas
        spawnZoneRef={heroZoneRef}
        heroTopContentRef={heroTopContentRef}
      />
      <HeroSection
        sublineZoneRef={sublineZoneRef}
        heroZoneRef={heroZoneRef}
        imgZoneRef={imgZoneRef}
        heroTopContentRef={heroTopContentRef}
      />
    </>
  );
}
