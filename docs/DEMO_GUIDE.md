# Demo Guide (for grading / presentation)

1. **Load demo data**: open `/settings` and click **Load Demo Data** (or run
   `supabase/seed.sql` in the Supabase SQL editor beforehand).
2. **Dashboard** (`/dashboard`): show total spending, budget progress, top
   category, and the category/trend charts — all populated from the demo
   data.
3. **Add an expense manually** (`/expenses` -> Add Manually): demonstrate
   client + server validation (try a negative amount or empty description).
4. **Natural-language entry** (`/expenses`): type
   `"I spent ₹450 on dinner at a restaurant yesterday"`, show the extracted
   fields, edit one field, then save.
5. **Analytics** (`/analytics`): show the pie/donut, bar, and line charts,
   plus average daily spend and highest expense.
6. **Budget** (`/budget`): change the monthly budget amount and show the
   progress bar / status badge update.
7. **FinAI Assistant** (`/assistant`): ask "Where am I spending the most?",
   "Am I exceeding my monthly budget?", and "Give me suggestions to reduce my
   spending" — point out that answers only reference real stored data.
8. **AI Monthly Summary** (`/budget`, right column): show the AI-written
   narrative alongside the code-calculated figures above it.
9. **Local fallback**: temporarily remove `GEMINI_API_KEY` and reload — the
   AI features show a clear "not configured" message while the dashboard,
   expenses, analytics, and budget pages keep working normally.
