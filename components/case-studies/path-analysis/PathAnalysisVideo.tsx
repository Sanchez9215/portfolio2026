"use client";

import { useEffect, useRef } from "react";
import styles from "./PathAnalysisVideo.module.css";

interface PathAnalysisVideoProps {
  /** Gates playback start — true once the row's own visual fade/translate-in
   *  tween finishes (WorkCaseStudyRow's `settled`), so the video starts once
   *  it's actually in place rather than mid-entrance. Loops from there. */
  play: boolean;
}

// Muted + loop is required for autoPlay to be allowed by browsers with no
// user gesture — there's no audio track worth hearing anyway (screen
// recording of the player UI).
export default function PathAnalysisVideo({ play }: PathAnalysisVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !play) return;
    video.play().catch(() => {
      // Autoplay can still be rejected in some browser/embed contexts
      // (e.g. low-power mode) — the poster frame stays visible instead of
      // throwing.
    });
  }, [play]);

  return (
    <video
      ref={videoRef}
      className={styles.video}
      src="/videos/PathAnalysis_Final.mp4"
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}
