import type { Run, Branch } from "../domain/types";

const runs = new Map<string, Run>();
const branchesByRun = new Map<string, Branch[]>();

export function savePlan(run: Run, branches: Branch[]): void {
  runs.set(run.runId, run);
  branchesByRun.set(run.runId, branches);
}

export function getRun(runId: string): Run | undefined {
  return runs.get(runId);
}

export function getBranches(runId: string): Branch[] {
  return branchesByRun.get(runId) ?? [];
}

export function clear(): void {
  runs.clear();
  branchesByRun.clear();
}