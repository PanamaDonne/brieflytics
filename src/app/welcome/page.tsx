/**
 * /welcome
 *
 * Shown after a successful Stripe Checkout payment.
 * Stripe redirects here via success_url.
 */

export default function WelcomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080808',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>

        <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
          Brieflytics
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12, letterSpacing: '-0.02em' }}>
          Welcome to Brieflytics!
        </h1>

        <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: 8, lineHeight: 1.6 }}>
          Your subscription is active.
        </p>
        <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: 40, lineHeight: 1.6 }}>
          Reports will start arriving soon — sit back and let the insights come to you.
        </p>

        <a
          href="/"
          style={{
            display: 'inline-block',
            background: '#0ea5e9',
            color: '#fff',
            borderRadius: 8,
            padding: '13px 28px',
            fontWeight: 700,
            fontSize: '0.95rem',
            textDecoration: 'none',
          }}
        >
          ← Back to home
        </a>
      </div>
    </main>
  );
}
