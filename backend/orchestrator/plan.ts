import {
  PARALLELISM_DEFAULTS,
  MODEL_MATRIX,
  generateBranchSeeds,
  type BranchProfile,
  type ModelProvider,
} from "../config/parallelism";
import type { Run, Branch } from "../domain/types";

export interface BranchPlanItem {
  index: number;
  profile: BranchProfile;
  provider: ModelProvider;
  modelId: string;
  seed: number;
}

export interface PlanOptions {
  branchCount?: number;
  maxDepth?: number;
  baseSeed?: number;
}

export interface OrchestratorPlan {
  question: string;
  branchCount: number;
  maxDepth: number;
  branches: BranchPlanItem[];
}

export function buildBranchPlan(
  question: string,
  opts: PlanOptions = {}
): OrchestratorPlan {
  const branchCount = Math.min(
    Math.max(opts.branchCount ?? PARALLELISM_DEFAULTS.defaultBranchCount, 2),
    8
  );
  const maxDepth = Math.min(
    Math.max(opts.maxDepth ?? PARALLELISM_DEFAULTS.defaultMaxDepth, 1),
    4
  );
  const baseSeed = opts.baseSeed ?? PARALLELISM_DEFAULTS.baseSeed;
  const seeds = generateBranchSeeds(branchCount, baseSeed);

  const profiles: BranchProfile[] = ["researcher", "engineer", "critic"];
  const providers: ModelProvider[] = ["llama", "qwen", "openai"];
  const modelByProvider = Object.fromEntries(
    MODEL_MATRIX.map((m) => [m.provider, m.modelId])
  ) as Record<ModelProvider, string>;

  const branches: BranchPlanItem[] = Array.from({ length: branchCount }, (_, i) => {
    const profile = profiles[i % profiles.length];
    const provider = providers[i % providers.length];
    return {
      index: i,
      profile,
      provider,
      modelId: modelByProvider[provider],
      seed: seeds[i],
    };
  });

  return { question, branchCount, maxDepth, branches };
}

export function buildTypedPlan(
  question: string,
  opts: PlanOptions = {}
): { run: Run; branches: Branch[] } {
  const plan = buildBranchPlan(question, opts);

  const now = Date.now();
  const runId = `run_${now}`;
  const run: Run = {
    runId,
    question: plan.question,
    branchCount: plan.branchCount,
    maxDepth: plan.maxDepth,
    createdAt: now,
    status: "queued",
  };

  const branches: Branch[] = plan.branches.map((b) => ({
    branchId: `B${b.index}`,
    runId,
    index: b.index,
    profile: b.profile,
    provider: b.provider,
    modelId: b.modelId,
    seed: b.seed,
  }));

  return { run, branches };
}


