"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjetoPermissao } from "@/lib/db/access";
import { db } from "@/lib/db";
import { memoriasDescritivas, projetos } from "@/lib/db/schema";

export async function deleteMemoriaAction(memoriaId: string) {
  const session = await auth();
  if (!session?.user || !session.user.entidadeId) {
    throw new Error("Sem permissão");
  }

  const record = await db.query.memoriasDescritivas.findFirst({
    where: eq(memoriasDescritivas.id, memoriaId),
  });
  if (!record) throw new Error("Não encontrado");

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, record.projetoId),
  });
  if (!projeto || projeto.entidadeId !== session.user.entidadeId) {
    throw new Error("Não encontrado");
  }

  const permissao = await getProjetoPermissao(session.user.id, session.user.role, projeto);
  if (permissao !== "edicao") throw new Error("Sem permissão");

  await db.delete(memoriasDescritivas).where(eq(memoriasDescritivas.id, memoriaId));

  redirect(`/projetos/${projeto.id}`);
}
