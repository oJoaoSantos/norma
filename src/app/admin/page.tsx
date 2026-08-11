import { and, desc, eq, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { CreateUserForm } from "./CreateUserForm";
import { UserRow } from "./UserRow";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  const session = await auth();

  const where = and(
    eq(users.entidadeId, session!.user.entidadeId!),
    q ? or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)) : undefined,
  );

  const rows = await db.query.users.findMany({
    where,
    orderBy: desc(users.createdAt),
    limit: PAGE_SIZE + 1,
    offset: (page - 1) * PAGE_SIZE,
  });

  const hasMore = rows.length > PAGE_SIZE;
  const visibleRows = rows.slice(0, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      <CreateUserForm />

      <SearchBox q={q} placeholder="Pesquisar por nome ou email…" />

      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Papel</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} hasMore={hasMore} q={q} />
    </div>
  );
}
