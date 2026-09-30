# Intelligent Personal Finance Assistant

An AI-powered personal expense analyzer and financial assistant, built as a
full-stack academic project. It helps a user log, categorize, and understand
their own spending using natural language and Generative AI (Google Gemini),
alongside a conventional dashboard, analytics, and budget tracker.

> **Disclaimer**: This is a student project presented as a personal finance
> assistant. It is **not** a professional financial advisor. AI-generated
> suggestions are informational only — always consult a licensed professional
> for real financial, tax, or investment decisions.

---

## Features

- Manual expense entry with validation
- Natural-language expense entry ("I spent ₹450 on dinner yesterday") via Gemini, with an edit-before-save review step
- AI-assisted expense categorization (user can always override)
- Expense list with search, category filter, month filter, sort, edit, delete
- Dashboard: total spending, budget, remaining budget, transaction count, top category, recent transactions, charts, budget progress
- Analytics: category breakdown, monthly trend, average daily spend, highest expense (pie, bar, and line charts — all real data)
- FinAI Assistant: a conversational AI that answers only from your real stored expenses
- AI Monthly Summary: numbers computed in code, narrative + observations + suggestions written by Gemini
- Budget management with Under Budget / Near Limit / Over Budget status
- Responsive UI: sidebar nav on desktop, mobile header + drawer on small screens
- Demo data seeding (in-app button, SQL script, or CLI script)
- Graceful local fallback if `GEMINI_API_KEY` is missing — the rest of the app still works

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React, Tailwind CSS, Recharts, Lucide React
- **Backend**: Next.js API routes (TypeScript, server-side only)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (`gemini-1.5-flash`)
- **Validation**: Zod (validates both form input and AI-returned JSON)
- **Deployment**: Vercel
- **Version control**: Git + GitHub

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full breakdown.
Short version:

```
User -> Next.js UI -> Next.js API routes -> Supabase (data) + Gemini (AI)
```

All financial calculations happen in `lib/calculations/finance.ts`. Gemini is
only ever asked to *explain* numbers already computed in code, or to extract
structured data that is then validated with Zod before use — never trusted
blindly.

## Folder Structure

```
intelligent-personal-finance-assistant/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── dashboard/                # /dashboard
│   ├── expenses/                 # /expenses
│   ├── analytics/                # /analytics
│   ├── budget/                   # /budget
│   ├── assistant/                # /assistant (FinAI)
│   ├── settings/                 # /settings
│   └── api/
│       ├── expenses/             # CRUD
│       ├── ai/                   # extract, categorize, chat, summary
│       ├── analytics/
│       ├── budget/
│       └── demo/seed/
├── components/                   # dashboard, expenses, analytics, assistant, budget, layout, ui
├── lib/
│   ├── supabase/                 # client.ts (browser), server.ts (API routes only)
│   ├── ai/                       # gemini.ts, prompts.ts
│   ├── validation/                # zod schemas
│   ├── calculations/              # all real financial math
│   └── utils/
├── types/
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── scripts/seed.ts               # optional CLI seeding
├── docs/
├── .env.example
├── .gitignore
├── README.md
├── LICENSE
└── package.json
```

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- A free [Supabase](https://supabase.com) project
- A free [Google AI Studio](https://aistudio.google.com/app/apikey) Gemini API key
- Git and a GitHub account (for version control / submission)

## Installation

```bash
git clone <your-repo-url> intelligent-personal-finance-assistant
cd intelligent-personal-finance-assistant
npm install
```

## Environment Variables

Copy the example file and fill in real values (never commit the real file):

```bash
cp .env.example .env.local
```

| Variable | Required | Where it's used |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser + server |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server only — enables the "Load Demo Data" button and `npm run seed` |
| `GEMINI_API_KEY` | Optional* | Server only — enables all AI features |
| `NEXT_PUBLIC_DEMO_USER_ID` | No (has a default) | Identifies the single demo user |

\* The app runs and the dashboard/expenses/analytics/budget pages all work
without `GEMINI_API_KEY`; only the AI-specific features are disabled with a
clear in-app message.

**Never commit `.env` or `.env.local`.** `.gitignore` already excludes them.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings -> API** and copy the **Project URL** and
   **anon public key** into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. (Optional, for demo-data seeding) Also copy the **service_role** key into
   `SUPABASE_SERVICE_ROLE_KEY`. Keep this secret — it bypasses Row Level
   Security.
4. Open **SQL Editor -> New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates the `profiles`,
   `expenses`, and `budgets` tables, indexes, triggers, and RLS policies.
5. (Optional) Paste and run `supabase/seed.sql` to load demo data directly,
   or use the in-app **Settings -> Load Demo Data** button instead once the
   app is running.

## Gemini API Setup

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   and create an API key.
2. Paste it into `.env.local` as `GEMINI_API_KEY`.
3. That's it — no further configuration needed; `lib/ai/gemini.ts` reads it
   automatically.

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page is at
`/`; the app itself starts at `/dashboard`.

## Loading Demo Data

Pick any one of these:

- **In-app**: go to `/settings` and click **Load Demo Data** (requires
  `SUPABASE_SERVICE_ROLE_KEY` to be set).
- **SQL Editor**: run `supabase/seed.sql` in the Supabase SQL Editor.
- **CLI script**: `npm run seed` (requires `NEXT_PUBLIC_SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` to be set in your shell environment).

All demo data is clearly labelled `(demo)` in its description and uses
realistic Indian Rupee amounts — it is not real personal data.

## Testing Every Major Feature

1. **Dashboard** — loads stats/charts without errors after seeding demo data.
2. **Add Expense (manual)** — try submitting with a negative amount or empty
   description; confirm validation errors appear and nothing is saved.
3. **Natural-language entry** — type a plain-English expense, confirm the
   extracted fields appear, edit one, then save; confirm it appears in
   `/expenses`.
4. **Expense list** — search, filter by category, filter by month, sort,
   edit an existing row, delete a row.
5. **Analytics** — confirm the pie/bar/line charts reflect the same totals
   shown on the dashboard.
6. **Budget** — set a budget, confirm the status badge changes between
   Under Budget / Near Limit / Over Budget as spending changes.
7. **FinAI Assistant** — ask each of the six sample questions from the
   project brief; confirm answers reference only real stored amounts.
8. **AI Monthly Summary** (on `/budget`) — confirm the top stats match your
   real data and the narrative below them is generated text.
9. **Local fallback** — temporarily remove `GEMINI_API_KEY` and confirm the
   AI features show a friendly "not configured" message instead of crashing.

## GitHub Upload Instructions

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Deployment to Vercel

Full steps in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). Summary:

1. Push to GitHub (above).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add the environment variables listed above under **Project Settings ->
   Environment Variables**.
4. Deploy. Vercel auto-detects Next.js and runs `next build`.

### Environment variables required in Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   (optional, for the demo-data button)
GEMINI_API_KEY
NEXT_PUBLIC_DEMO_USER_ID
```

## Screenshots

_Add screenshots of the Dashboard, Expenses, Analytics, Budget, and FinAI
Assistant pages here after running the app locally or viewing the deployed
site._

- `docs/screenshots/dashboard.png`
- `docs/screenshots/expenses.png`
- `docs/screenshots/analytics.png`
- `docs/screenshots/budget.png`
- `docs/screenshots/assistant.png`

## Future Improvements

- Real multi-user Supabase Auth (schema and RLS are already structured for it — see `docs/ARCHITECTURE.md`)
- Recurring expenses / subscriptions tracking
- Export to CSV/PDF
- Multi-currency support
- Push/email budget-alert notifications
- Receipt photo upload with OCR-assisted extraction

## Disclaimer

This project is submitted for academic purposes. It demonstrates the use of
Generative AI for natural-language understanding, categorization, and
conversational Q&A within a personal finance context. It does not provide,
and is not a substitute for, professional financial, investment, tax, or
legal advice.

## License

MIT — see [`LICENSE`](LICENSE).
