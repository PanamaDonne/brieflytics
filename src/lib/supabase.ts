import { createClient } from "@supabase/supabase-js";

/**
 * Browser/edge-safe Supabase client using the anon key.
 * Safe for client components and API routes that respect RLS.
 */
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * Server-only Supabase client with service role key.
 * Bypasses RLS — only use in trusted server contexts (API routes, scripts).
 * Never expose this to the browser.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
