/**
 * Report Runner
 *
 * Orchestrates the full report pipeline:
 *   1. Fetch site(s) and their subscriber info
 *   2. Aggregate stats for the past 7 days
 *   3. Generate AI summary + suggestions via OpenAI
 *   4. Store the report in the DB
 *   5. Deliver via Telegram and/or email per subscriber preference
 */

import { supabaseAdmin } from "@/lib/supabase";
import { aggregateStats } from "@/lib/stats";
import { generateSummary } from "@/lib/summarize";
import { sendReportToTelegram } from "@/lib/telegram";
import { sendReportByEmail } from "@/lib/email";
import type { Report, Site, Subscriber, ReportStats } from "@/types";

export interface ReportResult {
  site_id: string;
  domain: string;
  success: boolean;
  error?: string;
  delivered_via?: string[];
}

/**
 * Generate and deliver reports.
 * @param siteId - if provided, generate for one site; otherwise all sites.
 */
export async function generateAndDeliverReport(
  siteId?: string
): Promise<ReportResult[]> {
  // ── 1. Fetch sites ──────────────────────────
  let query = supabaseAdmin
    .from("sites")
    .select("id, domain, name, owner_id");

  if (siteId) {
    query = query.eq("id", siteId) as typeof query;
  }

  const { data: sites, error: sitesErr } = await query;

  if (sitesErr || !sites || sites.length === 0) {
    console.error("[report-runner] No sites found:", sitesErr?.message);
    return [];
  }

  // ── 2. Run reports for each site in sequence ─
  const results: ReportResult[] = [];

  for (const site of sites as Site[]) {
    const result = await runSiteReport(site);
    results.push(result);
  }

  return results;
}

async function runSiteReport(site: Site): Promise<ReportResult> {
  console.log(`[report-runner] Generating report for ${site.domain}...`);

  try {
    // ── Period: last 7 days ───────────────────
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);

    // ── Fetch subscriber ──────────────────────
    const { data: subscriber, error: subErr } = await supabaseAdmin
      .from("subscribers")
      .select("*")
      .eq("id", site.owner_id)
      .single();

    if (subErr || !subscriber) {
      throw new Error(`Subscriber not found for site ${site.id}`);
    }

    const sub = subscriber as Subscriber;

    // ── Check account is active ───────────────
    const { data: isActive } = await supabaseAdmin
      .rpc("is_account_active", { subscriber_id: sub.id });

    if (!isActive) {
      console.log(`[report-runner] ⏭ Skipping ${site.domain} — account inactive (trial expired or cancelled)`);
      return {
        site_id: site.id,
        domain: site.domain,
        success: false,
        error: "account_inactive",
      };
    }

    // ── Aggregate stats ───────────────────────
    const stats: ReportStats = await aggregateStats(
      site.id,
      periodStart,
      periodEnd
    );

    // ── AI summary ────────────────────────────
    const { summary, suggestions } = await generateSummary(
      site.name,
      site.domain,
      stats,
      periodStart,
      periodEnd
    );

    // ── Save report to DB ─────────────────────
    const deliveredVia: ("telegram" | "email")[] = [];

    const { data: reportRow, error: reportErr } = await supabaseAdmin
      .from("reports")
      .insert({
        site_id: site.id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        summary,
        suggestions,
        raw_stats: stats,
        delivered_via: [],
      })
      .select()
      .single();

    if (reportErr || !reportRow) {
      throw new Error(`Failed to save report: ${reportErr?.message}`);
    }

    const report = reportRow as Report;

    // ── Deliver ───────────────────────────────
    const deliveryPrefs: ("telegram" | "email")[] =
      sub.delivery_preference === "both"
        ? ["telegram", "email"]
        : [sub.delivery_preference];

    for (const channel of deliveryPrefs) {
      try {
        if (channel === "telegram" && sub.telegram_chat_id) {
          await sendReportToTelegram(sub.telegram_chat_id, site, report);
          deliveredVia.push("telegram");
        } else if (channel === "email" && sub.email) {
          await sendReportByEmail(sub.email, site, report);
          deliveredVia.push("email");
        }
      } catch (deliveryErr) {
        // Log delivery errors but don't fail the whole report
        console.error(
          `[report-runner] Delivery via ${channel} failed for ${site.domain}:`,
          deliveryErr
        );
      }
    }

    // ── Update delivered_via in DB ─────────────
    await supabaseAdmin
      .from("reports")
      .update({ delivered_via: deliveredVia })
      .eq("id", report.id);

    console.log(
      `[report-runner] ✅ ${site.domain} — delivered via: ${deliveredVia.join(", ") || "none"}`
    );

    return {
      site_id: site.id,
      domain: site.domain,
      success: true,
      delivered_via: deliveredVia,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[report-runner] ❌ ${site.domain}: ${message}`);

    return {
      site_id: site.id,
      domain: site.domain,
      success: false,
      error: message,
    };
  }
}
