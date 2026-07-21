import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const boolFlag = z.enum(["true", "false"]).transform((v) => v === "true");

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().min(1),

  SSO_BASE_URL: z.string().min(1),
  SSO_PARTNER_CODE: z.string().min(1),
  SSO_PARTNER_SECRET: z.string().min(1),
  // Required by the live SSO /api/token despite being absent from the spec;
  // set it to the value given in the official hackathon SSO docs.
  SSO_SCOPE: z.string().optional(),

  EVERIFY_BASE_URL: z.string().min(1),
  EVERIFY_CLIENT_ID: z.string().min(1),
  EVERIFY_CLIENT_SECRET: z.string().min(1),

  // AI copilot — Anthropic API. When the key is absent here, the SDK still
  // falls back to ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN in the shell env.
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-opus-4-8"),

  EMESSAGE_BASE_URL: z.string().min(1),
  EMESSAGE_TOKEN: z.string().min(1),

  SSO_MOCK: boolFlag,
  EVERIFY_MOCK: boolFlag,
  SMS_MOCK: boolFlag,
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  for (const issue of parsed.error.issues) {
    console.error(`[ENV] Missing: ${issue.path.join(".")}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof EnvSchema>;
