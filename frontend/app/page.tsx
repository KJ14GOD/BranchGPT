"use client";
import { useState } from "react";
import AskBar from "../components/AskBar";
import BranchGrid from "../components/BranchGrid";
import TimingPanel from "../components/TimingPanel";
import NodePanel from "../components/NodePanel";
import ModelPicker from "../components/ModelPicker";
import PromptsDropdown, { type CustomPrompts } from "../components/PromptsDropdown";
import { askGroq, type Branch } from "../lib/api";

export default function Page() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [timings, setTimings] = useState<{ wallClockMs: number; perBranch: Record<string, { latencyMs: number; tokensIn: number; tokensOut: number; cost: number }> } | null>(null);
  const [nodesByBranch, setNodesByBranch] = useState<Record<string, { content: string; status: string }>>({});
  const [openBranchId, setOpenBranchId] = useState<string | null>(null);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [branchCount, setBranchCount] = useState<number>(6);
  const [customPrompts, setCustomPrompts] = useState<CustomPrompts>({});
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(question: string) {
    setTimings(null);
    setError(null);
    
    try {
      const { run, branches, timings, nodes } = await askGroq(question, { selectedModelIds, branchCount, customPrompts });
      setRunId(run.runId);
      setBranches(branches);
      setTimings(timings);
      const map: Record<string, { content: string; status: string }> = {};
      for (const n of nodes) {
        if (!map[n.branchId]) map[n.branchId] = { content: n.content, status: n.status };
      }
      setNodesByBranch(map);
    } catch (e: any) {
      if (e.message.includes("At least one prompt is required")) {
        setError("Please select at least one prompt to continue");
      } else {
        setError(`Error: ${e.message}`);
      }
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <AskBar onAsk={handleAsk} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-40 items-center justify-center max-w-4xl mx-auto">
        <ModelPicker value={selectedModelIds} onChange={setSelectedModelIds} />
        <PromptsDropdown onChange={setCustomPrompts} />
        <div className="blocked px-3 h-8 flex items-center gap-2 w-fit">
          <label className="text-xs font-semibold" htmlFor="branchCount">Branches</label>
          <input
            id="branchCount"
            type="number"
            min={2}
            value={branchCount}
            onChange={(e) => setBranchCount(Math.max(2, Number(e.target.value) || 2))}
            className="w-16 h-6 border border-black px-2 text-xs"
          />
        </div>
      </div>
      
      {error && (
        <div className="max-w-4xl mx-auto">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        </div>
      )}
      
      {runId && (
        <div className="text-xs">runId: {runId}</div>
      )}
      {timings && <TimingPanel wallClockMs={timings.wallClockMs} perBranch={timings.perBranch} />}
      <BranchGrid branches={branches} nodesByBranch={nodesByBranch} selectedModelIds={selectedModelIds} onSelect={(id) => setOpenBranchId(id)} />
      {openBranchId && (
        <NodePanel
          title={`Branch ${branches.find(b => b.branchId === openBranchId)?.index ?? ""} output`}
          content={nodesByBranch[openBranchId]?.content || ""}
          onClose={() => setOpenBranchId(null)}
        />
      )}
    </main>
  );
}


