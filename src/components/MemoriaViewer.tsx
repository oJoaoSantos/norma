"use client";

import { useState } from "react";

export function MemoriaViewer({
  id,
  initialText,
  editable,
}: {
  id: string;
  initialText: string;
  editable: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onExport() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/documents/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text }),
      });
      if (!res.ok) throw new Error(`Falha ao exportar (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "memoria-descritiva.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {editable ? (
        <textarea
          className="min-h-[420px] w-full rounded border border-zinc-300 bg-white p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <pre className="min-h-[420px] w-full whitespace-pre-wrap rounded border border-zinc-300 bg-white p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900">
          {text}
        </pre>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {exporting ? "A exportar…" : "Exportar .docx"}
        </button>
      </div>
    </div>
  );
}
