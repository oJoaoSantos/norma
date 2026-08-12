import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getProjetoPermissao } from "@/lib/db/access";
import { db } from "@/lib/db";
import { memoriaVersoes, memoriasDescritivas, projetos } from "@/lib/db/schema";
import { memoriaToInput } from "@/lib/db/mappers";
import { getProvider } from "@/lib/llm";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";

const requestSchema = z.object({ memoriaId: z.string().uuid() });

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const record = await db.query.memoriasDescritivas.findFirst({
    where: eq(memoriasDescritivas.id, parsed.data.memoriaId),
  });
  if (!record) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, record.projetoId),
  });
  if (!projeto || projeto.entidadeId !== session.user.entidadeId) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const permissao = await getProjetoPermissao(session.user.id, role!, projeto);
  if (permissao !== "edicao") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const data = memoriaToInput(record);

  const provider = getProvider();
  const corpo = await provider.generate({
    system: await buildSystemPrompt(data.concelho),
    user: buildUserPrompt(data, {
      nome: record.tecnicoNome,
      numeroOrdem: record.tecnicoNumeroOrdem,
    }),
  });
  // Ver nota equivalente em generate/route.ts — o Quadro Sinótico já não
  // fica embutido no texto, é recalculado a partir dos dados no export.
  const generatedText = corpo;
  const novaVersao = record.versaoAtual + 1;

  await db
    .update(memoriasDescritivas)
    .set({
      generatedText,
      status: "gerado",
      versaoAtual: novaVersao,
      updatedAt: new Date(),
    })
    .where(eq(memoriasDescritivas.id, record.id));

  await db.insert(memoriaVersoes).values({
    memoriaId: record.id,
    versao: novaVersao,
    generatedText,
    status: "gerado",
    createdBy: session.user.id,
  });

  return NextResponse.json({ id: record.id, generatedText, versao: novaVersao });
}
