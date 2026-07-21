import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

/**
 * Central error middleware: the client only ever sees { ok:false, error, hint? }.
 * Stack traces and upstream gov API bodies go to the server console only.
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
  console.error("[error]", err);
  res.status(500).json({
    ok: false,
    error: "Something went wrong on our end.",
    hint: "Please try again in a moment.",
  });
};
