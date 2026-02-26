// ─────────────────────────────────────────────
// Core domain types for Brieflytics analytics
// ─────────────────────────────────────────────

/** A registered site / property */
export interface Site {
  id: string;
  domain: string;           // e.g. "example.com"
  name: string;
  owner_id: string;         // maps to subscribers.id
  created_at: string;
}

/** Raw pageview event stored in the DB */
export interface Pageview {
  id: string;
  site_id: string;
  session_id: string;       // hashed, no PII
  url: string;
  referrer: string | null;
  // Parsed from User-Agent — never the raw UA string
  browser: string | null;
  os: string | null;
  device_type: "desktop" | "mobile" | "tablet" | null;
  // From IP geolocation — IP itself is discarded immediately
  country: string | null;
  city: string | null;
  screen_width: number | null;
  screen_height: number | null;
  is_bounce: boolean;
  is_entry: boolean;
  is_exit: boolean;
  timestamp: string;
}

/** Custom event (e.g. "signup", "purchase") */
export interface AnalyticsEvent {
  id: string;
  site_id: string;
  session_id: string;
  event_name: string;
  properties: Record<string, unknown> | null;  // arbitrary JSON
  url: string;
  timestamp: string;
}

/** A generated analytics report */
export interface Report {
  id: string;
  site_id: string;
  period_start: string;
  period_end: string;
  summary: string;          // AI-generated plain English summary
  suggestions: string;      // AI-generated growth suggestions
  raw_stats: ReportStats;
  delivered_via: ("telegram" | "email")[];
  created_at: string;
}

/** Aggregated stats that feed the AI summary */
export interface ReportStats {
  total_pageviews: number;
  unique_visitors: number;
  sessions: number;
  bounce_rate: number;       // 0–100 percentage
  avg_session_duration_s: number;
  top_pages: { url: string; views: number }[];
  top_referrers: { source: string; visits: number }[];
  top_countries: { country: string; visits: number }[];
  top_devices: { device: string; count: number }[];
  top_browsers: { browser: string; count: number }[];
  entry_pages: { url: string; entries: number }[];
  exit_pages: { url: string; exits: number }[];
  top_events: { name: string; count: number }[];
}

/** A subscriber (site owner) */
export interface Subscriber {
  id: string;
  email: string;
  telegram_chat_id: string | null;
  delivery_preference: "telegram" | "email" | "both";
  plan: "free" | "supporter";
  stripe_customer_id: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_status: "trial" | "active" | "expired" | "cancelled";
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────
// Collect endpoint payload (from tracker.js)
// ─────────────────────────────────────────────
export interface CollectPayload {
  /** Site token — matches sites.token in DB */
  t: string;
  /** Current page URL */
  u: string;
  /** Referrer URL */
  r?: string;
  /** Screen width */
  sw?: number;
  /** Screen height */
  sh?: number;
  /** Hashed session ID — generated client-side, no PII */
  s: string;
  /** Event name — undefined means pageview */
  e?: string;
  /** Event properties */
  p?: Record<string, unknown>;
  /** Timestamp (ISO string) */
  ts: string;
}
