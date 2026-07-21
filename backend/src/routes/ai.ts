import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";
import { z } from "zod";
import { anthropicConfigured, claudeChat, ChatTurn } from "../clients/claude";
import { requireSession } from "../middleware/session";
import { answerFromKnowledgeBase } from "../services/knowledgeBase";
import { nodeById, orderedNodes } from "../services/roadmap";

export const aiRouter = Router();

const ChatBody = z.object({
  prompt: z.string().min(1).max(500),
  node_id: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .max(12)
    .optional(),
});

aiRouter.post("/ai/chat", requireSession, async (req, res, next) => {
  try {
    const { prompt, node_id, history = [] } = ChatBody.parse(req.body);
    const user = req.user!;
    const nodeTitle = node_id ? nodeById(node_id)?.title : undefined;
    const routeContext = orderedNodes
      .map(
        (n) =>
          `${n.order}. ${n.title} (${n.fee_php > 0 ? `₱${n.fee_php}` : "free"}) — ${
            user.roadmap[n.id]?.status ?? "locked"
          }`
      )
      .join("; ");

    const system = [
      "You are HaviFlow, a warm, concise copilot for Philippine government services.",
      "Answer questions about PH government processes practically in 2-5 sentences; use short Markdown lists when steps help.",
      "The app shows an interactive driver's-license route panel on the left — refer citizens there for that journey instead of re-listing all its steps.",
      "Do not invent exact fees beyond common public knowledge; when unsure, say so and point to the official source.",
      `The citizen is ${user.profile.first_name}, identity verified via their Digital National ID (Once-Only Policy).`,
      `Driver's-license route stations and their status: ${routeContext}.`,
      `The citizen is currently at step: ${nodeTitle ?? "starting out"}.`,
    ].join("\n");

    // The messages array must start with a user turn — drop any leading
    // assistant greeting the browser included.
    const firstUserIndex = history.findIndex((turn) => turn.role === "user");
    const turns: ChatTurn[] = [
      ...(firstUserIndex === -1 ? [] : history.slice(firstUserIndex)),
      { role: "user", content: prompt },
    ];

    // No API key → answer from the offline knowledge base (marked simulated
    // so the sandbox badge shows) instead of failing.
    if (!anthropicConfigured()) {
      console.warn("[claude] not configured — answering from the offline knowledge base");
      res.json({ ok: true, data: { text: answerFromKnowledgeBase(prompt).text, simulated: true } });
      return;
    }

    try {
      const text = await claudeChat(system, turns);
      res.json({ ok: true, data: { text, simulated: false } });
    } catch (err) {
      // API errors also degrade to the knowledge base — the copilot always answers.
      if (err instanceof Anthropic.APIError) {
        console.error(`[claude] API error ${err.status ?? "network"}: ${err.message} — degrading to knowledge base`);
        res.json({ ok: true, data: { text: answerFromKnowledgeBase(prompt).text, simulated: true } });
        return;
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});
