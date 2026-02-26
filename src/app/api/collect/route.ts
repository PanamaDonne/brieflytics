/**
 * POST /api/collect
 *
 * Receives tracking data from tracker.js embedded on client sites.
 * Validates, enriches (geo from IP, UA parsing), and stores in Supabase.
 *
 * Privacy guarantees:
 *   - IP address is used only for geo lookup, then discarded immediately
 *   - Raw User-Agent is parsed then discarded
 *   - No cookies, no localStorage reads
 *   - All session IDs are hashed client-side before sending
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { parseUserAgent } from "@/lib/ua-parser";
import { resolveGeo } from "@/lib/geo";
import type { CollectPayload } from "@/types";

// ─────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────

const CollectSchema = z.object({
  t: z.string().min(1).max(64),              // site token
  u: z.string().url().max(2048),             // page URL
  r: z.string().max(2048).optional(),        // referrer
  sw: z.number().int().positive().max(8000).optional(),  // screen width
  sh: z.number().int().positive().max(8000).optional(),  // screen height
  s: z.string().min(8).max(128),             // hashed session ID
  e: z.string().min(1).max(128).optional(),  // event name
  p: z.record(z.unknown()).optional(),       // event properties
  ts: z.string().datetime(),                 // timestamp
});

// ─────────────────────────────────────────────
// OPTIONS — preflight for CORS
// ─────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// ─────────────────────────────────────────────
// POST — main collect handler
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse body ──────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return respond(400, "Invalid JSON");
  }

  // ── 2. Validate ────────────────────────────
  const parsed = CollectSchema.safeParse(body);
  if (!parsed.success) {
    return respond(400, "Invalid payload", parsed.error.flatten());
  }

  const payload = parsed.data as CollectPayload;

  // ── 3. Verify site token ───────────────────
  const { data: site, error: siteErr } = await supabaseAdmin
    .from("sites")
    .select("id, domain")
    .eq("token", payload.t)
    .single();

  if (siteErr || !site) {
    // Return 200 to prevent token enumeration — silently drop
    return respond(200, "ok");
  }

  // Optional: validate the URL's origin matches the registered domain
  try {
    const origin = new URL(payload.u).hostname;
    if (!origin.endsWith(site.domain) && origin !== site.domain) {
      // Mismatched domain — log but don't hard-fail (subdomains vary)
      console.warn(`[collect] Domain mismatch: ${origin} vs ${site.domain}`);
    }
  } catch {
    return respond(400, "Invalid URL");
  }

  // ── 4. Extract IP, then immediately discard ─
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // ── 5. Geo lookup (IP discarded after this) ─
  const geo = await resolveGeo(ip);
  // ip variable goes out of scope / is never stored

  // ── 6. Parse User-Agent, then discard raw UA ─
  const rawUA = req.headers.get("user-agent") ?? "";
  const { browser, os, device_type } = parseUserAgent(rawUA);
  // rawUA is never stored

  // ── 7. Store pageview or custom event ──────
  if (payload.e) {
    // Custom event
    const { error } = await supabaseAdmin.from("events").insert({
      site_id: site.id,
      session_id: payload.s,
      event_name: payload.e,
      properties: payload.p ?? null,
      url: payload.u,
      timestamp: payload.ts,
    });

    if (error) {
      console.error("[collect] Event insert error:", error.message);
      return respond(500, "Storage error");
    }
  } else {
    // Pageview
    const { error } = await supabaseAdmin.from("pageviews").insert({
      site_id: site.id,
      session_id: payload.s,
      url: payload.u,
      referrer: payload.r ?? null,
      browser,
      os,
      device_type,
      country: geo.country,
      city: geo.city,
      screen_width: payload.sw ?? null,
      screen_height: payload.sh ?? null,
      // Entry/exit detection is done async or via DB trigger
      is_bounce: false,   // updated when session ends / next pageview arrives
      is_entry: false,    // set by DB trigger or upsert logic
      is_exit: false,     // set by DB trigger or upsert logic
      timestamp: payload.ts,
    });

    if (error) {
      console.error("[collect] Pageview insert error:", error.message);
      return respond(500, "Storage error");
    }

    // Mark entry/exit pages via DB function
    await supabaseAdmin.rpc("update_entry_exit", {
      p_site_id: site.id,
      p_session_id: payload.s,
      p_url: payload.u,
      p_timestamp: payload.ts,
    });
  }

  // ── 8. Return a 1×1 transparent GIF ────────
  // This allows tracker.js to use <img> as a fallback beacon
  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function respond(status: number, message: string, detail?: unknown) {
  return NextResponse.json({ message, ...(detail ? { detail } : {}) }, { status });
}

// Minimal 1×1 transparent GIF (35 bytes)
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);
