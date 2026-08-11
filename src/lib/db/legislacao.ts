import { eq, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { legislacaoConcelhos } from "@/lib/db/schema";

/**
 * Chave reservada para a linha que guarda a base legal nacional (RJUE/RGEU),
 * aplicável a todos os concelhos — vive na mesma tabela para reutilizar o
 * CRUD do admin, mas nunca corresponde a um nome de concelho real.
 */
export const LEGISLACAO_NACIONAL_KEY = "__base_nacional__";

export async function getLegislacaoNacional(): Promise<string | null> {
  const record = await db.query.legislacaoConcelhos.findFirst({
    where: eq(legislacaoConcelhos.concelho, LEGISLACAO_NACIONAL_KEY),
  });
  return record?.conteudo ?? null;
}

export async function getLegislacaoMunicipal(
  concelho: string,
): Promise<string | null> {
  const record = await db.query.legislacaoConcelhos.findFirst({
    where: ilike(legislacaoConcelhos.concelho, concelho.trim()),
  });
  return record?.conteudo ?? null;
}
