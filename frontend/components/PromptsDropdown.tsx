"use client";
import { useEffect, useState } from "react";

export type CustomPrompts = {
  all?: string;
  researcher?: string;
  engineer?: string;
  critic?: string;
  extras?: Array<{ name: string; prompt: string }>;
};

const DEFAULT_RESEARCHER =
  "Act as a meticulous researcher. Produce concise findings with citations; avoid code unless essential. Return sections: Findings, Sources (links), Next action.";
const DEFAULT_ENGINEER =
  "Act as a pragmatic engineer. Provide a stepwise plan and a tiny, runnable code sketch. Return sections: Plan, Snippet, Benchmark.";
const DEFAULT_CRITIC =
  "Act as a skeptic. Identify weak assumptions and propose tests to break them. Return sections: Counterpoints, Risks, Test-to-fail.";

export default function PromptsDropdown({
  onChange,
}: {
  onChange: (v: CustomPrompts) => void;
}) {
  const [open, setOpen] = useState(false);
  const [useSingle, setUseSingle] = useState(false);
  const [all, setAll] = useState("");
  const [researcher, setResearcher] = useState(DEFAULT_RESEARCHER);
  const [engineer, setEngineer] = useState(DEFAULT_ENGINEER);
  const [critic, setCritic] = useState(DEFAULT_CRITIC);
  const [extras, setExtras] = useState<Array<{ name: string; prompt: string }>>([]);

  useEffect(() => {
    const payload: CustomPrompts = useSingle ? { all } : { researcher, engineer, critic };
    if (extras.length) payload.extras = extras;
    onChange(payload);
  }, [useSingle, all, researcher, engineer, critic, extras, onChange]);

  const boxWidth = "w-72";
  function addExtra() {
    setExtras((arr) => [...arr, { name: `custom-${arr.length + 1}`, prompt: "" }]);
  }
  function updateExtra(i: number, key: "name" | "prompt", value: string) {
    setExtras((arr) => arr.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)));
  }
  function removeExtra(i: number) {
    setExtras((arr) => arr.filter((_, idx) => idx !== i));
  }

  return (
    <div className="relative">
      <details className="group" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
        <summary className={`blocked px-3 h-8 flex items-center justify-between text-xs cursor-pointer select-none list-none bg-white ${boxWidth}`}>
          <span className="font-semibold">Prompts</span>
          <span aria-hidden>▾</span>
        </summary>
        <div className={`absolute mt-1 z-10 ${boxWidth} bg-white blocked p-2 max-h-96 overflow-auto space-y-2`}>
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={useSingle} onChange={(e) => setUseSingle(e.target.checked)} />
            Use single prompt for all branches
          </label>
          {useSingle ? (
            <textarea className="w-full h-24 border border-black p-2 text-xs" value={all} onChange={(e) => setAll(e.target.value)} placeholder="System prompt for all" />
          ) : (
            <div className="space-y-2">
              <div className="border border-black p-2">
                <input className="w-full border border-black px-2 py-1 text-xs mb-1" value="Researcher" readOnly />
                <textarea className="w-full h-16 border border-black p-2 text-xs" value={researcher} onChange={(e) => setResearcher(e.target.value)} placeholder="prompt" />
                <div className="mt-1 flex justify-end">
                  <button type="button" className="blocked px-2 h-7 text-xs" onClick={() => setResearcher("")}>Remove</button>
                </div>
              </div>
              <div className="border border-black p-2">
                <input className="w-full border border-black px-2 py-1 text-xs mb-1" value="Engineer" readOnly />
                <textarea className="w-full h-16 border border-black p-2 text-xs" value={engineer} onChange={(e) => setEngineer(e.target.value)} placeholder="prompt" />
                <div className="mt-1 flex justify-end">
                  <button type="button" className="blocked px-2 h-7 text-xs" onClick={() => setEngineer("")}>Remove</button>
                </div>
              </div>
              <div className="border border-black p-2">
                <input className="w-full border border-black px-2 py-1 text-xs mb-1" value="Critic" readOnly />
                <textarea className="w-full h-16 border border-black p-2 text-xs" value={critic} onChange={(e) => setCritic(e.target.value)} placeholder="prompt" />
                <div className="mt-1 flex justify-end">
                  <button type="button" className="blocked px-2 h-7 text-xs" onClick={() => setCritic("")}>Remove</button>
                </div>
              </div>
            </div>
          )}
          <div className="text-xs font-semibold mt-2">Custom prompts</div>
          <div className="space-y-2">
            {extras.map((ex, i) => (
              <div key={i} className="border border-black p-2">
                <input className="w-full border border-black px-2 py-1 text-xs mb-1" value={ex.name} onChange={(e) => updateExtra(i, "name", e.target.value)} placeholder="name" />
                <textarea className="w-full h-16 border border-black p-2 text-xs" value={ex.prompt} onChange={(e) => updateExtra(i, "prompt", e.target.value)} placeholder="prompt" />
                <div className="mt-1 flex justify-end">
                  <button type="button" className="blocked px-2 h-7 text-xs" onClick={() => removeExtra(i)}>Remove</button>
                </div>
              </div>
            ))}
            <button type="button" className="blocked px-2 h-7 text-xs" onClick={addExtra}>Add custom prompt</button>
          </div>
        </div>
      </details>
    </div>
  );
}


