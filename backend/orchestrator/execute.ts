import { buildTypedPlan } from "./plan";
import { PARALLELISM_DEFAULTS } from "../config/parallelism";
import { MODEL_PRICING } from "../config/pricing";
import { savePlan } from "../store/memory";
import type { Branch, Run } from "../domain/types";
import { groqChatOnce, type ChatMessage } from "../providers/groq";

function profileToSystem(profile: string): string {
  if (profile === "researcher") {
    return "Act as a meticulous researcher. Produce concise findings with citations; avoid code unless essential. Return sections: Findings, Sources (links), Next action.";
  }
  if (profile === "engineer") {
    return "Act as a pragmatic engineer. Provide a stepwise plan and a tiny, runnable code sketch. Return sections: Plan, Snippet, Benchmark.";
  }
  return "Act as a skeptic. Identify weak assumptions and propose tests to break them. Return sections: Counterpoints, Risks, Test-to-fail.";
}

export async function runSingleStep(
  question: string,
  opts: { branchCount?: number; maxDepth?: number; selectedModelIds?: string[]; customPrompts?: { all?: string; researcher?: string; engineer?: string; critic?: string; extras?: Array<{ name: string; prompt: string }> } } = {}
): Promise<{ run: Run; branches: Branch[]; nodes: any[]; timings: any }> {
  const { run, branches } = buildTypedPlan(question, {
    branchCount: opts.branchCount ?? PARALLELISM_DEFAULTS.defaultBranchCount,
    maxDepth: 1,
  });

  // If user selected specific models, cycle them across branches
  const selected = Array.isArray(opts.selectedModelIds) && opts.selectedModelIds.length > 0
    ? opts.selectedModelIds
    : undefined;

  // Build prompt list: all -> extras -> per-profile defaults/overrides
  function defaultFor(profile: string): string {
    return profileToSystem(profile);
  }
  let promptList: string[] = [];
  let promptNames: string[] = [];
  
  if (opts.customPrompts?.all && opts.customPrompts.all.trim()) {
    promptList = [opts.customPrompts.all];
    promptNames = ["Custom"];
  } else if (opts.customPrompts?.extras && opts.customPrompts.extras.length > 0) {
    promptList = opts.customPrompts.extras.map((e) => (e.prompt || "").trim()).filter(Boolean);
    promptNames = opts.customPrompts.extras.filter((e) => (e.prompt || "").trim()).map((e) => e.name || "Custom");
  } else {
    const r = (typeof opts.customPrompts?.researcher === "string") ? opts.customPrompts?.researcher : defaultFor("researcher");
    const e = (typeof opts.customPrompts?.engineer === "string") ? opts.customPrompts?.engineer : defaultFor("engineer");
    const c = (typeof opts.customPrompts?.critic === "string") ? opts.customPrompts?.critic : defaultFor("critic");
    promptList = [r, e, c].map((p) => (p || "").trim()).filter(Boolean);
    promptNames = ["researcher", "engineer", "critic"];
  }
  if (promptList.length === 0) {
    throw new Error("no_prompts");
  }
  
  // Update branch profiles to reflect custom prompt names using same logic as model assignment
  // Get number of models to determine how many branches per prompt
  const numModels = Array.isArray(opts.selectedModelIds) && opts.selectedModelIds.length > 0 
    ? opts.selectedModelIds.length 
    : 3; // default number of model providers
    
  const updatedBranches = branches.map((branch, i) => {
    const promptIndex = Math.floor(i / numModels);
    return {
      ...branch,
      profile: promptNames[promptIndex % promptNames.length] as any
    };
  });

  const tasks = branches.map(async (b, i) => {
    const promptIndex = Math.floor(i / numModels);
    const messages: ChatMessage[] = [
      { role: "system", content: promptList[promptIndex % promptList.length] },
      { role: "user", content: question },
    ];
    try {
      const result = await groqChatOnce(messages, {
        model: selected ? selected[i % selected.length] : b.modelId,
        temperature: PARALLELISM_DEFAULTS.temperature,
        top_p: PARALLELISM_DEFAULTS.top_p,
        max_tokens: PARALLELISM_DEFAULTS.maxTokens,
        timeoutMs: PARALLELISM_DEFAULTS.timeoutMs,
      });
      const modelId = selected ? selected[i % selected.length] : b.modelId;
      const pricing = MODEL_PRICING[modelId];
      const cost = pricing ? (pricing.input * (result.tokensIn || 0)) + (pricing.output * (result.tokensOut || 0)) : 0;
      return {
        ok: true,
        branchId: b.branchId,
        role: b.profile === "engineer" ? "code" : "analysis",
        content: result.text,
        latencyMs: result.latencyMs,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        cost: cost,
        modelId: modelId,
      };
    } catch (e: any) {
      return { ok: false, branchId: b.branchId, error: e?.message || String(e) };
    }
  });

  const startedAt = Date.now();
  const settled = await Promise.allSettled(tasks);
  const nodes: any[] = [];
  const timingsPerBranch: Record<string, any> = {};
  for (const s of settled) {
    if (s.status === "fulfilled") {
      const r = s.value as any;
      if (r.ok) {
        nodes.push({
          nodeId: `${r.branchId}-0`,
          branchId: r.branchId,
          stepIndex: 0,
          role: r.role,
          content: r.content,
          status: "ok",
          createdAt: Date.now(),
        });
        timingsPerBranch[r.branchId] = { latencyMs: r.latencyMs, tokensIn: r.tokensIn, tokensOut: r.tokensOut, cost: r.cost };
      } else {
        nodes.push({
          nodeId: `${r.branchId}-0`,
          branchId: r.branchId,
          stepIndex: 0,
          role: "analysis",
          content: r.error,
          status: "error",
          createdAt: Date.now(),
        });
      }
    } else {
      // rejected promise
    }
  }
  const wallClockMs = Date.now() - startedAt;

  // Persist run+branches; nodes are ephemeral for now (MVP)
  savePlan(run, updatedBranches);

  return { run, branches: updatedBranches, nodes, timings: { perBranch: timingsPerBranch, wallClockMs } };
}
