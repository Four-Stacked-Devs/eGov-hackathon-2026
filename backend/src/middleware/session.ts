import type { RequestHandler, Response } from "express";
import { sessions, User } from "../store";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const attachSession: RequestHandler = (req, _res, next) => {
  const sessionId = (req.cookies as Record<string, string> | undefined)?.haviflow_session;
  if (sessionId) {
    const user = sessions.get(sessionId);
    if (user) req.user = user;
  }
  next();
};

export const requireSession: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "Not signed in" });
    return;
  }
  next();
};

export function setSessionCookie(res: Response, sessionId: string): void {
  // In production the frontend (Vercel) and backend (Render/Railway) live on
  // different domains, so the cookie must be SameSite=None + Secure to be sent
  // on cross-site fetch() calls. On localhost we stay Lax (Secure would drop it
  // over plain http).
  const crossSite = process.env.NODE_ENV === "production";
  res.cookie("haviflow_session", sessionId, {
    httpOnly: true,
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
  });
}
