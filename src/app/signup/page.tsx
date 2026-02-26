'use client';

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif", padding: '40px 20px' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Brieflytics</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>Start your free trial</h1>
        <p style={{ color: '#666', marginBottom: 32, fontSize: '0.9rem' }}>14 days free · No credit card required · $5/mo after</p>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 32 }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
                You&apos;re in!
              </p>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                Check your Telegram/email — your trial has started!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  marginBottom: 12,
                  boxSizing: 'border-box',
                  opacity: loading ? 0.6 : 1,
                }}
              />
              {error && (
                <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 12, textAlign: 'left' }}>
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
                  borderRadius: 8,
                  padding: '13px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: !email ? 0.6 : 1,
                  transition: 'background 0.15s',
                }}
              >
                {loading ? "Creating account…" : "Create free account →"}
              </button>
            </form>
          )}
        </div>

        <p style={{ color: '#444', fontSize: '0.8rem', marginTop: 20 }}>
          <a href="/" style={{ color: '#444' }}>← Back to home</a>
        </p>
      </div>
    </main>
  );
}
