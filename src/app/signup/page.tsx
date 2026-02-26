'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function BrieflyticsMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="24" height="20" rx="5" fill="#0ea5e9" />
      <path d="M8 22 L6 29 L14 22 Z" fill="#0ea5e9" />
      <text x="8" y="17" fontFamily="'Inter', -apple-system, sans-serif" fontSize="14" fontWeight="800" fill="#080808">B</text>
    </svg>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      const { token, siteId, subscriberId } = data as { token: string; siteId: string; subscriberId: string };
      router.push(`/onboarding?token=${encodeURIComponent(token)}&siteId=${encodeURIComponent(siteId)}&subscriberId=${encodeURIComponent(subscriberId)}`);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080808',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 36 }}>
          <BrieflyticsMark />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Brieflytics</span>
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 'clamp(1.7rem, 5vw, 2.2rem)',
            fontWeight: 900,
            margin: '0 0 12px',
            letterSpacing: '-0.035em',
            background: 'linear-gradient(135deg, #fff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Start your free trial
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 10px' }}>
            14 days free · No credit card required · $5/mo after
          </p>
          <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0, fontStyle: 'italic' }}>
            Join founders and developers tracking their sites with Brieflytics
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#0f1721',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '32px',
        }}>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                background: '#080808',
                border: '1px solid #1e2a3a',
                borderRadius: 9,
                padding: '13px 16px',
                color: '#fff',
                fontSize: '0.95rem',
                marginBottom: 12,
                boxSizing: 'border-box',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1e2a3a')}
            />
            {error && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 12, marginTop: 0 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !email}
              style={{
                width: '100%',
                background: loading ? '#0284a8' : '#0ea5e9',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                padding: '13px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading || !email ? 'not-allowed' : 'pointer',
                opacity: !email ? 0.6 : 1,
                transition: 'background 0.15s',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>
          </form>

          {/* Google sign-in placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: '#334155', fontSize: '0.8rem', flexShrink: 0 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <button
            disabled
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 9,
              padding: '12px',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" opacity="0.4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" opacity="0.4"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" opacity="0.4"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" opacity="0.4"/>
            </svg>
            Continue with Google
            <span style={{ fontSize: '0.72rem', color: '#2a3548' }}>(coming soon)</span>
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.78rem', marginTop: 20 }}>
          <a href="/" style={{ color: '#334155', textDecoration: 'none' }}>← Back to home</a>
        </p>
      </div>
    </main>
  );
}
