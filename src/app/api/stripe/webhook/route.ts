export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for trial → subscription lifecycle:
 *   - checkout.session.completed → activate subscription
 *   - customer.subscription.updated → sync status
 *   - customer.subscription.deleted → mark cancelled
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Must read raw body for Stripe signature verification
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
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }

      default:
        // Unhandled event types — ignore gracefully
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[stripe/webhook] Handler error for ${event.type}:`, message);
    // Return 200 so Stripe doesn't retry — log the error for manual review
  }

  return NextResponse.json({ received: true });
}

// ─────────────────────────────────────────────
// Event handlers
// ─────────────────────────────────────────────

/**
 * checkout.session.completed
 * Subscriber completed payment — activate their subscription.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscriberId = session.metadata?.subscriber_id;

  if (!subscriberId) {
    console.warn("[stripe/webhook] checkout.session.completed missing subscriber_id in metadata");
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("subscribers")
    .update({
      subscription_status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: "supporter",
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriberId);

  if (error) {
    throw new Error(`Failed to activate subscriber ${subscriberId}: ${error.message}`);
  }

  console.log(`[stripe/webhook] ✅ Subscriber ${subscriberId} activated — customer: ${customerId}`);
}

/**
 * customer.subscription.updated
 * Sync subscription status when Stripe status changes (renewal, past_due, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const stripeStatus = subscription.status;

  let subscriptionStatus: string;
  if (stripeStatus === "active" || stripeStatus === "trialing") {
    subscriptionStatus = "active";
  } else if (stripeStatus === "past_due" || stripeStatus === "unpaid") {
    subscriptionStatus = "expired";
  } else {
    // canceled, incomplete, incomplete_expired, paused — don't change
    console.log(`[stripe/webhook] Ignoring subscription.updated with status: ${stripeStatus}`);
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("subscribers")
    .update({
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw new Error(`Failed to update subscriber for customer ${customerId}: ${error.message}`);
  }

  console.log(`[stripe/webhook] Subscriber ${customerId} subscription_status → ${subscriptionStatus}`);
}

/**
 * customer.subscription.deleted
 * Subscription was fully cancelled.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("subscribers")
    .update({
      subscription_status: "cancelled",
      plan: "free",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw new Error(`Failed to cancel subscriber for customer ${customerId}: ${error.message}`);
  }

  console.log(`[stripe/webhook] Subscriber ${customerId} subscription_status → cancelled`);
}
