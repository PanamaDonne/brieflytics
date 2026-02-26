export const dynamic = 'force-dynamic';

/**
 * GET /api/telegram/register
 *
 * Registers the Telegram webhook URL with the Telegram Bot API.
 * Protected by CRON_SECRET header.
 *
 * Call this once after deployment or whenever the bot token/URL changes.
 */

import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://brieflytics.com/api/telegram/webhook";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");

  if (!cronSecret || provided !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 });
  }

  const telegramUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;

  try {
    const res = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: WEBHOOK_URL }),
    });

    const data = await res.json() as { ok: boolean; description?: string; result?: boolean };

    if (!data.ok) {
      console.error("[telegram/register] Failed:", data.description);
      return NextResponse.json({ success: false, error: data.description }, { status: 500 });
    }

    console.log("[telegram/register] Webhook registered:", WEBHOOK_URL);
    return NextResponse.json({ success: true, webhook_url: WEBHOOK_URL, telegram_response: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[telegram/register] Exception:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
