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

function DashboardContent() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const embedCode = token
    ? `<script defer src="https://brieflytics.com/tracker.js" data-token="${token}"></script>`
    : `<script defer src="https://brieflytics.com/tracker.js" data-token="YOUR_TOKEN"></script>`;

  const [copied, setCopied] = useState(false);

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = embedCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '40px 20px',
    }}>
      {/* Nav */}
      <nav style={{
        maxWidth: 720,
        margin: '0 auto 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrieflyticsMark />
          <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Brieflytics</span>
        </div>
        <span style={{
          padding: '5px 12px',
          background: 'rgba(74,222,128,0.1)',
          border: '1px solid rgba(74,222,128,0.25)',
          borderRadius: 100,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#4ade80',
          letterSpacing: '0.04em',
        }}>
          ● TRACKING ACTIVE
        </span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Status card */}
        <div style={{
          background: '#0f1721',
          border: '1.5px solid rgba(74,222,128,0.2)',
          borderRadius: 16,
          padding: '32px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(74,222,128,0.12)',
            border: '2px solid rgba(74,222,128,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0,
          }}>
            📊
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 4 }}>Your site is being tracked.</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Reports will arrive weekly to your Telegram or email. First report in ~7 days.
            </div>
          </div>
        </div>

        {/* Embed code card */}
        <div style={{
          background: '#0f1721',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '28px',
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>Your embed code</div>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: 16 }}>
            Make sure this is in the &lt;head&gt; of every page you want to track.
          </div>

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
              padding: '10px 20px',
              background: copied ? '#059669' : 'rgba(14,165,233,0.15)',
              border: '1px solid rgba(14,165,233,0.3)',
              borderRadius: 8,
              color: copied ? '#fff' : '#7dd3fc',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>

        {/* What's next */}
        <div style={{
          background: '#0f1721',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '28px',
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>What happens next</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '📡', text: 'We collect pageviews, referrers, and device data — no cookies needed' },
              { icon: '🤖', text: 'Our AI analyzes your traffic patterns and trends' },
              { icon: '📬', text: 'Every week you receive a plain English report via Telegram or email' },
              { icon: '💡', text: 'Each report includes AI suggestions to help you grow' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <a href="/" style={{ color: '#334155', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Back to brieflytics.com
          </a>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#475569', fontFamily: "'Inter', sans-serif" }}>Loading…</div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  );
}
