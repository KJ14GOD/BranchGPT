export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "llama3-8b-8192": { input: 0.05 / 1_000_000, output: 0.08 / 1_000_000 },
  "llama3-70b-8192": { input: 0.59 / 1_000_000, output: 0.79 / 1_000_000 },
  "mixtral-8x7b-32768": { input: 0.24 / 1_000_000, output: 0.24 / 1_000_000 },
  "gemma-7b-it": { input: 0.07 / 1_000_000, output: 0.07 / 1_000_000 },
};
