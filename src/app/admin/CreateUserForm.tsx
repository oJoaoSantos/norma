"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUserAction } from "./actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { ROLE_OPTIONS } from "@/lib/schemas/user";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(
    createUserAction,
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
      <h2 className="font-medium">Novo utilizador</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          placeholder="Nome"
          required
          className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="password"
          type="password"
          placeholder="Password temporária"
          required
          className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          name="role"
          defaultValue="arquiteto"
          className="rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Utilizador criado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "A criar…" : "Criar utilizador"}
      </button>
    </form>
  );
}
