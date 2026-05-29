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
    // Natural height = top-pad + header + bottom-pad (no gap, wrapper at 0).
    collapsedHeight.current = navRef.current.offsetHeight
    gsap.set(navRef.current, { height: collapsedHeight.current })

    // Ensure wrapper starts with no margin (defensive — CSS sets height:0,
    // but GSAP needs marginTop at 0 for accurate close resets).
    gsap.set(menuListRef.current, { marginTop: 0 })

    // Prep each wrapper's label span: opacity-0 + y-offset ready for entrance.
    // The wrapper divs are already at opacity-0 via CSS (.menuItemWrapper).
    itemRefs.current.forEach(item => {
      if (!item) return
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

    // Gap between nav header and menu card — matches --spacing-md (16px).
    // Set instantly (not animated) the moment the card starts revealing.
    const gap = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--spacing-md')
    )

    const tl = gsap.timeline()
    tlRef.current = tl

    // Step 1 — Nav container expands to full viewport height
    tl.to(navRef.current, {
      height: '100dvh',
      duration: durExpand,
      ease,
    })

    // Gap pops in instantly at the start of Step 2 — no animation, just appears.
    tl.set(menuListRef.current, { marginTop: gap })

    // Step 2 — Wrapper grows downward from height: 0 → auto, revealing the card
    tl.to(menuListRef.current, {
      height: 'auto',
      duration: durOverlay,
      ease,
    })

    // Step 3 — Each MenuItem staggers in: border first, then label slides up
    itemRefs.current.forEach((item, i) => {
      if (!item) return
      const labelSpan = item.querySelectorAll('span')[0] as HTMLElement | undefined
      const t = durExpand + durOverlay + delayItems + i * stagger

      // Border appears: wrapper opacity 0 → 1
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

    // Revert button to Menu/outline immediately — don't wait for animation to finish
    setIsOpen(false)

    gsap.to(navRef.current, {
      height: collapsedHeight.current,
      duration: readMs('--motion-duration-nav-expand'),
      ease: 'power2.inOut',
      onComplete: () => {
        // Reset wrapper states for next open — height and gap margin both to 0
        if (menuListRef.current) {
          gsap.set(menuListRef.current, { height: 0, marginTop: 0 })
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
      className={[styles.nav, isOpen ? styles.open : ''].filter(Boolean).join(' ')}
      aria-label="Main navigation"
    >
      {/* ── Header (always visible) ─────────────────────────── */}
      <div className={styles.header}>

        {/* div.brand — logo + name + title */}
        <div className={styles.brand}>
          <span className={styles.logoWrapper} aria-hidden="true">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.logoIcon}
            >
              <path d="M8 8H56V56H8V8Z" fill="currentColor"/>
              <path d="M39.9992 20H47.9992V28H39.9992V20Z" fill="#0B0B0D"/>
              <path d="M48.0008 32.8016H52.0008V40.8016H48.0008V32.8016Z" fill="#0B0B0D"/>
              <path d="M39.9992 40.7984H47.9992V44.7984H39.9992V40.7984Z" fill="#0B0B0D"/>
              <path d="M32 40.7984H40V44.7984H32V40.7984Z" fill="#0B0B0D"/>
              <path d="M24.0008 40.7984H32.0008V44.7984H24.0008V40.7984Z" fill="#0B0B0D"/>
              <path d="M15.9992 40.7984H23.9992V44.7984H15.9992V40.7984Z" fill="#0B0B0D"/>
              <path d="M12.0008 32.8016H16.0008V40.8016H12.0008V32.8016Z" fill="#0B0B0D"/>
              <path d="M15.9992 20H23.9992V28H15.9992V20Z" fill="#0B0B0D"/>
            </svg>
          </span>
          <div className={styles.designerDetails}>
            <p className={styles.designerName}>Edgar</p>
            <p className={styles.designerTitle}>Sanchez</p>
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
      {/*
        Outer wrapper: GSAP animation target. height 0→auto on open,
        marginTop snaps to --spacing-md at the start of the reveal.
        overflow:hidden fully clips the inner card at height:0.
      */}
      <div
        ref={menuListRef}
        className={styles.menuListWrapper}
      >
        {/* Inner card: styled surface — no height animation here */}
        <div
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
      </div>
    </nav>
  )
}
