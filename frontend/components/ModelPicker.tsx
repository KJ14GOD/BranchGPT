"use client";
import { useEffect, useState } from "react";
import { listModels } from "../lib/api";

export default function ModelPicker({
  onChange,
  value,
  label = "Models",
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}) {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { models } = await listModels();
        if (!mounted) return;
        setModels(models.map((m) => m.id));
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load models");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function toggle(id: string) {
    const set = new Set(value);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange(Array.from(set));
  }

  const selectedCount = value.length;

  const boxWidth = "w-80"; // keep summary and dropdown same width, compact

  return (
    <div className="relative">
      <details className="group">
        <summary className={`blocked px-3 h-8 flex items-center justify-between text-xs cursor-pointer select-none list-none bg-white ${boxWidth}`}>
          <span className="flex items-center gap-2">
            <span className="font-semibold">{label}</span>
            <span className="text-[10px]">({selectedCount} selected)</span>
          </span>
          <span aria-hidden>▾</span>
        </summary>
        <div className={`absolute mt-1 z-10 ${boxWidth} bg-white blocked p-2 max-h-56 overflow-auto`}>
          {loading ? (
            <div className="text-xs">Loading…</div>
          ) : error ? (
            <div className="text-xs flex items-center gap-2">
              <span className="text-red-600">{error}</span>
              <button
                type="button"
                className="blocked px-2 py-1"
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    const { models } = await listModels();
                    setModels(models.map((m) => m.id));
                  } catch (e: any) {
                    setError(e?.message || "Failed to load models");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4">
              <ul className="space-y-1">
                {models.filter((_, i) => i % 2 === 0).map((id) => (
                  <li key={id} className="flex items-center gap-2 text-xs">
                    <input
                      id={`m-${id}`}
                      type="checkbox"
                      className="border border-black"
                      checked={value.includes(id)}
                      onChange={() => toggle(id)}
                    />
                    <label htmlFor={`m-${id}`} className="cursor-pointer truncate flex items-center gap-2" title={id}>
                      <img src={logoFor(id)} alt="" className="w-4 h-4" onError={(e: any) => { e.currentTarget.src = logoFor("groq/"); }} />
                      <span className="truncate">{id}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <ul className="space-y-1">
                {models.filter((_, i) => i % 2 === 1).map((id) => (
                  <li key={id} className="flex items-center gap-2 text-xs">
                    <input
                      id={`m-${id}`}
                      type="checkbox"
                      className="border border-black"
                      checked={value.includes(id)}
                      onChange={() => toggle(id)}
                    />
                    <label htmlFor={`m-${id}`} className="cursor-pointer truncate flex items-center gap-2" title={id}>
                      <img src={logoFor(id)} alt="" className="w-4 h-4" onError={(e: any) => { e.currentTarget.src = logoFor("groq/"); }} />
                      <span className="truncate">{id}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    </div>
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


