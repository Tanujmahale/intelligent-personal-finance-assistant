/**
 * Standalone demo-data seed script.
 * Run with: npm run seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your
 * environment (e.g. via a local .env.local loaded by your shell, or export
 * them before running). This performs the same inserts as the
 * "Load Demo Data" button in Settings / supabase/seed.sql.
 */
import { createClient } from "@supabase/supabase-js";

const DEMO_USER_ID =
  process.env.NEXT_PUBLIC_DEMO_USER_ID || "00000000-0000-0000-0000-000000000001";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.\n" +
        "Tip: export them in your shell, or run the SQL in supabase/seed.sql directly in the Supabase SQL Editor instead."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  await supabase
    .from("profiles")
    .upsert({ id: DEMO_USER_ID, display_name: "Demo User", currency: "INR" });

  await supabase.from("expenses").delete().eq("user_id", DEMO_USER_ID);
  await supabase.from("budgets").delete().eq("user_id", DEMO_USER_ID);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const iso = (days: number) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const demoExpenses = [
    { amount: 320, category: "Food", description: "Groceries - weekly shop (demo)", days: 1, payment_method: "UPI" },
    { amount: 450, category: "Food", description: "Dinner at restaurant (demo)", days: 2, payment_method: "Card" },
    { amount: 180, category: "Transport", description: "Cab ride to office (demo)", days: 2, payment_method: "UPI" },
    { amount: 2500, category: "Shopping", description: "New pair of shoes (demo)", days: 3, payment_method: "Card" },
    { amount: 999, category: "Entertainment", description: "Movie tickets + snacks (demo)", days: 4, payment_method: "UPI" },
    { amount: 3200, category: "Bills", description: "Electricity bill (demo)", days: 5, payment_method: "Net Banking" },
    { amount: 1200, category: "Healthcare", description: "Pharmacy + consultation (demo)", days: 6, payment_method: "Cash" },
    { amount: 1500, category: "Education", description: "Online course subscription (demo)", days: 7, payment_method: "Card" },
    { amount: 640, category: "Transport", description: "Fuel top-up (demo)", days: 8, payment_method: "Card" },
    { amount: 275, category: "Food", description: "Lunch with colleagues (demo)", days: 9, payment_method: "UPI" },
    { amount: 5200, category: "Travel", description: "Weekend trip - train + stay (demo)", days: 10, payment_method: "Net Banking" },
    { amount: 350, category: "Entertainment", description: "Streaming subscriptions (demo)", days: 11, payment_method: "Card" },
    { amount: 420, category: "Food", description: "Groceries top-up (demo)", days: 13, payment_method: "UPI" },
    { amount: 150, category: "Other", description: "Miscellaneous purchase (demo)", days: 14, payment_method: "Cash" },
  ].map((e) => ({
    user_id: DEMO_USER_ID,
    amount: e.amount,
    category: e.category,
    description: e.description,
    expense_date: iso(e.days),
    payment_method: e.payment_method,
    source: "manual",
  }));

  const { error: insertError } = await supabase.from("expenses").insert(demoExpenses);
  if (insertError) throw insertError;

  const { error: budgetError } = await supabase
    .from("budgets")
    .upsert(
      { user_id: DEMO_USER_ID, month: now.getMonth() + 1, year: now.getFullYear(), amount: 25000 },
      { onConflict: "user_id,month,year" }
    );
  if (budgetError) throw budgetError;

  console.log(`Seeded ${demoExpenses.length} demo expenses and a ₹25,000 budget for user ${DEMO_USER_ID}.`);
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
