import type {
  Expense,
  ExpenseCategory,
  CategoryBreakdown,
  MonthlyTrendPoint,
  BudgetStatus,
} from "@/types";

/** All financial math lives here, in code — never delegated to the AI. */

export function sumAmounts(expenses: { amount: number }[]): number {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

export function getCategoryBreakdown(
  expenses: Pick<Expense, "amount" | "category">[]
): CategoryBreakdown[] {
  const total = sumAmounts(expenses);
  const map = new Map<ExpenseCategory, { total: number; count: number }>();

  for (const e of expenses) {
    const cur = map.get(e.category) || { total: 0, count: 0 };
    cur.total += Number(e.amount);
    cur.count += 1;
    map.set(e.category, cur);
  }

  return Array.from(map.entries())
    .map(([category, { total: catTotal, count }]) => ({
      category,
      total: round2(catTotal),
      count,
      percentage: total > 0 ? round2((catTotal / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getTopCategory(
  breakdown: CategoryBreakdown[]
): CategoryBreakdown | null {
  return breakdown.length > 0 ? breakdown[0]! : null;
}

export function getHighestExpense(expenses: Expense[]): Expense | null {
  if (expenses.length === 0) return null;
  return expenses.reduce((max, e) =>
    Number(e.amount) > Number(max.amount) ? e : max
  );
}

export function getAverageDailySpending(
  expenses: { amount: number }[],
  daysElapsedInMonth: number
): number {
  if (daysElapsedInMonth <= 0) return 0;
  return round2(sumAmounts(expenses) / daysElapsedInMonth);
}

/** Builds a month->total trend for the last N months (including the current one). */
export function getMonthlyTrend(
  expenses: Pick<Expense, "amount" | "expense_date">[],
  monthsBack = 6,
  reference: Date = new Date()
): MonthlyTrendPoint[] {
  const buckets: { key: string; label: string; total: number }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    buckets.push({ key, label, total: 0 });
  }

  const byKey = new Map(buckets.map((b) => [b.key, b]));

  for (const e of expenses) {
    const d = new Date(e.expense_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.total += Number(e.amount);
  }

  return buckets.map((b) => ({ month: b.label, total: round2(b.total) }));
}

export function getBudgetStatus(
  spent: number,
  budget: number
): BudgetStatus {
  if (budget <= 0) return "Under Budget";
  const pct = (spent / budget) * 100;
  if (pct >= 100) return "Over Budget";
  if (pct >= 80) return "Near Limit";
  return "Under Budget";
}

export function getBudgetPercentageUsed(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return round2(Math.min((spent / budget) * 100, 999));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function daysElapsedInCurrentMonth(reference: Date = new Date()): number {
  return reference.getDate();
}

export function getMonthLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return round2(((current - previous) / previous) * 100);
}
