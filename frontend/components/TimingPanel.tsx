"use client";
import { useState } from "react";

export default function TimingPanel({
  wallClockMs,
  perBranch,
}: {
  wallClockMs: number;
  perBranch: Record<
    string,
    { latencyMs: number; tokensIn: number; tokensOut: number; cost: number }
  >;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const entries = Object.entries(perBranch || {});
  if (!entries.length) return null;
  const max = Math.max(...entries.map(([, v]) => v.latencyMs));

  return (
    <section className="blocked">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
      >
        <div>
          <div className="text-sm font-semibold">Timing</div>
          <div className="text-xs mt-1">
            Wall clock: {(wallClockMs / 1000).toFixed(2)}s
          </div>
        </div>
        <span
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="mt-3 space-y-2">
            {entries.map(([branchId, stats]) => (
              <div key={branchId} className="text-xs">
                <div className="flex justify-between">
                  <span>{branchId}</span>
                  <span>{stats.latencyMs} ms</span>
                </div>
                <div className="h-2 bg-black/10">
                  <div
                    className="h-2 bg-brand-yellow"
                    style={{ width: `${(stats.latencyMs / max) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>
                    {stats.tokensIn} in / {stats.tokensOut} out
                  </span>
                  <span>${stats.cost.toFixed(6)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
