"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ImgCard from "@/components/ImgCard";
import styles from "@/app/work/software-observability/software-observability.module.css";

gsap.registerPlugin(ScrollTrigger);

// Same fade-up-stagger treatment as GeneratingEventsContent's image row —
// matching duration/stagger constants for a consistent feel across sections.
const IMAGE_FADE_DURATION = 0.6;
const IMAGE_STAGGER = 0.4;

const IMAGES = [
  {
    src: "/images/software-observability/utilization-tooltip.jpg",
    caption: "Utilization Tool Tip",
  },
  {
    src: "/images/software-observability/opportunity-tooltip.jpg",
    caption: "Opportunity Tool Tip",
  },
  {
    src: "/images/software-observability/renewal-tooltip.jpg",
    caption: "Renewal Tool Tip",
  },
];

export default function ToolTipsImages() {
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageEls = imagesRef.current
      ? (Array.from(imagesRef.current.children) as HTMLElement[])
      : [];
    if (imageEls.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(imageEls, { opacity: 0, y: 16 });

      gsap.to(imageEls, {
        opacity: 1,
        y: 0,
        ease: "none",
        duration: IMAGE_FADE_DURATION,
        stagger: IMAGE_STAGGER,
        scrollTrigger: {
          trigger: imagesRef.current,
          start: "top 85%",
          end: "top 40%",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={imagesRef} className={styles.toolTipsFinalDesignImages}>
      {IMAGES.map((img) => (
        <ImgCard key={img.src} caption={img.caption}>
          <img src={img.src} alt={img.caption} />
        </ImgCard>
      ))}
    </div>
  );
}
