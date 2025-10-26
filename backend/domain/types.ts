import { BranchProfile, ModelProvider } from "../config/parallelism";
export type Id = string;

export type RunStatus = "queued" | "running" | "merged" | "failed";
export type NodeStatus = "ok" | "error" | "timeout";

export interface Run {
    runId: Id;
    question: string;
    branchCount: number;
    maxDepth: number;
    createdAt: number;
    status: RunStatus;
    merged?: Id;
}

export interface Branch {
    branchId: Id;
    runId: Id;
    index: number;
    profile: BranchProfile;
    provider: ModelProvider;
    modelId: string;
    seed: number;
}

export type NodeRole = "analysis" | "code" | "benchmark" | "counter";

export interface Node {
    nodeId: Id;
    branchId: Id;
    stepIndex: number; // 0..maxDepth-1
    role: NodeRole;
    content: string; // markdown/text
    status: NodeStatus;
    createdAt: number; // epoch ms
}

export type ArtifactType = "markdown" | "code" | "source-list" | "result-json";

export interface Artifact {
    artifactId: Id;
    nodeId: Id;
    type: ArtifactType;
    mime?: string;
    text?: string;
}
  
export interface MergePR {
    mergeId: Id;
    runId: Id;
    summary1p: string;
    usedNodes: Id[];
    createdAt: number; // epoch ms
}