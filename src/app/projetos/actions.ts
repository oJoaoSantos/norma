"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjetoPermissao } from "@/lib/db/access";
import { db } from "@/lib/db";
import { projetoAcessos, projetos } from "@/lib/db/schema";
import { createProjetoSchema } from "@/lib/schemas/projeto";
import type { ActionState } from "@/lib/action-state";

async function requireEntidadeUser() {
  const session = await auth();
  if (!session?.user || !session.user.entidadeId) {
    throw new Error("Sem permissão");
  }
  return session;
}

export async function createProjetoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireEntidadeUser();
  if (session.user.role !== "admin" && session.user.role !== "arquiteto") {
    return { error: "Sem permissão" };
  }

  const parsed = createProjetoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const [projeto] = await db
    .insert(projetos)
    .values({
      nome: parsed.data.nome,
      descricao: parsed.data.descricao,
      entidadeId: session.user.entidadeId!,
      createdBy: session.user.id,
    })
    .returning();

  revalidatePath("/projetos");
  redirect(`/projetos/${projeto.id}`);
}

export async function deleteProjetoAction(projetoId: string) {
  const session = await requireEntidadeUser();

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, projetoId),
  });
  if (!projeto || projeto.entidadeId !== session.user.entidadeId) {
    throw new Error("Não encontrado");
  }
  if (session.user.role !== "admin" && projeto.createdBy !== session.user.id) {
    throw new Error("Sem permissão");
  }

  await db.delete(projetos).where(eq(projetos.id, projetoId));

  revalidatePath("/projetos");
  redirect("/projetos");
}

export async function leaveProjetoAction(projetoId: string) {
  const session = await requireEntidadeUser();

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, projetoId),
  });
  if (!projeto || projeto.entidadeId !== session.user.entidadeId) {
    throw new Error("Não encontrado");
  }
  if (session.user.role === "admin" || projeto.createdBy === session.user.id) {
    throw new Error("Não podes sair deste projeto");
  }

  await db
    .delete(projetoAcessos)
    .where(
      and(
        eq(projetoAcessos.projetoId, projetoId),
        eq(projetoAcessos.userId, session.user.id),
      ),
    );

  revalidatePath("/projetos");
  redirect("/projetos");
}

async function requireProjetoAdmin(projetoId: string) {
  const session = await requireEntidadeUser();

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, projetoId),
  });
  if (!projeto || projeto.entidadeId !== session.user.entidadeId) {
    throw new Error("Não encontrado");
  }

  const permissao = await getProjetoPermissao(session.user.id, session.user.role, projeto);
  if (permissao !== "edicao") throw new Error("Sem permissão");

  return { session, projeto };
}

export async function setProjetoAcessoAction(
  projetoId: string,
  userId: string,
  permissao: "visualizacao" | "edicao" | null,
) {
  await requireProjetoAdmin(projetoId);

  const where = and(
    eq(projetoAcessos.projetoId, projetoId),
    eq(projetoAcessos.userId, userId),
  );

  if (permissao === null) {
    await db.delete(projetoAcessos).where(where);
  } else {
    const existing = await db.query.projetoAcessos.findFirst({ where });
    if (existing) {
      await db.update(projetoAcessos).set({ permissao }).where(where);
    } else {
      await db.insert(projetoAcessos).values({ projetoId, userId, permissao });
    }
  }

  revalidatePath(`/projetos/${projetoId}`);
}
