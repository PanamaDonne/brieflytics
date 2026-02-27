'use client';

/**
 * Brieflytics Landing Page — Redesign
 * Dark theme, inline styles, no external dependencies
 */

import { useState } from 'react';

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Brieflytics",
  "description": "Privacy-first web analytics that delivers plain English reports and AI growth suggestions via Telegram or email. No dashboard, no cookies, EU-hosted.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://brieflytics.com",
  "offers": {
    "@type": "Offer",
    "price": "5.00",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "RecurringCharge",
      "billingPeriod": "Month"
    }
  },
  "featureList": [
    "No cookies",
    "GDPR compliant",
    "EU-hosted",
    "Plain English reports",
    "AI growth suggestions",
    "Telegram delivery",
    "Email delivery",
    "No dashboard required"
  ]
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does Brieflytics use cookies?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. Brieflytics is completely cookieless. No cookies are set, no consent banner is required, and you remain fully GDPR compliant." }
    },
    {
      "@type": "Question",
      "name": "Where is my data stored?",
      "acceptedAnswer": { "@type": "Answer", "text": "All data is stored in the EU (Frankfurt, Germany). We never transfer data outside the EU." }
    },
    {
      "@type": "Question",
      "name": "How does Brieflytics work?",
      "acceptedAnswer": { "@type": "Answer", "text": "You embed one line of JavaScript on your website. Brieflytics tracks visitor data anonymously and sends you a plain English summary with AI-powered growth suggestions via Telegram or email every week." }
    },
    {
      "@type": "Question",
      "name": "Do I need a credit card to start?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. You get a 14-day free trial with no credit card required. After 14 days, it's $5/month." }
    },
    {
      "@type": "Question",
      "name": "Is Brieflytics a Google Analytics alternative?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Brieflytics is a privacy-friendly alternative to Google Analytics. Unlike Google Analytics, it uses no cookies, requires no consent banner, stores data in the EU, and delivers insights directly to your phone instead of requiring you to log in to a dashboard." }
    }
  ]
};

// ─── FAQ Accordion Component ──────────────────────────────────────────────────

const faqItems = [
  {
    q: "Does Brieflytics use cookies?",
    a: "No. Brieflytics is completely cookieless. No cookies are set, no consent banner is required, and you remain fully GDPR compliant.",
  },
  {
    q: "Where is my data stored?",
    a: "All data is stored in the EU (Frankfurt, Germany). We never transfer data outside the EU.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. You get a 14-day free trial with no credit card required. After 14 days, it's $5/month. Cancel anytime.",
  },
  {
    q: "Is this a Google Analytics alternative?",
    a: "Yes. Brieflytics is a privacy-friendly alternative to Google Analytics. Unlike GA, it uses no cookies, requires no consent banner, stores data in the EU, and delivers insights directly to your phone.",
  },
  {
    q: "How do I receive my reports?",
    a: "You choose: Telegram message or email. Reports arrive every 3 days, plain English, straight to your phone. No logins, no dashboards.",
  },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ padding: "0 24px 96px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "0 0 14px",
          }}>
            Frequently asked questions
          </h2>
          <p style={{ color: "#64748b", fontSize: "1rem", margin: 0 }}>Everything you need to know before you start.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqItems.map((item, i) => (
            <div
              key={i}
              style={{
                background: "#0f1721",
                border: `1px solid ${open === i ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 14,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 16,
                }}
              >
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>{item.q}</span>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: open === i ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${open === i ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.1)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "1.1rem",
                  color: open === i ? "#0ea5e9" : "#64748b",
                  transition: "all 0.2s",
                  fontWeight: 300,
                }}>
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <div style={{
                  padding: "0 24px 20px",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Logo Component ──────────────────────────────────────────────────────────

function BrieflyticsMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Speech bubble / "B" mark */}
      <rect x="2" y="2" width="24" height="20" rx="5" fill="#0ea5e9" />
      {/* Tail of the speech bubble */}
      <path d="M8 22 L6 29 L14 22 Z" fill="#0ea5e9" />
      {/* Stylized B shape inside */}
      <text x="8" y="17" fontFamily="'Inter', -apple-system, sans-serif" fontSize="14" fontWeight="800" fill="#080808">B</text>
    </svg>
  );
}

function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const textSize = size === "small" ? "1rem" : "1.15rem";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <BrieflyticsMark />
      <span style={{
        fontSize: textSize,
        fontWeight: 800,
        color: "#fff",
        letterSpacing: "-0.02em",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        Brieflytics
      </span>
    </div>
  );
}

// ─── SVG Illustrations ────────────────────────────────────────────────────────

function CodeEditorSVG() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Editor window */}
      <rect x="4" y="4" width="112" height="92" rx="8" fill="#1e293b" />
      {/* Title bar */}
      <rect x="4" y="4" width="112" height="18" rx="8" fill="#0f172a" />
      <rect x="14" y="10" width="6" height="6" rx="3" fill="#ef4444" />
      <rect x="26" y="10" width="6" height="6" rx="3" fill="#f59e0b" />
      <rect x="38" y="10" width="6" height="6" rx="3" fill="#22c55e" />
      {/* Code lines */}
      <rect x="14" y="30" width="40" height="4" rx="2" fill="#334155" />
      <rect x="14" y="40" width="60" height="4" rx="2" fill="#334155" />
      {/* Highlighted script tag line */}
      <rect x="14" y="52" width="92" height="14" rx="3" fill="#0ea5e9" opacity="0.2" />
      <rect x="18" y="55" width="28" height="4" rx="2" fill="#0ea5e9" />
      <rect x="50" y="55" width="48" height="4" rx="2" fill="#7dd3fc" opacity="0.7" />
      {/* More code lines */}
      <rect x="14" y="74" width="50" height="4" rx="2" fill="#334155" />
      <rect x="14" y="84" width="30" height="4" rx="2" fill="#334155" />
    </svg>
  );
}

function DataFlowSVG() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bar chart base */}
      <rect x="8" y="80" width="104" height="2" rx="1" fill="#334155" />
      {/* Bars */}
      <rect x="16" y="55" width="16" height="25" rx="3" fill="#1e293b" />
      <rect x="38" y="40" width="16" height="40" rx="3" fill="#0ea5e9" opacity="0.5" />
      <rect x="60" y="28" width="16" height="52" rx="3" fill="#0ea5e9" opacity="0.75" />
      <rect x="82" y="15" width="16" height="65" rx="3" fill="#0ea5e9" />
      {/* Trend line */}
      <polyline points="24,55 46,42 68,30 90,18" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
      {/* Dots on trend line */}
      <circle cx="24" cy="55" r="3" fill="#0ea5e9" />
      <circle cx="46" cy="42" r="3" fill="#0ea5e9" />
      <circle cx="68" cy="30" r="3" fill="#0ea5e9" />
      <circle cx="90" cy="18" r="3.5" fill="#fff" stroke="#0ea5e9" strokeWidth="2" />
    </svg>
  );
}

function PhoneMsgSVG() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Phone outline */}
      <rect x="35" y="4" width="50" height="88" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      {/* Screen */}
      <rect x="40" y="14" width="40" height="64" rx="5" fill="#0f172a" />
      {/* Notch */}
      <rect x="52" y="8" width="16" height="4" rx="2" fill="#334155" />
      {/* Message bubble inside phone */}
      <rect x="44" y="34" width="30" height="22" rx="5" fill="#0ea5e9" />
      <path d="M50 56 L46 63 L56 56 Z" fill="#0ea5e9" />
      {/* Lines inside bubble (text) */}
      <rect x="48" y="39" width="22" height="3" rx="1.5" fill="white" opacity="0.8" />
      <rect x="48" y="46" width="16" height="3" rx="1.5" fill="white" opacity="0.6" />
      {/* Notification dot */}
      <circle cx="85" cy="20" r="6" fill="#ef4444" />
      <text x="85" y="24" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">1</text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  } as React.CSSProperties,

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
  } as React.CSSProperties,
};

export default function Home() {
  return (
    <div style={styles.page}>

      {/* ── JSON-LD Structured Data ──────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(8,8,8,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{
          ...styles.container,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}>
          <Logo />
          <a href="/signup" style={{
            padding: "8px 18px",
            border: "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: 8,
            color: "#fff",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            transition: "border-color 0.2s, background 0.2s",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#0ea5e9";
              (e.currentTarget as HTMLAnchorElement).style.color = "#0ea5e9";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            }}
          >
            Start free trial
          </a>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 100,
            background: "rgba(14,165,233,0.1)",
            border: "1px solid rgba(14,165,233,0.25)",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#7dd3fc",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 32,
          }}>
            <span>🇪🇺</span> EU-hosted · GDPR compliant · No cookies
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(2.6rem, 6.5vw, 4.2rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            margin: "0 0 24px",
            letterSpacing: "-0.035em",
            background: "linear-gradient(135deg, #fff 30%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            The analytics tool<br />that talks to you.
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "#94a3b8",
            lineHeight: 1.65,
            margin: "0 auto 40px",
            maxWidth: 560,
          }}>
            No dashboards. No logins. Plain English reports delivered straight to your phone.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <a href="/signup" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "14px 28px",
              borderRadius: 10,
              background: "#fff",
              color: "#080808",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: 700,
              boxShadow: "0 0 0 0 rgba(14,165,233,0)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 30px rgba(14,165,233,0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              }}
            >
              Start free trial →
            </a>
            <a href="#how-it-works" style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 28px",
              borderRadius: 10,
              border: "1.5px solid rgba(255,255,255,0.15)",
              color: "#cbd5e1",
              textDecoration: "none",
              fontSize: "1rem",
              fontWeight: 600,
              transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(14,165,233,0.4)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#cbd5e1";
              }}
            >
              See how it works
            </a>
          </div>

          {/* Mock Telegram message card */}
          <div style={{
            maxWidth: 480,
            margin: "0 auto",
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            textAlign: "left",
          }}>
            {/* App bar */}
            <div style={{
              padding: "10px 16px",
              background: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>📊</div>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>Brieflytics Bot</div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>online</div>
              </div>
            </div>
            {/* Message bubble */}
            <div style={{ padding: "20px 16px 20px" }}>
              <div style={{
                background: "#1e293b",
                borderRadius: "4px 14px 14px 14px",
                padding: "14px 16px",
                fontSize: "0.82rem",
                lineHeight: 1.7,
                color: "#e2e8f0",
                maxWidth: 340,
              }}>
                <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>📊 brieflytics.com — 3-Day Report</div>
                <div>843 visitors this week <span style={{ color: "#4ade80" }}>↑ 12%</span> from last week</div>
                <div style={{ color: "#94a3b8", marginTop: 4 }}>Top sources: Google (44%), Reddit (29%), Direct</div>
                <div style={{ color: "#94a3b8" }}>71% mobile · Top country: 🇩🇪 Germany</div>
                <div style={{ color: "#94a3b8" }}>Drop-off: Pricing page</div>
                <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 10 }}>
                  <div style={{ fontWeight: 600, color: "#7dd3fc", marginBottom: 4 }}>💡 Suggestions:</div>
                  <div>1. Simplify your pricing page</div>
                  <div>2. Post on Reddit again — it&apos;s working</div>
                  <div>3. Check your mobile experience</div>
                </div>
                <div style={{ marginTop: 10, fontSize: "0.7rem", color: "#475569", textAlign: "right" }}>Today 08:00 ✓✓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Bar ─────────────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        padding: "16px 24px",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "0.85rem",
          color: "#64748b",
          fontWeight: 500,
          letterSpacing: "0.04em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "clamp(12px, 3vw, 32px)",
          flexWrap: "wrap",
        }}>
          {["🇪🇺 EU-hosted", "🍪 No cookies", "🔒 GDPR compliant", "✕ Cancel anytime"].map(item => (
            <span key={item} style={{ whiteSpace: "nowrap" }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "96px 24px" }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: "0 0 16px",
            }}>
              Up and running in 2 minutes
            </h2>
            <p style={{ color: "#64748b", fontSize: "1rem", margin: 0 }}>No setup complexity. No dashboards to learn.</p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {[
              {
                step: "01",
                title: "Embed one line of code",
                desc: "Paste a single script tag into your site's <head>. That's it. No config, no cookies, no complexity.",
                svg: <CodeEditorSVG />,
              },
              {
                step: "02",
                title: "We track everything",
                desc: "Pageviews, referrers, devices, top pages, drop-offs — all captured privately without storing personal data.",
                svg: <DataFlowSVG />,
              },
              {
                step: "03",
                title: "You get a message",
                desc: "Every week (or day), you get a plain English summary in Telegram or email. No logins, no dashboards.",
                svg: <PhoneMsgSVG />,
              },
            ].map(({ step, title, desc, svg }) => (
              <div key={step} style={{
                background: "#0f1721",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(14,165,233,0.08)",
                  border: "1px solid rgba(14,165,233,0.15)",
                  borderRadius: 14,
                }}>
                  {svg}
                </div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0ea5e9", letterSpacing: "0.1em" }}>STEP {step}</div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Report Card ──────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: "0 0 14px",
            }}>
              Your 3-day briefing, delivered
            </h2>
            <p style={{ color: "#64748b", fontSize: "1rem", margin: 0 }}>Here&apos;s exactly what you&apos;ll receive every week.</p>
          </div>

          {/* Full report card */}
          <div style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 32px 100px rgba(0,0,0,0.5)",
          }}>
            {/* Telegram header */}
            <div style={{
              background: "#1e293b",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem",
              }}>📊</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Brieflytics Bot</div>
                <div style={{ fontSize: "0.72rem", color: "#22c55e" }}>● online</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: "0.7rem", color: "#475569", textAlign: "center", marginBottom: 12 }}>Monday, 09:00</div>
              <div style={{
                background: "#1e293b",
                borderRadius: "4px 16px 16px 16px",
                padding: "16px 18px",
                maxWidth: "85%",
                fontSize: "0.85rem",
                lineHeight: 1.75,
                color: "#e2e8f0",
              }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  📊 brieflytics.com — 3-Day Report
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Traffic</div>
                  <div><span style={{ fontWeight: 700, color: "#fff", fontSize: "1.2rem" }}>843</span> <span style={{ color: "#94a3b8" }}>visitors this week</span> <span style={{ color: "#4ade80", fontWeight: 700 }}>↑ 12%</span></div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Top Sources</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {[
                      { name: "Google", pct: 44 },
                      { name: "Reddit", pct: 29 },
                      { name: "Direct", pct: 18 },
                    ].map(s => (
                      <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "#94a3b8", width: 52, flexShrink: 0, fontSize: "0.82rem" }}>{s.name}</span>
                        <div style={{ flex: 1, height: 4, background: "#1e3a50", borderRadius: 2 }}>
                          <div style={{ width: `${s.pct}%`, height: "100%", background: "#0ea5e9", borderRadius: 2 }} />
                        </div>
                        <span style={{ color: "#7dd3fc", fontWeight: 700, width: 34, textAlign: "right", fontSize: "0.82rem" }}>{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Devices & Location</div>
                  <div style={{ color: "#cbd5e1" }}>71% mobile · Top country: 🇩🇪 Germany</div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Drop-off Page</div>
                  <div style={{ color: "#fbbf24" }}>⚠️ Pricing page <span style={{ color: "#64748b", fontSize: "0.78rem" }}>(visitors leaving without converting)</span></div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
                  <div style={{ color: "#7dd3fc", fontWeight: 700, marginBottom: 8 }}>💡 AI Suggestions</div>
                  {[
                    "Simplify your pricing page — it's causing drop-off",
                    "Post on Reddit again — it drove 29% of traffic",
                    "Optimize for mobile — 71% of your visitors are on phones",
                  ].map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, color: "#cbd5e1" }}>
                      <span style={{ color: "#0ea5e9", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: "0.7rem", color: "#475569", textAlign: "right" }}>09:00 ✓✓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "0 0 14px",
          }}>
            Simple pricing
          </h2>
          <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: 40 }}>One plan. Everything included.</p>

          <div style={{
            background: "#0f1721",
            border: "1.5px solid rgba(14,165,233,0.25)",
            borderRadius: 20,
            padding: "40px 36px",
            boxShadow: "0 0 60px rgba(14,165,233,0.08)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Glow */}
            <div style={{
              position: "absolute",
              top: -60, left: "50%", transform: "translateX(-50%)",
              width: 200, height: 120,
              background: "radial-gradient(ellipse, rgba(14,165,233,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0ea5e9", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Brieflytics Pro</div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>$5</span>
              <span style={{ color: "#64748b", paddingBottom: 8 }}>/month</span>
            </div>

            <div style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 36 }}>
              14-day free trial · No credit card required
            </div>

            <div style={{ textAlign: "left", marginBottom: 36, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Reports every 3 days",
                "Telegram & email delivery",
                "AI-powered growth suggestions",
                "Unlimited pageviews",
                "EU-hosted, GDPR compliant",
                "No cookies, no consent banners",
                "Cancel anytime",
              ].map(feature => (
                <div key={feature} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(14,165,233,0.15)",
                    border: "1px solid rgba(14,165,233,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", color: "#0ea5e9", flexShrink: 0, marginTop: 1,
                    fontWeight: 800,
                  }}>✓</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>{feature}</span>
                </div>
              ))}
            </div>

            <a href="/signup" style={{
              display: "block",
              padding: "15px 0",
              background: "#0ea5e9",
              borderRadius: 10,
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "1rem",
              textAlign: "center",
              letterSpacing: "-0.01em",
              transition: "background 0.2s, transform 0.15s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#0284c7";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#0ea5e9";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              Start your free trial →
            </a>

            <p style={{ margin: "14px 0 0", color: "#475569", fontSize: "0.78rem" }}>No credit card · Cancel anytime · Starts immediately</p>
          </div>
        </div>
      </section>

      {/* ── Privacy Section ───────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: "0 0 12px",
            }}>
              Privacy isn&apos;t a feature. It&apos;s the foundation.
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>Built from day one to respect your visitors.</p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            maxWidth: 780,
            margin: "0 auto",
          }}>
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5" />
                    <path d="M8 14 C8 10 10 8 14 8 C18 8 20 10 20 14" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <rect x="7" y="13" width="14" height="9" rx="3" fill="#0ea5e9" opacity="0.8" />
                    <circle cx="14" cy="17.5" r="1.5" fill="#fff" />
                  </svg>
                ),
                title: "No cookies",
                desc: "Zero cookies stored on your visitors' devices. No consent banner required.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5" />
                    <text x="14" y="18" textAnchor="middle" fontSize="12" fill="#0ea5e9" fontWeight="800">EU</text>
                  </svg>
                ),
                title: "EU-hosted",
                desc: "All data lives in the European Union. No transatlantic data transfers.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5" />
                    <path d="M14 7 L20 10 L20 16 C20 19.5 17.5 22 14 23 C10.5 22 8 19.5 8 16 L8 10 Z" fill="rgba(14,165,233,0.2)" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M11 14.5 L13 16.5 L17 12" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "GDPR compliant",
                desc: "Built to meet EU privacy regulations. No legal headaches for you or your visitors.",
              },
            ].map(card => (
              <div key={card.title} style={{
                background: "#0f1721",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}>
                <div>{card.icon}</div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{card.title}</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <FAQAccordion />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 24px",
      }}>
        <div style={{
          ...styles.container,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <Logo size="small" />
          <div style={{ color: "#475569", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} Brieflytics. All rights reserved.
          </div>
          <a href="/privacy" style={{ color: "#475569", fontSize: "0.8rem", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#475569"}
          >
            Privacy Policy
          </a>
          <a href="mailto:panamadonne@proton.me" style={{ color: "#475569", fontSize: "0.8rem", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#475569"}
          >
            Support
          </a>
        </div>
      </footer>

    </div>
  );
}
