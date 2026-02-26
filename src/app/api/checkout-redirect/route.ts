export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout-redirect?subscriberId=xxx
 *
 * Browser-friendly redirect to the Stripe Checkout URL.
 * Used in Telegram/email links (which must be GET requests).
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function GET(req: NextRequest) {
  const subscriberId = req.nextUrl.searchParams.get("subscriberId");

  if (!subscriberId) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  const supabase = getSupabaseAdmin();
  const { data: subscriber, error } = await supabase
    .from("subscribers")
    .select("id, email, stripe_customer_id")
    .eq("id", subscriberId)
    .single();

  if (error || !subscriber) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
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

    if (subscriber.stripe_customer_id) {
      sessionParams.customer = subscriber.stripe_customer_id;
    } else {
      sessionParams.customer_email = subscriber.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return NextResponse.redirect(new URL("/signup", req.url));
    }

    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error("[checkout-redirect] Error:", err);
    return NextResponse.redirect(new URL("/signup", req.url));
  }
}
