import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singletons — only created when first accessed at runtime, not at build time

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}

// Keep backwards-compatible named exports as getters
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getSupabase() as any)[prop],
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getSupabaseAdmin() as any)[prop],
});
