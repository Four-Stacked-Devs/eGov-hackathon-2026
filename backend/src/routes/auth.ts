import axios from "axios";
import { Router } from "express";
import { z } from "zod";
import { env } from "../env";
import { ssoAuthenticate } from "../clients/sso";
import {
  everifyQuery,
  EverifyQueryData,
  EverifyQueryPayload,
  isVerified,
} from "../clients/everify";
import { sendSms } from "../clients/emessage";
import {
  FIXTURE_EVERIFY_PROFILE,
  FIXTURE_SSO_PROFILE,
  matchesEverifyFixture,
} from "../mocks/fixtures";
import { createSession, findOrCreateUser, SanitizedProfile } from "../store";
import { initialProgress } from "../services/roadmap";
import { requireSession, setSessionCookie } from "../middleware/session";
import { isNetworkOrTimeout } from "../utils/http";

export const authRouter = Router();

const SsoBody = z.object({ exchange_code: z.string().min(1) });

const VerifyBody = z.object({
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  suffix: z.string().optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  session_id: z.string().uuid(),
});
type VerifyBodyT = z.infer<typeof VerifyBody>;

function firstString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return null;
}

/** The live SSO returns birth_date as MM/DD/YYYY — normalize to YYYY-MM-DD. */
function normalizeBirthDate(value: string | null): string {
  if (!value) return "";
  const mdy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1]}-${mdy[2]}`;
  return value;
}

/**
 * Maps the sso_authentication profile (per the sandbox OpenAPI: uniqid,
 * first/middle/last name, suffix, gender, birth_date, email, mobile,
 * address, …) defensively; unknown fields are ignored.
 */
function mapSsoProfile(raw: Record<string, unknown>): SanitizedProfile {
  const source = (
    raw.data && typeof raw.data === "object" ? raw.data : raw
  ) as Record<string, unknown>;
  const first_name = firstString(source, ["first_name", "firstname", "given_name"]) ?? "";
  const middle_name = firstString(source, ["middle_name", "middlename"]);
  const last_name = firstString(source, ["last_name", "lastname", "surname", "family_name"]) ?? "";
  const suffix = firstString(source, ["suffix"]);
  const full_name =
    firstString(source, ["full_name", "name"]) ??
    [first_name, middle_name, last_name, suffix].filter(Boolean).join(" ");
  return {
    full_name,
    first_name,
    middle_name,
    last_name,
    suffix,
    gender: firstString(source, ["gender", "sex"]),
    birth_date: normalizeBirthDate(firstString(source, ["birth_date", "birthdate", "birthday"])),
    mobile_number: firstString(source, ["mobile_number", "contact_number", "mobile", "phone"]),
    email: firstString(source, ["email"]),
    full_address: firstString(source, ["full_address", "address"]),
    marital_status: firstString(source, ["marital_status"]),
  };
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** NEVER return data.token, data.reference, or data.face_url to the frontend. */
function sanitizeEverifyProfile(data: EverifyQueryData): SanitizedProfile {
  const first_name = str(data.first_name) ?? "";
  const last_name = str(data.last_name) ?? "";
  const full_name =
    str(data.full_name) ??
    [first_name, str(data.middle_name), last_name, str(data.suffix)]
      .filter(Boolean)
      .join(" ");
  return {
    full_name,
    first_name,
    middle_name: str(data.middle_name),
    last_name,
    suffix: str(data.suffix),
    gender: str(data.gender),
    birth_date: str(data.birth_date) ?? "",
    mobile_number: str(data.mobile_number),
    email: str(data.email),
    full_address: str(data.full_address),
    marital_status: str(data.marital_status),
  };
}

authRouter.post("/auth/sso", async (req, res, next) => {
  try {
    const { exchange_code } = SsoBody.parse(req.body);
    let raw: Record<string, unknown>;
    let simulated: boolean;
    if (env.SSO_MOCK) {
      raw = FIXTURE_SSO_PROFILE;
      simulated = true;
    } else {
      try {
        raw = await ssoAuthenticate(exchange_code);
        simulated = false;
      } catch (err) {
        if (isNetworkOrTimeout(err)) {
          console.warn("[sso] gov API unreachable — degrading to fixture");
          raw = FIXTURE_SSO_PROFILE;
          simulated = true;
        } else if (axios.isAxiosError(err) && err.response && err.response.status < 500) {
          // A real exchange_code only exists when the eGovPH app initiated
          // the redirect — rejected/expired codes get a clear message.
          console.error(
            `[sso] rejected sign-in (${err.response.status}): ${JSON.stringify(err.response.data ?? null)}`
          );
          res.status(422).json({
            ok: false,
            error: "This eGovPH sign-in link is invalid or expired.",
            hint: "Start from the eGovPH app, or use Face Verification instead.",
          });
          return;
        } else {
          throw err;
        }
      }
    }
    const user = findOrCreateUser(mapSsoProfile(raw), initialProgress());
    setSessionCookie(res, createSession(user));
    res.json({ ok: true, data: { user: user.profile, simulated } });
  } catch (err) {
    next(err);
  }
});

function buildQueryPayload(body: VerifyBodyT): EverifyQueryPayload {
  const payload: EverifyQueryPayload = {
    first_name: body.first_name,
    last_name: body.last_name,
    birth_date: body.birth_date,
    face_liveness_session_id: body.session_id,
  };
  // Optional fields: OMIT the key entirely when empty — never send "".
  if (body.middle_name && body.middle_name.trim() !== "") payload.middle_name = body.middle_name;
  if (body.suffix && body.suffix.trim() !== "") payload.suffix = body.suffix;
  return payload;
}

authRouter.post("/auth/verify", async (req, res, next) => {
  try {
    const body = VerifyBody.parse(req.body);
    // The fixture only verifies the one demo identity — anyone else gets
    // the same rejection a real PhilSys mismatch would produce.
    const rejectAsMismatch = () => {
      res.status(422).json({
        ok: false,
        error: "We couldn't match those details with PhilSys.",
        hint: "Check spelling and birth date.",
      });
    };
    let data: EverifyQueryData;
    let simulated: boolean;
    if (env.EVERIFY_MOCK) {
      if (!matchesEverifyFixture(body)) {
        rejectAsMismatch();
        return;
      }
      data = FIXTURE_EVERIFY_PROFILE;
      simulated = true;
    } else {
      try {
        data = await everifyQuery(buildQueryPayload(body));
        simulated = false;
      } catch (err) {
        if (isNetworkOrTimeout(err)) {
          if (!matchesEverifyFixture(body)) {
            console.warn("[everify] gov API unreachable and details don't match the demo fixture — rejecting");
            rejectAsMismatch();
            return;
          }
          console.warn("[everify] gov API unreachable — degrading to fixture");
          data = FIXTURE_EVERIFY_PROFILE;
          simulated = true;
        } else if (axios.isAxiosError(err) && err.response && err.response.status < 500) {
          const upstream = err.response.data as Record<string, unknown> | null;
          if (matchesEverifyFixture(body)) {
            // Failsafe: the demo identity must never fail on stage, even
            // when the live API rejects the scan.
            console.warn(
              `[everify] live API rejected the demo identity (${err.response.status}) — failsafe fixture engaged: ${JSON.stringify(upstream ?? null)}`
            );
            data = FIXTURE_EVERIFY_PROFILE;
            simulated = true;
          } else {
            // The live API reports failures as 4xx with citizen-readable
            // messages (e.g. "Face liveness encountered an error.") —
            // pass those through instead of a generic error.
            console.error(
              `[everify] rejected query (${err.response.status}): ${JSON.stringify(upstream ?? null)}`
            );
            res.status(422).json({
              ok: false,
              error:
                typeof upstream?.message === "string"
                  ? upstream.message
                  : "We couldn't match those details with PhilSys.",
              hint: "Check spelling and birth date, then try again.",
            });
            return;
          }
        } else {
          throw err;
        }
      }
    }
    if (!isVerified(data) && matchesEverifyFixture(body)) {
      // Failsafe: a 200 body that doesn't verify still must not fail the
      // demo identity.
      const { token: _t, reference: _r, face_url: _f, ...redacted } = data;
      console.warn(
        "[everify] live API did not verify the demo identity — failsafe fixture engaged:",
        JSON.stringify(redacted)
      );
      data = FIXTURE_EVERIFY_PROFILE;
      simulated = true;
    }
    if (!isVerified(data)) {
      // Server-console-only diagnostic of the real upstream shape,
      // with the backend-only secret fields stripped first.
      const { token: _token, reference: _reference, face_url: _faceUrl, ...redacted } = data;
      console.error("[everify] verification failed or unexpected response shape:", JSON.stringify(redacted));
      res.status(422).json({
        ok: false,
        error:
          typeof data.message === "string"
            ? data.message
            : "We couldn't match those details with PhilSys.",
        hint: "Check spelling and birth date.",
      });
      return;
    }
    const user = findOrCreateUser(sanitizeEverifyProfile(data), initialProgress());
    setSessionCookie(res, createSession(user));
    sendSms(
      user.profile.mobile_number,
      `Welcome to HaviFlow, ${user.profile.first_name}! Your driver's license roadmap is ready.`
    );
    res.json({ ok: true, data: { user: user.profile, simulated } });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireSession, (req, res) => {
  res.json({ ok: true, data: { user: req.user!.profile } });
});
