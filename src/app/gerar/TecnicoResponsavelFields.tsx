"use client";

import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import type { MemoriaFormInput } from "@/lib/schemas/memoria";

const fieldClass =
  "rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900";

export function TecnicoResponsavelFields({
  register,
  watch,
  errors,
  meuNome,
  meuNumeroOrdem,
}: {
  register: UseFormRegister<MemoriaFormInput>;
  watch: UseFormWatch<MemoriaFormInput>;
  errors: FieldErrors<MemoriaFormInput>;
  meuNome: string;
  meuNumeroOrdem: string | null;
}) {
  const modo = watch("tecnicoModo");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Técnico Responsável</span>
        <label className="flex items-center gap-2">
          <input type="radio" value="proprio" {...register("tecnicoModo")} />
          Eu próprio
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="outro" {...register("tecnicoModo")} />
          Outro técnico
        </label>
      </div>

      {modo === "outro" ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nome completo do técnico</span>
            <input {...register("tecnicoNomeOutro")} className={fieldClass} />
            {errors.tecnicoNomeOutro && (
              <span className="text-red-600 dark:text-red-400">
                {errors.tecnicoNomeOutro.message}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">N.º de ordem (OA/OE)</span>
            <input
              {...register("tecnicoNumeroOrdemOutro")}
              className={fieldClass}
            />
            {errors.tecnicoNumeroOrdemOutro && (
              <span className="text-red-600 dark:text-red-400">
                {errors.tecnicoNumeroOrdemOutro.message}
              </span>
            )}
          </label>
        </>
      ) : (
        <div className="rounded border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          {meuNumeroOrdem ? (
            <>
              <span className="font-medium">{meuNome}</span>
              <span className="text-zinc-500"> — n.º {meuNumeroOrdem}</span>
            </>
          ) : (
            <span className="text-amber-700 dark:text-amber-400">
              Ainda não preencheste o teu número de ordem no perfil —
              necessário para gerares como técnico responsável.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
