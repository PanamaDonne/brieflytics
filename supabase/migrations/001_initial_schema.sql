-- ──────────────────────────────────────────────────────────────────────────────
-- Brieflytics Analytics — Initial Schema
-- ──────────────────────────────────────────────────────────────────────────────
-- Privacy-first design:
--   • No IP addresses stored anywhere
--   • User-Agents are parsed to browser/OS/device then discarded
--   • Session IDs are hashed client-side before arrival
--   • All timestamps in UTC
-- ──────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────────────
-- SUBSCRIBERS
-- Site owners / users of Brieflytics
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE subscribers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               TEXT NOT NULL UNIQUE,
  telegram_chat_id    TEXT,                         -- Telegram chat ID (nullable)
  delivery_preference TEXT NOT NULL DEFAULT 'email'
                      CHECK (delivery_preference IN ('telegram', 'email', 'both')),
  plan                TEXT NOT NULL DEFAULT 'free'
                      CHECK (plan IN ('free', 'supporter')),
  stripe_customer_id  TEXT,                         -- for tip/supporter payments
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- SITES
-- Each tracked website / property
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE sites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  domain     TEXT NOT NULL,           -- e.g. "example.com" (no protocol, no trailing slash)
  name       TEXT NOT NULL,           -- display name
  token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
                                      -- embed token for tracker.js
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sites_owner_id ON sites(owner_id);
CREATE INDEX idx_sites_token    ON sites(token);

-- ──────────────────────────────────────────────────────────────────────────────
-- PAGEVIEWS
-- One row per page load. No PII.
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE pageviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id       UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  session_id    TEXT NOT NULL,         -- hashed client-side, no PII
  url           TEXT NOT NULL,
  referrer      TEXT,
  -- Parsed from UA string (raw UA never stored):
  browser       TEXT,
  os            TEXT,
  device_type   TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  -- From IP geo (IP never stored):
  country       TEXT,
  city          TEXT,
  -- Screen dimensions from JS:
  screen_width  INTEGER,
  screen_height INTEGER,
  -- Engagement flags (set by trigger or update):
  is_bounce     BOOLEAN NOT NULL DEFAULT false,
  is_entry      BOOLEAN NOT NULL DEFAULT false,
  is_exit       BOOLEAN NOT NULL DEFAULT false,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pageviews_site_id   ON pageviews(site_id);
CREATE INDEX idx_pageviews_session   ON pageviews(site_id, session_id);
CREATE INDEX idx_pageviews_timestamp ON pageviews(site_id, timestamp);
CREATE INDEX idx_pageviews_url       ON pageviews(site_id, url);

-- ──────────────────────────────────────────────────────────────────────────────
-- EVENTS
-- Custom events (e.g. "signup", "purchase", "video_play")
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  event_name  TEXT NOT NULL,
  properties  JSONB,                  -- arbitrary key-value pairs, no PII
  url         TEXT NOT NULL,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_site_id    ON events(site_id);
CREATE INDEX idx_events_name       ON events(site_id, event_name);
CREATE INDEX idx_events_timestamp  ON events(site_id, timestamp);

-- ──────────────────────────────────────────────────────────────────────────────
-- REPORTS
-- Generated analytics reports (AI summaries + raw stats snapshot)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id       UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  period_start  TIMESTAMPTZ NOT NULL,
  period_end    TIMESTAMPTZ NOT NULL,
  summary       TEXT NOT NULL,        -- AI-generated plain English summary
  suggestions   TEXT NOT NULL,        -- AI-generated growth suggestions
  raw_stats     JSONB NOT NULL,       -- snapshot of ReportStats at generation time
  delivered_via TEXT[] NOT NULL DEFAULT '{}',  -- ["telegram", "email"]
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_site_id    ON reports(site_id);
CREATE INDEX idx_reports_created_at ON reports(site_id, created_at);

-- ──────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS (used by stats aggregation)
-- ──────────────────────────────────────────────────────────────────────────────

-- Top pages by view count
CREATE OR REPLACE FUNCTION top_pages(
  p_site_id UUID,
  p_from    TIMESTAMPTZ,
  p_to      TIMESTAMPTZ,
  p_limit   INTEGER DEFAULT 10
)
RETURNS TABLE (url TEXT, views BIGINT) AS $$
  SELECT url, COUNT(*) AS views
  FROM pageviews
  WHERE site_id = p_site_id
    AND timestamp >= p_from
    AND timestamp <= p_to
  GROUP BY url
  ORDER BY views DESC
  LIMIT p_limit;
$$ LANGUAGE SQL STABLE;

-- Top referrers by visit count
CREATE OR REPLACE FUNCTION top_referrers(
  p_site_id UUID,
  p_from    TIMESTAMPTZ,
  p_to      TIMESTAMPTZ,
  p_limit   INTEGER DEFAULT 10
)
RETURNS TABLE (referrer TEXT, visits BIGINT) AS $$
  SELECT
    COALESCE(NULLIF(referrer, ''), 'Direct') AS referrer,
    COUNT(DISTINCT session_id) AS visits
  FROM pageviews
  WHERE site_id = p_site_id
    AND timestamp >= p_from
    AND timestamp <= p_to
  GROUP BY referrer
  ORDER BY visits DESC
  LIMIT p_limit;
$$ LANGUAGE SQL STABLE;

-- Top countries
CREATE OR REPLACE FUNCTION top_countries(
  p_site_id UUID,
  p_from    TIMESTAMPTZ,
  p_to      TIMESTAMPTZ,
  p_limit   INTEGER DEFAULT 10
)
RETURNS TABLE (country TEXT, visits BIGINT) AS $$
  SELECT
    COALESCE(country, 'Unknown') AS country,
    COUNT(DISTINCT session_id) AS visits
  FROM pageviews
  WHERE site_id = p_site_id
    AND timestamp >= p_from
    AND timestamp <= p_to
  GROUP BY country
  ORDER BY visits DESC
  LIMIT p_limit;
$$ LANGUAGE SQL STABLE;

-- Device type breakdown
CREATE OR REPLACE FUNCTION device_breakdown(
  p_site_id UUID,
  p_from    TIMESTAMPTZ,
  p_to      TIMESTAMPTZ
)
RETURNS TABLE (device_type TEXT, count BIGINT) AS $$
  SELECT
    COALESCE(device_type, 'Unknown') AS device_type,
    COUNT(*) AS count
  FROM pageviews
  WHERE site_id = p_site_id
    AND timestamp >= p_from
    AND timestamp <= p_to
  GROUP BY device_type
  ORDER BY count DESC;
$$ LANGUAGE SQL STABLE;

-- Browser breakdown
CREATE OR REPLACE FUNCTION browser_breakdown(
  p_site_id UUID,
  p_from    TIMESTAMPTZ,
  p_to      TIMESTAMPTZ
)
RETURNS TABLE (browser TEXT, count BIGINT) AS $$
  SELECT
    COALESCE(browser, 'Unknown') AS browser,
    COUNT(*) AS count
  FROM pageviews
  WHERE site_id = p_site_id
    AND timestamp >= p_from
    AND timestamp <= p_to
  GROUP BY browser
  ORDER BY count DESC;
$$ LANGUAGE SQL STABLE;

-- Top custom events
CREATE OR REPLACE FUNCTION top_events(
  p_site_id UUID,
  p_from    TIMESTAMPTZ,
  p_to      TIMESTAMPTZ,
  p_limit   INTEGER DEFAULT 10
)
RETURNS TABLE (event_name TEXT, count BIGINT) AS $$
  SELECT event_name, COUNT(*) AS count
  FROM events
  WHERE site_id = p_site_id
    AND timestamp >= p_from
    AND timestamp <= p_to
  GROUP BY event_name
  ORDER BY count DESC
  LIMIT p_limit;
$$ LANGUAGE SQL STABLE;

-- Average session duration
-- Calculated as: (max timestamp - min timestamp) per session, then averaged
CREATE OR REPLACE FUNCTION avg_session_duration(
  p_site_id UUID,
  p_from    TIMESTAMPTZ,
  p_to      TIMESTAMPTZ
)
RETURNS TABLE (avg_duration_s NUMERIC) AS $$
  SELECT AVG(duration_s) AS avg_duration_s
  FROM (
    SELECT
      session_id,
      EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) AS duration_s
    FROM pageviews
    WHERE site_id = p_site_id
      AND timestamp >= p_from
      AND timestamp <= p_to
    GROUP BY session_id
    HAVING COUNT(*) > 1  -- only multi-page sessions have a meaningful duration
  ) session_durations;
$$ LANGUAGE SQL STABLE;

-- ──────────────────────────────────────────────────────────────────────────────
-- ENTRY / EXIT PAGE UPDATER
-- Called after each pageview insert to maintain is_entry / is_exit flags.
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_entry_exit(
  p_site_id    UUID,
  p_session_id TEXT,
  p_url        TEXT,
  p_timestamp  TIMESTAMPTZ
)
RETURNS VOID AS $$
DECLARE
  session_count INTEGER;
BEGIN
  -- Count pageviews for this session
  SELECT COUNT(*) INTO session_count
  FROM pageviews
  WHERE site_id = p_site_id AND session_id = p_session_id;

  IF session_count = 1 THEN
    -- First pageview in session → mark as entry
    UPDATE pageviews
    SET is_entry = true, is_bounce = true   -- assume bounce until a second PV arrives
    WHERE site_id = p_site_id
      AND session_id = p_session_id
      AND url = p_url;
  ELSE
    -- Second+ pageview → clear bounce on all prior PVs for this session
    UPDATE pageviews
    SET is_bounce = false
    WHERE site_id = p_site_id AND session_id = p_session_id;

    -- Clear previous exit flag
    UPDATE pageviews
    SET is_exit = false
    WHERE site_id = p_site_id AND session_id = p_session_id;
  END IF;

  -- Mark latest pageview as exit
  UPDATE pageviews
  SET is_exit = true
  WHERE id = (
    SELECT id FROM pageviews
    WHERE site_id = p_site_id AND session_id = p_session_id
    ORDER BY timestamp DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Subscribers can only read their own data
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pageviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports     ENABLE ROW LEVEL SECURITY;

-- Subscribers: users can see/edit their own row
CREATE POLICY "subscribers_self"
  ON subscribers FOR ALL
  USING (id = auth.uid());

-- Sites: owners can manage their sites
CREATE POLICY "sites_owner"
  ON sites FOR ALL
  USING (owner_id = auth.uid());

-- Pageviews: owners can read their site's data
CREATE POLICY "pageviews_owner"
  ON pageviews FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

-- Events: same pattern
CREATE POLICY "events_owner"
  ON events FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

-- Reports: owners can read their reports
CREATE POLICY "reports_owner"
  ON reports FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE owner_id = auth.uid()
    )
  );

-- Service role bypass is automatic via supabaseAdmin client
