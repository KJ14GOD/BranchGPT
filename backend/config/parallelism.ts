// Configuration for parallelism and model defaults
export type ModelProvider = 'llama' | 'qwen' | 'openai';

export interface ModelEntry {
  provider: ModelProvider;
  modelId: string; // placeholder IDs for now
  temperature: number;
  top_p: number;
}

export interface ParallelismDefaults {
  temperature: number;
  top_p: number;
  maxTokens: number;
  timeoutMs: number;
  retries: number;
  baseSeed: number;
  defaultBranchCount: number;
  defaultMaxDepth: number;
}

export const PARALLELISM_DEFAULTS: ParallelismDefaults = {
  temperature: 0.2,
  top_p: 0.9,
  maxTokens: 1000,
  timeoutMs: 10_000,
  retries: 1,
  baseSeed: 42,
  defaultBranchCount: 6,
  defaultMaxDepth: 3,
};

// Models defined for groq
export const MODEL_MATRIX: ModelEntry[] = [
  { provider: 'llama', modelId: 'llama-3.1-70b',        temperature: 0.2, top_p: 0.9 },
  { provider: 'qwen',  modelId: 'qwen-2.5-72b-instruct', temperature: 0.2, top_p: 0.9 },
  { provider: 'openai',modelId: 'gpt-4o-mini',           temperature: 0.2, top_p: 0.9 },
];

// Profiles we’ll use for branches
export type BranchProfile = 'researcher' | 'engineer' | 'critic';

export function getBranchSeed(baseSeed: number, branchIndex: number): number {
    return baseSeed + branchIndex;
}
export function generateBranchSeeds(
    count: number,
    baseSeed: number = PARALLELISM_DEFAULTS.baseSeed
): number[] {
    return Array.from({ length: count }, (_, i) => getBranchSeed(baseSeed, i));
}