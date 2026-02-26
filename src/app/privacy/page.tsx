export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif", padding: '80px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <a href="/" style={{ color: '#0ea5e9', fontSize: '0.875rem', textDecoration: 'none' }}>← Back to Brieflytics</a>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '24px 0 8px', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
        <p style={{ color: '#555', marginBottom: 40, fontSize: '0.875rem' }}>Last updated: February 2026</p>
        {[
          { title: 'What we collect', body: 'Brieflytics collects anonymous pageview data including: page URLs, referrer sources, device type, browser, operating system, screen size, and approximate country/city derived from IP address. We do not store IP addresses — they are used only to determine approximate location and are immediately discarded.' },
          { title: 'What we do not collect', body: 'We do not use cookies. We do not track individual users across sessions. We do not store personally identifiable information about your website visitors. We do not sell any data to third parties.' },
          { title: 'Data storage', body: 'All data is stored in the European Union (Frankfurt, Germany) on Supabase infrastructure. We are fully GDPR compliant. No consent banner is required on your website because we do not use cookies or collect personal data.' },
          { title: 'Your data', body: 'You own your analytics data. You can request deletion of your account and all associated data at any time by emailing panamadonne@proton.me.' },
          { title: 'Contact', body: 'Questions? Email us at panamadonne@proton.me.' },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>{title}</h2>
            <p style={{ color: '#888', lineHeight: 1.8, fontSize: '0.95rem' }}>{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
