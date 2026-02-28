export const dynamic = 'force-dynamic';

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for a subscriber to start paying.
 * Called when a trial expires or subscriber chooses to upgrade.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { subscriberId } = body as { subscriberId?: string };

  if (!subscriberId) {
    return NextResponse.json({ error: "subscriberId is required" }, { status: 400 });
  }

  // Fetch subscriber record for customer_email
  const supabase = getSupabaseAdmin();
  const { data: subscriber, error: subErr } = await supabase
    .from("subscribers")
    .select("id, email, stripe_customer_id")
    .eq("id", subscriberId)
    .single();

  if (subErr || !subscriber) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: "https://brieflytics.com/welcome",
      cancel_url: "https://brieflytics.com/signup",
      metadata: {
        subscriber_id: subscriberId,
      },
    };

    // Attach to existing Stripe customer if available, otherwise use email
    if (subscriber.stripe_customer_id) {
      sessionParams.customer = subscriber.stripe_customer_id;
    } else {
      sessionParams.customer_email = subscriber.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout] Stripe session creation failed:", message);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
