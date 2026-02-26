export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for:
 *   - checkout.session.completed → one-time tip received
 *   - customer.subscription.created/updated → supporter tier activated
 *   - customer.subscription.deleted → supporter tier cancelled
 *
 * Stripe sends a signature in the stripe-signature header.
 * We verify it before processing any event.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

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
        // Handle one-time tip — log it, maybe send a thank-you message
        await handleTipReceived(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(sub, "active");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(sub, "cancelled");
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

async function handleTipReceived(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const amount = session.amount_total ?? 0;
  const currency = session.currency ?? "eur";

  console.log(
    `[stripe/webhook] Tip received: ${(amount / 100).toFixed(2)} ${currency.toUpperCase()} from customer ${customerId}`
  );

  // You could: store a tip record, send a thank-you Telegram message, etc.
  // For now, just log it.
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  status: "active" | "cancelled"
) {
  const customerId = subscription.customer as string;
  const plan = status === "active" ? "supporter" : "free";

  const { error } = await supabaseAdmin
    .from("subscribers")
    .update({ plan })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw new Error(
      `Failed to update subscriber plan for ${customerId}: ${error.message}`
    );
  }

  console.log(
    `[stripe/webhook] Subscriber ${customerId} plan → ${plan}`
  );
}
