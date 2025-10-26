export type BranchProfile = "researcher" | "engineer" | "critic";
export type ModelProvider = "llama" | "qwen" | "openai";

export interface Run {
  runId: string;
  question: string;
  branchCount: number;
  maxDepth: number;
  createdAt: number;
  status: "queued" | "running" | "merged" | "failed";
}

export interface Branch {
  branchId: string;
  runId: string;
  index: number;
  profile: BranchProfile;
  provider: ModelProvider;
  modelId: string;
  seed: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function ask(
  question: string,
  opts: { branchCount?: number; maxDepth?: number } = {}
): Promise<{ run: Run; branches: Branch[] }> {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, ...opts }),
  });
  if (!res.ok) throw new Error(`ask failed: ${res.status}`);
  return res.json();
}

export async function getGraph(runId: string): Promise<{ run: Run; branches: Branch[] }> {
  const res = await fetch(`${BASE_URL}/graph/${encodeURIComponent(runId)}`);
  if (!res.ok) throw new Error(`graph fetch failed: ${res.status}`);
  return res.json();
}


