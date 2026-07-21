import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env";

// The Anthropic SDK resolves credentials from ANTHROPIC_API_KEY /
// ANTHROPIC_AUTH_TOKEN when no explicit key is passed.
const client = new Anthropic({
  ...(env.ANTHROPIC_API_KEY ? { apiKey: env.ANTHROPIC_API_KEY } : {}),
  timeout: 30_000, // ms — keep chat snappy; a hung request shouldn't stall the UI
  maxRetries: 1,
});

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export function anthropicConfigured(): boolean {
  return Boolean(
    env.ANTHROPIC_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.ANTHROPIC_AUTH_TOKEN
  );
}

export async function claudeChat(system: string, turns: ChatTurn[]): Promise<string> {
  const response = await client.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 1024, // deliberately short — chat-bubble answers
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system,
    messages: turns,
  });
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Claude returned a response with no text content");
  return text;
}
