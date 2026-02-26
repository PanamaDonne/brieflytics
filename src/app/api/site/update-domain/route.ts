export const dynamic = 'force-dynamic';

/**
 * POST /api/site/update-domain
 *
 * Updates the domain for a site record.
 * Called from the onboarding page when the user enters their actual website URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { siteId, domain } = body as { siteId?: string; domain?: string };

  if (!siteId) {
    return NextResponse.json({ error: "siteId is required" }, { status: 400 });
  }

  if (!domain || !domain.trim()) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  // Strip protocol (http:// or https://) and trailing slashes
  const cleanDomain = domain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

  if (!cleanDomain) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("sites")
    .update({ domain: cleanDomain })
    .eq("id", siteId);

  if (error) {
    console.error("[site/update-domain] Error:", error.message);
    return NextResponse.json({ error: "Failed to update domain" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, domain: cleanDomain });
}
