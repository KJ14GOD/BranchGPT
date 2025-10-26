import type { Branch } from "../lib/api";

export default function BranchGrid({ 
  branches, 
  nodesByBranch = {},
  selectedModelIds = [], 
  onSelect 
}: { 
  branches: Branch[]; 
  nodesByBranch?: Record<string, { content: string; status: string }>; 
  selectedModelIds?: string[];
  onSelect?: (branchId: string) => void 
}) {
  if (!branches?.length) return null;
  
  function getBorderClass(branchId: string): string {
    const node = nodesByBranch[branchId];
    if (!node) return "blocked"; // default
    
    switch (node.status) {
      case "ok":
        return "border border-green-500 shadow-none rounded-none";
      case "error":
      case "timeout":
        return "border border-red-500 shadow-none rounded-none";
      default:
        return "blocked";
    }
  }
  
  function getModelLogo(branchIndex: number): string {
    if (selectedModelIds.length === 0) {
      // Fallback to using the branch's actual modelId
      return logoFor(branches[branchIndex]?.modelId || "groq/");
    }
    
    // Use the selected models in cycling order
    const modelId = selectedModelIds[branchIndex % selectedModelIds.length];
    return logoFor(modelId);
  }
  
  function getActualModelId(branchIndex: number): string {
    if (selectedModelIds.length === 0) {
      // Fallback to using the branch's actual modelId
      return branches[branchIndex]?.modelId || "unknown";
    }
    
    // Use the selected models in cycling order
    return selectedModelIds[branchIndex % selectedModelIds.length];
  }
  
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {branches.map((b) => (
        <button key={b.branchId} className={`${getBorderClass(b.branchId)} p-4 text-left blocked-hover w-full`} onClick={() => onSelect?.(b.branchId)}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase">Branch {b.index}</div>
              <div className="mt-2 text-xs">
                <div><span className="font-semibold">Profile:</span> {b.profile}</div>
                <div><span className="font-semibold">Model:</span> {getActualModelId(b.index)}</div>
                <div><span className="font-semibold">Seed:</span> {b.seed}</div>
              </div>
            </div>
            <div className="ml-2">
              <img src={getModelLogo(b.index)} alt="" className="w-15 h-15" onError={(e: any) => { e.currentTarget.src = favicon("groq.com"); }} />
            </div>
          </div>
        </button>
      ))}
    </section>
  );
}

function logoFor(id: string): string {
  const lower = id.toLowerCase();
  // Use reliable favicons service per vendor
  if (lower.startsWith("meta-llama") || lower.startsWith("llama")) return favicon("meta.com");
  if (lower.startsWith("openai/")) return favicon("openai.com");
  if (lower.startsWith("qwen/")) return favicon("qwen.ai");
  if (lower.startsWith("groq/")) return favicon("groq.com");
  if (lower.startsWith("moonshotai/")) return favicon("moonshot.ai");
  if (lower.startsWith("playai")) return favicon("play.ai");
  if (lower.startsWith("allam")) return favicon("humain.ai");
  if (lower.startsWith("whisper")) return favicon("openai.com");
  return favicon("groq.com");
}

function favicon(domain: string): string {
  return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
}
