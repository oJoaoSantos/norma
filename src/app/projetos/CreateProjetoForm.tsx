"use client";

import { useActionState } from "react";
import { createProjetoAction } from "./actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

export function CreateProjetoForm() {
  const [state, formAction, pending] = useActionState(
    createProjetoAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 className="font-medium">Novo projeto</h2>
      <input
        name="nome"
        placeholder="Nome do projeto"
        required
        className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <textarea
        name="descricao"
        placeholder="Descrição"
        rows={2}
        required
        className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "A criar…" : "Criar projeto"}
      </button>
    </form>
  );
}
