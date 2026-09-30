import { NextRequest, NextResponse } from "next/server";
import { callGemini, cleanJsonResponse, isGeminiConfigured, GeminiNotConfiguredError } from "@/lib/ai/gemini";
import { buildExtractionPrompt } from "@/lib/ai/prompts";
import { extractedExpenseSchema } from "@/lib/validation/schemas";
import { todayIso } from "@/lib/utils/format";

export async function POST(req: NextRequest) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Add GEMINI_API_KEY to .env.local to enable AI features." },
        { status: 503 }
      );
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Please enter a description of your expense." }, { status: 400 });
    }

    const prompt = buildExtractionPrompt(text.trim(), todayIso());
    const raw = await callGemini({ userPrompt: prompt, jsonMode: true });
    const cleaned = cleanJsonResponse(raw);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "The AI response could not be understood. Please try rephrasing, or enter the expense manually." },
        { status: 502 }
      );
    }

    // Never trust AI output blindly — validate with Zod before returning it.
    const validated = extractedExpenseSchema.safeParse(parsedJson);
    if (!validated.success) {
      return NextResponse.json(
        { error: "The AI response was incomplete or invalid. Please review the fields manually.", raw: parsedJson },
        { status: 422 }
      );
    }

    return NextResponse.json({ extracted: validated.data });
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("POST /api/ai/extract error:", err);
    return NextResponse.json(
      { error: "AI extraction failed. Please try again or enter the expense manually." },
      { status: 500 }
    );
  }
}
