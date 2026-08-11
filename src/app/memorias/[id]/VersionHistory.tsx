"use client";

import { useState } from "react";
import type { MemoriaVersao } from "@/lib/db/schema";

export function VersionHistory({ versoes }: { versoes: MemoriaVersao[] }) {
  if (versoes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {versoes.map((v) => (
        <VersionItem key={v.id} versao={v} />
      ))}
    </div>
  );
}

function VersionItem({ versao }: { versao: MemoriaVersao }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onExport() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/documents/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: versao.memoriaId,
          text: versao.generatedText,
          historico: true,
        }),
      });
      if (!res.ok) throw new Error(`Falha ao exportar (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `memoria-descritiva-v${versao.versao}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="rounded border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm"
      >
        <span>
          Versão {versao.versao} —{" "}
          {versao.createdAt.toLocaleString("pt-PT")}
        </span>
        <span className="text-zinc-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-zinc-600 dark:text-zinc-400">
            {versao.generatedText}
          </pre>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="self-start rounded border border-zinc-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-zinc-700"
          >
            {exporting ? "A exportar…" : "Exportar esta versão"}
          </button>
          {error && (
            <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
          )}
        </div>
      )}
    </div>
  );
}
