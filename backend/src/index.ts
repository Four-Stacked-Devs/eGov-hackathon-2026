import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env"; // fail-fast env validation runs on import
import { attachSession } from "./middleware/session";
import { errorMiddleware } from "./middleware/error";
import { anthropicConfigured } from "./clients/claude";
import { authRouter } from "./routes/auth";
import { roadmapRouter } from "./routes/roadmap";
import { formsRouter } from "./routes/forms";
import { aiRouter } from "./routes/ai";
import { adminRouter } from "./routes/admin";

const app = express();

app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(attachSession);

app.use(authRouter);
app.use(roadmapRouter);
app.use(formsRouter);
app.use(aiRouter);
app.use(adminRouter);

app.use(errorMiddleware);

function boot(): void {
  if (!anthropicConfigured()) {
    console.warn(
      "[boot] ANTHROPIC_API_KEY is not set — the AI copilot will return a 'not configured' error until it is."
    );
  }
  app.listen(env.PORT, () => {
    console.log(`[boot] HaviFlow backend listening on :${env.PORT}`);
  });
}

boot();
