import axios from "axios";
import { Router } from "express";
import { z } from "zod";
import { aiGenerate } from "../clients/egovai";
import { requireSession } from "../middleware/session";
import { answerFromKnowledgeBase } from "../services/knowledgeBase";
import { nodeById } from "../services/roadmap";

export const aiRouter = Router();

const ChatBody = z.object({
  prompt: z.string().min(1).max(500),
  node_id: z.string().optional(),
});

aiRouter.post("/ai/chat", requireSession, async (req, res, next) => {
  try {
    const { prompt, node_id } = ChatBody.parse(req.body);
    const kb = answerFromKnowledgeBase(prompt);

    // Only driver's-license conversations spend eGov AI credits; every other
    // known topic answers from the offline knowledge base, and unknown
    // topics get the unavailable message.
    const isDriversLicense = kb.topic?.startsWith("dl_") ?? false;
    if (!isDriversLicense) {
      res.json({ ok: true, data: { text: kb.text, simulated: true } });
      return;
    }

    const nodeTitle = node_id ? nodeById(node_id)?.title : undefined;
    const constructed = [
      "You are a Philippine government services guide helping a citizen get a driver's license.",
      `The citizen is currently at step: ${nodeTitle ?? "starting out"}.`,
      "Answer concisely with official requirements and fees where known.",
      `Citizen question: ${prompt}`,
    ].join("\n");

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
      // eGov AI unreachable/errored — the roadmap-derived answer still ships.
      console.error(
        "[egovai] chat failed — degrading to knowledge base:",
        axios.isAxiosError(err)
          ? `${err.response?.status ?? err.code}`
          : err instanceof Error
            ? err.message
            : err
      );
      res.json({ ok: true, data: { text: kb.text, simulated: true } });
    }
  } catch (err) {
    next(err);
  }
});
