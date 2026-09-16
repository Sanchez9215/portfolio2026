'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Card from './Card'
import styles from './ImgCard.module.css'

type ImageItem = {
  src: string
  alt?: string
  caption: string
}

interface ImgCardProps {
  children?: React.ReactNode
  caption?: string
  aspectRatio?: string
  height?: string
  className?: string
  images?: ImageItem[]
  layout?: 'row' | 'column'
  variant?: 'bare' | 'card' | 'embed'
  inverse?: boolean
  /** Lets content (e.g. a hotspot tooltip) render past the image wrapper's own
   *  edges instead of being clipped by its default `overflow: hidden`. */
  allowOverflow?: boolean
  /** variant="embed" only — total hotspot count, rendered as a segment track
   *  above the embed. Omit to hide the track entirely. */
  progressSteps?: number
  /** variant="embed" only — 0-based index of the current hotspot; segments
   *  before this index render fully filled. undefined/-1 = none filled yet
   *  (the pre-walkthrough countdown state). */
  activeStep?: number
  /** variant="embed" only — how long activeStep's own segment takes to fill
   *  grey → blue, in ms, matching the real auto-advance duration for that
   *  card. Omit to render it fully filled instantly instead of animating. */
  activeStepDurationMs?: number
  /** variant="embed" only — freezes the active segment's fill tween in place
   *  without resetting it (mirrors the auto-advance timer's own pause). */
  paused?: boolean
}

export default function ImgCard({
  children,
  caption,
  aspectRatio,
  height,
  className,
  images,
  layout = 'row',
  variant = 'bare',
  inverse = false,
  allowOverflow = false,
  progressSteps,
  activeStep,
  activeStepDurationMs,
  paused,
}: ImgCardProps) {
  const captionClassName = `${styles.caption}${inverse ? ` ${styles.inverse}` : ''}`
  const imgWrapperClassName = `${styles.imgWrapper}${allowOverflow ? ` ${styles.imgWrapperOverflowVisible}` : ''}`
  const isEmbed = variant === 'embed'

  // Drives every segment's fill directly via GSAP on each activeStep change
  // (not just the active one) — earlier this only touched the active
  // segment and let React's own inline `style` handle the rest, but React
  // only rewrites style.transform when the *declared* value differs from
  // what it last wrote; stepping backward doesn't change that declared
  // value for the vacated segment (still "0 → false → scaleX(0)" either
  // way), so GSAP's mid-tween leftover value silently survived instead of
  // clearing. Being the single source of truth for all of them avoids that
  // desync: completed segments snap to filled, the active one tweens
  // grey → blue, everything after clears to grey — every time, in both
  // directions.
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([])
  useLayoutEffect(() => {
    if (!isEmbed || !progressSteps) return
    let tween: gsap.core.Tween | null = null
    for (let i = 0; i < progressSteps; i++) {
      const el = fillRefs.current[i]
      if (!el) continue
      if (activeStep == null || activeStep < 0 || i > activeStep) {
        gsap.set(el, { scaleX: 0 })
      } else if (i < activeStep) {
        gsap.set(el, { scaleX: 1 })
      } else if (paused) {
        // Active segment, paused — leave its current fill exactly where it
        // is rather than resetting it.
      } else if (!activeStepDurationMs) {
        gsap.set(el, { scaleX: 1 })
      } else {
        gsap.set(el, { scaleX: 0 })
        tween = gsap.to(el, {
          scaleX: 1,
          duration: activeStepDurationMs / 1000,
          ease: 'none',
        })
      }
    }
    return () => {
      tween?.kill()
    }
  }, [isEmbed, progressSteps, activeStep, activeStepDurationMs, paused])

  const content = images ? (
    <div className={`${styles.inner} ${styles.innerMulti} ${layout === 'column' ? styles.innerMultiColumn : ''}`}>
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className={styles.imgColumn}>
          <div className={imgWrapperClassName}>
            <img src={img.src} alt={img.alt ?? ''} className={styles.imgFill} />
          </div>
          <div className={styles.labelWrapper}>
            <span className={captionClassName}>{img.caption}</span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className={`${styles.inner}${isEmbed ? ` ${styles.innerEmbed}` : ''}`}>
      {isEmbed && (
        <div className={styles.embedHeader}>
          {caption && <span className={captionClassName}>{caption}</span>}
          {progressSteps != null && progressSteps > 0 && (
            <div className={styles.progressTrack}>
              {Array.from({ length: progressSteps }).map((_, i) => (
                <span key={i} className={styles.progressSegment}>
                  <span
                    ref={(el) => {
                      fillRefs.current[i] = el
                    }}
                    className={styles.progressSegmentFill}
                    style={{
                      transform: `scaleX(${i < (activeStep ?? -1) ? 1 : 0})`,
                    }}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div
        className={imgWrapperClassName}
        style={{ ...(aspectRatio ? { aspectRatio } : {}), ...(height ? { height } : {}) }}
      >
        {children}
      </div>
      {!isEmbed && caption && (
        <div className={styles.labelWrapper}>
          <span className={captionClassName}>{caption}</span>
        </div>
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <Card variant="outline" className={`${styles.card}${className ? ` ${className}` : ''}`}>
        {content}
      </Card>
    )
  }

  return <div className={`${styles.bare}${className ? ` ${className}` : ''}`}>{content}</div>
}
