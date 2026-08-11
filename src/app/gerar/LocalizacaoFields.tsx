"use client";

import { useState } from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  findDistritoPorConcelho,
  getConcelhosPorDistrito,
  getDistritos,
  getFreguesiasPorConcelho,
} from "@/lib/geo";
import type { MemoriaFormInput } from "@/lib/schemas/memoria";

const fieldClass =
  "rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900";

export function LocalizacaoFields({
  register,
  setValue,
  watch,
  errors,
}: {
  register: UseFormRegister<MemoriaFormInput>;
  setValue: UseFormSetValue<MemoriaFormInput>;
  watch: UseFormWatch<MemoriaFormInput>;
  errors: FieldErrors<MemoriaFormInput>;
}) {
  const concelhoAtual = watch("concelho") ?? "";
  const [distrito, setDistrito] = useState(
    () => findDistritoPorConcelho(concelhoAtual) ?? getDistritos()[0],
  );

  const concelhos = getConcelhosPorDistrito(distrito);
  const freguesias = getFreguesiasPorConcelho(concelhoAtual);

  function onDistritoChange(novoDistrito: string) {
    setDistrito(novoDistrito);
    const primeiroConcelho = getConcelhosPorDistrito(novoDistrito)[0] ?? "";
    setValue("concelho", primeiroConcelho, { shouldValidate: true });
    setValue(
      "freguesia",
      getFreguesiasPorConcelho(primeiroConcelho)[0] ?? "",
      { shouldValidate: true },
    );
  }

  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Distrito / Ilha</span>
        <select
          value={distrito}
          onChange={(e) => onDistritoChange(e.target.value)}
          className={fieldClass}
        >
          {getDistritos().map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Concelho</span>
        <select
          {...register("concelho", {
            onChange: (e) => {
              setValue(
                "freguesia",
                getFreguesiasPorConcelho(e.target.value)[0] ?? "",
                { shouldValidate: true },
              );
            },
          })}
          className={fieldClass}
        >
          {concelhos.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.concelho && (
          <span className="text-red-600 dark:text-red-400">
            {errors.concelho.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Freguesia</span>
        <select {...register("freguesia")} className={fieldClass}>
          {freguesias.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        {errors.freguesia && (
          <span className="text-red-600 dark:text-red-400">
            {errors.freguesia.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Artigo matricial</span>
        <input {...register("artigoMatricial")} className={fieldClass} />
        {errors.artigoMatricial && (
          <span className="text-red-600 dark:text-red-400">
            {errors.artigoMatricial.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Morada da obra</span>
        <input {...register("morada")} className={fieldClass} />
        {errors.morada && (
          <span className="text-red-600 dark:text-red-400">
            {errors.morada.message}
          </span>
        )}
      </label>
    </>
  );
}
