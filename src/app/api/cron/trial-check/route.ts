export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/trial-check
 *
 * Cron endpoint to expire trials and send payment nudges.
 * Protected by CRON_SECRET header to prevent unauthorized invocations.
 *
 * Example Vercel cron config in vercel.json:
 *   { "crons": [{ "path": "/api/cron/trial-check", "schedule": "0 9 * * *" }] }
 */

import { NextRequest, NextResponse } from "next/server";
import { checkExpiringTrials } from "@/lib/trial-checker";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = req.headers.get("x-cron-secret");

  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkExpiringTrials();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/trial-check] Error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
