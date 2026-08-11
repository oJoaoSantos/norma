import { desc, eq, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { entidades, users } from "@/lib/db/schema";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { CreateEntidadeForm } from "./CreateEntidadeForm";
import { EntidadeRow } from "./EntidadeRow";

export default async function RootEntidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: rawPage } = await searchParams;
  const page = parsePage(rawPage);

  const rows = await db.query.entidades.findMany({
    where: q ? ilike(entidades.nome, `%${q}%`) : undefined,
    orderBy: desc(entidades.createdAt),
    limit: PAGE_SIZE + 1,
    offset: (page - 1) * PAGE_SIZE,
  });
  const hasMore = rows.length > PAGE_SIZE;
  const visibleRows = rows.slice(0, PAGE_SIZE);

  const admins =
    visibleRows.length > 0
      ? await db.query.users.findMany({ where: eq(users.role, "admin") })
      : [];

  const adminEmailsByEntidade = new Map<string, string[]>();
  for (const admin of admins) {
    if (!admin.entidadeId) continue;
    const list = adminEmailsByEntidade.get(admin.entidadeId) ?? [];
    list.push(admin.email);
    adminEmailsByEntidade.set(admin.entidadeId, list);
  }

  return (
    <div className="flex flex-col gap-8">
      <CreateEntidadeForm />

      <SearchBox q={q} placeholder="Pesquisar entidades…" />

      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2 font-medium">Entidade</th>
              <th className="px-4 py-2 font-medium">Admin(s)</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((e) => (
              <EntidadeRow
                key={e.id}
                entidade={e}
                adminEmails={adminEmailsByEntidade.get(e.id) ?? []}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} hasMore={hasMore} q={q} />
    </div>
  );
}
