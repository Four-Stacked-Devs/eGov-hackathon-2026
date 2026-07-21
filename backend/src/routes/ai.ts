import { Router } from "express";
import { z } from "zod";
import { env } from "../env";
import { aiGenerate } from "../clients/egovai";
import { mockAiReply } from "../mocks/fixtures";
import { requireSession } from "../middleware/session";
import { nodeById } from "../services/roadmap";
import { isNetworkOrTimeout } from "../utils/http";

export const aiRouter = Router();

const ChatBody = z.object({
  prompt: z.string().min(1).max(500),
  node_id: z.string().optional(),
});

// Stateless: no conversation history is stored or sent — only the current
// node name travels as context.
aiRouter.post("/ai/chat", requireSession, async (req, res, next) => {
  try {
    const { prompt, node_id } = ChatBody.parse(req.body);
    const nodeTitle = node_id ? nodeById(node_id)?.title : undefined;
    const constructed = [
      "You are a Philippine government services guide helping a citizen get a driver's license.",
      `The citizen is currently at step: ${nodeTitle ?? "starting out"}.`,
      "Answer concisely with official requirements and fees where known.",
      `Citizen question: ${prompt}`,
    ].join("\n");

    if (env.AI_MOCK) {
      res.json({ ok: true, data: { text: mockAiReply(prompt), simulated: true } });
      return;
    }
    try {
      const { text, credits_remaining } = await aiGenerate(constructed);
      res.json({
        ok: true,
        data: {
          text,
          ...(credits_remaining !== undefined ? { credits_remaining } : {}),
          simulated: false,
        },
      });
    } catch (err) {
      if (!isNetworkOrTimeout(err)) throw err;
      console.warn("[egovai] gov API unreachable — degrading to fixture");
      res.json({ ok: true, data: { text: mockAiReply(prompt), simulated: true } });
    }
  } catch (err) {
    next(err);
  }
});
