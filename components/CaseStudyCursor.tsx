'use client'

/**
 * CaseStudyCursor — custom cursor shown while hovering a CaseStudyCard.
 *
 * Mounts once in layout.tsx. Tracks `mousemove` on the document and renders
 * a primary-button–styled pill at the pointer position whenever the pointer
 * is inside an element marked with [data-case-study-card].
 *
 * Pill anatomy:
 *   div.cursor
 *     span.label  ← "VIEW", label-xl, primary button typography
 *     img.icon    ← go-arrow.svg, icon-lg (32px)
 *
 * Layout: no vertical padding (height = content), left pad = lg button
 * horizontal pad (--spacing-xl), right pad = 20px, gap = 0, radius = full.
 */

import { useEffect, useState } from 'react'
import styles from './CaseStudyCursor.module.css'

export default function CaseStudyCursor() {
  const [pos, setPos]         = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      const overCard = !!(e.target as Element)?.closest('[data-case-study-card]')
      setVisible(overCard)
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  if (!visible) return null

  return (
    <div
      className={styles.cursor}
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
    >
      <span className={styles.label}>VIEW</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/go-arrow.svg"
        alt=""
        className={styles.icon}
        aria-hidden="true"
      />
    </div>
  )
}
