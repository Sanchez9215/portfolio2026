'use client'

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'

export type VillainHandle = {
  triggerHit: () => void
  reset:       () => void
}

const HIT_HOLD = 0.5  // seconds in hit state before recovering

const BulletBaby = forwardRef<VillainHandle, { size?: number }>(
  function BulletBaby({ size = 120 }, ref) {
    const svgRef      = useRef<SVGSVGElement>(null)
    const bodyRef     = useRef<SVGPathElement>(null)
    const wingRef     = useRef<SVGPathElement>(null)
    const eyeRef      = useRef<SVGRectElement>(null)
    const squintRef   = useRef<SVGGElement>(null)
    const impactRefs  = useRef<(SVGPathElement | null)[]>([null, null, null])
    const isFiringRef = useRef(false)
    const tlRef       = useRef<gsap.core.Timeline | null>(null)

    const triggerHit = useCallback(() => {
      if (isFiringRef.current) return
      isFiringRef.current = true

      const impacts = impactRefs.current.filter((el): el is SVGPathElement => el !== null)
      const tl = gsap.timeline({ onComplete: () => { isFiringRef.current = false } })
      tlRef.current = tl

      // Shake — big amplitude, 7 cycles
      tl.to(svgRef.current, { x: -12, duration: 0.03, ease: 'none' }, 0)
      tl.to(svgRef.current, { x:  12, duration: 0.04, ease: 'none', yoyo: true, repeat: 5 }, 0.03)
      tl.to(svgRef.current, { x:   0, duration: 0.03, ease: 'none' }, 0.03 + 0.04 * 6)

      // Instant hit state — all switches simultaneous, no DOM gap
      tl.to(bodyRef.current,  { attr: { fill: '#FF7878' }, duration: 0 }, 0)
      tl.to(eyeRef.current,   { opacity: 0, duration: 0 }, 0)
      tl.to(wingRef.current,  { opacity: 0, duration: 0 }, 0)
      tl.to(squintRef.current,{ opacity: 1, duration: 0 }, 0)

      // Impact lines flash
      tl.to(impacts, { opacity: 1, duration: 0.04, stagger: 0.01 }, 0)
      tl.to(impacts, { opacity: 0, duration: 0.18 }, 0.1)

      // Auto-recover — color fades back, squint/eye cross-fade, wing returns
      tl.to(bodyRef.current,  { attr: { fill: '#0B0B0D' }, duration: 0.15, ease: 'none' }, HIT_HOLD)
      tl.to(squintRef.current,{ opacity: 0, duration: 0.1, ease: 'none' }, HIT_HOLD)
      tl.to(eyeRef.current,   { opacity: 1, duration: 0.1, ease: 'none' }, HIT_HOLD)
      tl.to(wingRef.current,  { opacity: 1, duration: 0.15, ease: 'none' }, HIT_HOLD)
    }, [])

    const reset = useCallback(() => {
      tlRef.current?.kill()
      isFiringRef.current = false
      gsap.set(svgRef.current,   { x: 0 })
      gsap.set(bodyRef.current,  { attr: { fill: '#0B0B0D' } })
      gsap.set(eyeRef.current,   { opacity: 1 })
      gsap.set(wingRef.current,  { opacity: 1 })
      gsap.set(squintRef.current,{ opacity: 0 })
      impactRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0 }) })
    }, [])

    useImperativeHandle(ref, () => ({ triggerHit, reset }), [triggerHit, reset])

    return (
      <svg
        ref={svgRef}
        width={size} height={size} viewBox="0 0 120 120" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {/* Body */}
        <path
          ref={bodyRef}
          d="M8.5 11.5V16.5H20.5V11.5H70C96.7858 11.5 118.5 33.2142 118.5 60C118.5 69.782 115.605 78.8831 110.626 86.5H102.5V96C101.411 96.9833 100.278 97.9183 99.1035 98.8008C98.1581 99.5111 97.1856 100.188 96.1885 100.829C95.552 101.238 94.9054 101.633 94.249 102.013C92.6855 102.917 91.0667 103.736 89.3994 104.465C88.76 104.744 88.1134 105.01 87.46 105.263C85.882 105.872 84.264 106.401 82.6113 106.845C78.5917 107.924 74.3641 108.5 70 108.5H20.5V103.5H8.5V108.5H1.5V11.5H8.5Z"
          fill="#0B0B0D" stroke="#D6E5FE" strokeWidth="3"
        />

        {/* Wing — always in DOM, hidden via GSAP on hit */}
        <path ref={wingRef}
          d="M87.5436 43.6522L50 30L54.7368 44.2105C58.0106 54.0317 66.1167 61.4711 76.1822 63.8919L99.5 69.5L99.9577 67.8773C102.801 57.7974 97.3861 47.2313 87.5436 43.6522Z"
          fill="#D6E5FE"
        />

        {/* Step pattern */}
        <rect width="5" height="9" transform="translate(20 40)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(27 50)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(34 55)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(41 60)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(48 65)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(55 70)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(62 75)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(69 80)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(76 85)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(83 88)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(90 88)"  fill="#D6E5FE"/>
        <rect width="4" height="9" transform="translate(97 88)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(20 52)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(27 62)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(34 67)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(41 72)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(48 77)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(55 82)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(62 87)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(69 92)"  fill="#D6E5FE"/>
        <rect width="5" height="9" transform="translate(76 97)"  fill="#D6E5FE"/>

        {/* Column clips */}
        <path fillRule="evenodd" clipRule="evenodd"
          d="M88 100H83V108.293C84.7043 107.836 86.3727 107.29 88 106.662V100Z" fill="#D6E5FE"/>
        <path fillRule="evenodd" clipRule="evenodd"
          d="M95 100H90V105.84C91.7192 105.088 93.3881 104.243 95 103.311V100Z" fill="#D6E5FE"/>

        {/* Normal eye — always in DOM, GSAP-toggled */}
        <rect ref={eyeRef} x="80" y="41" width="15" height="15" fill="#0B0B0D"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />

        {/* Impact lines — always in DOM */}
        <path ref={el => { impactRefs.current[0] = el }} style={{ opacity: 0 }}
          d="M98.5609 70.299C99.2784 70.7133 100.196 70.4674 100.61 69.75C101.024 69.0326 100.778 68.1152 100.061 67.701L99.3109 69L98.5609 70.299ZM69.75 50.201L68.451 49.451L66.951 52.049L68.25 52.799L69 51.5L69.75 50.201ZM99.3109 69L100.061 67.701L69.75 50.201L69 51.5L68.25 52.799L98.5609 70.299L99.3109 69Z"
          fill="#D6E5FE"
        />
        <path ref={el => { impactRefs.current[1] = el }} style={{ opacity: 0 }}
          d="M98.6806 69.9173C99.2386 70.5296 100.187 70.5737 100.8 70.0157C101.412 69.4578 101.456 68.5091 100.898 67.8967L99.7894 68.907L98.6806 69.9173ZM81.8483 46.9897L80.838 45.881L78.6205 47.9015L79.6307 49.0103L80.7395 48L81.8483 46.9897ZM99.7894 68.907L100.898 67.8967L81.8483 46.9897L80.7395 48L79.6307 49.0103L98.6806 69.9173L99.7894 68.907Z"
          fill="#D6E5FE"
        />
        <path ref={el => { impactRefs.current[2] = el }} style={{ opacity: 0 }}
          d="M98.9665 70.5076C99.7722 70.7007 100.582 70.2041 100.775 69.3985C100.968 68.5929 100.471 67.7833 99.6658 67.5902L99.3162 69.0489L98.9665 70.5076ZM99.3162 69.0489L99.6658 67.5902L72.1605 60.9977L71.8109 62.4564L71.4613 63.9151L98.9665 70.5076L99.3162 69.0489Z"
          fill="#D6E5FE"
        />

        {/* Bracket squint — always in DOM, hidden until hit, GSAP-toggled */}
        <g ref={squintRef} style={{ opacity: 0 }}>
          <path d="M58 25C58 25.9763 58 26.5237 58 27.5C58 28.8807 56.8807 30 55.5 30H53"
            stroke="#D6E5FE" strokeLinecap="square"/>
          <path d="M62 25V27.5C62 28.8807 63.1193 30 64.5 30H67"
            stroke="#D6E5FE" strokeLinecap="square"/>
          <path d="M62 38V35.5C62 34.1193 63.1193 33 64.5 33H67"
            stroke="#D6E5FE" strokeLinecap="square"/>
          <path d="M58 38V35.5C58 34.1193 56.8807 33 55.5 33H53"
            stroke="#D6E5FE" strokeLinecap="square"/>
        </g>
      </svg>
    )
  }
)

export default BulletBaby
