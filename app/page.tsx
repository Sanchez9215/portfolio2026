import Nav from '@/components/Nav'
import HeroSection from '@/components/HeroSection'
import CaseStudyCard from '@/components/CaseStudyCard'

export default function Home() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ paddingTop: '128px' }}>
        <HeroSection />

        {/* Work section — preview */}
        <section id="work" style={{ padding: '80px var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <CaseStudyCard
            href="/work/softwareobservability"
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
        </section>
      </main>
    </>
  )
}
