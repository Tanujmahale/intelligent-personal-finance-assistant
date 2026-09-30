import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for use inside API routes only.
 * Prefers the service role key (bypasses RLS, needed for seeding demo data);
 * falls back to the anon key for normal CRUD, which works fine against the
 * permissive RLS policies defined in supabase/schema.sql.
 *
 * NEVER import this file from a "use client" component.
 */
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || (!serviceKey && !anonKey)) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (and optionally SUPABASE_SERVICE_ROLE_KEY) in your environment."
    );
  }

  return createClient(url, serviceKey || anonKey!, {
    auth: { persistSession: false },
  });
}

export function getDemoUserId(): string {
  return (
    process.env.NEXT_PUBLIC_DEMO_USER_ID ||
    "00000000-0000-0000-0000-000000000001"
  );
}
