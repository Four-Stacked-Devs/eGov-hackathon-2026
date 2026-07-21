import { Router } from "express";
import { requireSession } from "../middleware/session";
import { computeSummary, orderedNodes, roadmapDefinition } from "../services/roadmap";

export const roadmapRouter = Router();

roadmapRouter.get("/roadmap", requireSession, (req, res) => {
  const user = req.user!;
  const nodes = orderedNodes.map((node) => ({
    ...node,
    status: user.roadmap[node.id]?.status ?? "locked",
    reference_no: user.roadmap[node.id]?.reference_no ?? null,
  }));
  res.json({
    ok: true,
    data: {
      journey_id: roadmapDefinition.journey_id,
      title: roadmapDefinition.title,
      subtitle: roadmapDefinition.subtitle,
      nodes,
      summary: computeSummary(orderedNodes),
    },
  });
});
