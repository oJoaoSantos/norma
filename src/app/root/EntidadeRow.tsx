"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleEntidadeActiveAction } from "./actions";
import { ActionButton } from "@/components/ActionButton";
import type { Entidade } from "@/lib/db/schema";

export function EntidadeRow({
  entidade,
  adminEmails,
}: {
  entidade: Entidade;
  adminEmails: string[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-t border-zinc-200 dark:border-zinc-800">
      <td className="px-4 py-2">
        <Link href={`/root/entidades/${entidade.id}`} className="hover:underline">
          {entidade.nome}
        </Link>
      </td>
      <td className="px-4 py-2 text-zinc-500">
        {adminEmails.length > 0 ? adminEmails.join(", ") : "—"}
      </td>
      <td className="px-4 py-2">{entidade.active ? "Ativa" : "Inativa"}</td>
      <td className="px-4 py-2 text-right">
        <ActionButton
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(() => {
              toggleEntidadeActiveAction(entidade.id, !entidade.active);
            })
          }
        >
          {entidade.active ? "Desativar" : "Ativar"}
        </ActionButton>
      </td>
    </tr>
  );
}
