import BulletBaby from '@/components/BulletBaby'

export default function TestPage() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '24px',
        background: '#0B0B0D',
      }}
    >
      <BulletBaby size={240} />
      <p style={{ color: '#D6E5FE', fontFamily: 'monospace', fontSize: 13, opacity: 0.5 }}>
        click to trigger hit
      </p>
    </main>
  )
}
