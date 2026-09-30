import { NextResponse } from "next/server";
import { getServerSupabase, getDemoUserId } from "@/lib/supabase/server";
import {
  getCategoryBreakdown,
  getTopCategory,
  getMonthlyTrend,
  sumAmounts,
  getBudgetStatus,
  getBudgetPercentageUsed,
} from "@/lib/calculations/finance";
import type { Expense, DashboardData } from "@/types";

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const userId = getDemoUserId();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    const trendStart = new Date(year, month - 6, 1).toISOString().slice(0, 10);

    const [{ data: monthExpenses, error: e1 }, { data: recent, error: e2 }, { data: trendExpenses, error: e3 }, { data: budgetRow }] =
      await Promise.all([
        supabase.from("expenses").select("*").eq("user_id", userId).gte("expense_date", start).lte("expense_date", end),
        supabase
          .from("expenses")
          .select("*")
          .eq("user_id", userId)
          .order("expense_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("expenses")
          .select("amount, expense_date")
          .eq("user_id", userId)
          .gte("expense_date", trendStart)
          .lte("expense_date", end),
        supabase.from("budgets").select("amount").eq("user_id", userId).eq("month", month).eq("year", year).maybeSingle(),
      ]);

    if (e1) throw e1;
    if (e2) throw e2;
    if (e3) throw e3;

    const expenses = (monthExpenses ?? []) as Expense[];
    const breakdown = getCategoryBreakdown(expenses);
    const totalSpendingThisMonth = sumAmounts(expenses);
    const monthlyBudget = budgetRow?.amount ?? 0;

    const data: DashboardData = {
      totalSpendingThisMonth,
      monthlyBudget,
      remainingBudget: monthlyBudget - totalSpendingThisMonth,
      budgetPercentageUsed: getBudgetPercentageUsed(totalSpendingThisMonth, monthlyBudget),
      budgetStatus: getBudgetStatus(totalSpendingThisMonth, monthlyBudget),
      transactionCount: expenses.length,
      topCategory: getTopCategory(breakdown),
      recentTransactions: (recent ?? []) as Expense[],
      categoryBreakdown: breakdown,
      monthlyTrend: getMonthlyTrend(trendExpenses ?? [], 6),
    };

    return NextResponse.json({ dashboard: data });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json(
      { error: "Could not load dashboard data. Please check your Supabase configuration." },
      { status: 500 }
    );
  }
}
