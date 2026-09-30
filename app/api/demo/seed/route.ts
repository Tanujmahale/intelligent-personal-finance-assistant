import { NextResponse } from "next/server";
import { getServerSupabase, getDemoUserId } from "@/lib/supabase/server";

/**
 * Loads clearly-labelled demo data for the fixed demo user. Mirrors
 * supabase/seed.sql so the "Load demo data" button in Settings works
 * without requiring the user to run SQL manually.
 */
export async function POST() {
  try {
    const supabase = getServerSupabase();
    const userId = getDemoUserId();

    await supabase.from("profiles").upsert({ id: userId, display_name: "Demo User", currency: "INR" });

    await supabase.from("expenses").delete().eq("user_id", userId);
    await supabase.from("budgets").delete().eq("user_id", userId);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const addDays = (base: Date, days: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };

    const demoExpenses = [
      { amount: 320, category: "Food", description: "Groceries - weekly shop (demo)", days: 1, payment_method: "UPI", source: "manual" },
      { amount: 450, category: "Food", description: "Dinner at restaurant (demo)", days: 2, payment_method: "Card", source: "ai" },
      { amount: 180, category: "Transport", description: "Cab ride to office (demo)", days: 2, payment_method: "UPI", source: "manual" },
      { amount: 2500, category: "Shopping", description: "New pair of shoes (demo)", days: 3, payment_method: "Card", source: "ai" },
      { amount: 999, category: "Entertainment", description: "Movie tickets + snacks (demo)", days: 4, payment_method: "UPI", source: "manual" },
      { amount: 3200, category: "Bills", description: "Electricity bill (demo)", days: 5, payment_method: "Net Banking", source: "manual" },
      { amount: 1200, category: "Healthcare", description: "Pharmacy + consultation (demo)", days: 6, payment_method: "Cash", source: "manual" },
      { amount: 1500, category: "Education", description: "Online course subscription (demo)", days: 7, payment_method: "Card", source: "manual" },
      { amount: 640, category: "Transport", description: "Fuel top-up (demo)", days: 8, payment_method: "Card", source: "manual" },
      { amount: 275, category: "Food", description: "Lunch with colleagues (demo)", days: 9, payment_method: "UPI", source: "manual" },
      { amount: 5200, category: "Travel", description: "Weekend trip - train + stay (demo)", days: 10, payment_method: "Net Banking", source: "manual" },
      { amount: 350, category: "Entertainment", description: "Streaming subscriptions (demo)", days: 11, payment_method: "Card", source: "manual" },
      { amount: 420, category: "Food", description: "Groceries top-up (demo)", days: 13, payment_method: "UPI", source: "manual" },
      { amount: 150, category: "Other", description: "Miscellaneous purchase (demo)", days: 14, payment_method: "Cash", source: "manual" },
    ].map((e) => ({
      user_id: userId,
      amount: e.amount,
      category: e.category,
      description: e.description,
      expense_date: addDays(monthStart, e.days),
      payment_method: e.payment_method,
      source: e.source,
    }));

    const { error: insertError } = await supabase.from("expenses").insert(demoExpenses);
    if (insertError) throw insertError;

    const { error: budgetError } = await supabase
      .from("budgets")
      .upsert(
        { user_id: userId, month: now.getMonth() + 1, year: now.getFullYear(), amount: 25000 },
        { onConflict: "user_id,month,year" }
      );
    if (budgetError) throw budgetError;

    return NextResponse.json({ success: true, count: demoExpenses.length });
  } catch (err) {
    console.error("POST /api/demo/seed error:", err);
    return NextResponse.json(
      { error: "Could not load demo data. Check that supabase/schema.sql has been run and your service role key is set." },
      { status: 500 }
    );
  }
}
