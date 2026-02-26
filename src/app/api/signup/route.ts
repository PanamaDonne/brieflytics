export const dynamic = 'force-dynamic';

/**
 * POST /api/signup
 *
 * Registers a new subscriber with a 14-day free trial.
 * Creates a default site record and returns the subscriber ID + site token.
 *
 * No credit card required to start.
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

  const { email } = body as { email?: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check if email already exists
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const now = new Date();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  // ── Create subscriber ──────────────────────
  const { data: subscriber, error: subErr } = await supabase
    .from("subscribers")
    .insert({
      email,
      subscription_status: "trial",
      trial_started_at: now.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
      delivery_preference: "email",
      plan: "free",
    })
    .select("id")
    .single();

  if (subErr || !subscriber) {
    console.error("[signup] Failed to create subscriber:", subErr?.message);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }

  // ── Create default site ────────────────────
  // Extract a domain from the email as a default (they can update later)
  const emailDomain = email.split("@")[1] ?? "mysite.com";

  const { data: site, error: siteErr } = await supabase
    .from("sites")
    .insert({
      owner_id: subscriber.id,
      domain: emailDomain,
      name: "My Site",
    })
    .select("id, token")
    .single();

  if (siteErr || !site) {
    console.error("[signup] Failed to create default site:", siteErr?.message);
    // Subscriber was created — return partial success with no token
    return NextResponse.json({
      subscriberId: subscriber.id,
      siteId: null,
      token: null,
      embedCode: null,
    });
  }

  const embedCode = `<script defer src="https://brieflytics.com/tracker.js" data-token="${site.token}"></script>`;

  return NextResponse.json(
    {
      subscriberId: subscriber.id,
      siteId: site.id,
      token: site.token,
      embedCode,
    },
    { status: 201 }
  );
}
