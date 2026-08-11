import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projetoAcessos, type Projeto, type Role } from "@/lib/db/schema";

export type ProjetoPermissao = "edicao" | "visualizacao" | null;

/**
 * Nível de acesso de um utilizador a um projeto: admin da entidade e quem
 * criou o projeto têm sempre "edicao"; outros dependem da partilha explícita
 * (projeto_acessos.permissao). `null` = sem acesso nenhum.
 */
export async function getProjetoPermissao(
  userId: string,
  role: Role,
  projeto: Pick<Projeto, "id" | "createdBy">,
): Promise<ProjetoPermissao> {
  if (role === "admin") return "edicao";
  if (projeto.createdBy === userId) return "edicao";

  const acesso = await db.query.projetoAcessos.findFirst({
    where: and(
      eq(projetoAcessos.projetoId, projeto.id),
      eq(projetoAcessos.userId, userId),
    ),
  });
  return acesso?.permissao ?? null;
}

export async function hasProjetoAccess(
  userId: string,
  role: Role,
  projeto: Pick<Projeto, "id" | "createdBy">,
): Promise<boolean> {
  return (await getProjetoPermissao(userId, role, projeto)) !== null;
}
