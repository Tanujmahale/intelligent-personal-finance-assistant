/**
 * Centralized AI prompt engineering.
 *
 * All prompts used anywhere in the application live here, per the project
 * requirement to avoid scattering prompt strings across the codebase.
 * Every prompt asks Gemini for STRICT JSON where structured output is
 * required, and every response is still validated with Zod before use
 * (see lib/validation/schemas.ts) — we never trust AI output blindly.
 */

import type { Expense } from "@/types";

export const EXPENSE_CATEGORIES_LIST = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
] as const;

/** Prompt: Natural-language expense extraction (+ categorization). */
export function buildExtractionPrompt(userText: string, todayIso: string) {
  return `You are an expense-extraction engine for a personal finance app.

Extract a SINGLE expense from the user's message and return ONLY a JSON
object (no markdown, no code fences, no commentary) with EXACTLY this shape:

{
  "amount": number,
  "category": one of ${JSON.stringify(EXPENSE_CATEGORIES_LIST)},
  "description": string,
  "date": "YYYY-MM-DD",
  "payment_method": one of ["Cash","Card","UPI","Net Banking","Wallet","Unknown"],
  "confidence": one of ["high","medium","low"]
}

Rules:
- Today's date is ${todayIso}. Resolve relative dates ("yesterday", "last Monday") against it.
- If no date is mentioned, use today's date.
- If the currency symbol is missing, assume the amount is already numeric (do not invent a value).
- If payment method is not mentioned, use "Unknown".
- Pick the single best-fitting category from the allowed list only.
- description should be a short, clean phrase (e.g. "Dinner at a restaurant"), not the whole sentence.
- If the message does not contain enough information to extract an amount, set "amount" to 0 and "confidence" to "low".
- Return ONLY the JSON object. No prose before or after it.

User message: """${userText}"""`;
}

/** Prompt: Standalone categorization suggestion for a manually-entered description. */
export function buildCategorizationPrompt(description: string) {
  return `You are a categorization engine for a personal finance app.

Given a short expense description, choose the single best category from this
exact list: ${JSON.stringify(EXPENSE_CATEGORIES_LIST)}.

Return ONLY a JSON object of the shape:
{ "category": string, "confidence": "high" | "medium" | "low" }

Description: """${description}"""`;
}

/** System prompt for the FinAI conversational assistant. */
export function buildAssistantSystemPrompt() {
  return `You are "FinAI Assistant", a personal finance helper inside a student
project called Intelligent Personal Finance Assistant.

STRICT RULES (follow all of them):
1. Use ONLY the expense data supplied to you in the user turn below. Never invent, assume, or hallucinate transactions, amounts, or dates that are not present in the supplied data.
2. If the supplied data cannot answer the question (e.g. no expenses in a category, or empty data set), say so plainly instead of guessing.
3. Clearly separate factual calculations (which are computed from the real data given to you) from suggestions or opinions (which are informational only).
4. You are NOT a licensed or professional financial advisor. Do not give regulated financial, investment, tax, or legal advice. Keep suggestions practical and generic (e.g. budgeting habits, spending awareness).
5. Whenever you give budgeting suggestions, add a brief reminder that they are informational only and not professional financial advice.
6. Be concise, friendly, and use the currency symbol ₹ (Indian Rupees) for amounts.
7. If asked something entirely unrelated to the user's finances, politely redirect to finance-related topics.`;
}

/** Prompt: financial Q&A turn, with real expense context injected. */
export function buildAssistantUserPrompt(params: {
  question: string;
  monthLabel: string;
  budget: number | null;
  expenses: Pick<Expense, "amount" | "category" | "description" | "expense_date">[];
}) {
  const { question, monthLabel, budget, expenses } = params;
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return `Here is the user's real stored expense data for ${monthLabel} (JSON,
already fetched from the database — do not add anything not listed here):

Monthly budget: ${budget !== null ? `₹${budget}` : "not set"}
Total spent so far this month: ₹${total.toFixed(2)}
Number of transactions: ${expenses.length}
Expenses: ${JSON.stringify(expenses)}

User question: "${question}"

Answer the user's question using only the data above. If the data is empty
or insufficient, say so instead of fabricating an answer.`;
}

/** Prompt: monthly AI narrative summary (numbers are computed in code, not by the AI). */
export function buildMonthlySummaryPrompt(params: {
  monthLabel: string;
  totalSpending: number;
  topCategory: string | null;
  topCategoryPercentage: number | null;
  largestExpense: { amount: number; description: string; category: string } | null;
  budget: number | null;
  budgetStatus: string | null;
  previousMonthTotal: number | null;
  categoryDeltas: { category: string; changePercent: number }[];
}) {
  return `Write a short, friendly natural-language monthly spending summary for
"${params.monthLabel}" using ONLY the pre-calculated figures below (do not
recompute or alter any numbers — they were already calculated in code from
the real database):

Total spending: ₹${params.totalSpending.toFixed(2)}
Top category: ${params.topCategory ?? "N/A"} (${params.topCategoryPercentage ?? 0}% of spending)
Largest single expense: ${
    params.largestExpense
      ? `₹${params.largestExpense.amount} - ${params.largestExpense.description} (${params.largestExpense.category})`
      : "N/A"
  }
Monthly budget: ${params.budget !== null ? `₹${params.budget}` : "not set"}
Budget status: ${params.budgetStatus ?? "N/A"}
Previous month total: ${params.previousMonthTotal !== null ? `₹${params.previousMonthTotal.toFixed(2)}` : "N/A"}
Category changes vs previous month: ${JSON.stringify(params.categoryDeltas)}

Return ONLY a JSON object of this exact shape (no markdown fences):
{
  "narrative": "1-2 sentence friendly overview",
  "observations": ["3-5 short bullet observations, each referencing the numbers above"],
  "suggestions": ["2-4 short, practical, generic budgeting suggestions"]
}

Do not give regulated financial advice. Do not mention numbers that are not
in the data provided above.`;
}
