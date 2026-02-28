/**
 * AI Summarization Service
 *
 * Takes a ReportStats object and calls OpenAI to produce:
 *   1. A plain-English summary of the week's analytics
 *   2. Actionable growth suggestions
 *
 * Designed to be token-efficient — we send structured stats,
 * not raw rows, so we never pass PII to OpenAI.
 */

import OpenAI from "openai";
import type { ReportStats } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export interface SummaryResult {
  summary: string;
  suggestions: string;
}

/**
 * Generate a plain-English summary and growth suggestions
 * for a given site's analytics stats over a time period.
 */
export async function generateSummary(
  siteName: string,
  siteDomain: string,
  stats: ReportStats,
  periodStart: Date,
  periodEnd: Date
): Promise<SummaryResult> {
  const period = `${formatDate(periodStart)} – ${formatDate(periodEnd)}`;

  // Build a concise, structured prompt — no PII, just aggregates
  const statsBlock = formatStatsForPrompt(stats);

  const systemPrompt = `You are an analytics assistant for a busy indie founder.
Your job is to surface what changed, why it matters, and what to do next.
Always compare to the previous period when the data allows it. If numbers are zero, call it out.
Sound confident and direct. Avoid filler. Be specific with numbers and channels.`;

  const userPrompt = `Here are the analytics stats for ${siteName} (${siteDomain}) for the period ${period}:

${statsBlock}

Please provide:
1. SUMMARY: 2-4 sentences that explain what changed (up or down), what caused it (source/page/device), and whether it needs action. Reference specific numbers and deltas when possible.
2. SUGGESTIONS: Return an array of 3 concrete, high-leverage actions (JSON array of strings). Each suggestion should reference the metric or insight that triggered it.

Format your response as JSON:
{
  "summary": "...",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed = JSON.parse(content) as { summary?: string; suggestions?: unknown };
  const suggestionsList = normalizeSuggestions(parsed.suggestions);

  return {
    summary: parsed.summary ?? "Summary unavailable.",
    suggestions: suggestionsList.length ? suggestionsList.map((item, idx) => `${idx + 1}. ${item}`).join("\n") : "No suggestions available.",
  };
}

function normalizeSuggestions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-•\d\.\s]+/, "").trim())
      .filter(Boolean);
  }
  return [];
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatStatsForPrompt(stats: ReportStats): string {
  const topPages = stats.top_pages
    .slice(0, 5)
    .map((p) => `  - ${p.url} (${p.views} views)`)
    .join("\n");

  const topReferrers = stats.top_referrers
    .slice(0, 5)
    .map((r) => `  - ${r.source} (${r.visits} visits)`)
    .join("\n");

  const topCountries = stats.top_countries
    .slice(0, 5)
    .map((c) => `  - ${c.country} (${c.visits} visits)`)
    .join("\n");

  const topEvents = stats.top_events
    .slice(0, 5)
    .map((e) => `  - ${e.name} (${e.count}x)`)
    .join("\n");

  return `
📊 Core Metrics:
  - Pageviews: ${stats.total_pageviews}
  - Unique visitors: ${stats.unique_visitors}
  - Sessions: ${stats.sessions}
  - Bounce rate: ${stats.bounce_rate.toFixed(1)}%
  - Avg session duration: ${formatDuration(stats.avg_session_duration_s)}

📄 Top Pages:
${topPages || "  (none)"}

🔗 Top Traffic Sources:
${topReferrers || "  (none)"}

🌍 Top Countries:
${topCountries || "  (none)"}

🎯 Custom Events:
${topEvents || "  (none)"}

📱 Top Devices: ${stats.top_devices.map((d) => `${d.device} (${d.count})`).join(", ") || "n/a"}
🌐 Top Browsers: ${stats.top_browsers.map((b) => `${b.browser} (${b.count})`).join(", ") || "n/a"}
`.trim();
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}
