"use client";

import { useSession } from "next-auth/react";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "./actions";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

export function ProfileForm({
  name,
  numeroOrdem,
}: {
  name: string;
  numeroOrdem: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    INITIAL_ACTION_STATE,
  );
  const { update } = useSession();
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      update({ name: nameRef.current?.value }).then(() => router.refresh());
    }
  }, [state.success, update, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nome</span>
          <input
            ref={nameRef}
            name="name"
            defaultValue={name}
            required
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">N.º de ordem (OA/OE)</span>
          <input
            name="numeroOrdem"
            defaultValue={numeroOrdem ?? ""}
            required
            className="rounded border border-zinc-300 p-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Dados atualizados.
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
