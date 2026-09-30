import { NextRequest, NextResponse } from "next/server";
import { callGemini, isGeminiConfigured, GeminiNotConfiguredError } from "@/lib/ai/gemini";
import { buildAssistantSystemPrompt, buildAssistantUserPrompt } from "@/lib/ai/prompts";
import { chatRequestSchema } from "@/lib/validation/schemas";
import { getServerSupabase, getDemoUserId } from "@/lib/supabase/server";
import { getMonthLabel } from "@/lib/calculations/finance";

export async function POST(req: NextRequest) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Add GEMINI_API_KEY to .env.local to enable AI features." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid question" },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();
    const userId = getDemoUserId();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const [{ data: expenses, error: expError }, { data: budgetRow }] = await Promise.all([
      supabase
        .from("expenses")
        .select("amount, category, description, expense_date")
        .eq("user_id", userId)
        .gte("expense_date", start)
        .lte("expense_date", end)
        .order("expense_date", { ascending: false }),
      supabase
        .from("budgets")
        .select("amount")
        .eq("user_id", userId)
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .maybeSingle(),
    ]);

    if (expError) throw expError;

    const userPrompt = buildAssistantUserPrompt({
      question: parsed.data.question,
      monthLabel: getMonthLabel(now.getMonth() + 1, now.getFullYear()),
      budget: budgetRow?.amount ?? null,
      expenses: expenses ?? [],
    });

    const answer = await callGemini({
      systemPrompt: buildAssistantSystemPrompt(),
      userPrompt,
    });

    return NextResponse.json({ answer: answer.trim() });
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("POST /api/ai/chat error:", err);
    return NextResponse.json(
      { error: "The assistant could not respond right now. Please try again." },
      { status: 500 }
    );
  }
}
