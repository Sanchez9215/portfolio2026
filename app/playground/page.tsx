import BounceCanvas from '@/components/BounceCanvas'

export default function Playground() {
  return (
    <div className="min-h-screen">
      <BounceCanvas villainMaxCount={2} holdToFire />
    </div>
  )
}
