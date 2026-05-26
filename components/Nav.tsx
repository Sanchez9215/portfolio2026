/**
 * Nav
 *
 * Sticky full-viewport overlay nav. Fixed at top; expands on open
 * to fill the screen with a rounded card containing four MenuItem links.
 *
 * Built from Figma nodes 273:439 (nav-button) + 274:75 (nav) — Claude-Code file.
 * Tokens: nav.* + surface.* + motion.* (design-system/tokens.json)
 * Spec:   components/components.md → nav
 *
 * Open animation sequence (GSAP):
 *   1. Nav container → 100dvh             (--motion-duration-nav-expand, 700ms)
 *   2. Menu-list card reveals top→bottom  (--motion-duration-nav-overlay, 500ms)
 *   3. Each MenuItem staggers in:         (--motion-duration-nav-items, 500ms)
 *        • wrapper opacity 0→1 (border appears)
 *        • label span slides up 50ms later
 *
 * Close animation: nav shrinks back to header height; no interior exit animation.
 *
 * Easing: power2.inOut ≈ cubic-bezier(0.4, 0, 0.2, 1) (--motion-easing-nav-expand)
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Button from './Button'
import MenuItem from './MenuItem'
import styles from './Nav.module.css'

/* ── Nav links ─────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Work',    href: '/#work' },
  { label: 'About',   href: '/about' },
  { label: 'Resume',  href: '/resume' },
  { label: 'Contact', href: 'mailto:edgar.sanchez9215@gmail.com' },
] as const

/* ── Helpers ────────────────────────────────────────────────── */

/**
 * Read a CSS custom property from :root and convert from ms → seconds
 * for use as GSAP duration/delay values.
 */
const readMs = (prop: string): number => {
  if (typeof window === 'undefined') return 0
  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(prop)
    ) / 1000
  )
}

/* ── Component ──────────────────────────────────────────────── */

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  const navRef          = useRef<HTMLElement>(null)
  const menuListRef     = useRef<HTMLDivElement>(null)
  const itemRefs        = useRef<(HTMLDivElement | null)[]>([])
  const tlRef           = useRef<gsap.core.Timeline | null>(null)
  const collapsedHeight = useRef<number>(0)

  /* ── Mount: capture collapsed height, prep GSAP initial states ── */
  useEffect(() => {
    if (!navRef.current || !menuListRef.current) return

    // Lock nav to its natural (header-only) height as an explicit px value
    // so GSAP can interpolate from it.
    collapsedHeight.current = navRef.current.offsetHeight
    gsap.set(navRef.current, { height: collapsedHeight.current })

    // Prepare each item's label span: opacity-0 + y-offset ready for entrance.
    // The wrapper divs are already at opacity-0 via CSS (.menuItemWrapper).
    itemRefs.current.forEach(item => {
      if (!item) return
      // spans[0] = label, spans[1] = icon (SVG has no <span> elements)
      const labelSpan = item.querySelectorAll('span')[0]
      if (labelSpan) gsap.set(labelSpan, { opacity: 0, y: 8 })
    })
  }, [])

  /* ── Open ───────────────────────────────────────────────────── */
  const handleOpen = () => {
    setIsOpen(true)
    tlRef.current?.kill()

    // Read all timing values from motion tokens in globals.css
    const durExpand  = readMs('--motion-duration-nav-expand')   // 0.7s
    const durOverlay = readMs('--motion-duration-nav-overlay')  // 0.5s
    const durItems   = readMs('--motion-duration-nav-items')    // 0.5s
    const delayItems = readMs('--motion-delay-nav-items')       // 0.25s
    const stagger    = readMs('--motion-stagger-nav-items')     // 0.05s
    // Easing: power2.inOut ≈ cubic-bezier(0.4, 0, 0.2, 1)
    const ease = 'power2.inOut'

    const tl = gsap.timeline()
    tlRef.current = tl

    // Step 1 — Nav container expands to full viewport height
    tl.to(navRef.current, {
      height: '100dvh',
      duration: durExpand,
      ease,
    })

    // Step 2 — Menu-list card reveals top-to-bottom via clip-path
    // 48px = --radius-lg = var(--border-radius-lg); hardcoded here for GSAP string
    .to(menuListRef.current, {
      clipPath: 'inset(0 0 0% 0 round 48px)',
      duration: durOverlay,
      ease,
    })

    // Step 3 — Each MenuItem staggers in: border first, then label
    itemRefs.current.forEach((item, i) => {
      if (!item) return

      // first span inside the wrapper = label (not icon)
      const labelSpan = item.querySelectorAll('span')[0] as HTMLElement | undefined
      // Absolute position in the timeline (after expand + overlay + delay)
      const t = durExpand + durOverlay + delayItems + i * stagger

      // Border appears: wrapper goes opacity 0 → 1 (label is still opacity-0)
      tl.to(item, { opacity: 1, duration: 0.12, ease: 'none' }, t)

      // Label fades up 50ms after border
      if (labelSpan) {
        tl.to(
          labelSpan,
          { opacity: 1, y: 0, duration: durItems, ease: 'power2.out' },
          t + 0.05
        )
      }
    })
  }

  /* ── Close ──────────────────────────────────────────────────── */
  const handleClose = () => {
    tlRef.current?.kill()

    gsap.to(navRef.current, {
      height: collapsedHeight.current,
      duration: readMs('--motion-duration-nav-expand'),
      ease: 'power2.inOut',
      onComplete: () => {
        setIsOpen(false)
        // Reset menu-list clip-path and item states for next open
        if (menuListRef.current) {
          gsap.set(menuListRef.current, {
            clipPath: 'inset(0 0 100% 0 round 48px)',
          })
        }
        itemRefs.current.forEach(item => {
          if (!item) return
          gsap.set(item, { opacity: 0 })
          const labelSpan = item.querySelectorAll('span')[0]
          if (labelSpan) gsap.set(labelSpan, { opacity: 0, y: 8 })
        })
      },
    })
  }

  const toggleNav = () => (isOpen ? handleClose() : handleOpen())

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <nav
      ref={navRef}
      className={styles.nav}
      aria-label="Main navigation"
    >
      {/* ── Header (always visible) ─────────────────────────── */}
      <div className={styles.header}>

        {/* div.brand — logo + name + title */}
        <div className={styles.brand}>
          <span className={styles.logoWrapper} aria-hidden="true">
            {/* Logo mark — public/icons/icon.svg (added by user) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon.svg"
              alt=""
              className={styles.logoIcon}
            />
          </span>
          <div className={styles.designerDetails}>
            {/* --text-primary (grey-50) — decision 1A */}
            <p className={styles.designerName}>Edgar Sanchez</p>
            {/* --nav-link-text (grey-600) — decision 2A */}
            <p className={styles.designerTitle}>Product Designer</p>
          </div>
        </div>

        {/* Button — outline (menu) ↔ ghost (close), toggled by nav state */}
        <Button
          variant={isOpen ? 'ghost' : 'outline'}
          size="md"
          onClick={toggleNav}
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        >
          {isOpen ? 'Close' : 'Menu'}
        </Button>
      </div>

      {/* ── Menu list (hidden when closed) ──────────────────── */}
      <div
        ref={menuListRef}
        id="nav-menu"
        className={styles.menuList}
        aria-hidden={!isOpen}
      >
        {NAV_LINKS.map((link, i) => (
          <div
            key={link.href}
            ref={el => { itemRefs.current[i] = el }}
            className={styles.menuItemWrapper}
          >
            {/*
              MenuItem uses <a href>. For proper Next.js client-side routing,
              MenuItem could be updated to use <Link> — deferred to a future pass.
            */}
            <MenuItem href={link.href} label={link.label} />
          </div>
        ))}
      </div>
    </nav>
  )
}
