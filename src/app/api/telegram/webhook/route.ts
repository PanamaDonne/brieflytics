export const dynamic = 'force-dynamic';

/**
 * POST /api/telegram/webhook
 *
 * Receives Telegram bot updates.
 * - /start TOKEN  → links the subscriber's Telegram account
 * - /start        → welcome message
 *
 * Always returns 200 (Telegram requires this).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendMessage } from "@/lib/telegram";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      first_name?: string;
      username?: string;
    };
    chat: {
      id: number;
    };
    text?: string;
  };
}

export async function POST(req: NextRequest) {
  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message || !message.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  // Only handle /start commands
  if (!text.startsWith("/start")) {
    return NextResponse.json({ ok: true });
  }

  const parts = text.split(" ");
  const token = parts[1]?.trim();

  if (!token) {
    // /start with no token
    await sendMessage(
      chatId,
      "Welcome to Brieflytics\\! Please use your unique link from the onboarding page to connect your account\\.",
      "MarkdownV2"
    );
    return NextResponse.json({ ok: true });
  }

  // /start TOKEN — link the account
  const supabase = getSupabaseAdmin();

  // Find the site by token
  const { data: site, error: siteErr } = await supabase
    .from("sites")
    .select("id, owner_id, domain")
    .eq("token", token)
    .single();

  if (siteErr || !site) {
    await sendMessage(
      chatId,
      "Sorry, that link is invalid or expired\\. Please sign up at brieflytics\\.com\\.",
      "MarkdownV2"
    );
    return NextResponse.json({ ok: true });
  }

  // Update subscriber with telegram_chat_id
  const { error: updateErr } = await supabase
    .from("subscribers")
    .update({
      telegram_chat_id: chatId,
      delivery_preference: "telegram",
    })
    .eq("id", site.owner_id);

  if (updateErr) {
    console.error("[telegram/webhook] Failed to update subscriber:", updateErr.message);
    await sendMessage(
      chatId,
      "Something went wrong linking your account\\. Please try again or contact support\\.",
      "MarkdownV2"
    );
    return NextResponse.json({ ok: true });
  }

  await sendMessage(
    chatId,
    `✅ *Account linked\\!* You'll now receive weekly analytics reports for *${site.domain}* right here in Telegram\\.`,
    "MarkdownV2"
  );

  return NextResponse.json({ ok: true });
}
