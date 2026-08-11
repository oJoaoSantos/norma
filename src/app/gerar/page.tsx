import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjetoPermissao } from "@/lib/db/access";
import { db } from "@/lib/db";
import { projetos, users } from "@/lib/db/schema";
import { GerarWizard } from "./GerarWizard";

export default async function GerarPage({
  searchParams,
}: {
  searchParams: Promise<{ projetoId?: string }>;
}) {
  const { projetoId } = await searchParams;
  const session = await auth();
  const user = session!.user;

  if (!projetoId) redirect("/projetos");

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, projetoId),
  });
  if (!projeto || projeto.entidadeId !== user.entidadeId) redirect("/projetos");
  const permissao = await getProjetoPermissao(user.id, user.role, projeto);
  if (permissao !== "edicao") redirect(`/projetos/${projeto.id}`);

  const eu = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  const semNumeroOrdem = !eu?.numeroOrdem;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <p className="text-sm text-zinc-500">
        Projeto:{" "}
        <Link href={`/projetos/${projeto.id}`} className="underline">
          {projeto.nome}
        </Link>
      </p>

      {semNumeroOrdem && (
        <p className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Ainda não preencheste o teu número de ordem no{" "}
          <Link href="/perfil" className="underline">
            perfil
          </Link>
          . É necessário para gerares uma Memória Descritiva como técnico
          responsável (não é necessário se fores registar a memória em nome
          de outro técnico).
        </p>
      )}
      <GerarWizard
        projetoId={projeto.id}
        meuNome={eu?.name ?? ""}
        meuNumeroOrdem={eu?.numeroOrdem ?? null}
      />
    </main>
  );
}
