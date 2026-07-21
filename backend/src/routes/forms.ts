import { Router } from "express";
import { z } from "zod";
import { requireSession } from "../middleware/session";
import { nodeById, nodeIds } from "../services/roadmap";
import { sendSms } from "../clients/emessage";
import { sleep } from "../utils/http";

export const formsRouter = Router();

const SubmitBody = z.object({
  node_id: z.enum(nodeIds as [string, ...string[]]),
  form: z.record(z.string()),
});

function randomReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `LTO-${out}`;
}

// Simulated LTO sandbox — this endpoint never calls a real LTO system,
// so `simulated` is ALWAYS true in its response.
formsRouter.post("/forms/submit", requireSession, async (req, res, next) => {
  try {
    const { node_id } = SubmitBody.parse(req.body);
    const user = req.user!;
    const progress = user.roadmap[node_id];
    if (!progress || progress.status !== "active") {
      res.status(409).json({ ok: false, error: "Complete previous steps first" });
      return;
    }
    await sleep(800);
    const reference_no = randomReference();
    progress.status = "done";
    progress.reference_no = reference_no;
    const nextId = nodeIds[nodeIds.indexOf(node_id) + 1] ?? null;
    if (nextId) {
      const nextProgress = user.roadmap[nextId];
      if (nextProgress) nextProgress.status = "active";
    }
    const nodeTitle = nodeById(node_id)?.title ?? node_id;
    const nextTitle = nextId ? nodeById(nextId)?.title ?? nextId : "None — journey complete!";
    sendSms(
      user.profile.mobile_number,
      `GabAI: Your ${nodeTitle} application ${reference_no} was received. Next step: ${nextTitle}`
    );
    res.json({
      ok: true,
      data: {
        status: "SUBMITTED",
        reference_no,
        node_id,
        next_node_id: nextId,
        simulated: true,
      },
    });
  } catch (err) {
    next(err);
  }
});
