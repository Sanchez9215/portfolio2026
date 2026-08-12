import '@/design-systems/xops/tokens.css'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import HeroWithCanvas from '@/components/HeroWithCanvas'
import WorkCaseStudyRow from '@/components/WorkCaseStudyRow'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      {false && <HeroWithCanvas />}
      <main id="work">
        <WorkCaseStudyRow />
      </main>
    </>
  )
}
