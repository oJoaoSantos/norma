import type { MemoriaDescritiva } from "@/lib/db/schema";
import type { MemoriaInput } from "@/lib/schemas/memoria";

/**
 * Reconstrói o formato usado pelo motor de geração a partir de uma linha já
 * gravada — usado ao "Regenerar" uma memória existente (nova versão com os
 * mesmos dados). `tecnicoModo`/`tecnicoNomeOutro`/`tecnicoNumeroOrdemOutro`
 * não são lidos por `buildUserPrompt` (que recebe o técnico à parte), o
 * valor aqui é só para satisfazer o tipo.
 */
export function memoriaToInput(record: MemoriaDescritiva): MemoriaInput {
  return {
    requerenteNome: record.requerenteNome,
    requerenteNif: record.requerenteNif,
    requerenteMorada: record.requerenteMorada,
    tecnicoModo: "proprio",
    concelho: record.concelho,
    freguesia: record.freguesia,
    artigoMatricial: record.artigoMatricial,
    morada: record.morada,
    naturezaPredio: record.naturezaPredio,
    numeroRegistoPredial: record.numeroRegistoPredial,
    areaTerreno: Number(record.areaTerreno),
    confrontacaoNorte: record.confrontacaoNorte,
    confrontacaoSul: record.confrontacaoSul,
    confrontacaoNascente: record.confrontacaoNascente,
    confrontacaoPoente: record.confrontacaoPoente,
    enquadramentoEnvolvente: record.enquadramentoEnvolvente ?? undefined,
    areaTotalConstrucao: Number(record.areaTotalConstrucao),
    areaImplantacao: Number(record.areaImplantacao),
    cerceaMetros: Number(record.cerceaMetros),
    numeroPisos: record.numeroPisos,
    volumeMetrosCubicos:
      record.volumeMetrosCubicos != null
        ? Number(record.volumeMetrosCubicos)
        : undefined,
    numeroEstacionamentos: record.numeroEstacionamentos ?? undefined,
    cotaSoleira:
      record.cotaSoleira != null ? Number(record.cotaSoleira) : undefined,
    areaImpermeabilizacao:
      record.areaImpermeabilizacao != null
        ? Number(record.areaImpermeabilizacao)
        : undefined,
    compartimentos: record.compartimentos ?? [],
    revestimentoFachada: record.revestimentoFachada,
    caixilharia: record.caixilharia,
    isolamentoTermicoAcustico: record.isolamentoTermicoAcustico,
    tipoObra: record.tipoObra,
  };
}
