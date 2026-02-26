# Brieflytics ⚡

> Privacy-first web analytics — delivered via Telegram or email. No dashboard.

---

## What is this?

Brieflytics is a lightweight analytics tool that:

- Embeds a **single JS snippet** on any website (no npm, no config)
- Tracks pageviews, visitors, sessions, bounce rate, traffic sources, devices, countries, and custom events
- **AI summarizes** your week in plain English + gives actionable growth suggestions
- **Delivers reports** straight to your Telegram or inbox — no dashboard to check
- **Privacy-first**: no cookies, no PII stored, no fingerprinting, EU-hosted
- **GDPR-exempt** from consent requirements (aggregate stats only)

---

## Tech Stack

| Layer         | Technology                         |
|---------------|------------------------------------|
| Framework     | Next.js 14 (App Router, TypeScript) |
| Database      | Supabase (EU region)               |
| Hosting       | Vercel (EU — Frankfurt `fra1`)     |
| AI            | OpenAI (gpt-4o-mini)               |
| Delivery      | Telegram Bot API + Resend          |
| Payments      | Stripe                             |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd brieflytics
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your real credentials
```

### 3. Set up Supabase

Run the migration in your Supabase project:

```bash
# Option A: Supabase CLI
supabase db push

# Option B: Supabase Dashboard → SQL Editor
# Paste contents of supabase/migrations/001_initial_schema.sql
```

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## Embedding the Tracker

Add one line to any website's `<head>`:

```html
<script
  defer
  src="https://brieflytics.com/tracker.js"
  data-token="YOUR_SITE_TOKEN"
></script>
```

Get `YOUR_SITE_TOKEN` from the `sites.token` column in your database.

### Custom Events

```javascript
// Track any event
window.brieflytics.track("signup");
window.brieflytics.track("purchase", { plan: "pro" });

// User opt-out (for GDPR compliance)
window.brieflytics.optOut();
```

---

## API Routes

| Route                     | Method | Description                         |
|---------------------------|--------|-------------------------------------|
| `/api/collect`            | POST   | Receive tracking data from tracker.js |
| `/api/report`             | GET    | Trigger reports (Vercel Cron)       |
| `/api/report`             | POST   | Manual report trigger               |
| `/api/stripe/webhook`     | POST   | Stripe payment webhooks             |

---

## Report Generation

### Via Vercel Cron (automatic)

The `vercel.json` schedules reports every **Monday at 8:00 AM UTC**.

### Manual (CLI)

```bash
# All sites
npm run report

# Single site
SITE_ID=your-uuid npm run report
```

### Via API

```bash
curl -X POST https://brieflytics.com/api/report \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"site_id": "optional-uuid"}'
```

---

## Privacy Design

- **IPs**: used transiently for geo lookup (country/city), then immediately discarded. Never logged or stored.
- **User-Agent**: parsed to browser/OS/device type, then discarded.
- **Session IDs**: generated client-side from random entropy, never tied to identity.
- **No cookies**: tracker.js never reads or writes cookies.
- **No localStorage**: session ID lives only in memory (tab lifetime).
- **Do Not Track**: respected — tracker silently exits if DNT=1.
- **Opt-out**: `window.brieflytics.optOut()` sets a localStorage flag and stops all tracking.

---

## Project Structure

```
.
├── public/
│   └── tracker.js              # Embeddable tracking script
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   └── api/
│   │       ├── collect/        # Tracking data receiver
│   │       ├── report/         # Report trigger endpoint
│   │       └── stripe/         # Payment webhooks
│   ├── lib/
│   │   ├── supabase.ts         # Supabase clients
│   │   ├── ua-parser.ts        # User-Agent parser
│   │   ├── geo.ts              # IP geolocation (privacy-first)
│   │   ├── stats.ts            # Stats aggregation
│   │   ├── summarize.ts        # OpenAI summarization
│   │   ├── telegram.ts         # Telegram delivery
│   │   ├── email.ts            # Email delivery (Resend)
│   │   └── report-runner.ts    # Orchestration
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── scripts/
│   └── generate-report.ts      # CLI script for reports
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── vercel.json                 # Cron + region config
└── .env.example                # Environment variable template
```

---

## Revenue Model

- **Free tier**: up to X sites, weekly reports
- **Supporter tier**: more sites, custom report intervals, priority delivery
- **Optional tip**: one-time Stripe payment — no features gated

---

Built with ⚡ by Macky Smallz
