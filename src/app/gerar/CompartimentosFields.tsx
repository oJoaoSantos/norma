"use client";

import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import type { MemoriaFormInput } from "@/lib/schemas/memoria";

const fieldClass =
  "rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900";

export function CompartimentosFields({
  control,
  register,
  errors,
}: {
  control: Control<MemoriaFormInput>;
  register: UseFormRegister<MemoriaFormInput>;
  errors: FieldErrors<MemoriaFormInput>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "compartimentos",
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Opcional — lista os compartimentos e respetiva área para a secção
        &quot;Utilização da Edificação&quot; e o Quadro de Áreas. Podes saltar
        este passo.
      </p>

      {fields.map((field, i) => (
        <div key={field.id} className="flex items-end gap-2">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Compartimento</span>
            <input
              {...register(`compartimentos.${i}.nome`)}
              className={fieldClass}
              placeholder="Ex: Sala de Estar"
            />
            {errors.compartimentos?.[i]?.nome && (
              <span className="text-red-600 dark:text-red-400">
                {errors.compartimentos[i]?.nome?.message}
              </span>
            )}
          </label>
          <label className="flex w-32 flex-col gap-1 text-sm">
            <span className="font-medium">Área (m²)</span>
            <input
              type="number"
              step="any"
              {...register(`compartimentos.${i}.area`)}
              className={fieldClass}
            />
            {errors.compartimentos?.[i]?.area && (
              <span className="text-red-600 dark:text-red-400">
                {errors.compartimentos[i]?.area?.message}
              </span>
            )}
          </label>
          <button
            type="button"
            onClick={() => remove(i)}
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Remover
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ nome: "", area: 0 })}
        className="self-start rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
      >
        + Adicionar compartimento
      </button>
    </div>
  );
}
