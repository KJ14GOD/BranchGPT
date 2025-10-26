import express from "express";
import { buildTypedPlan } from "../orchestrator/plan";
import { getRun, getBranches } from "../store/memory";
import { savePlan } from "../store/memory";

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