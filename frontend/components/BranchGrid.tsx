import type { Branch } from "../lib/api";

export default function BranchGrid({ branches }: { branches: Branch[] }) {
  if (!branches?.length) return null;
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {branches.map((b) => (
        <div key={b.branchId} className="blocked p-4">
          <div className="text-xs uppercase">Branch {b.index}</div>
          <div className="mt-2 text-sm">
            <div><span className="font-semibold">Profile:</span> {b.profile}</div>
            <div><span className="font-semibold">Model:</span> {b.provider}/{b.modelId}</div>
            <div><span className="font-semibold">Seed:</span> {b.seed}</div>
          </div>
        </div>
      ))}
    </section>
  );
}


