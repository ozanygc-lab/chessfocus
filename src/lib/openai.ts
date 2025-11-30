import OpenAI from "openai";

// Lazy initialization - only create client when needed (at runtime, not build time)
// This prevents build errors when OPENAI_API_KEY is not available during build
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  // Only check API key when actually using the client (at runtime)
  // This allows the module to be imported during build without errors
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }
    
    openaiInstance = new OpenAI({
      apiKey: apiKey,
      // If I later want to use project/org ids, I will extend this,
      // but for now only apiKey must be used.
    });
  }
  
  return openaiInstance;
}

// Export openai with lazy initialization
// The client is only created when chat.completions.create() is called
export const openai = {
  get chat() {
    return getOpenAI().chat;
  },
} as OpenAI;

export const OPENAI_MODEL =
  process.env.OPENAI_MODEL || "gpt-4o-mini";
