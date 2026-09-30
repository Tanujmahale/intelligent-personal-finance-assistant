# Architecture

## High-level flow

```
User
 |
 v
Next.js UI (App Router, React, TypeScript, Tailwind, Recharts)
 |
 v
Next.js API Routes (server-side, TypeScript)
 |
 +------------------------+------------------------+
 |                                                  |
 v                                                  v
Supabase PostgreSQL                          Google Gemini API
(expenses, budgets, profiles)                (extraction, categorization,
 |                                             chat, monthly summary)
 +------------------------+------------------------+
                          |
                          v
       Dashboard / Analytics / Budget / FinAI Assistant
```

## Layers

- **`app/`** — Next.js App Router pages (client components) and API routes
  (server-only). Pages never talk to Supabase or Gemini directly — they call
  the app's own `/api/*` routes, which is what keeps secrets server-side.
- **`components/`** — Presentational + lightly-stateful React components,
  organized by feature area (dashboard, expenses, analytics, assistant,
  budget) plus a small shared `ui/` kit and `layout/` shell.
- **`lib/supabase/`** — `client.ts` (browser, anon key only) and `server.ts`
  (API routes only, prefers the service role key). Never import `server.ts`
  from a `"use client"` file.
- **`lib/ai/`** — `gemini.ts` (thin API wrapper with error handling) and
  `prompts.ts` (every prompt used anywhere in the app, centralized).
- **`lib/validation/`** — Zod schemas for both user-submitted forms and
  AI-returned JSON. AI output is always validated before it touches the
  database or is shown as "extracted" data.
- **`lib/calculations/`** — All real financial math (totals, percentages,
  budget status, trends). Gemini is only asked to explain numbers that were
  already computed here — never to compute them itself.
- **`types/`** — Shared TypeScript types/interfaces used by both client and
  server code.

## Why a demo-user model instead of full auth?

The project brief asks for a simple, deployment-friendly auth story. Every
table has a `user_id` column and Row Level Security is enabled, so the schema
is ready for real multi-user auth. To upgrade:

1. Enable Supabase Auth (email/password or OAuth) in your Supabase project.
2. Replace `getDemoUserId()` calls with the authenticated user's `auth.uid()`
   (e.g. read the session server-side with `@supabase/ssr`).
3. Tighten the RLS policies in `supabase/schema.sql` from `using (true)` to
   `using (auth.uid() = user_id)`.

No other architectural changes are required — the API routes, validation, and
calculation layers are already user-scoped.

## Error-handling & fallback strategy

- Every API route wraps its logic in try/catch and returns a JSON
  `{ error: string }` with an appropriate HTTP status, never a raw stack
  trace.
- If `GEMINI_API_KEY` is missing, AI routes return `503` with a clear message
  instead of crashing; the UI falls back to manual entry / shows the message
  inline (see `lib/ai/gemini.ts` and the `aiUnavailable` flag returned by
  `/api/ai/summary`).
- If Supabase env vars are missing, `lib/supabase/server.ts` throws a clear
  error immediately, which the calling route turns into a `500` with a
  friendly message — the whole app does not crash at build or boot time.
