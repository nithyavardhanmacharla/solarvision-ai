import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export const GEMINI_MODEL_FAST = "gemini-3.6-flash";
export const GEMINI_MODEL_ALT = "gemini-3.1-pro-preview";

export function isGeminiKeyConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== "dummy-key" && apiKey.trim().length > 5);
}

export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing. AI features will fallback to deterministic engines.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "solarvision-ai",
        },
      },
    });
  }
  return aiInstance;
}
