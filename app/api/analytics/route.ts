import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, getDemoUserId } from "@/lib/supabase/server";
import {
  getCategoryBreakdown,
  getHighestExpense,
  getAverageDailySpending,
  getMonthlyTrend,
  sumAmounts,
  daysElapsedInCurrentMonth,
} from "@/lib/calculations/finance";
import type { Expense, AnalyticsSummary } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const userId = getDemoUserId();
    const { searchParams } = new URL(req.url);

    const month = Number(searchParams.get("month")) || new Date().getMonth() + 1;
    const year = Number(searchParams.get("year")) || new Date().getFullYear();

    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);

    // Last 6 months of data for the trend chart.
    const trendStart = new Date(year, month - 6, 1).toISOString().slice(0, 10);

    const [{ data: monthExpenses, error: e1 }, { data: trendExpenses, error: e2 }] = await Promise.all([
      supabase.from("expenses").select("*").eq("user_id", userId).gte("expense_date", start).lte("expense_date", end),
      supabase
        .from("expenses")
        .select("amount, expense_date")
        .eq("user_id", userId)
        .gte("expense_date", trendStart)
        .lte("expense_date", end),
    ]);

    if (e1) throw e1;
    if (e2) throw e2;

    const expenses = (monthExpenses ?? []) as Expense[];
    const isCurrentMonth =
      month === new Date().getMonth() + 1 && year === new Date().getFullYear();

    const summary: AnalyticsSummary = {
      totalSpending: sumAmounts(expenses),
      transactionCount: expenses.length,
      averageDailySpending: getAverageDailySpending(
        expenses,
        isCurrentMonth ? daysElapsedInCurrentMonth() : new Date(year, month, 0).getDate()
      ),
      highestExpense: getHighestExpense(expenses),
      categoryBreakdown: getCategoryBreakdown(expenses),
      monthlyTrend: getMonthlyTrend(trendExpenses ?? [], 6, new Date(year, month - 1, 1)),
    };

    return NextResponse.json({ analytics: summary });
  } catch (err) {
    console.error("GET /api/analytics error:", err);
    return NextResponse.json(
      { error: "Could not load analytics. Please check your database connection." },
      { status: 500 }
    );
  }
}
