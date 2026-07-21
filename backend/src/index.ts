import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env"; // fail-fast env validation runs on import
import { attachSession } from "./middleware/session";
import { errorMiddleware } from "./middleware/error";
import { egovaiTokens } from "./clients/egovai";
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

async function boot(): Promise<void> {
  if (env.AI_MOCK) {
    console.log("[boot] AI_MOCK=true — skipping eGov AI token warm-up");
  } else {
    try {
      await egovaiTokens.getToken();
    } catch (err) {
      console.error(
        "[boot] eGov AI token warm-up failed — continuing; chat will degrade:",
        err instanceof Error ? err.message : err
      );
    }
  }
  app.listen(env.PORT, () => {
    console.log(`[boot] GabAI PH backend listening on :${env.PORT}`);
  });
}

void boot();
