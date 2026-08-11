import { and, desc, eq, ilike, inArray } from "drizzle-orm";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memoriasDescritivas, projetoAcessos, projetos, users } from "@/lib/db/schema";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  gerado: "Gerado",
  exportado: "Exportado",
};

export default async function MemoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  const session = await auth();
  const user = session!.user;

  const todosProjetos = await db.query.projetos.findMany({
    where: eq(projetos.entidadeId, user.entidadeId!),
  });

  let projetosVisiveis = todosProjetos;
  if (user.role !== "admin") {
    const acessos = await db.query.projetoAcessos.findMany({
      where: eq(projetoAcessos.userId, user.id),
    });
    const acessoIds = new Set(acessos.map((a) => a.projetoId));
    projetosVisiveis = todosProjetos.filter(
      (p) => p.createdBy === user.id || acessoIds.has(p.id),
    );
  }

  const nomesPorProjeto = new Map(projetosVisiveis.map((p) => [p.id, p.nome]));
  const idsVisiveis = projetosVisiveis.map((p) => p.id);

  const where =
    idsVisiveis.length > 0
      ? and(
          inArray(memoriasDescritivas.projetoId, idsVisiveis),
          q ? ilike(memoriasDescritivas.requerenteNome, `%${q}%`) : undefined,
        )
      : undefined;

  const rows =
    idsVisiveis.length > 0
      ? await db.query.memoriasDescritivas.findMany({
          where,
          orderBy: desc(memoriasDescritivas.createdAt),
          limit: PAGE_SIZE + 1,
          offset: (page - 1) * PAGE_SIZE,
        })
      : [];

  const hasMore = rows.length > PAGE_SIZE;
  const visibleRows = rows.slice(0, PAGE_SIZE);

  const criadorIds = [
    ...new Set(visibleRows.map((r) => r.createdBy).filter((v): v is string => !!v)),
  ];
  const criadores =
    criadorIds.length > 0
      ? await db.query.users.findMany({ where: inArray(users.id, criadorIds) })
      : [];
  const nomeCriador = new Map(criadores.map((u) => [u.id, u.name]));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Memórias Descritivas</h1>
        <Link
          href="/projetos"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Ver Projetos
        </Link>
      </div>

      <SearchBox q={q} placeholder="Pesquisar por requerente…" />

      {visibleRows.length === 0 ? (
        <p className="text-sm text-zinc-500">Ainda não há memórias descritivas.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2 font-medium">Requerente</th>
                <th className="px-4 py-2 font-medium">Projeto</th>
                <th className="px-4 py-2 font-medium">Criado por</th>
                <th className="px-4 py-2 font-medium">Concelho</th>
                <th className="px-4 py-2 font-medium">Versão</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-zinc-200 dark:border-zinc-800"
                >
                  <td className="px-4 py-2">
                    <Link href={`/memorias/${row.id}`} className="hover:underline">
                      {row.requerenteNome}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {nomesPorProjeto.get(row.projetoId) ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {row.createdBy ? (nomeCriador.get(row.createdBy) ?? "—") : "—"}
                  </td>
                  <td className="px-4 py-2">{row.concelho}</td>
                  <td className="px-4 py-2">v{row.versaoAtual}</td>
                  <td className="px-4 py-2">{STATUS_LABEL[row.status] ?? row.status}</td>
                  <td className="px-4 py-2">
                    {row.createdAt.toLocaleDateString("pt-PT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} hasMore={hasMore} q={q} />
    </main>
  );
}
