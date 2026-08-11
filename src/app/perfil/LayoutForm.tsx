"use client";

import { useActionState } from "react";
import { updateLayoutAction } from "./actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import {
  DOCX_ALINHAMENTO_OPTIONS,
  DOCX_ESPACAMENTO_OPTIONS,
  DOCX_FONTE_OPTIONS,
} from "@/lib/schemas/user";

const fieldClass =
  "rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900";

export function LayoutForm({
  docxFonte,
  docxTamanhoPt,
  docxEspacamento,
  docxAlinhamento,
}: {
  docxFonte: string;
  docxTamanhoPt: number;
  docxEspacamento: string;
  docxAlinhamento: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateLayoutAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Tipo de letra</span>
          <select name="docxFonte" defaultValue={docxFonte} className={fieldClass}>
            {DOCX_FONTE_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Tamanho (pt)</span>
          <input
            name="docxTamanhoPt"
            type="number"
            min={8}
            max={16}
            defaultValue={docxTamanhoPt}
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Espaçamento entre linhas</span>
          <select
            name="docxEspacamento"
            defaultValue={docxEspacamento}
            className={fieldClass}
          >
            {DOCX_ESPACAMENTO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Alinhamento</span>
          <select
            name="docxAlinhamento"
            defaultValue={docxAlinhamento}
            className={fieldClass}
          >
            {DOCX_ALINHAMENTO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Formatação atualizada.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "A guardar…" : "Guardar"}
      </button>
    </form>
  );
}
