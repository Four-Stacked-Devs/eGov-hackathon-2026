import { Router } from "express";
import { env } from "../env";
import { everifyTokens } from "../clients/everify";
import { aiCredits, egovaiTokens } from "../clients/egovai";
import { users } from "../store";

export const adminRouter = Router();

// Dev-only status endpoint — intentionally unauthenticated and unlinked in the UI.
adminRouter.get("/admin/status", async (_req, res) => {
  res.json({
    ok: true,
    data: {
      tokens: {
        // SSO access tokens are one-time per citizen sign-in — never cached.
        sso: { cached: false, expires_in_s: null },
        everify: everifyTokens.status(),
        egovai: egovaiTokens.status(),
      },
      mocks: {
        SSO_MOCK: env.SSO_MOCK,
        EVERIFY_MOCK: env.EVERIFY_MOCK,
        AI_MOCK: env.AI_MOCK,
        SMS_MOCK: env.SMS_MOCK,
      },
      egovai_credits_remaining: await aiCredits(),
      users_in_memory: users.size,
    },
  });
});
