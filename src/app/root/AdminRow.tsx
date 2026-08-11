"use client";

import { useRef, useState, useTransition } from "react";
import { toggleAdminActiveAction, updateAdminAction } from "./actions";
import { ActionButton } from "@/components/ActionButton";
import type { User } from "@/lib/db/schema";

export function AdminRow({ admin }: { admin: User }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSave() {
    setError(null);
    const formData = new FormData(formRef.current!);
    startTransition(async () => {
      const result = await updateAdminAction(admin.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <tr className="border-t border-zinc-200 dark:border-zinc-800">
        <td className="px-4 py-2" colSpan={4}>
          <form
            ref={formRef}
            className="flex flex-wrap items-start gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <input
              name="adminName"
              defaultValue={admin.name}
              required
              className="rounded border border-zinc-300 p-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              name="adminEmail"
              type="email"
              defaultValue={admin.email}
              required
              className="rounded border border-zinc-300 p-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              name="adminPassword"
              type="password"
              placeholder="Nova password (opcional)"
              className="rounded border border-zinc-300 p-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-black px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {pending ? "A guardar…" : "Guardar"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setError(null);
                setEditing(false);
              }}
              className="rounded border border-zinc-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-zinc-700"
            >
              Cancelar
            </button>
            {error && (
              <p className="w-full text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-zinc-200 dark:border-zinc-800">
      <td className="px-4 py-2">{admin.name}</td>
      <td className="px-4 py-2">{admin.email}</td>
      <td className="px-4 py-2">{admin.active ? "Ativo" : "Inativo"}</td>
      <td className="px-4 py-2 text-right">
        <div className="flex justify-end gap-2">
          <ActionButton type="button" onClick={() => setEditing(true)}>
            Editar
          </ActionButton>
          <ActionButton
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                toggleAdminActiveAction(admin.id, !admin.active);
              })
            }
          >
            {admin.active ? "Desativar" : "Ativar"}
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}
