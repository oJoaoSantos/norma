import { z } from "zod";

export const TIPO_OBRA_OPTIONS = [
  { value: "construcao_nova", label: "Construção Nova" },
  { value: "ampliacao", label: "Ampliação" },
  { value: "alteracao", label: "Alteração" },
  { value: "demolicao", label: "Demolição" },
] as const;

export const NATUREZA_PREDIO_OPTIONS = [
  { value: "rustica", label: "Rústica" },
  { value: "urbana", label: "Urbana" },
  { value: "mista", label: "Mista" },
] as const;

const optionalPositiveNumber = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.coerce.number().positive("Tem de ser positivo").optional(),
);

const optionalPositiveInt = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.coerce.number().int().positive("Tem de ser positivo").optional(),
);

export const compartimentoSchema = z.object({
  nome: z.string().min(1, "Obrigatório"),
  area: z.coerce.number().positive("Tem de ser positivo"),
});

export const memoriaInputSchema = z
  .object({
    // Requerente
    requerenteNome: z.string().min(1, "Obrigatório"),
    requerenteNif: z.string().min(1, "Obrigatório"),
    requerenteMorada: z.string().min(1, "Obrigatório"),

    // Técnico responsável
    tecnicoModo: z.enum(["proprio", "outro"]).default("proprio"),
    tecnicoNomeOutro: z.string().optional(),
    tecnicoNumeroOrdemOutro: z.string().optional(),

    // Localização da obra
    concelho: z.string().min(1, "Obrigatório"),
    freguesia: z.string().min(1, "Obrigatório"),
    artigoMatricial: z.string().min(1, "Obrigatório"),
    morada: z.string().min(1, "Obrigatório"),
    naturezaPredio: z.enum(["rustica", "urbana", "mista"]),
    numeroRegistoPredial: z.string().min(1, "Obrigatório"),

    // Terreno e confrontações
    areaTerreno: z.coerce.number().positive("Tem de ser positivo"),
    confrontacaoNorte: z.string().min(1, "Obrigatório"),
    confrontacaoSul: z.string().min(1, "Obrigatório"),
    confrontacaoNascente: z.string().min(1, "Obrigatório"),
    confrontacaoPoente: z.string().min(1, "Obrigatório"),

    // Parâmetros urbanísticos
    areaTotalConstrucao: z.coerce.number().positive("Tem de ser positivo"),
    areaImplantacao: z.coerce.number().positive("Tem de ser positivo"),
    cerceaMetros: z.coerce.number().positive("Tem de ser positivo"),
    numeroPisos: z.coerce.number().int().positive("Tem de ser positivo"),
    volumeMetrosCubicos: optionalPositiveNumber,
    numeroEstacionamentos: optionalPositiveInt,
    cotaSoleira: optionalPositiveNumber,
    areaImpermeabilizacao: optionalPositiveNumber,

    // Compartimentos (opcional)
    compartimentos: z.array(compartimentoSchema).default([]),

    // Materiais e acabamentos
    revestimentoFachada: z.string().min(1, "Obrigatório"),
    caixilharia: z.string().min(1, "Obrigatório"),
    isolamentoTermicoAcustico: z.string().min(1, "Obrigatório"),

    tipoObra: z.enum([
      "construcao_nova",
      "ampliacao",
      "alteracao",
      "demolicao",
    ]),
  })
  .superRefine((data, ctx) => {
    if (data.tecnicoModo === "outro") {
      if (!data.tecnicoNomeOutro?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Obrigatório",
          path: ["tecnicoNomeOutro"],
        });
      }
      if (!data.tecnicoNumeroOrdemOutro?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Obrigatório",
          path: ["tecnicoNumeroOrdemOutro"],
        });
      }
    }
  });

/** Valores validados/coagidos (o que a API recebe depois do parse). */
export type MemoriaInput = z.output<typeof memoriaInputSchema>;

/** Valores tal como o formulário os guarda antes da validação (inputs HTML são strings). */
export type MemoriaFormInput = z.input<typeof memoriaInputSchema>;
