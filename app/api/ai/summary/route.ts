import { NextResponse } from "next/server";
import { callGemini, cleanJsonResponse, isGeminiConfigured, GeminiNotConfiguredError } from "@/lib/ai/gemini";
import { buildMonthlySummaryPrompt } from "@/lib/ai/prompts";
import { aiSummarySchema } from "@/lib/validation/schemas";
import { getServerSupabase, getDemoUserId } from "@/lib/supabase/server";
import {
  getCategoryBreakdown,
  getTopCategory,
  getHighestExpense,
  getBudgetStatus,
  sumAmounts,
  getMonthLabel,
  percentChange,
} from "@/lib/calculations/finance";
import type { Expense } from "@/types";

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const userId = getDemoUserId();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevStart = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const prevEnd = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const [{ data: currentExpenses, error: e1 }, { data: prevExpenses, error: e2 }, { data: budgetRow }] =
      await Promise.all([
        supabase.from("expenses").select("*").eq("user_id", userId).gte("expense_date", start).lte("expense_date", end),
        supabase.from("expenses").select("*").eq("user_id", userId).gte("expense_date", prevStart).lte("expense_date", prevEnd),
        supabase
          .from("budgets")
          .select("amount")
          .eq("user_id", userId)
          .eq("month", now.getMonth() + 1)
          .eq("year", now.getFullYear())
          .maybeSingle(),
      ]);

    if (e1) throw e1;
    if (e2) throw e2;

    const expenses = (currentExpenses ?? []) as Expense[];
    const previous = (prevExpenses ?? []) as Expense[];

    const breakdown = getCategoryBreakdown(expenses);
    const prevBreakdown = getCategoryBreakdown(previous);
    const top = getTopCategory(breakdown);
    const highest = getHighestExpense(expenses);
    const totalSpending = sumAmounts(expenses);
    const previousTotal = sumAmounts(previous);
    const budget = budgetRow?.amount ?? null;
    const status = budget !== null ? getBudgetStatus(totalSpending, budget) : null;

    const categoryDeltas = breakdown.slice(0, 5).map((b) => {
      const prev = prevBreakdown.find((p) => p.category === b.category);
      return {
        category: b.category,
        changePercent: percentChange(b.total, prev?.total ?? 0),
      };
    });

    const calculated = {
      totalSpending,
      topCategory: top?.category ?? null,
      topCategoryPercentage: top?.percentage ?? null,
      largestExpense: highest
        ? { amount: Number(highest.amount), description: highest.description, category: highest.category }
        : null,
      budget,
      budgetStatus: status,
      previousMonthTotal: previous.length > 0 ? previousTotal : null,
      categoryDeltas,
    };

    if (!isGeminiConfigured()) {
      // Local fallback: still return the real calculated numbers, just
      // without an AI-generated narrative.
      return NextResponse.json({
        calculated,
        ai: null,
        aiUnavailable: true,
        message: "Gemini API key is not configured. Add GEMINI_API_KEY to .env.local to enable AI features.",
      });
    }

    const prompt = buildMonthlySummaryPrompt({
      monthLabel: getMonthLabel(now.getMonth() + 1, now.getFullYear()),
      ...calculated,
    });

    try {
      const raw = await callGemini({ userPrompt: prompt, jsonMode: true });
      const cleaned = cleanJsonResponse(raw);
      const parsedJson = JSON.parse(cleaned);
      const validated = aiSummarySchema.safeParse(parsedJson);

      if (!validated.success) {
        return NextResponse.json({
          calculated,
          ai: null,
          aiUnavailable: true,
          message: "The AI summary response was invalid, showing calculated figures only.",
        });
      }

      return NextResponse.json({ calculated, ai: validated.data, aiUnavailable: false });
    } catch (aiErr) {
      console.error("AI summary generation failed:", aiErr);
      return NextResponse.json({
        calculated,
        ai: null,
        aiUnavailable: true,
        message: "AI summary generation failed. Showing calculated figures only.",
      });
    }
  } catch (err) {
    console.error("GET /api/ai/summary error:", err);
    return NextResponse.json(
      { error: "Could not generate the monthly summary. Please check your database connection." },
      { status: 500 }
    );
  }
}
