# Deployment (Vercel)

1. Push the repository to GitHub (see the root `README.md` for exact git
   commands).
2. Go to https://vercel.com/new and import the GitHub repository.
3. Framework preset: Vercel auto-detects **Next.js** — no changes needed.
4. Add the environment variables (Project Settings -> Environment Variables),
   same names as `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional — only needed for the in-app
     "Load Demo Data" button; omit it if you seed via the SQL editor instead)
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_DEMO_USER_ID` (can reuse the default from `.env.example`)
5. Click **Deploy**. Vercel builds with `next build` and serves the app.
6. After the first deploy, open the live URL and go to **Settings -> Load
   Demo Data** to populate sample expenses (only works if
   `SUPABASE_SERVICE_ROLE_KEY` is set; otherwise run `supabase/seed.sql` in
   the Supabase SQL editor instead).

## Notes
- `NEXT_PUBLIC_*` variables are safe to expose to the browser by design
  (Supabase's anon key relies on Row Level Security, not secrecy).
  `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are **server-only** and are
  never read by any client component.
- Redeploy after changing environment variables (Vercel does not hot-reload
  them into already-built deployments).
