"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const SWITCH_SECONDS = 0.5;
const SWITCH_EASE = "power2.inOut";

interface EmbedSwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Two embeds stacked in one spot; `index` picks the visible one. */
  layers: React.ReactNode[];
  index: number;
}

// Two embeds stacked in one spot: the active one is in flow, the other sits on
// top of it, hidden. Switching crossfades them while the wrapper's height eases
// between the two embeds' heights.
export default function EmbedSwitch({
  layers: content,
  index,
  ...rest
}: EmbedSwitchProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previous = useRef({ index, height: 0 });

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const layers = layerRefs.current;
    if (!wrap) return;
    const seconds = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : SWITCH_SECONDS;
    const settle = () => {
      previous.current = { index, height: wrap.offsetHeight };
    };
    if (previous.current.index === index) {
      gsap.set(layers[index], { autoAlpha: 1 });
      gsap.set(layers[1 - index], { autoAlpha: 0 });
      settle();
      return;
    }
    const from = previous.current.height;
    const to = wrap.offsetHeight;
    gsap.killTweensOf([wrap, ...layers]);
    gsap.fromTo(
      layers[index],
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: seconds, ease: SWITCH_EASE },
    );
    gsap.to(layers[1 - index], {
      autoAlpha: 0,
      duration: seconds,
      ease: SWITCH_EASE,
    });
    gsap.fromTo(
      wrap,
      { height: from },
      {
        height: to,
        duration: seconds,
        ease: SWITCH_EASE,
        clearProps: "height",
        onComplete: settle,
      },
    );
    settle();
  }, [index]);

  const layerStyle = (i: number): React.CSSProperties =>
    i === index
      ? { position: "relative" }
      : { position: "absolute", top: 0, left: 0, width: "100%" };

  return (
    <div {...rest} ref={wrapRef} style={{ position: "relative" }}>
      {content.map((embed, i) => (
        <div
          key={i}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          style={layerStyle(i)}
          aria-hidden={i !== index}
        >
          {embed}
        </div>
      ))}
    </div>
  );
}
