import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoriaViewer } from "@/components/MemoriaViewer";
import { auth } from "@/lib/auth";
import { getProjetoPermissao } from "@/lib/db/access";
import { db } from "@/lib/db";
import { memoriaVersoes, memoriasDescritivas, projetos, users } from "@/lib/db/schema";
import { DeleteMemoriaButton } from "./DeleteMemoriaButton";
import { RegenerarButton } from "./RegenerarButton";
import { VersionHistory } from "./VersionHistory";

export default async function MemoriaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const user = session!.user;

  const record = await db.query.memoriasDescritivas.findFirst({
    where: eq(memoriasDescritivas.id, id),
  });
  if (!record) notFound();

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, record.projetoId),
  });
  if (!projeto || projeto.entidadeId !== user.entidadeId) notFound();
  const permissao = await getProjetoPermissao(user.id, user.role, projeto);
  if (permissao === null) notFound();

  const editable = permissao === "edicao";

  const criador = record.createdBy
    ? await db.query.users.findFirst({ where: eq(users.id, record.createdBy) })
    : null;

  const versoesAnteriores = await db.query.memoriaVersoes.findMany({
    where: eq(memoriaVersoes.memoriaId, record.id),
    orderBy: desc(memoriaVersoes.versao),
  });
  // A versão atual já é mostrada acima, no editor — não repetir no histórico.
  const historico = versoesAnteriores.filter((v) => v.versao !== record.versaoAtual);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/projetos/${projeto.id}`} className="text-sm text-zinc-500 hover:underline">
            ← {projeto.nome}
          </Link>
          <h1 className="text-2xl font-semibold">{record.requerenteNome}</h1>
          <p className="text-sm text-zinc-500">
            {record.concelho} — {record.freguesia} · versão {record.versaoAtual}
            {criador && ` · criado por ${criador.name}`}
          </p>
        </div>
        {editable && <DeleteMemoriaButton memoriaId={record.id} />}
      </div>

      {record.generatedText ? (
        <>
          <MemoriaViewer
            id={record.id}
            initialText={record.generatedText}
            editable={editable}
          />
          {editable && <RegenerarButton memoriaId={record.id} />}
        </>
      ) : (
        <p className="text-sm text-zinc-500">
          Esta memória ainda não tem texto gerado.
        </p>
      )}

      {historico.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium">Versões anteriores</h2>
          <VersionHistory versoes={historico} />
        </section>
      )}
    </main>
  );
}
