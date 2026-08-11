import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projetoAcessos, projetos } from "@/lib/db/schema";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { CreateProjetoForm } from "./CreateProjetoForm";

export default async function ProjetosPage({
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
    orderBy: desc(projetos.createdAt),
  });

  let visiveis = todosProjetos;
  if (user.role !== "admin") {
    const acessos = await db.query.projetoAcessos.findMany({
      where: eq(projetoAcessos.userId, user.id),
    });
    const acessoIds = new Set(acessos.map((a) => a.projetoId));
    visiveis = todosProjetos.filter(
      (p) => p.createdBy === user.id || acessoIds.has(p.id),
    );
  }

  if (q) {
    const needle = q.toLowerCase();
    visiveis = visiveis.filter((p) => p.nome.toLowerCase().includes(needle));
  }

  const hasMore = visiveis.length > page * PAGE_SIZE;
  const visiblePage = visiveis.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const canCreate = user.role === "admin" || user.role === "arquiteto";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">Projetos</h1>

      {canCreate && <CreateProjetoForm />}

      <SearchBox q={q} placeholder="Pesquisar projetos…" />

      {visiblePage.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Ainda não tens acesso a nenhum projeto.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visiblePage.map((p) => (
            <Link
              key={p.id}
              href={`/projetos/${p.id}`}
              className="rounded border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <p className="font-medium">{p.nome}</p>
              {p.descricao && (
                <p className="text-sm text-zinc-500">{p.descricao}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} hasMore={hasMore} q={q} />
    </main>
  );
}
