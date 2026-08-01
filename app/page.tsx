import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import HeroWithCanvas from '@/components/HeroWithCanvas'
import CaseStudyCard from '@/components/CaseStudyCard'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      {false && <main className="min-h-screen" style={{ paddingTop: '128px' }}>
        <HeroWithCanvas />

        {/* Work section — preview */}
        <section id="work" style={{ padding: '80px var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
          <CaseStudyCard
            href="/work/software-observability"
            title={"Software\nObservability"}
            category="Overview"
            description="XOPS' Software Observability module gives enterprises real-time visibility into license ownership, spend, and utilization to identify waste and drive reclamation and cost optimization."
            meta={[
              { label: 'Company', value: 'XOPS' },
              { label: 'Role', value: 'Lead Product Designer' },
            ]}
            impactPoints={[
              {
                heading: 'Platform Expansion (0 → 1)',
                body: "Designed and launched XOPS's Software Lifecycle management module from scratch, extending the platform's lifecycle coverage from employees and devices into software and license intelligence.",
              },
              {
                heading: 'Millions Reclaimed in License Spend',
                body: 'Established the foundation for advanced software optimization. The XOPS software intelligence layer directly enabled enterprise customers like Broadcom to surface and recover unused software costs at scale.',
              },
              {
                heading: 'Revenue & Sales Enablement',
                body: "Software portfolio and profile views became a consistent presence in enterprise sales demos, revealing the depth of XOPS's data model and system of intelligence.",
              },
            ]}
          />

          <CaseStudyCard
            href="/work/dhm"
            title={"Data Health\nMonitor"}
            category="Overview"
            description="XOPS' Data Health Monitor turns reactive data cleanup into a proactive monitoring and remediation layer, surfacing integrity gaps that place operations and autonomous workflows at risk."
            imageSrc="/images/softwareobservability-cover.jpg"
            imageAlt="XOPS Software Observability dashboard"
            meta={[
              { label: 'Company', value: 'XOPS' },
              { label: 'Role', value: 'Lead Product Designer' },
            ]}
            impactPoints={[
              {
                heading: 'Platform Expansion (0 → 1)',
                body: "Designed and launched XOPS's first data health monitoring capability, giving enterprise IT teams continuous observability into configuration data quality with clear remediation prioritization across domains.",
              },
              {
                heading: 'Workforce Data Integrity',
                body: 'A Fortune 500 pharmaceutical company went from manually reconciling 3,000–5,000 seasonal worker records across disconnected systems to 99%+ data accuracy and 2.8x device recovery, saving 100+ hours of IT effort weekly.',
              },
              {
                heading: 'Self-Healing Data At Scale',
                body: 'Unified 17 disconnected data sources for Broadcom into a self-healing source of truth, maintaining continuous device and employee data health across a 50,000-person enterprise.',
              },
            ]}
          />

          <CaseStudyCard
            href="/work/path-analysis"
            title={"Path\nAnalysis"}
            category="Overview"
            description="Led design for Auryc's path analysis tool that turned cluttered user journey data into a self-service analysis experience, integrating session replay and frustration signals to reveal actionable friction points."
            imageSrc="/images/softwareobservability-cover.jpg"
            imageAlt="XOPS Software Observability dashboard"
            meta={[
              { label: 'Company', value: 'Auryc' },
              { label: 'Role', value: 'Lead Product Designer' },
            ]}
            impactPoints={[
              {
                heading: '78% Product Adoption',
                body: 'Path analysis was adopted by 78% of accounts within the quarter, with a 92% retention rate, validating the self-service approach and accessible design for non-technical teams.',
              },
              {
                heading: '20% ARR Growth',
                body: 'The launch directly contributed to 20% ARR growth and a 15% expansion in overall contract value, making path analysis one of Auryc\'s highest-impact feature releases.',
              },
              {
                heading: 'Competitive Differentiator',
                body: 'By integrating behavioral and frustration signals directly into the user journey visualization, the tool surfaced insights competitors couldn\'t match, closing a critical feature gap that had been driving customer loss.',
              },
            ]}
          />

          <CaseStudyCard
            href="/work/session-replay"
            title={"Session\nReplay"}
            category="Overview"
            description="Transformed Heap's session replay tool into a diagnostic hub by integrating searchable event logs and user metadata, enabling support teams to identify and resolve root causes without manual playback."
            imageSrc="/images/softwareobservability-cover.jpg"
            imageAlt="XOPS Software Observability dashboard"
            meta={[
              { label: 'Company', value: 'Heap Analytics' },
              { label: 'Role', value: 'Lead Product Designer' },
            ]}
            impactPoints={[
              {
                heading: '10% Engagement Lift',
                body: 'Session replay player enhancements drove a 10% increase in session replay engagement across Heap\'s customer base.',
              },
              {
                heading: 'Competitive Displacement',
                body: 'The new session replay experience positioned Heap as a full-spectrum digital insights platform, combining quantitative analytics with qualitative session replay to make it a key differentiator in enterprise replay tool replacement deals.',
              },
            ]}
          />
        </section>
      </main>}
    </>
  )
}
