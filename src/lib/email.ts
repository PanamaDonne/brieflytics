/**
 * Email Delivery Service (via Resend)
 *
 * Sends weekly analytics reports as well-formatted HTML emails.
 * Uses Resend for reliable transactional email delivery.
 */

import { Resend } from "resend";
import type { Report, Site } from "@/types";

const FROM = process.env.RESEND_FROM_EMAIL ?? "hello@brieflytics.com";

/** Send a formatted analytics report via email */
export async function sendReportByEmail(
  toEmail: string,
  site: Site,
  report: Report
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email delivery");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const stats = report.raw_stats;
  const periodStart = new Date(report.period_start);
  const periodEnd = new Date(report.period_end);
  const period = `${formatDate(periodStart)} – ${formatDate(periodEnd)}`;

  const { error } = await resend.emails.send({
    from: `Brieflytics Analytics <${FROM}>`,
    to: [toEmail],
    subject: `📊 ${site.name} Weekly Report — ${period}`,
    html: buildEmailHtml(site, report, period),
    text: buildEmailText(site, report, period),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

// ─────────────────────────────────────────────
// HTML email template
// ─────────────────────────────────────────────

function buildEmailHtml(site: Site, report: Report, period: string): string {
  const stats = report.raw_stats;

  const topPagesRows = stats.top_pages
    .slice(0, 5)
    .map(
      (p, i) => `
      <tr>
        <td style="padding:6px 0;color:#888;">${i + 1}</td>
        <td style="padding:6px 0;">${escHtml(p.url)}</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;">${p.views.toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const topReferrersRows = stats.top_referrers
    .slice(0, 5)
    .map(
      (r) => `
      <tr>
        <td style="padding:6px 0;">${escHtml(r.source)}</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;">${r.visits.toLocaleString()}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>Brieflytics Weekly Report</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#111;padding:32px 40px;">
      <div style="font-size:13px;color:#888;margin-bottom:4px;">Weekly Analytics Report</div>
      <h1 style="margin:0;color:#fff;font-size:24px;">${escHtml(site.name)}</h1>
      <div style="color:#aaa;margin-top:4px;font-size:14px;">${escHtml(period)}</div>
    </div>

    <!-- Core metrics -->
    <div style="padding:32px 40px 0;">
      <h2 style="margin:0 0 20px;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;color:#444;">Core Metrics</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
        ${metricCard("Pageviews", stats.total_pageviews.toLocaleString())}
        ${metricCard("Unique Visitors", stats.unique_visitors.toLocaleString())}
        ${metricCard("Sessions", stats.sessions.toLocaleString())}
        ${metricCard("Bounce Rate", `${stats.bounce_rate.toFixed(1)}%`)}
        ${metricCard("Avg Session", formatDuration(stats.avg_session_duration_s))}
      </div>
    </div>

    <!-- Top Pages -->
    <div style="padding:28px 40px 0;">
      <h2 style="margin:0 0 12px;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;color:#444;">Top Pages</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="color:#888;font-size:12px;border-bottom:1px solid #eee;">
          <th style="padding:6px 0;text-align:left;width:30px;">#</th>
          <th style="padding:6px 0;text-align:left;">Page</th>
          <th style="padding:6px 0;text-align:right;">Views</th>
        </tr>
        ${topPagesRows}
      </table>
    </div>

    <!-- Traffic Sources -->
    <div style="padding:28px 40px 0;">
      <h2 style="margin:0 0 12px;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;color:#444;">Traffic Sources</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="color:#888;font-size:12px;border-bottom:1px solid #eee;">
          <th style="padding:6px 0;text-align:left;">Source</th>
          <th style="padding:6px 0;text-align:right;">Visits</th>
        </tr>
        ${topReferrersRows}
      </table>
    </div>

    <!-- AI Summary -->
    <div style="padding:28px 40px 0;">
      <h2 style="margin:0 0 12px;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;color:#444;">📝 AI Summary</h2>
      <p style="margin:0;color:#333;line-height:1.7;font-size:15px;">${escHtml(report.summary)}</p>
    </div>

    <!-- Growth Suggestions -->
    <div style="padding:28px 40px 32px;">
      <h2 style="margin:0 0 12px;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;color:#444;">💡 Growth Suggestions</h2>
      <p style="margin:0;color:#333;line-height:1.7;font-size:15px;white-space:pre-line;">${escHtml(report.suggestions)}</p>
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f9;border-top:1px solid #eee;padding:20px 40px;font-size:12px;color:#aaa;text-align:center;">
      Brieflytics Analytics · Privacy-first · EU-hosted · No cookies<br/>
      <a href="#" style="color:#888;">Unsubscribe</a>
    </div>

  </div>
</body>
</html>`;
}

function metricCard(label: string, value: string): string {
  return `<div style="background:#f9f9f9;border-radius:8px;padding:16px;">
    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">${label}</div>
    <div style="font-size:24px;font-weight:700;margin-top:4px;">${value}</div>
  </div>`;
}

// ─────────────────────────────────────────────
// Plain-text fallback
// ─────────────────────────────────────────────

function buildEmailText(site: Site, report: Report, period: string): string {
  const stats = report.raw_stats;
  return `
${site.name} — Weekly Analytics Report
${period}

CORE METRICS
Pageviews: ${stats.total_pageviews.toLocaleString()}
Unique Visitors: ${stats.unique_visitors.toLocaleString()}
Sessions: ${stats.sessions.toLocaleString()}
Bounce Rate: ${stats.bounce_rate.toFixed(1)}%
Avg Session: ${formatDuration(stats.avg_session_duration_s)}

TOP PAGES
${stats.top_pages.slice(0, 5).map((p, i) => `${i + 1}. ${p.url} — ${p.views} views`).join("\n")}

TRAFFIC SOURCES
${stats.top_referrers.slice(0, 5).map((r) => `• ${r.source} — ${r.visits} visits`).join("\n")}

AI SUMMARY
${report.summary}

GROWTH SUGGESTIONS
${report.suggestions}

—
Brieflytics Analytics · Privacy-first · EU-hosted · No cookies
`.trim();
}

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────

function escHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}
