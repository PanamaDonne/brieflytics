/**
 * Stats Aggregation Service
 *
 * Queries Supabase to aggregate pageview and event data
 * for a given site over a specified time period.
 * Returns a ReportStats object ready for AI summarization.
 */

import { supabaseAdmin } from "@/lib/supabase";
import type { ReportStats } from "@/types";

/**
 * Aggregate stats for a site over a date range.
 * All heavy lifting happens in Supabase queries — no PII is returned.
 */
export async function aggregateStats(
  siteId: string,
  from: Date,
  to: Date
): Promise<ReportStats> {
  const fromISO = from.toISOString();
  const toISO = to.toISOString();

  // Run all queries in parallel for speed
  const [
    pageviewsResult,
    uniqueVisitorsResult,
    sessionsResult,
    topPagesResult,
    topReferrersResult,
    topCountriesResult,
    deviceBreakdownResult,
    browserBreakdownResult,
    entryPagesResult,
    exitPagesResult,
    eventsResult,
    bounceResult,
    sessionDurationResult,
  ] = await Promise.all([
    // Total pageviews
    supabaseAdmin
      .from("pageviews")
      .select("id", { count: "exact", head: true })
      .eq("site_id", siteId)
      .gte("timestamp", fromISO)
      .lte("timestamp", toISO),

    // Unique visitors (distinct session_ids as proxy)
    supabaseAdmin
      .from("pageviews")
      .select("session_id")
      .eq("site_id", siteId)
      .gte("timestamp", fromISO)
      .lte("timestamp", toISO),

    // Sessions (same as unique visitors for now — one session_id per session)
    supabaseAdmin
      .from("pageviews")
      .select("session_id")
      .eq("site_id", siteId)
      .gte("timestamp", fromISO)
      .lte("timestamp", toISO),

    // Top pages
    supabaseAdmin.rpc("top_pages", {
      p_site_id: siteId,
      p_from: fromISO,
      p_to: toISO,
      p_limit: 10,
    }),

    // Top referrers
    supabaseAdmin.rpc("top_referrers", {
      p_site_id: siteId,
      p_from: fromISO,
      p_to: toISO,
      p_limit: 10,
    }),

    // Top countries
    supabaseAdmin.rpc("top_countries", {
      p_site_id: siteId,
      p_from: fromISO,
      p_to: toISO,
      p_limit: 10,
    }),

    // Device breakdown
    supabaseAdmin.rpc("device_breakdown", {
      p_site_id: siteId,
      p_from: fromISO,
      p_to: toISO,
    }),

    // Browser breakdown
    supabaseAdmin.rpc("browser_breakdown", {
      p_site_id: siteId,
      p_from: fromISO,
      p_to: toISO,
    }),

    // Entry pages
    supabaseAdmin
      .from("pageviews")
      .select("url")
      .eq("site_id", siteId)
      .eq("is_entry", true)
      .gte("timestamp", fromISO)
      .lte("timestamp", toISO),

    // Exit pages
    supabaseAdmin
      .from("pageviews")
      .select("url")
      .eq("site_id", siteId)
      .eq("is_exit", true)
      .gte("timestamp", fromISO)
      .lte("timestamp", toISO),

    // Custom events
    supabaseAdmin.rpc("top_events", {
      p_site_id: siteId,
      p_from: fromISO,
      p_to: toISO,
      p_limit: 10,
    }),

    // Bounce count
    supabaseAdmin
      .from("pageviews")
      .select("session_id")
      .eq("site_id", siteId)
      .eq("is_bounce", true)
      .gte("timestamp", fromISO)
      .lte("timestamp", toISO),

    // Session durations (for avg calculation)
    supabaseAdmin.rpc("avg_session_duration", {
      p_site_id: siteId,
      p_from: fromISO,
      p_to: toISO,
    }),
  ]);

  // ── Derive counts ─────────────────────────────
  const totalPageviews = pageviewsResult.count ?? 0;

  // Deduplicate session IDs client-side
  const allSessionIds = (uniqueVisitorsResult.data ?? []).map(
    (r: { session_id: string }) => r.session_id
  );
  const uniqueSessionIds = new Set(allSessionIds);
  const uniqueVisitors = uniqueSessionIds.size;
  const sessions = uniqueSessionIds.size;

  // Bounce rate
  const bouncedSessions = new Set(
    (bounceResult.data ?? []).map((r: { session_id: string }) => r.session_id)
  ).size;
  const bounceRate = sessions > 0 ? (bouncedSessions / sessions) * 100 : 0;

  // Avg session duration
  const avgSessionDuration =
    (sessionDurationResult.data as { avg_duration_s: number } | null)
      ?.avg_duration_s ?? 0;

  // ── Top aggregates ────────────────────────────
  const topPages: ReportStats["top_pages"] = (topPagesResult.data ?? []).map(
    (r: { url: string; views: number }) => ({ url: r.url, views: r.views })
  );

  const topReferrers: ReportStats["top_referrers"] = (
    topReferrersResult.data ?? []
  ).map((r: { referrer: string; visits: number }) => ({
    source: r.referrer || "Direct",
    visits: r.visits,
  }));

  const topCountries: ReportStats["top_countries"] = (
    topCountriesResult.data ?? []
  ).map((r: { country: string; visits: number }) => ({
    country: r.country || "Unknown",
    visits: r.visits,
  }));

  const topDevices: ReportStats["top_devices"] = (
    deviceBreakdownResult.data ?? []
  ).map((r: { device_type: string; count: number }) => ({
    device: r.device_type || "Unknown",
    count: r.count,
  }));

  const topBrowsers: ReportStats["top_browsers"] = (
    browserBreakdownResult.data ?? []
  ).map((r: { browser: string; count: number }) => ({
    browser: r.browser || "Unknown",
    count: r.count,
  }));

  // Entry/exit pages — aggregate manually
  const entryMap = new Map<string, number>();
  for (const { url } of entryPagesResult.data ?? []) {
    entryMap.set(url, (entryMap.get(url) ?? 0) + 1);
  }
  const entryPages = Array.from(entryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([url, entries]) => ({ url, entries }));

  const exitMap = new Map<string, number>();
  for (const { url } of exitPagesResult.data ?? []) {
    exitMap.set(url, (exitMap.get(url) ?? 0) + 1);
  }
  const exitPages = Array.from(exitMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([url, exits]) => ({ url, exits }));

  const topEvents: ReportStats["top_events"] = (eventsResult.data ?? []).map(
    (r: { event_name: string; count: number }) => ({
      name: r.event_name,
      count: r.count,
    })
  );

  return {
    total_pageviews: totalPageviews,
    unique_visitors: uniqueVisitors,
    sessions,
    bounce_rate: bounceRate,
    avg_session_duration_s: avgSessionDuration,
    top_pages: topPages,
    top_referrers: topReferrers,
    top_countries: topCountries,
    top_devices: topDevices,
    top_browsers: topBrowsers,
    entry_pages: entryPages,
    exit_pages: exitPages,
    top_events: topEvents,
  };
}
