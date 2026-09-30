# AI Prompt Engineering

All prompts live in `lib/ai/prompts.ts` — nowhere else in the codebase builds
a Gemini prompt string. Every route that calls Gemini for structured data
requests **strict JSON** and validates the response with Zod
(`lib/validation/schemas.ts`) before it is used or shown as trustworthy.

## 1. Expense extraction (`buildExtractionPrompt`)
Used by `POST /api/ai/extract`. Takes free text + today's date, returns
`{ amount, category, description, date, payment_method, confidence }`.
Explicitly instructs the model to resolve relative dates, default missing
fields sensibly, and never invent an amount it isn't given.

## 2. Categorization (`buildCategorizationPrompt`)
Used by `POST /api/ai/categorize`. Takes a short description, returns
`{ category, confidence }` from the fixed 9-category list only.

## 3. FinAI Assistant (`buildAssistantSystemPrompt` + `buildAssistantUserPrompt`)
Used by `POST /api/ai/chat`. The **system prompt** is a fixed set of rules
(use only supplied data, never fabricate transactions, separate calculations
from suggestions, no regulated financial advice, informational-only
disclaimer). The **user prompt** is built per-request with the current
month's real expenses and budget injected as JSON, so the model can only
reason about what's actually in the database.

## 4. Monthly summary (`buildMonthlySummaryPrompt`)
Used by `GET /api/ai/summary`. All numbers (totals, top category, largest
expense, budget status, month-over-month deltas) are **computed in
`lib/calculations/finance.ts`**, not by the AI — the prompt only asks Gemini
to turn already-correct numbers into a short narrative + observations +
suggestions, returned as strict JSON.

## Why validate everything with Zod?
Generative output is not guaranteed to match the requested shape. Every AI
JSON response passes through a matching Zod schema before the app trusts it:
- Extraction/categorization failures fall back to manual entry.
- Summary failures fall back to showing the calculated numbers with no AI
  narrative, rather than blocking the page.
