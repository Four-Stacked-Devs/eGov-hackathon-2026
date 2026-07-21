import { Router } from "express";
import { env } from "../env";
import { anthropicConfigured } from "../clients/claude";
import { everifyTokens } from "../clients/everify";
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
      },
      mocks: {
        SSO_MOCK: env.SSO_MOCK,
        EVERIFY_MOCK: env.EVERIFY_MOCK,
        SMS_MOCK: env.SMS_MOCK,
      },
      ai: {
        provider: "anthropic",
        model: env.ANTHROPIC_MODEL,
        configured: anthropicConfigured(),
      },
      users_in_memory: users.size,
    },
  });
});
