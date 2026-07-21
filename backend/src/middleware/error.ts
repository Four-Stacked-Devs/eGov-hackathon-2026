import axios from "axios";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

/**
 * Central error middleware: the client only ever sees { ok:false, error, hint? }.
 * Stack traces and upstream gov API bodies go to the server console only.
 * Axios errors are never logged whole — err.config.data carries request
 * bodies (partner secrets, client secrets), which must never reach any log.
 */
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: "Invalid request",
      hint: err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    });
    return;
  }
  if (axios.isAxiosError(err)) {
    const url = `${err.config?.baseURL ?? ""}${err.config?.url ?? ""}`;
    console.error(
      `[error] upstream ${err.config?.method?.toUpperCase() ?? "?"} ${url} → ` +
        `${err.response?.status ?? err.code}: ${JSON.stringify(err.response?.data ?? null)}`
    );
    res.status(502).json({
      ok: false,
      error: "A government service could not process the request.",
      hint: "Please try again in a moment.",
    });
    return;
  }
  console.error("[error]", err);
  res.status(500).json({
    ok: false,
    error: "Something went wrong on our end.",
    hint: "Please try again in a moment.",
  });
};
