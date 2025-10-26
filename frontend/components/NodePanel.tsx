import ReactMarkdown from 'react-markdown';

export interface NodePanelProps {
  title: string;
  content: string;
  onClose: () => void;
}

export default function NodePanel({ title, content, onClose }: NodePanelProps) {
  return (
    <aside className="blocked p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{title}</div>
        <button className="blocked px-2 py-1" onClick={onClose}>Close</button>
      </div>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content || "(empty)"}</ReactMarkdown>
      </div>
    </aside>
  );
}