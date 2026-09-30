import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, getDemoUserId } from "@/lib/supabase/server";
import { newExpenseSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const userId = getDemoUserId();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");
    const search = searchParams.get("search");

    let query = supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (month && year) {
      const m = Number(month);
      const y = Number(year);
      const start = new Date(y, m - 1, 1).toISOString().slice(0, 10);
      const end = new Date(y, m, 0).toISOString().slice(0, 10);
      query = query.gte("expense_date", start).lte("expense_date", end);
    }
    if (search) {
      query = query.ilike("description", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ expenses: data ?? [] });
  } catch (err) {
    console.error("GET /api/expenses error:", err);
    return NextResponse.json(
      { error: "Could not load expenses. Please check your database connection." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newExpenseSchema.safeParse({
      ...body,
      amount: Number(body.amount),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid expense data" },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();
    const userId = getDemoUserId();

    const { data, error } = await supabase
      .from("expenses")
      .insert({ ...parsed.data, user_id: userId, source: parsed.data.source ?? "manual" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ expense: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/expenses error:", err);
    return NextResponse.json(
      { error: "Could not save expense. Please try again." },
      { status: 500 }
    );
  }
}
