import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Section from '@/components/Section'
import LabelBlock from '@/components/LabelBlock'
import Block from '@/components/Block'
import Card from '@/components/Card'
import QuoteBlock from '@/components/QuoteBlock'
import Button from '@/components/Button'
import NumberCard from '@/components/about/NumberCard'
import QuoteMarquee, { type MarqueeQuote } from '@/components/about/QuoteMarquee'
import SnapshotGallery from '@/components/about/SnapshotGallery'
import styles from './about.module.css'

export const metadata: Metadata = {
  title: 'About — Edgar Sanchez',
  description:
    'Senior Product Designer specializing in data-heavy enterprise systems. ' +
    'Five years designing B2B/Enterprise products end-to-end.',
}

/* ── Colleague quotes — sourced from LinkedIn recommendations ── */

const QUOTES_ROW_ONE: MarqueeQuote[] = [
  {
    quote:
      'His presence strengthened our design culture and raised the creative bar for everyone around him.',
    name: 'Blair Seifert',
    role: 'Managed Edgar · XOPS',
    href: 'https://www.linkedin.com/in/blairseifert/',
  },
  {
    quote:
      'A rare talent for simplifying the difficult and making it accessible through thoughtful design.',
    name: 'Rajiv Verma',
    role: 'GenAI & Data Architecture · XOPS',
    href: 'https://www.linkedin.com/in/rvrajiv/',
  },
  {
    quote:
      'A sincere passion for humanizing complex enterprise experiences, turning data-rich systems into clear, elegant interfaces that users can trust.',
    name: 'Andrew Robinson',
    role: 'Co-Founder & CSO · XOPS',
    href: 'https://www.linkedin.com/in/andrew-robinson-064a3a179/',
  },
  {
    quote:
      'He approaches systems holistically, analyzing them from multiple perspectives to identify core challenges and resolve them without introducing unnecessary complexity.',
    name: 'Manish Jape',
    role: 'Director of Engineering',
    href: 'https://www.linkedin.com/in/manish-jape-3725303/',
  },
  {
    quote:
      'The perfect blend of a can-do attitude and creative ingenuity to solve the hardest UX problems with the end user in mind.',
    name: 'Amod Setlur',
    role: 'Managed Edgar · Heap',
    href: 'https://www.linkedin.com/in/amodsetlur/',
  },
  {
    quote:
      'He played a huge role in pushing our product forward from a design perspective, setting up the style guides and design philosophy.',
    name: 'Venkata Jay Chidiri',
    role: 'Managed Edgar · Product Management',
    href: 'https://www.linkedin.com/in/venkatajay/',
  },
  {
    quote:
      "Edgar's design expertise and collaborative spirit have consistently raised the bar for our team. Truly a great leader!",
    name: 'Cisco Sanchez',
    role: 'CXO · Digital Transformation Leader',
    href: 'https://www.linkedin.com/in/ciscosanchez/',
  },
]

const QUOTES_ROW_TWO: MarqueeQuote[] = [
  {
    quote:
      'He conducted effective user research, worked with the dev team closely to implement the design, and tested the product to make sure the feature worked as expected.',
    name: 'Feng Shao',
    role: 'VP of Engineering · Contentsquare',
    href: 'https://www.linkedin.com/in/fengshaofs/',
  },
  {
    quote:
      'I was routinely impressed by how proactive and exploratory he was in his designs. He continuously pushes himself to make his work better.',
    name: 'Will Guldin',
    role: 'Product Designer · Heap',
    href: 'https://www.linkedin.com/in/will-guldin/',
  },
  {
    quote:
      'Edgar consistently made meaningful contributions to our group critiques that helped other designers consider novel solutions to their own design problems.',
    name: 'Mikel McCavana',
    role: 'Product Design · Ramp',
    href: 'https://www.linkedin.com/in/mikelmccavana/',
  },
  {
    quote:
      'You could always count on him to dive right into the problem to make sure we had all the information we needed to solve the right problems.',
    name: 'Kris DelaCruz',
    role: 'UX Designer & Software Engineer',
    href: 'https://www.linkedin.com/in/krisdelacruzdesign/',
  },
  {
    quote:
      'If I said I needed something later in the week, I usually got it within hours of the request.',
    name: 'Steve Kennedy',
    role: 'Strategic Account Executive',
    href: 'https://www.linkedin.com/in/steve-kennedy-7046301/',
  },
  {
    quote:
      'His hard work brought in direct revenue contributions to many deals in the sales channel.',
    name: 'JT Trippett',
    role: 'Enterprise Account Manager',
    href: 'https://www.linkedin.com/in/jt-trippett-5768752a/',
  },
  {
    quote:
      'He jumped right into our complex product and domain space and faced ambiguous design problems head-on. He impressed us all with grit and tenacity.',
    name: 'Monique Escamilla',
    role: 'UX Leader · Heap',
    href: 'https://www.linkedin.com/in/moniqueescamilla/',
  },
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        {/* ── section.about-hero ─────────────────────────────── */}
        <Section className={styles.hero}>
          <div className={styles.heroPortrait}>
            <img
              src="/images/about-me/me.jpg"
              alt="Edgar Sanchez"
              className={styles.heroPortraitImg}
            />
          </div>
          <div className={styles.heroText}>
            <LabelBlock
              size="display"
              label="About Me"
              body="I'm Edgar Sanchez — a Senior Product Designer specializing in data-heavy enterprise systems."
              support="I turn complex, integration-heavy platforms into products people trust."
            />
            <ul className={styles.heroFacts}>
              <li className={styles.heroFact}>San Jose, CA</li>
              <li className={styles.heroFact}>5 yrs B2B / Enterprise</li>
              <li className={styles.heroFact}>0→1 Platform Modules</li>
              <li className={styles.heroFact}>Design × Code</li>
            </ul>
          </div>
        </Section>

        {/* ── section.how-i-operate ──────────────────────────── */}
        <Section className={styles.operate}>
          <LabelBlock
            className={styles.sectionHeader}
            size="display"
            label="How I Operate"
            body="Early-stage startups taught me to work beyond traditional design boundaries."
            support="Three things shape how I show up on a team."
          />
          <div className={styles.operateCards}>
            <NumberCard index="01" title="Product Ownership">
              <Block size="md" color="tertiary">
                Coming from startups where formal product structures did not
                yet exist, I partnered directly with founders to define
                requirements, shape priorities, and translate vision into
                execution.
              </Block>
              <Block size="md" color="tertiary">
                That environment trained me to think in outcomes, business
                strategy, and execution planning — so what I build aligns
                tightly with company direction and long-term goals.
              </Block>
            </NumberCard>
            <NumberCard index="02" title="The Team as an Organism">
              <Block size="md" color="tertiary">
                I view teams as living organisms where diverse thinking
                strengthens outcomes, and I intentionally create environments
                where individuals feel safe to contribute ideas, challenge
                assumptions, and take ownership beyond their formal role.
              </Block>
              <Block size="md" color="tertiary">
                When trust and psychological safety are present, collaboration
                becomes faster, decisions improve, and innovation emerges
                organically.
              </Block>
            </NumberCard>
            <NumberCard index="03" title="Technical Depth">
              <Block size="md" color="tertiary">
                I taught myself HTML and CSS early in my career and later
                explored React to understand component architecture.
              </Block>
              <Block size="md" color="tertiary">
                That foundation lets me collaborate fluently with engineering,
                anticipate constraints, and design with implementation in mind
                — and it strengthens how I prototype, reason about structure,
                and communicate across technical discussions.
              </Block>
            </NumberCard>
          </div>
        </Section>

        {/* ── section.principles ─────────────────────────────── */}
        <Section className={styles.principles}>
          <div className={styles.principlesCards}>
            <Card
              variant="ghost"
              separator
              label="Principle"
              title="Continuous Improvement"
              className={styles.principleCard}
            >
              <Block size="md" color="tertiary">
                Embrace the never-ending product audit — there is always room
                to improve through questioning assumptions, research,
                experimentation, testing, and iteration.
              </Block>
            </Card>
            <Card
              variant="ghost"
              separator
              label="Principle"
              title="Communication & Collaboration"
              className={styles.principleCard}
            >
              <Block size="md" color="tertiary">
                When everyone is comfortable sharing ideas, feedback, and
                questions, we tap into collective intelligence and arrive at
                more creative, innovative solutions.
              </Block>
            </Card>
            <Card
              variant="ghost"
              separator
              label="Principle"
              title="Transparency"
              className={styles.principleCard}
            >
              <Block size="md" color="tertiary">
                Proactively sharing progress, design decisions, and embracing
                feedback builds a strong foundation of trust and alignment
                with every team.
              </Block>
            </Card>
          </div>
        </Section>

        {/* ── section.designing-with-ai ──────────────────────── */}
        <Section className={styles.ai}>
          <LabelBlock
            className={styles.sectionHeader}
            size="display"
            label="Designing Systems With AI"
            body="Complex, integration-heavy systems demand clarity across unfamiliar domains and ambiguous data."
            support="I use AI to reduce ambiguity early and design against how systems actually behave."
          />
          <div className={styles.aiCards}>
            <NumberCard index="04" title="Rapid Domain Immersion">
              <Block size="md" color="tertiary">
                At XOPS I designed across multiple IT-operations domains with
                no prior experience in the space. AI tools let me ramp
                quickly and contribute at a systems level earlier than
                traditional onboarding would allow.
              </Block>
              <Block size="md" color="tertiary">
                It also helped me synthesize the problem space into clear
                documentation, aligning and educating the broader product
                team.
              </Block>
            </NumberCard>
            <NumberCard index="05" title="Synthetic Data & Metric Modeling">
              <Block size="md" color="tertiary">
                The platform relied on multiple integrations to power
                autonomous outcomes. I used AI to translate integration
                documentation into realistic synthetic datasets — what data
                would be available, how it was structured, and how to
                prioritize it by persona intent.
              </Block>
              <Block size="md" color="tertiary">
                That let me structure meaningful metric hierarchies grounded
                in dependable inputs rather than assumptions.
              </Block>
            </NumberCard>
            <NumberCard index="06" title="Prototyping & Analytical Flows">
              <Block size="md" color="tertiary">
                I generated early prototype artifacts grounded in the data
                models I had defined, refining them iteratively to test
                metric groupings, supporting context, and hierarchy.
              </Block>
              <Block size="md" color="tertiary">
                I also simulated how different personas move through
                drill-down paths, ensuring each interaction reflects real
                investigative behavior rather than arbitrary navigation.
              </Block>
            </NumberCard>
          </div>
          <Card
            variant="filled"
            label="AI in the Product"
            title="Natural-Language Reporting"
            titleSize="lg"
            headerGap="md"
            className={styles.aiHighlight}
          >
            <Block size="lg" color="secondary">
              Customers frequently requested custom dashboards and reports
              tailored to their operational needs — and manually building each
              one doesn&apos;t scale, creating ongoing dependency on product
              and engineering. I designed a natural-language reporting
              experience that turns user questions into structured reports
              that can be saved, scheduled, and reused — shifting reporting
              from reactive customization to self-serve system intelligence.
            </Block>
          </Card>
        </Section>

        {/* ── section.in-their-words ─────────────────────────── */}
        <Section className={styles.words}>
          <LabelBlock
            className={styles.sectionHeader}
            size="display"
            label="In Their Words"
            body="Fourteen colleagues — managers, engineers, PMs, and designers —"
            support="on what it's like to work together."
          />
          <div className={styles.featuredQuote}>
            <QuoteBlock
              quote="Edgar brought his keen artistry, insane drive and commitment, and openness to new challenges to an incredibly high-performing team."
              emphasis="A dream team designer."
            />
            <Block size="md" color="tertiary" className={styles.featuredAttribution}>
              — Monique Escamilla, UX Leader at Heap
            </Block>
          </div>
        </Section>
        <div className={styles.marqueeStack}>
          <QuoteMarquee quotes={QUOTES_ROW_ONE} direction="left" />
          <QuoteMarquee quotes={QUOTES_ROW_TWO} direction="right" />
        </div>

        {/* ── section.off-duty ───────────────────────────────── */}
        <Section className={styles.offDuty}>
          <div className={styles.offDutyText}>
            <LabelBlock
              size="display"
              label="When I'm Not Building"
              body="I'm usually painting — or cooking."
            />
            <Block size="lg" color="tertiary" className={styles.offDutyBody}>
              A couple of years ago my brother and I were{' '}
              <a
                href="https://sjwalls.com/2020-artists-murals-1-1"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.offDutyLink}
              >
                invited to paint a mural in Downtown San Jose
              </a>{' '}
              through art organization SJ Walls. I also love to cook — my
              partner&apos;s family is from India, so recently I&apos;ve been
              getting more familiar with cooking Indian dishes.
            </Block>
          </div>
          <SnapshotGallery
            className={styles.offDutyGallery}
            snapshots={[
              {
                src: '/images/about-me/art.jpg',
                alt: 'Painting by Edgar Sanchez',
                caption: 'On Canvas',
              },
              {
                src: '/images/about-me/mural.jpg',
                alt: 'Mural in Downtown San Jose painted through SJ Walls',
                caption: 'SJ Walls Mural',
              },
              {
                src: '/images/about-me/food.jpg',
                alt: 'Home-cooked dish',
                caption: 'From the Kitchen',
              },
            ]}
          />
        </Section>

        {/* ── section.say-hello ──────────────────────────────── */}
        <Section className={styles.cta}>
          <div className={styles.ctaInner}>
            <LabelBlock
              size="display"
              label="Say Hello"
              body="Looking for a designer who owns problems end-to-end?"
              support="I'd love to talk."
            />
            <div className={styles.ctaActions}>
              <Button variant="primary" href="mailto:edgar.sanchez9215@gmail.com">
                Contact Me
              </Button>
              <Button
                variant="outline"
                href="https://www.linkedin.com/in/edgar-sanchez-a19b53131/"
              >
                LinkedIn
              </Button>
            </div>
          </div>
        </Section>
      </main>
    </>
  )
}
