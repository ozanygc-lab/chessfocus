import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  // If I later want to use project/org ids, I will extend this,
  // but for now only apiKey must be used.
});

export const OPENAI_MODEL =
  process.env.OPENAI_MODEL || "gpt-4o-mini";
