import { asc, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { legislacaoConcelhos } from "@/lib/db/schema";
import { LEGISLACAO_NACIONAL_KEY, getLegislacaoNacional } from "@/lib/db/legislacao";
import { LegislacaoForm } from "./LegislacaoForm";

export default async function RootLegislacaoPage() {
  const [nacional, rows] = await Promise.all([
    getLegislacaoNacional(),
    db.query.legislacaoConcelhos.findMany({
      where: ne(legislacaoConcelhos.concelho, LEGISLACAO_NACIONAL_KEY),
      orderBy: asc(legislacaoConcelhos.concelho),
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-500">
        A base nacional (RJUE/RGEU) aplica-se automaticamente a todos os
        concelhos, em todas as entidades. O texto por concelho é para o
        PDM/regulamentos municipais específicos — se um concelho não tiver
        nada aqui, a IA é instruída a não inventar índices ou parâmetros
        desse município.
      </p>

      <LegislacaoForm
        concelho={LEGISLACAO_NACIONAL_KEY}
        conteudo={nacional ?? ""}
        label="Base Nacional (RJUE / RGEU) — aplicada a todos os concelhos"
      />

      {rows.map((r) => (
        <LegislacaoForm key={r.id} concelho={r.concelho} conteudo={r.conteudo} />
      ))}

      <LegislacaoForm concelho="" conteudo="" isNew />
    </div>
  );
}
