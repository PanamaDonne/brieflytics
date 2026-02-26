#!/usr/bin/env ts-node
/**
 * generate-report.ts
 *
 * Standalone script to generate and deliver analytics reports.
 * Can be run manually or triggered by a cron job / Vercel Cron.
 *
 * Usage:
 *   # All sites:
 *   npm run report
 *
 *   # Single site:
 *   SITE_ID=uuid npm run report
 *
 * Requirements:
 *   - Copy .env.example → .env.local and fill in real values
 *   - Run from the project root
 *
 * For Vercel Cron, use the POST /api/report endpoint instead.
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Validate required env vars before proceeding
const REQUIRED = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `❌ Missing required environment variables:\n${missing.map((k) => `  • ${k}`).join("\n")}\n\nCopy .env.example → .env.local and fill them in.`
  );
  process.exit(1);
}

// Dynamic import after env is loaded
async function main() {
  // Import here so env vars are set before Supabase client initializes
  const { generateAndDeliverReport } = await import("../src/lib/report-runner");

  const siteId = process.env.SITE_ID;

  console.log("─".repeat(50));
  console.log("🚀 Brieflytics Report Generator");
  console.log("─".repeat(50));

  if (siteId) {
    console.log(`📍 Generating report for site: ${siteId}`);
  } else {
    console.log("📍 Generating reports for ALL sites");
  }

  console.log();

  const startTime = Date.now();
  const results = await generateAndDeliverReport(siteId);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log();
  console.log("─".repeat(50));
  console.log(`⚡ Done in ${elapsed}s — ${results.length} site(s) processed`);
  console.log();

  let successCount = 0;
  let failCount = 0;

  for (const r of results) {
    if (r.success) {
      successCount++;
      const via = r.delivered_via?.join(", ") || "none";
      console.log(`  ✅ ${r.domain} — delivered via: ${via}`);
    } else {
      failCount++;
      console.log(`  ❌ ${r.domain} — ERROR: ${r.error}`);
    }
  }

  console.log();
  console.log(`Results: ${successCount} succeeded, ${failCount} failed`);
  console.log("─".repeat(50));

  // Exit with error code if any reports failed
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
