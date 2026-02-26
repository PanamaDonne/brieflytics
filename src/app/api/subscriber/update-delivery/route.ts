export const dynamic = 'force-dynamic';

/**
 * POST /api/subscriber/update-delivery
 *
 * Updates a subscriber's email and/or delivery preference.
 * Called from the onboarding page when the user chooses email delivery.
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

  const { subscriberId, email, deliveryPreference } = body as {
    subscriberId?: string;
    email?: string;
    deliveryPreference?: string;
  };

  if (!subscriberId) {
    return NextResponse.json({ error: "subscriberId is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const updates: Record<string, string> = {};
  if (email) updates.email = email;
  if (deliveryPreference) updates.delivery_preference = deliveryPreference;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("subscribers")
    .update(updates)
    .eq("id", subscriberId);

  if (error) {
    console.error("[subscriber/update-delivery] Error:", error.message);
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
