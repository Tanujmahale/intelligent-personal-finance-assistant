import { NextRequest, NextResponse } from "next/server";
import { callGemini, cleanJsonResponse, isGeminiConfigured, GeminiNotConfiguredError } from "@/lib/ai/gemini";
import { buildCategorizationPrompt } from "@/lib/ai/prompts";
import { categorizationSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Add GEMINI_API_KEY to .env.local to enable AI features." },
        { status: 503 }
      );
    }

    const { description } = await req.json();
    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json({ error: "Please enter a description." }, { status: 400 });
    }

    const prompt = buildCategorizationPrompt(description.trim());
    const raw = await callGemini({ userPrompt: prompt, jsonMode: true });
    const cleaned = cleanJsonResponse(raw);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Could not determine a category. Please choose one manually." }, { status: 502 });
    }

    const validated = categorizationSchema.safeParse(parsedJson);
    if (!validated.success) {
      return NextResponse.json({ error: "Could not determine a category. Please choose one manually." }, { status: 422 });
    }

    return NextResponse.json({ suggestion: validated.data });
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("POST /api/ai/categorize error:", err);
    return NextResponse.json({ error: "AI categorization failed. Please choose a category manually." }, { status: 500 });
  }
}
