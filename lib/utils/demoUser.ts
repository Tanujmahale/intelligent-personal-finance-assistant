/**
 * This project intentionally ships with a simple single-demo-user model
 * instead of a full auth system, per the project brief ("keep the first
 * version simple"). The user id is a fixed UUID shared by client and
 * server code, and is the same value seed.sql inserts a profile row for.
 *
 * To upgrade to real multi-user auth later: swap this for Supabase Auth's
 * `auth.uid()`, and tighten the RLS policies in supabase/schema.sql.
 */
export function getClientDemoUserId(): string {
  return (
    process.env.NEXT_PUBLIC_DEMO_USER_ID ||
    "00000000-0000-0000-0000-000000000001"
  );
}
