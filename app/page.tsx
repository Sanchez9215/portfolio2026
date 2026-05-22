/**
 * Home page — dev preview
 * Rendering MenuItem for browser verification.
 */
import MenuItem from '@/components/MenuItem'

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-base px-section-padding-x py-3xl">
      <p className="text-secondary text-body-sm mb-xl font-body uppercase tracking-widest">
        menu-item component preview
      </p>
      <div className="flex flex-col">
        <MenuItem href="#" label="Work" />
        <MenuItem href="#" label="About" />
        <MenuItem href="#" label="Resume" />
        <MenuItem href="#" label="Contact" />
      </div>
    </main>
  )
}
