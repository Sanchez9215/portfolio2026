"use client";

/**
 * HeroWithCanvas — client boundary that owns the exclusion zone refs
 * shared between BounceCanvas (measures them) and HeroSection (attaches them).
 *
 * Lives at the page level so BounceCanvas can be a full-page fixed layer
 * and eventually extend down to the footer as new sections are added.
 */

import { useRef } from "react";
import type React from "react";
import BounceCanvas from "./BounceCanvas";
import HeroSection from "./HeroSection";

export default function HeroWithCanvas() {
  // Exclusion zones — passed to BounceCanvas for measuring and to
  // HeroSection for attaching to the correct DOM elements.
  const headlineZoneRef    = useRef<HTMLDivElement>(null);
  const buttonGroupZoneRef = useRef<HTMLDivElement>(null);
  const sublineZoneRef     = useRef<HTMLParagraphElement>(null);
  const heroZoneRef        = useRef<HTMLElement>(null);
  // imgZoneRef — narrower active firing zone (right column only)
  const imgZoneRef         = useRef<HTMLDivElement>(null);
  // heroTopContentRef — BounceCanvas reads height to size the big villain (40%)
  const heroTopContentRef  = useRef<HTMLDivElement>(null);

  return (
    <>
      <BounceCanvas
        textZones={[
          headlineZoneRef    as React.RefObject<HTMLElement>,
          sublineZoneRef     as React.RefObject<HTMLElement>,
        ]}
        gapZones={[
          buttonGroupZoneRef as React.RefObject<HTMLElement>,
        ]}
        overlapPx={16}
        gapPx={16}
        activeZoneRef={heroZoneRef as React.RefObject<HTMLElement>}
        spawnZoneRef={heroZoneRef  as React.RefObject<HTMLElement>}
        heroTopContentRef={heroTopContentRef}
        // Uncomment to use a custom pellet SVG:
        // pelletSrc="/SVG/bullet-baby.svg"
        // pelletSize={{ w: 20, h: 20 }}
      />
      <HeroSection
        headlineZoneRef={headlineZoneRef}
        buttonGroupZoneRef={buttonGroupZoneRef}
        sublineZoneRef={sublineZoneRef}
        heroZoneRef={heroZoneRef}
        imgZoneRef={imgZoneRef}
        heroTopContentRef={heroTopContentRef}
      />
    </>
  );
}
