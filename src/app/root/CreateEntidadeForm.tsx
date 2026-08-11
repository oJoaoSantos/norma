"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEntidadeAction } from "./actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

export function CreateEntidadeForm() {
  const [state, formAction, pending] = useActionState(
    createEntidadeAction,
    INITIAL_ACTION_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 className="font-medium">Nova entidade</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="nome"
          placeholder="Nome da entidade"
          required
          className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-2"
        />
        <input
          name="adminName"
          placeholder="Nome do administrador"
          required
          className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="adminEmail"
          type="email"
          placeholder="Email do administrador"
          required
          className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="adminPassword"
          type="password"
          placeholder="Password temporária"
          required
          className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Entidade criada.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "A criar…" : "Criar entidade"}
      </button>
    </form>
  );
}
