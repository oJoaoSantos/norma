import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { entidades, users } from "@/lib/db/schema";
import { AdminRow } from "../../AdminRow";
import { CreateAdminForm } from "../../CreateAdminForm";

export default async function RootEntidadeDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const entidade = await db.query.entidades.findFirst({
    where: eq(entidades.id, id),
  });
  if (!entidade) notFound();

  const admins = await db.query.users.findMany({
    where: and(eq(users.entidadeId, id), eq(users.role, "admin")),
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/root" className="text-sm text-zinc-500 hover:underline">
          ← Entidades
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{entidade.nome}</h1>
        <p className="text-sm text-zinc-500">
          {entidade.active ? "Ativa" : "Inativa"}
        </p>
      </div>

      <CreateAdminForm entidadeId={entidade.id} />

      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <AdminRow key={a.id} admin={a} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
