"use client";
import { useState } from "react";

export interface AskBarProps {
  onAsk: (q: string) => Promise<void> | void;
}

export default function AskBar({ onAsk }: AskBarProps) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    try {
      await onAsk(q.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 blocked p-3 bg-brand-white">
      <input
        className="flex-1 border border-black px-3 py-2 focus:outline-none"
        placeholder="Ask a question..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-brand-yellow blocked"
        type="submit"
        disabled={busy}
      >
        {busy ? "Running..." : "Run"}
      </button>
    </form>
  );
}


