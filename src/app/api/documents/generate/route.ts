import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getProjetoPermissao } from "@/lib/db/access";
import { db } from "@/lib/db";
import { memoriaVersoes, memoriasDescritivas, projetos, users } from "@/lib/db/schema";
import { getProvider } from "@/lib/llm";
import { buildQuadroSinotico, buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { memoriaInputSchema } from "@/lib/schemas/memoria";

const requestSchema = memoriaInputSchema.and(
  z.object({ projetoId: z.string().uuid() }),
);

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, data.projetoId),
  });
  if (!projeto || projeto.entidadeId !== session.user.entidadeId) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  }
  const permissao = await getProjetoPermissao(session.user.id, role!, projeto);
  if (permissao !== "edicao") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  let tecnicoNome: string;
  let tecnicoNumeroOrdem: string;

  if (data.tecnicoModo === "outro") {
    // Validado no schema (superRefine) que estes campos vêm preenchidos.
    tecnicoNome = data.tecnicoNomeOutro!;
    tecnicoNumeroOrdem = data.tecnicoNumeroOrdemOutro!;
  } else {
    const eu = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (!eu?.numeroOrdem) {
      return NextResponse.json(
        { error: "Preenche o teu número de ordem no perfil antes de gerar." },
        { status: 400 },
      );
    }
    tecnicoNome = eu.name;
    tecnicoNumeroOrdem = eu.numeroOrdem;
  }

  const [record] = await db
    .insert(memoriasDescritivas)
    .values({
      projetoId: projeto.id,
      createdBy: session.user.id,

      requerenteNome: data.requerenteNome,
      requerenteNif: data.requerenteNif,
      requerenteMorada: data.requerenteMorada,

      tecnicoNome,
      tecnicoNumeroOrdem,

      concelho: data.concelho,
      freguesia: data.freguesia,
      artigoMatricial: data.artigoMatricial,
      morada: data.morada,
      naturezaPredio: data.naturezaPredio,
      numeroRegistoPredial: data.numeroRegistoPredial,

      areaTerreno: String(data.areaTerreno),
      confrontacaoNorte: data.confrontacaoNorte,
      confrontacaoSul: data.confrontacaoSul,
      confrontacaoNascente: data.confrontacaoNascente,
      confrontacaoPoente: data.confrontacaoPoente,

      areaTotalConstrucao: String(data.areaTotalConstrucao),
      areaImplantacao: String(data.areaImplantacao),
      cerceaMetros: String(data.cerceaMetros),
      numeroPisos: data.numeroPisos,
      volumeMetrosCubicos:
        data.volumeMetrosCubicos !== undefined
          ? String(data.volumeMetrosCubicos)
          : undefined,
      numeroEstacionamentos: data.numeroEstacionamentos,
      cotaSoleira:
        data.cotaSoleira !== undefined ? String(data.cotaSoleira) : undefined,
      areaImpermeabilizacao:
        data.areaImpermeabilizacao !== undefined
          ? String(data.areaImpermeabilizacao)
          : undefined,

      compartimentos: data.compartimentos,

      revestimentoFachada: data.revestimentoFachada,
      caixilharia: data.caixilharia,
      isolamentoTermicoAcustico: data.isolamentoTermicoAcustico,

      tipoObra: data.tipoObra,
    })
    .returning();

  const provider = getProvider();
  const corpo = await provider.generate({
    system: await buildSystemPrompt(data.concelho),
    user: buildUserPrompt(data, {
      nome: tecnicoNome,
      numeroOrdem: tecnicoNumeroOrdem,
    }),
  });
  const generatedText = `${corpo}\n\n${buildQuadroSinotico(data)}`;

  const [updated] = await db
    .update(memoriasDescritivas)
    .set({ generatedText, status: "gerado", updatedAt: new Date() })
    .where(eq(memoriasDescritivas.id, record.id))
    .returning();

  await db.insert(memoriaVersoes).values({
    memoriaId: record.id,
    versao: 1,
    generatedText,
    status: "gerado",
    createdBy: session.user.id,
  });

  return NextResponse.json({ id: updated?.id ?? record.id, generatedText });
}
