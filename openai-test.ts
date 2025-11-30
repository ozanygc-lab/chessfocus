import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "ping" }],
    });

    const content = response.choices[0]?.message?.content;
    console.log("SUCCESS");
    console.log("Response:", content);
  } catch (error) {
    console.log("ERROR");
    console.log("Full error:", error);
  }
}

test();

