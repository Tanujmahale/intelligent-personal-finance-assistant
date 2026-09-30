import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, getDemoUserId } from "@/lib/supabase/server";
import { budgetSchema } from "@/lib/validation/schemas";
import { sumAmounts, getBudgetStatus, getBudgetPercentageUsed } from "@/lib/calculations/finance";

export async function GET(req: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const userId = getDemoUserId();
    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month")) || new Date().getMonth() + 1;
    const year = Number(searchParams.get("year")) || new Date().getFullYear();

    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);

    const [{ data: budgetRow, error: bErr }, { data: expenses, error: eErr }] = await Promise.all([
      supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle(),
      supabase.from("expenses").select("amount").eq("user_id", userId).gte("expense_date", start).lte("expense_date", end),
    ]);

    if (bErr) throw bErr;
    if (eErr) throw eErr;

    const budgetAmount = budgetRow?.amount ?? 0;
    const spent = sumAmounts(expenses ?? []);

    return NextResponse.json({
      budget: budgetRow ?? null,
      spent,
      remaining: budgetAmount - spent, // negative when over budget
      percentageUsed: getBudgetPercentageUsed(spent, budgetAmount),
      status: getBudgetStatus(spent, budgetAmount),
    });
  } catch (err) {
    console.error("GET /api/budget error:", err);
    return NextResponse.json(
      { error: "Could not load budget. Please check your database connection." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = budgetSchema.safeParse({
      month: Number(body.month),
      year: Number(body.year),
      amount: Number(body.amount),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid budget data" },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();
    const userId = getDemoUserId();

    const { data, error } = await supabase
      .from("budgets")
      .upsert(
        { ...parsed.data, user_id: userId },
        { onConflict: "user_id,month,year" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ budget: data });
  } catch (err) {
    console.error("POST /api/budget error:", err);
    return NextResponse.json(
      { error: "Could not save budget. Please try again." },
      { status: 500 }
    );
  }
}
