import Nav from '@/components/Nav'
import HeroSection from '@/components/HeroSection'

export default function Home() {
  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ paddingTop: '128px' }}>
        <HeroSection />
        {/* Work section — coming next */}
      </main>
    </>
  )
}
