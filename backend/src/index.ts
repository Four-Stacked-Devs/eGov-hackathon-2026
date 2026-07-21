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
  try {
    await egovaiTokens.getToken();
  } catch (err) {
    console.error(
      "[boot] eGov AI token warm-up failed — driver's-license chat will degrade to the knowledge base:",
      err instanceof Error ? err.message : err
    );
  }
  app.listen(env.PORT, () => {
    console.log(`[boot] HaviFlow backend listening on :${env.PORT}`);
  });
}

void boot();
