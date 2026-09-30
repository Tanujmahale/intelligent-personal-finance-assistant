import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super(
      "Gemini API key is not configured. Add GEMINI_API_KEY to .env.local to enable AI features."
    );
    this.name = "GeminiNotConfiguredError";
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Calls Gemini with a system instruction + user prompt and returns the raw
 * text response. Throws GeminiNotConfiguredError if no API key is set, and
 * a plain Error (with a friendly message) on any API failure, so callers
 * can surface a clean message instead of crashing the route.
 */
export async function callGemini(params: {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode?: boolean;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiNotConfiguredError();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      systemInstruction: params.systemPrompt,
      generationConfig: params.jsonMode
        ? { responseMimeType: "application/json" }
        : undefined,
    });

    const result = await model.generateContent(params.userPrompt);
    const text = result.response.text();
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return text;
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) throw err;
    console.error("Gemini API error:", err);
    throw new Error(
      "The AI service is temporarily unavailable. Please try again in a moment."
    );
  }
}

/** Strips ```json fences if the model added them despite instructions not to. */
export function cleanJsonResponse(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}
