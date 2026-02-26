-- ──────────────────────────────────────────────────────────────────────────────
-- Brieflytics — Trial & Billing Schema
-- ──────────────────────────────────────────────────────────────────────────────

-- Add trial and billing columns to subscribers table
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS trial_started_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id        TEXT;

-- Index for efficient trial expiry checks
CREATE INDEX IF NOT EXISTS idx_subscribers_trial_ends_at
  ON subscribers (trial_ends_at)
  WHERE subscription_status = 'trial';

CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_status
  ON subscribers (subscription_status);

-- ──────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: is_account_active
-- Returns TRUE if the subscriber is currently active (paid OR in valid trial)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_account_active(subscriber_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM subscribers
    WHERE id = subscriber_id
      AND (
        subscription_status = 'active'
        OR (
          subscription_status = 'trial'
          AND trial_ends_at > now()
        )
      )
  );
$$ LANGUAGE SQL STABLE;
