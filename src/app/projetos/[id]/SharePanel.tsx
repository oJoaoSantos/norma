"use client";

import { useTransition } from "react";
import { setProjetoAcessoAction } from "../actions";
import type { User } from "@/lib/db/schema";

type Permissao = "visualizacao" | "edicao";

export function SharePanel({
  projetoId,
  utilizadores,
  acessos,
  criador,
}: {
  projetoId: string;
  utilizadores: User[];
  acessos: Map<string, Permissao>;
  criador: { name: string; email: string } | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col divide-y divide-zinc-200 rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {criador && (
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <div>
            <span className="font-medium">{criador.name}</span>{" "}
            <span className="text-zinc-500">— {criador.email}</span>
          </div>
          <span className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-500 dark:bg-zinc-800">
            Criador
          </span>
        </div>
      )}
      {utilizadores.map((u) => {
        const atual = acessos.get(u.id) ?? "";
        return (
          <div key={u.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <div>
              <span className="font-medium">{u.name}</span>{" "}
              <span className="text-zinc-500">— {u.email}</span>
            </div>
            <select
              disabled={pending}
              defaultValue={atual}
              onChange={(e) =>
                startTransition(() => {
                  const value = e.target.value as Permissao | "";
                  setProjetoAcessoAction(projetoId, u.id, value === "" ? null : value);
                })
              }
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Sem acesso</option>
              <option value="visualizacao">Visualização</option>
              <option value="edicao">Edição</option>
            </select>
          </div>
        );
      })}
    </div>
  );
}
