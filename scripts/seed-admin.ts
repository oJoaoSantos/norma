import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { LEGISLACAO_NACIONAL_KEY } from "../src/lib/db/legislacao";
import { db } from "../src/lib/db";
import { entidades, legislacaoConcelhos, users } from "../src/lib/db/schema";

/**
 * Pesquisado e verificado em 2026-08-10 (pgdlisboa.pt, dre.pt). Só inclui
 * diplomas/artigos nacionais estáveis e bem estabelecidos — nada específico
 * de PDM municipal (isso fica na camada por concelho, preenchida à parte).
 *
 * ATENÇÃO — regime em transição: a Portaria n.º 320/2026/1, de 31 de julho
 * (que identifica os elementos instrutórios, incl. a Memória Descritiva),
 * está associada à entrada em vigor do DL n.º 108/2026, de 29 de maio
 * (revisão do RJUE), adiada para 1 de outubro de 2026. Revisar este texto
 * depois dessa data para confirmar que continua a refletir o regime em vigor.
 */
const LEGISLACAO_NACIONAL = `
Regime Jurídico da Urbanização e Edificação — RJUE (Decreto-Lei n.º 555/99,
de 16 de dezembro, na redação atual):
- Art. 4.º classifica as operações urbanísticas sujeitas a licenciamento e as
  sujeitas a comunicação prévia.
- Art. 6.º e 6.º-A definem as operações isentas de controlo prévio (ex.:
  obras de conservação, obras de escassa relevância urbanística).

Elementos instrutórios do procedimento (incluindo a Memória Descritiva e
Justificativa): regulados pela Portaria n.º 320/2026/1, de 31 de julho, que
identifica os elementos instrutórios dos procedimentos previstos no RJUE e
revogou as Portarias n.os 71-A/2024 e 71-B/2024, de 27 de fevereiro.

Regulamento Geral das Edificações Urbanas — RGEU (Decreto-Lei n.º 38382, de
7 de agosto de 1951, na redação atual):
- Art. 65.º — pé-direito mínimo: 2,70 m entre pisos em compartimentos de
  habitação, não podendo o pé-direito livre ser inferior a 2,40 m (com
  reduções admitidas para vestíbulos, corredores, instalações sanitárias e
  arrecadações).
- Art. 59.º e 60.º — regras de prospeto/afastamento entre fachadas com vãos
  de compartimentos habitáveis.
- Art. 71.º e 72.º — dimensão mínima e ventilação/iluminação natural dos
  vãos dos compartimentos.

Usa estes diplomas e artigos apenas para afirmações genéricas e estruturais
(classificação do procedimento, elementos instrutórios exigidos, regras
gerais de salubridade/conforto). Não inventes números de artigo adicionais
nem valores que não estejam aqui.
`.trim();

const PLACEHOLDER_SINTRA = `
[PLACEHOLDER — substituir por excertos oficiais antes de gerar documentos reais]

Fontes a incluir aqui:
- Decreto-Lei n.º 555/99, de 16 de dezembro (RJUE), na redação atual — artigos
  relevantes para o tipo de procedimento (licenciamento vs. comunicação prévia).
- RGEU (Regulamento Geral das Edificações Urbanas) — artigos aplicáveis a
  parâmetros como cércea, pé-direito, áreas mínimas.
- Regulamento do PDM de Sintra e regulamentos municipais aplicáveis
  (índices urbanísticos, cércea máxima por zona, afastamentos).
`.trim();

/**
 * Únicos dois artigos confirmados através de uma memória descritiva real
 * aprovada pela Câmara de Viseu (fornecida pelo utilizador em 2026-08),
 * para solo urbano classificado como "Espaços Habitacionais H2". NÃO cobre
 * outras classificações de solo do PDM de Viseu — o resto fica por
 * preencher até haver mais exemplos ou o regulamento consultado diretamente.
 */
const LEGISLACAO_VISEU = `
[PARCIALMENTE PREENCHIDO — apenas confirmado para solo urbano "Espaços
Habitacionais H2"; para outras classificações de solo, completar antes de
confiar nas citações]

P.D.M. do Município de Viseu:
- Art. 74.º-B — edificabilidade (incl. edificabilidade média, abstrata e em
  excesso) em solo urbano classificado como Espaços Habitacionais H2.
- Art. 68.º-G — número mínimo de lugares de estacionamento.

Regulamento Municipal de Urbanização e Edificação de Viseu — aplicável a
condicionantes gerais urbanísticas e arquitetónicas, afastamentos, recuos,
altura de muros de vedação e materialidade.
`.trim();

async function main() {
  const rootEmail = process.env.ROOT_EMAIL;
  const rootPassword = process.env.ROOT_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "Administrador";
  const entidadeNome = process.env.ENTIDADE_DEMO_NOME ?? "Entidade Demo";

  if (!rootEmail || !rootPassword) {
    throw new Error(
      "Define ROOT_EMAIL e ROOT_PASSWORD no .env antes de correr este script.",
    );
  }
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Define ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de correr este script.",
    );
  }

  const rootPasswordHash = await bcrypt.hash(rootPassword, 12);
  await db
    .insert(users)
    .values({
      name: "Root",
      email: rootEmail,
      passwordHash: rootPasswordHash,
      role: "root",
      entidadeId: null,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash: rootPasswordHash, role: "root", active: true },
    });

  let entidade = await db.query.entidades.findFirst({
    where: eq(entidades.nome, entidadeNome),
  });
  if (!entidade) {
    [entidade] = await db.insert(entidades).values({ nome: entidadeNome }).returning();
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  await db
    .insert(users)
    .values({
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "admin",
      entidadeId: entidade.id,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: adminPasswordHash,
        name: adminName,
        role: "admin",
        active: true,
        entidadeId: entidade.id,
      },
    });

  await db
    .insert(legislacaoConcelhos)
    .values({
      concelho: LEGISLACAO_NACIONAL_KEY,
      conteudo: LEGISLACAO_NACIONAL,
    })
    .onConflictDoNothing({ target: legislacaoConcelhos.concelho });

  await db
    .insert(legislacaoConcelhos)
    .values({ concelho: "Sintra", conteudo: PLACEHOLDER_SINTRA })
    .onConflictDoNothing({ target: legislacaoConcelhos.concelho });

  await db
    .insert(legislacaoConcelhos)
    .values({ concelho: "Viseu", conteudo: LEGISLACAO_VISEU })
    .onConflictDoNothing({ target: legislacaoConcelhos.concelho });

  console.log(
    `Root "${rootEmail}" criado/atualizado. Entidade "${entidade.nome}" (${entidade.id}) pronta, com admin "${adminEmail}". Legislação nacional, Sintra (placeholder) e Viseu (parcial) semeadas.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
