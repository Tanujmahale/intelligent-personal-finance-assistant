"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Browser-side Supabase client. Uses only the public URL + anon key, which
 * are safe to expose (Row Level Security controls what they can do).
 *
 * If env vars are missing, we still create a client with placeholder values
 * so the app doesn't crash on import; every call site should handle the
 * resulting network error gracefully (see components' try/catch + toasts).
 */
export const supabaseBrowser = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  { auth: { persistSession: false } }
);

export const isSupabaseConfigured = Boolean(url && anonKey);
