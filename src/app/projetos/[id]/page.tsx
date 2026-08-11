import { desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjetoPermissao } from "@/lib/db/access";
import { db } from "@/lib/db";
import { memoriasDescritivas, projetoAcessos, projetos, users } from "@/lib/db/schema";
import { DeleteProjetoButton } from "./DeleteProjetoButton";
import { LeaveProjetoButton } from "./LeaveProjetoButton";
import { SharePanel } from "./SharePanel";

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  gerado: "Gerado",
  exportado: "Exportado",
};

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const user = session!.user;

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, id),
  });

  if (!projeto || projeto.entidadeId !== user.entidadeId) notFound();

  const permissao = await getProjetoPermissao(user.id, user.role, projeto);
  if (permissao === null) notFound();

  const criador = projeto.createdBy
    ? await db.query.users.findFirst({ where: eq(users.id, projeto.createdBy) })
    : null;

  const memorias = await db.query.memoriasDescritivas.findMany({
    where: eq(memoriasDescritivas.projetoId, projeto.id),
    orderBy: desc(memoriasDescritivas.createdAt),
  });

  const criadorIds = [...new Set(memorias.map((m) => m.createdBy).filter((v): v is string => !!v))];
  const criadoresMemorias =
    criadorIds.length > 0
      ? await db.query.users.findMany({ where: inArray(users.id, criadorIds) })
      : [];
  const nomeCriadorMemoria = new Map(criadoresMemorias.map((u) => [u.id, u.name]));

  const canGerar = permissao === "edicao";
  const podeApagar = user.role === "admin" || projeto.createdBy === user.id;
  const podeSair = user.role !== "admin" && projeto.createdBy !== user.id;

  let shareData: {
    utilizadores: (typeof users.$inferSelect)[];
    acessos: Map<string, "visualizacao" | "edicao">;
  } | null = null;
  if (permissao === "edicao") {
    const [utilizadores, acessos] = await Promise.all([
      db.query.users.findMany({
        where: eq(users.entidadeId, user.entidadeId!),
      }),
      db.query.projetoAcessos.findMany({
        where: eq(projetoAcessos.projetoId, projeto.id),
      }),
    ]);
    shareData = {
      // O admin e quem criou o projeto já têm sempre acesso implícito —
      // não faz sentido aparecerem na lista de "dar acesso". O próprio
      // utilizador a ver esta página também não precisa de se autopartilhar.
      utilizadores: utilizadores.filter(
        (u) => u.id !== projeto.createdBy && u.id !== user.id,
      ),
      acessos: new Map(acessos.map((a) => [a.userId, a.permissao])),
    };
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <Link href="/projetos" className="text-sm text-zinc-500 hover:underline">
          ← Projetos
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{projeto.nome}</h1>
            {projeto.descricao && (
              <p className="text-sm text-zinc-500">{projeto.descricao}</p>
            )}
            {criador && (
              <p className="mt-1 text-sm text-zinc-500">Criado por {criador.name}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {podeSair && <LeaveProjetoButton projetoId={projeto.id} />}
            {podeApagar && <DeleteProjetoButton projetoId={projeto.id} />}
            {canGerar && (
              <Link
                href={`/gerar?projetoId=${projeto.id}`}
                className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
              >
                Nova Memória
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Memórias</h2>
        {memorias.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ainda não há memórias neste projeto.
          </p>
        ) : (
          <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 font-medium">Requerente</th>
                  <th className="px-4 py-2 font-medium">Criado por</th>
                  <th className="px-4 py-2 font-medium">Versão</th>
                  <th className="px-4 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {memorias.map((m) => (
                  <tr key={m.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-2">
                      <Link href={`/memorias/${m.id}`} className="hover:underline">
                        {m.requerenteNome}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-500">
                      {m.createdBy ? (nomeCriadorMemoria.get(m.createdBy) ?? "—") : "—"}
                    </td>
                    <td className="px-4 py-2">v{m.versaoAtual}</td>
                    <td className="px-4 py-2">{STATUS_LABEL[m.status] ?? m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {shareData && (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-medium">Partilhar</h2>
            <p className="text-sm text-zinc-500">
              Utilizadores com acesso a este projeto, além do admin e de quem
              o criou (que têm sempre acesso).
            </p>
          </div>
          <SharePanel
            projetoId={projeto.id}
            utilizadores={shareData.utilizadores}
            acessos={shareData.acessos}
            criador={criador ? { name: criador.name, email: criador.email } : null}
          />
        </section>
      )}
    </main>
  );
}
