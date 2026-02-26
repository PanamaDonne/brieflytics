/**
 * /api/report
 *
 * Trigger report generation for one or all sites.
 *
 * GET  — Called by Vercel Cron every Monday 8:00 AM (see vercel.json)
 *         Vercel passes Authorization: Bearer <CRON_SECRET>
 *
 * POST — Manual trigger (e.g. from CLI or webhook)
 *         Pass x-cron-secret header OR Authorization: Bearer <CRON_SECRET>
 *         Body: { "site_id": "uuid" } (optional — omit for all sites)
 */

import { NextRequest, NextResponse } from "next/server";
import { generateAndDeliverReport } from "@/lib/report-runner";

// ── Auth helper ────────────────────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  // Vercel Cron style
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  // Manual trigger style
  const xSecret = req.headers.get("x-cron-secret");
  if (xSecret === cronSecret) return true;

  return false;
}

// ── GET — Vercel Cron handler ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await generateAndDeliverReport();
  return NextResponse.json({ success: true, results });
}

// ── POST — Manual trigger ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let siteId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    siteId = body?.site_id;
  } catch {
    // No body is fine — will run for all sites
  }

  const results = await generateAndDeliverReport(siteId);
  return NextResponse.json({ success: true, results });
}
