"use client";
import { useState } from "react";
import AskBar from "../components/AskBar";
import BranchGrid from "../components/BranchGrid";
import { ask, getGraph, type Branch } from "../lib/api";

export default function Page() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [runId, setRunId] = useState<string | null>(null);

  async function handleAsk(question: string) {
    const { run, branches } = await ask(question);
    setRunId(run.runId);
    setBranches(branches);
    // Optionally refetch via graph endpoint for parity
    try {
      const g = await getGraph(run.runId);
      setBranches(g.branches);
    } catch {}
  }

  return (
    <main className="space-y-6">
      <AskBar onAsk={handleAsk} />
      {runId && (
        <div className="text-xs">runId: {runId}</div>
      )}
      <BranchGrid branches={branches} />
    </main>
  );
}


