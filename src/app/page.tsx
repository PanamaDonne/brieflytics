/**
 * Brieflytics Landing Page
 */

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 20px 60px",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Hero */}
      <div style={{ maxWidth: 680, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 24 }}>
          🇪🇺 EU-hosted · GDPR compliant · No cookies
        </div>

        <h1
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            fontWeight: 800,
            margin: "0 0 20px",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          The analytics tool<br />that talks to you.
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "#888",
            margin: "0 0 12px",
            lineHeight: 1.75,
            maxWidth: 520,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          No dashboards. No logins. No charts to decipher.
          <br />
          Brieflytics sends you a plain English summary of your site —
          plus actionable growth tips — straight to your phone.
        </p>

        <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: 40 }}>
          Weekly or daily. Via Telegram or email. $5/mo after a 14-day free trial.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
          <a
            href="/signup"
            style={{
              background: "#fff",
              color: "#000",
              padding: "14px 32px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            Start free trial →
          </a>
          <a
            href="#how-it-works"
            style={{
              background: "transparent",
              color: "#888",
              padding: "14px 24px",
              borderRadius: 8,
              fontWeight: 500,
              fontSize: "1rem",
              textDecoration: "none",
              border: "1px solid #222",
            }}
          >
            See how it works
          </a>
        </div>

        {/* Example message */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: 16,
            padding: "28px 28px",
            textAlign: "left",
            marginBottom: 80,
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>
            Example — what you receive every week
          </div>
          <div style={{ borderLeft: "2px solid #2a2a2a", paddingLeft: 18, lineHeight: 2, color: "#bbb", fontSize: "0.95rem" }}>
            <p style={{ margin: "0 0 10px" }}>
              📊 <strong style={{ color: "#fff" }}>brieflytics.com — Weekly Report</strong>
            </p>
            <p style={{ margin: "0 0 6px" }}>1,240 visitors this week, <span style={{ color: "#4ade80" }}>↑ 18%</span> from last week.</p>
            <p style={{ margin: "0 0 6px" }}>Top sources: Google (44%), Reddit (29%), Direct (18%).</p>
            <p style={{ margin: "0 0 6px" }}>71% of visitors on mobile. Top country: Germany.</p>
            <p style={{ margin: "0 0 18px" }}>Highest drop-off: Pricing page.</p>
            <p style={{ margin: "0 0 6px", color: "#fff", fontWeight: 600 }}>💡 This week&apos;s suggestions:</p>
            <p style={{ margin: "0 0 4px" }}>1. Simplify your pricing page — it&apos;s losing people.</p>
            <p style={{ margin: "0 0 4px" }}>2. Post on Reddit again — it&apos;s your best traffic source.</p>
            <p style={{ margin: "0" }}>3. Your mobile experience needs attention — 71% are on phones.</p>
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
            Set up in 60 seconds.
          </h2>
          <p style={{ color: "#555", marginBottom: 40, fontSize: "0.95rem" }}>One line of code. No configuration.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {[
              { step: "01", title: "Embed the script", desc: "One line added to your site. That's it." },
              { step: "02", title: "We track everything", desc: "Pages, sources, devices, countries — cookieless." },
              { step: "03", title: "You get a message", desc: "Plain English report + growth tips, on schedule." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 24, textAlign: "left" }}>
                <div style={{ fontSize: "0.7rem", color: "#444", letterSpacing: "0.15em", marginBottom: 10 }}>{step}</div>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: "1rem" }}>{title}</div>
                <div style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Embed snippet */}
        <div
          style={{
            background: "#0d0d0d",
            border: "1px solid #1e1e1e",
            borderRadius: 12,
            padding: 24,
            textAlign: "left",
            marginBottom: 80,
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
            Add to your site
          </div>
          <code style={{ fontSize: "0.82rem", color: "#7dd3fc", lineHeight: 2, wordBreak: "break-all" }}>
            {`<script defer src="https://brieflytics.com/tracker.js" data-token="YOUR_TOKEN"></script>`}
          </code>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Simple pricing.</h2>
          <p style={{ color: "#555", marginBottom: 32, fontSize: "0.95rem" }}>No tiers. No surprises.</p>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: 40, maxWidth: 380, margin: "0 auto" }}>
            <div style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.03em" }}>$5<span style={{ fontSize: "1rem", color: "#555", fontWeight: 400 }}>/mo</span></div>
            <div style={{ color: "#555", fontSize: "0.875rem", marginBottom: 28 }}>14-day free trial · No credit card required</div>
            {[
              "Unlimited pageviews",
              "Weekly + daily reports",
              "AI growth suggestions",
              "Telegram + email delivery",
              "EU-hosted, GDPR compliant",
              "Cancel anytime",
            ].map((f) => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, color: "#bbb", fontSize: "0.9rem" }}>
                <span style={{ color: "#4ade80" }}>✓</span> {f}
              </div>
            ))}
            <a
              href="/signup"
              style={{
                display: "block",
                marginTop: 28,
                background: "#fff",
                color: "#000",
                padding: "14px",
                borderRadius: 8,
                fontWeight: 700,
                textAlign: "center",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              Start free trial →
            </a>
          </div>
        </div>

        {/* Privacy */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>Privacy by default.</h2>
          <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
            No cookies. No persistent identifiers. IP addresses are hashed and immediately discarded.
            All data stored in the EU. Fully GDPR compliant — no consent banner needed.
          </p>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 32, color: "#444", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} Brieflytics · EU-based · <a href="/privacy" style={{ color: "#444" }}>Privacy</a>
        </div>
      </div>
    </main>
  );
}
