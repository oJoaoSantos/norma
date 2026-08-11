import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hasProjetoAccess } from "@/lib/db/access";
import { db } from "@/lib/db";
import { memoriasDescritivas, projetos, users } from "@/lib/db/schema";
import { buildMemoriaDocx, DEFAULT_LAYOUT, type LayoutConfig } from "@/lib/docx/build-memoria";

const exportInputSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  /** true ao exportar uma versão antiga — não atualiza o estado "atual" da memória. */
  historico: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = exportInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id, text, historico } = parsed.data;

  const record = await db.query.memoriasDescritivas.findFirst({
    where: eq(memoriasDescritivas.id, id),
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
  if (!(await hasProjetoAccess(session.user.id, session.user.role, projeto))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  if (!historico) {
    await db
      .update(memoriasDescritivas)
      .set({ generatedText: text, status: "exportado", updatedAt: new Date() })
      .where(eq(memoriasDescritivas.id, id));
  }

  const eu = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  const layout: LayoutConfig = eu
    ? {
        fonte: eu.docxFonte,
        tamanhoPt: eu.docxTamanhoPt,
        espacamento: eu.docxEspacamento,
        alinhamento: eu.docxAlinhamento,
      }
    : DEFAULT_LAYOUT;

  const buffer = await buildMemoriaDocx(record, text, layout);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="memoria-descritiva.docx"',
    },
  });
}
