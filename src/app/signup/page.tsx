export default function SignupPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif", padding: '40px 20px' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Brieflytics</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>Start your free trial</h1>
        <p style={{ color: '#666', marginBottom: 32, fontSize: '0.9rem' }}>14 days free · No credit card required · $5/mo after</p>
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 32 }}>
          <input type="email" placeholder="your@email.com" style={{ width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: '0.95rem', marginBottom: 12, boxSizing: 'border-box' }} />
          <button style={{ width: '100%', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '13px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            Create free account →
          </button>
        </div>
        <p style={{ color: '#444', fontSize: '0.8rem', marginTop: 20 }}>
          <a href="/" style={{ color: '#444' }}>← Back to home</a>
        </p>
      </div>
    </main>
  );
}
