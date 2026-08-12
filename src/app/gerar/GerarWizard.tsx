"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FieldErrors, UseFormRegister, useForm } from "react-hook-form";
import { MemoriaViewer } from "@/components/MemoriaViewer";
import { Stepper } from "@/components/Stepper";
import { getFreguesiasPorConcelho } from "@/lib/geo";
import {
  MemoriaFormInput,
  MemoriaInput,
  NATUREZA_PREDIO_OPTIONS,
  TIPO_OBRA_OPTIONS,
  memoriaInputSchema,
} from "@/lib/schemas/memoria";
import { CompartimentosFields } from "./CompartimentosFields";
import { LocalizacaoFields } from "./LocalizacaoFields";
import { TecnicoResponsavelFields } from "./TecnicoResponsavelFields";

type Step = {
  title: string;
  fields: (keyof MemoriaFormInput)[];
};

const STEPS: Step[] = [
  {
    title: "Requerente",
    fields: ["requerenteNome", "requerenteNif", "requerenteMorada"],
  },
  {
    title: "Técnico Responsável",
    fields: ["tecnicoModo", "tecnicoNomeOutro", "tecnicoNumeroOrdemOutro"],
  },
  {
    title: "Localização",
    fields: [
      "concelho",
      "freguesia",
      "artigoMatricial",
      "morada",
      "naturezaPredio",
      "numeroRegistoPredial",
    ],
  },
  {
    title: "Terreno e Confrontações",
    fields: [
      "areaTerreno",
      "confrontacaoNorte",
      "confrontacaoSul",
      "confrontacaoNascente",
      "confrontacaoPoente",
      "enquadramentoEnvolvente",
    ],
  },
  {
    title: "Áreas e Parâmetros",
    fields: [
      "areaTotalConstrucao",
      "areaImplantacao",
      "cerceaMetros",
      "numeroPisos",
      "volumeMetrosCubicos",
      "numeroEstacionamentos",
      "cotaSoleira",
      "areaImpermeabilizacao",
    ],
  },
  {
    title: "Compartimentos",
    fields: ["compartimentos"],
  },
  {
    title: "Materiais",
    fields: ["revestimentoFachada", "caixilharia", "isolamentoTermicoAcustico"],
  },
  {
    title: "Tipo de Obra",
    fields: ["tipoObra"],
  },
];

const STEPPER_ITEMS = [...STEPS.map((s) => ({ title: s.title })), { title: "Revisão" }];

const DEFAULT_CONCELHO = "Sintra";

type ResultState = { id: string; generatedText: string } | null;

export function GerarWizard({
  projetoId,
  meuNome,
  meuNumeroOrdem,
}: {
  projetoId: string;
  meuNome: string;
  meuNumeroOrdem: string | null;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState>(null);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<MemoriaFormInput, unknown, MemoriaInput>({
    resolver: zodResolver(memoriaInputSchema),
    defaultValues: {
      concelho: DEFAULT_CONCELHO,
      freguesia: getFreguesiasPorConcelho(DEFAULT_CONCELHO)[0] ?? "",
      tecnicoModo: "proprio",
      compartimentos: [],
    },
  });

  const isReviewStep = stepIndex === STEPS.length;
  const currentStep = STEPS[stepIndex];

  async function goNext() {
    const valid = await trigger(currentStep.fields);
    if (valid) setStepIndex((i) => i + 1);
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function onGenerate(data: MemoriaInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projetoId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Falha ao gerar (${res.status})`);
      }
      const json = (await res.json()) as ResultState;
      setResult(json);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Memória Descritiva gerada</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Revê e ajusta o texto antes de exportar — a responsabilidade pelo
          conteúdo é do técnico, não da IA.
        </p>
        <MemoriaViewer id={result.id} initialText={result.generatedText} editable />
        <button
          type="button"
          onClick={() => setResult(null)}
          className="self-start rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Voltar ao formulário
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Gerar Memória Descritiva</h1>

      <Stepper
        steps={STEPPER_ITEMS}
        currentIndex={stepIndex}
        onStepClick={setStepIndex}
      />

      <form
        onSubmit={handleSubmit(onGenerate)}
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800"
      >
        {!isReviewStep && currentStep.title === "Localização" && (
          <>
            <LocalizacaoFields
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
            <FormField
              name="naturezaPredio"
              register={register}
              error={errors.naturezaPredio?.message}
            />
            <FormField
              name="numeroRegistoPredial"
              register={register}
              error={errors.numeroRegistoPredial?.message}
            />
          </>
        )}
        {!isReviewStep && currentStep.title === "Técnico Responsável" && (
          <TecnicoResponsavelFields
            register={register}
            watch={watch}
            errors={errors}
            meuNome={meuNome}
            meuNumeroOrdem={meuNumeroOrdem}
          />
        )}
        {!isReviewStep && currentStep.title === "Compartimentos" && (
          <CompartimentosFields
            control={control}
            register={register}
            errors={errors}
          />
        )}
        {!isReviewStep &&
          !["Localização", "Técnico Responsável", "Compartimentos"].includes(
            currentStep.title,
          ) && (
            <StepFields step={currentStep} register={register} errors={errors} />
          )}

        {isReviewStep && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Confirma os dados nos passos anteriores e clica em &quot;Gerar&quot;
            para produzir o texto com IA.
          </p>
        )}

        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {submitError}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
            >
              Anterior
            </button>
          )}
          {!isReviewStep && (
            <button
              type="button"
              onClick={goNext}
              className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Seguinte
            </button>
          )}
          {isReviewStep && (
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {submitting ? "A gerar…" : "Gerar Memória Descritiva"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function StepFields({
  step,
  register,
  errors,
}: {
  step: Step;
  register: UseFormRegister<MemoriaFormInput>;
  errors: FieldErrors<MemoriaFormInput>;
}) {
  return (
    <>
      {step.fields.map((name) => (
        <FormField
          key={name}
          name={name}
          register={register}
          error={errors[name]?.message as string | undefined}
        />
      ))}
    </>
  );
}

const FIELD_LABELS: Record<keyof MemoriaFormInput, string> = {
  requerenteNome: "Nome do requerente",
  requerenteNif: "NIF do requerente",
  requerenteMorada: "Morada do requerente",
  tecnicoModo: "Técnico responsável",
  tecnicoNomeOutro: "Nome completo do técnico",
  tecnicoNumeroOrdemOutro: "N.º de ordem do técnico",
  concelho: "Concelho",
  freguesia: "Freguesia",
  artigoMatricial: "Artigo matricial",
  morada: "Morada da obra",
  naturezaPredio: "Natureza do prédio",
  numeroRegistoPredial: "N.º de registo predial",
  areaTerreno: "Área do terreno (m²)",
  confrontacaoNorte: "Confrontação Norte",
  confrontacaoSul: "Confrontação Sul",
  confrontacaoNascente: "Confrontação Nascente",
  confrontacaoPoente: "Confrontação Poente",
  enquadramentoEnvolvente: "Enquadramento da envolvente — opcional",
  areaTotalConstrucao: "Área total de construção (m²)",
  areaImplantacao: "Área de implantação (m²)",
  cerceaMetros: "Cércea (m)",
  numeroPisos: "Número de pisos",
  volumeMetrosCubicos: "Volume (m³) — opcional",
  numeroEstacionamentos: "N.º de estacionamentos — opcional",
  cotaSoleira: "Cota de soleira — opcional",
  areaImpermeabilizacao: "Área de impermeabilização (m²) — opcional",
  compartimentos: "Compartimentos",
  revestimentoFachada: "Revestimento de fachada",
  caixilharia: "Caixilharia",
  isolamentoTermicoAcustico: "Isolamento térmico/acústico",
  tipoObra: "Tipo de obra",
};

const NUMERIC_FIELDS: (keyof MemoriaFormInput)[] = [
  "areaTerreno",
  "areaTotalConstrucao",
  "areaImplantacao",
  "cerceaMetros",
  "numeroPisos",
  "volumeMetrosCubicos",
  "numeroEstacionamentos",
  "cotaSoleira",
  "areaImpermeabilizacao",
];

const SELECT_OPTIONS: Partial<Record<keyof MemoriaFormInput, readonly { value: string; label: string }[]>> = {
  tipoObra: TIPO_OBRA_OPTIONS,
  naturezaPredio: NATUREZA_PREDIO_OPTIONS,
};

const TEXTAREA_FIELDS: (keyof MemoriaFormInput)[] = ["enquadramentoEnvolvente"];

function FormField({
  name,
  register,
  error,
}: {
  name: keyof MemoriaFormInput;
  register: UseFormRegister<MemoriaFormInput>;
  error?: string;
}) {
  const label = FIELD_LABELS[name];
  const options = SELECT_OPTIONS[name];

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {options ? (
        <select
          {...register(name)}
          className="rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : TEXTAREA_FIELDS.includes(name) ? (
        <textarea
          rows={3}
          {...register(name)}
          className="rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      ) : (
        <input
          type={NUMERIC_FIELDS.includes(name) ? "number" : "text"}
          step="any"
          {...register(name)}
          className="rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      )}
      {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
