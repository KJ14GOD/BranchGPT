import express from "express";
import { buildTypedPlan } from "../orchestrator/plan";
import { getRun, getBranches } from "../store/memory";
import { savePlan } from "../store/memory";
import { groqChatOnce, listGroqModels } from "../providers/groq";
import { MODEL_MATRIX } from "../config/parallelism";
import { runSingleStep } from "../orchestrator/execute";

const app = express();
app.use(express.json());
// Minimal CORS to allow frontend on a different port
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.post("/ask", (req, res) => {
  const { question, branchCount, maxDepth } = req.body || {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question (string) is required" });
  }

  const { run, branches } = buildTypedPlan(question, {
    branchCount: typeof branchCount === "number" ? branchCount : undefined,
    maxDepth: typeof maxDepth === "number" ? maxDepth : undefined,
  });

  savePlan(run, branches);
  return res.status(200).json({ run, branches });
});

app.post("/groq-test", async (req, res) => {
  try {
    const model = MODEL_MATRIX[0]?.modelId ?? "llama-3.1-70b";
    const result = await groqChatOnce(
      [
        { role: "system", content: "You are concise." },
        { role: "user", content: "Reply with OK." }
      ],
      { model, max_tokens: 8, timeoutMs: 8000 }
    );
    return res.status(200).json({ ok: true, ...result });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "groq error" });
  }
});

app.post("/ask-groq", async (req, res) => {
  const { question, branchCount, maxDepth, selectedModelIds, customPrompts } = req.body || {};
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question (string) is required" });
  }
  try {
    const result = await runSingleStep(question, { branchCount, maxDepth, selectedModelIds, customPrompts });
    return res.status(200).json(result);
  } catch (e: any) {
    if (e?.message === "no_prompts") {
      return res.status(400).json({ error: "At least one prompt is required" });
    }
    return res.status(500).json({ error: e?.message || "ask-groq error" });
  }
});

// Cache models for 5 minutes
let MODELS_CACHE: { at: number; models: Array<{ id: string }> } | null = null;
app.get("/models", async (_req, res) => {
  try {
    const now = Date.now();
    if (MODELS_CACHE && now - MODELS_CACHE.at < 5 * 60 * 1000) {
      return res.status(200).json({ models: MODELS_CACHE.models });
    }
    const models = await listGroqModels();
    MODELS_CACHE = { at: now, models };
    return res.status(200).json({ models });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "models fetch error" });
  }
});

app.get("/graph/:runId", (req, res) => {
    const { runId } = req.params;
    const run = getRun(runId);
    if (!run) return res.status(404).json({ error: "run not found" });
    const branches = getBranches(runId);
    return res.status(200).json({ run, branches });
  });

export function createServer() {
  return app;
}