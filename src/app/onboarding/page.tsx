'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function BrieflyticsMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="24" height="20" rx="5" fill="#0ea5e9" />
      <path d="M8 22 L6 29 L14 22 Z" fill="#0ea5e9" />
      <text x="8" y="17" fontFamily="'Inter', -apple-system, sans-serif" fontSize="14" fontWeight="800" fill="#080808">B</text>
    </svg>
  );
}

function OnboardingContent() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const siteId = params.get('siteId') ?? '';
  const subscriberId = params.get('subscriberId') ?? '';

  const embedCode = `<script defer src="https://brieflytics.com/tracker.js" data-token="${token}"></script>`;

  const [copied, setCopied] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Email delivery state
  const [emailInput, setEmailInput] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Domain update state
  const [domainInput, setDomainInput] = useState('');
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainSaved, setDomainSaved] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  function markDone(step: number) {
    setCompletedSteps(prev => new Set(Array.from(prev).concat(step)));
  }

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      markDone(1);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = embedCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      markDone(1);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function saveDomain() {
    if (!domainInput.trim() || !siteId) return;
    setDomainSaving(true);
    setDomainError(null);
    try {
      const res = await fetch('/api/site/update-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, domain: domainInput.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setDomainError(data.error ?? 'Failed to save domain.');
      } else {
        setDomainSaved(true);
      }
    } catch {
      setDomainError('Network error. Please try again.');
    } finally {
      setDomainSaving(false);
    }
  }

  async function useEmail() {
    if (!emailInput.trim()) return;
    if (!subscriberId) {
      setEmailError('Missing subscriber ID. Please refresh and try again.');
      return;
    }
    setEmailSaving(true);
    setEmailError(null);
    try {
      const res = await fetch('/api/subscriber/update-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId,
          email: emailInput.trim(),
          deliveryPreference: 'email',
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setEmailError(data.error ?? 'Failed to save email.');
      } else {
        setEmailSaved(true);
        markDone(2);
      }
    } catch {
      setEmailError('Network error. Please try again.');
    } finally {
      setEmailSaving(false);
    }
  }

  const stepDone = (n: number) => completedSteps.has(n);
  const telegramLink = token
    ? `https://t.me/BrieflyticsBOT?start=${encodeURIComponent(token)}`
    : 'https://t.me/BrieflyticsBOT';

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '40px 20px',
    }}>
      {/* Header */}
      <div style={{ maxWidth: 640, margin: '0 auto 48px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <BrieflyticsMark />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Brieflytics</span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.035em',
          margin: '0 0 12px',
          background: 'linear-gradient(135deg, #fff 30%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          You&apos;re in. Let&apos;s get you set up.
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
          3 quick steps and you&apos;re tracking.
        </p>
      </div>

      {/* Steps */}
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Step 1 ── */}
        <div style={{
          background: '#0f1721',
          border: `1.5px solid ${stepDone(1) ? 'rgba(14,165,233,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 16,
          padding: '28px 28px 32px',
          transition: 'border-color 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: stepDone(1) ? '#0ea5e9' : 'rgba(14,165,233,0.15)',
              border: '1.5px solid rgba(14,165,233,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, color: stepDone(1) ? '#fff' : '#0ea5e9',
              flexShrink: 0, transition: 'background 0.3s',
            }}>
              {stepDone(1) ? '✓' : '1'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Add your embed code</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 2 }}>Paste this before the closing &lt;/head&gt; tag on your website</div>
            </div>
          </div>

          {/* Code block */}
          <div style={{
            background: '#080808',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '16px 18px',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            fontSize: '0.78rem',
            color: '#7dd3fc',
            wordBreak: 'break-all',
            lineHeight: 1.6,
            marginBottom: 14,
            position: 'relative',
          }}>
            <span style={{ color: '#94a3b8' }}>&lt;</span>
            <span style={{ color: '#0ea5e9' }}>script</span>
            <span style={{ color: '#94a3b8' }}> defer src=</span>
            <span style={{ color: '#4ade80' }}>&quot;https://brieflytics.com/tracker.js&quot;</span>
            <span style={{ color: '#94a3b8' }}> data-token=</span>
            <span style={{ color: '#fbbf24' }}>&quot;{token || 'YOUR_TOKEN'}&quot;</span>
            <span style={{ color: '#94a3b8' }}>&gt;&lt;/</span>
            <span style={{ color: '#0ea5e9' }}>script</span>
            <span style={{ color: '#94a3b8' }}>&gt;</span>
          </div>

          <button
            onClick={copyEmbed}
            style={{
              width: '100%',
              padding: '13px',
              background: copied ? '#059669' : '#0ea5e9',
              border: 'none',
              borderRadius: 9,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontFamily: "'Inter', sans-serif",
              marginBottom: 20,
            }}
          >
            {copied ? '✓ Copied to clipboard!' : '📋 Copy embed code'}
          </button>

          {/* Domain update input */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: 10 }}>
              Enter your website URL so we track the right domain:
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="https://yoursite.com"
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                disabled={domainSaved}
                style={{
                  flex: 1,
                  background: '#080808',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontFamily: "'Inter', sans-serif",
                  opacity: domainSaved ? 0.6 : 1,
                }}
              />
              <button
                onClick={saveDomain}
                disabled={domainSaving || domainSaved || !domainInput.trim()}
                style={{
                  padding: '10px 18px',
                  background: domainSaved ? '#059669' : '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: domainSaved ? '#fff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: domainSaving || domainSaved || !domainInput.trim() ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.2s',
                }}
              >
                {domainSaved ? '✓ Saved!' : domainSaving ? 'Saving…' : 'Save domain'}
              </button>
            </div>
            {domainError && (
              <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 6 }}>{domainError}</p>
            )}
          </div>
        </div>

        {/* ── Step 2 ── */}
        <div style={{
          background: '#0f1721',
          border: `1.5px solid ${stepDone(2) ? 'rgba(14,165,233,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 16,
          padding: '28px 28px 32px',
          transition: 'border-color 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: stepDone(2) ? '#0ea5e9' : 'rgba(14,165,233,0.15)',
              border: '1.5px solid rgba(14,165,233,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, color: stepDone(2) ? '#fff' : '#0ea5e9',
              flexShrink: 0, transition: 'background 0.3s',
            }}>
              {stepDone(2) ? '✓' : '2'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Connect Telegram <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.82rem' }}>optional but recommended</span></div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 2 }}>Receive weekly reports directly in your pocket</div>
            </div>
          </div>

          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markDone(2)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '13px',
              background: 'rgba(14,165,233,0.12)',
              border: '1.5px solid rgba(14,165,233,0.3)',
              borderRadius: 9,
              color: '#7dd3fc',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              marginBottom: 16,
              boxSizing: 'border-box',
              transition: 'background 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8.02c-.12.56-.46.7-.94.43l-2.6-1.92-1.25 1.21c-.14.14-.26.26-.53.26l.19-2.67 4.86-4.39c.21-.19-.05-.3-.32-.11L7.6 14.38l-2.55-.8c-.55-.17-.56-.55.12-.81l9.96-3.84c.46-.17.86.11.71.87z" fill="#0ea5e9"/>
            </svg>
            Open Telegram Bot → /start
          </a>

          <div style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', marginBottom: 14 }}>
            — or get reports by email —
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              disabled={emailSaved}
              style={{
                flex: 1,
                background: '#080808',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                padding: '11px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                fontFamily: "'Inter', sans-serif",
                opacity: emailSaved ? 0.6 : 1,
              }}
            />
            <button
              onClick={useEmail}
              disabled={emailSaving || emailSaved || !emailInput.trim()}
              style={{
                padding: '11px 18px',
                background: emailSaved ? '#059669' : '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: emailSaved ? '#fff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: emailSaving || emailSaved || !emailInput.trim() ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: "'Inter', sans-serif",
                transition: 'background 0.2s',
              }}
            >
              {emailSaved ? '✓ Email saved!' : emailSaving ? 'Saving…' : 'Use email'}
            </button>
          </div>
          {emailError && (
            <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 6 }}>{emailError}</p>
          )}
        </div>

        {/* ── Step 3 ── */}
        <div style={{
          background: '#0f1721',
          border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '28px 28px 32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(14,165,233,0.15)',
              border: '1.5px solid rgba(14,165,233,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, color: '#0ea5e9',
              flexShrink: 0,
            }}>
              3
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>You&apos;re all set 🎉</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 2 }}>Sit back and let Brieflytics do its thing</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(14,165,233,0.06)',
            border: '1px solid rgba(14,165,233,0.15)',
            borderRadius: 10,
            padding: '18px 20px',
            color: '#94a3b8',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            marginBottom: 20,
          }}>
            <span style={{ color: '#7dd3fc', fontWeight: 600 }}>📊 Your first report arrives in 7 days.</span>
            {' '}We&apos;ll message you with a summary of your traffic, top sources, and AI-powered suggestions to grow.
          </div>

          {siteId && (
            <a
              href={`/dashboard?siteId=${siteId}&token=${token}`}
              style={{
                display: 'block',
                width: '100%',
                padding: '13px',
                background: '#0ea5e9',
                border: 'none',
                borderRadius: 9,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'none',
                boxSizing: 'border-box',
                marginBottom: 12,
              }}
            >
              Go to dashboard →
            </a>
          )}

          <a
            href="https://brieflytics.com"
            style={{
              display: 'block',
              textAlign: 'center',
              color: '#475569',
              fontSize: '0.85rem',
              textDecoration: 'none',
              marginTop: 8,
            }}
          >
            ← Back to brieflytics.com
          </a>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#333', fontSize: '0.75rem', marginTop: 40 }}>
        Need help? <a href="mailto:panamadonne@proton.me" style={{ color: '#475569' }}>panamadonne@proton.me</a>
      </p>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>Loading…</div>
      </main>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
