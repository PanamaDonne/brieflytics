import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Brieflytics — The analytics tool that talks to you.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '80px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={{ width: 64, height: 64, background: '#0ea5e9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: '#080808' }}>B</div>
        <span style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>Brieflytics</span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 24, letterSpacing: '-1px', maxWidth: 800 }}>
        The analytics tool that talks to you.
      </div>
      <div style={{ fontSize: 22, color: '#64748b', textAlign: 'center', maxWidth: 700 }}>
        No dashboards. No logins. Plain English reports sent to your Telegram or email.
      </div>
      <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
        {['No cookies', 'EU-hosted', 'GDPR compliant', '$5/mo'].map(f => (
          <div key={f} style={{ background: '#0f1721', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 16px', color: '#94a3b8', fontSize: 18 }}>{f}</div>
        ))}
      </div>
    </div>
  )
}
