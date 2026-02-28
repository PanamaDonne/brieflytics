export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for one-time payment lifecycle:
 *   - checkout.session.completed → activate lifetime access
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/webhook] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[stripe/webhook] Received: ${event.type}`);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
    }
    // No subscription events needed — lifetime access is permanent
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[stripe/webhook] Handler error for ${event.type}:`, message);
  }

  return NextResponse.json({ received: true });
}

/**
 * checkout.session.completed
 * One-time payment received — activate lifetime access.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscriberId = session.metadata?.subscriber_id;

  if (!subscriberId) {
    console.warn("[stripe/webhook] checkout.session.completed missing subscriber_id in metadata");
    return;
  }

  const customerId = session.customer as string;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("subscribers")
    .update({
      subscription_status: "active",
      stripe_customer_id: customerId,
      plan: "lifetime",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriberId);

  if (error) {
    throw new Error(`Failed to activate subscriber ${subscriberId}: ${error.message}`);
  }

  console.log(`[stripe/webhook] ✅ Subscriber ${subscriberId} activated with lifetime access`);
}
