"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction } from "./actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    INITIAL_ACTION_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Password atual</span>
        <input
          name="currentPassword"
          type="password"
          required
          className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Nova password</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Password atualizada.
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
