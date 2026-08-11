"use client";

import { useActionState } from "react";
import { upsertLegislacaoAction } from "../actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

export function LegislacaoForm({
  concelho,
  conteudo,
  isNew,
  label,
}: {
  concelho: string;
  conteudo: string;
  isNew?: boolean;
  /** Quando definido, o concelho fica fixo (input escondido) e mostra este texto em vez de um campo editável. */
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(
    upsertLegislacaoAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 rounded border border-zinc-200 p-4 dark:border-zinc-800"
    >
      {label ? (
        <>
          <span className="w-fit text-sm font-medium">{label}</span>
          <input type="hidden" name="concelho" value={concelho} />
        </>
      ) : (
        <input
          name="concelho"
          defaultValue={concelho}
          placeholder="Concelho (ex: Cascais)"
          required
          readOnly={!isNew}
          className="w-fit rounded border border-zinc-300 p-2 text-sm font-medium disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900"
        />
      )}
      <textarea
        name="conteudo"
        defaultValue={conteudo}
        rows={8}
        placeholder="Excertos de RJUE/RGEU/PDM aplicáveis a este concelho…"
        className="w-full rounded border border-zinc-300 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
      />
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Guardado.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "A guardar…" : isNew ? "Adicionar concelho" : "Guardar"}
      </button>
    </form>
  );
}
