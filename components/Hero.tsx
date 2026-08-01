/**
 * Hero — home page hero section
 *
 * Built from Figma node 214:7415 ("Section", Portfolio Cleaning file).
 * Tokens: --button-*, --text-label-2xl-*, --text-title-xl-*, --text-body-2xl-*
 * (styles/globals.css); Label/Title/Block reused for all text.
 *
 * Headline line breaks are explicitly authored (Figma's own <br> positions),
 * rendered via CSS white-space:pre-line — not auto-wrap.
 *
 * Subline is temporarily rendered as plain regular-weight text — Figma's
 * mixed regular/bold inline emphasis is deferred (Block has no inline-weight
 * support yet), to be revisited.
 */

import Label from './Label'
import Title from './Title'
import Block from './Block'
import Button from './Button'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.topGroup}>
          <div className={styles.labelRow}>
            <span className={styles.icon} aria-hidden="true">
              <img src="/icons/Frame 1321320741.svg" alt="" width={32} height={32} />
            </span>
            <Label size="2xl" color="accent">PRODUCT BUILDER</Label>
          </div>
          <div className={styles.headlineGroup}>
            <Title size="xl" color="inverse" className={styles.headline}>
              {'Specializing in Data-Rich \nB2B Systems Driving \nHigh-Stakes Decisions.'}
            </Title>
            <Block size="2xl" color="tertiary">
              Early-stage startups building zero to one.
            </Block>
          </div>
        </div>
        <div className={styles.buttonRow}>
          <Button
            variant="primary"
            href="/#work"
            icon={<img src="/icons/happy.svg" alt="" />}
          >
            Work
          </Button>
          <Button variant="secondary" href="mailto:edgar.sanchez9215@gmail.com">
            Contact
          </Button>
        </div>
      </div>
    </section>
  )
}
