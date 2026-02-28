/**
 * Trial Checker
 *
 * Finds subscribers whose trials have expired and notifies them
 * via Telegram or email with a payment link.
 */

import { getSupabaseAdmin } from "@/lib/supabase";
import { sendMessage } from "@/lib/telegram";
import type { Subscriber } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://brieflytics.com";

/**
 * Finds all trial-expired subscribers, marks them as expired,
 * and sends them a payment nudge via Telegram or email.
 */
export async function checkExpiringTrials(): Promise<{ processed: number; errors: number }> {
  const supabase = getSupabaseAdmin();

  // Find trials that have run past their end date
  const { data: expiredSubscribers, error: fetchErr } = await supabase
    .from("subscribers")
    .select("*")
    .eq("subscription_status", "trial")
    .lt("trial_ends_at", new Date().toISOString());

  if (fetchErr) {
    console.error("[trial-checker] Failed to fetch expired trials:", fetchErr.message);
    throw fetchErr;
  }

  if (!expiredSubscribers || expiredSubscribers.length === 0) {
    console.log("[trial-checker] No expired trials found.");
    return { processed: 0, errors: 0 };
  }

  console.log(`[trial-checker] Found ${expiredSubscribers.length} expired trial(s) to process.`);

  let processed = 0;
  let errors = 0;

  for (const row of expiredSubscribers as Subscriber[]) {
    try {
      // 1. Update subscription_status to 'expired'
      const { error: updateErr } = await supabase
        .from("subscribers")
        .update({
          subscription_status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updateErr) {
        throw new Error(`DB update failed: ${updateErr.message}`);
      }

      // 2. Build the checkout link for this subscriber
      const checkoutLink = `${APP_URL}/api/checkout-redirect?subscriberId=${row.id}`;

      const message =
        `⏰ Your Brieflytics trial has ended\\. Get lifetime access for just $5 → [Get lifetime access](${checkoutLink})`;

      // 3. Send notification — prefer Telegram, fall back to email
      if (row.telegram_chat_id) {
        await sendMessage(row.telegram_chat_id, message, "MarkdownV2");
        console.log(`[trial-checker] Notified ${row.email} via Telegram`);
      } else if (row.email) {
        await sendTrialExpiredEmail(row.email, row.id);
        console.log(`[trial-checker] Notified ${row.email} via email`);
      }

      processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[trial-checker] Error processing subscriber ${row.id}: ${msg}`);
      errors++;
    }
  }

  console.log(`[trial-checker] Done. Processed: ${processed}, Errors: ${errors}`);
  return { processed, errors };
}

/**
 * Sends a trial-expired email via Resend.
 * Falls back gracefully if RESEND_API_KEY is not set.
 */
async function sendTrialExpiredEmail(email: string, subscriberId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[trial-checker] RESEND_API_KEY not set — skipping email for", email);
    return;
  }

  const checkoutLink = `${APP_URL}/api/checkout-redirect?subscriberId=${subscriberId}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Brieflytics <hello@brieflytics.com>",
      to: [email],
      subject: "⏰ Your Brieflytics trial has ended",
      html: `
        <p>Hi there,</p>
        <p>Your 7-day free trial has ended.</p>
        <p>
          <a href="${checkoutLink}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
            Get lifetime access for just $5 →
          </a>
        </p>
        <p>It's just $5/month — cancel any time.</p>
        <p>— The Brieflytics team</p>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${res.status} — ${err}`);
  }
}
