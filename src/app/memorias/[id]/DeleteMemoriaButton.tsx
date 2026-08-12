"use client";

import { useTransition } from "react";
import { deleteMemoriaAction } from "./actions";
import { ActionButton } from "@/components/ActionButton";

export function DeleteMemoriaButton({ memoriaId }: { memoriaId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <ActionButton
      type="button"
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Apagar esta memória descritiva? Todo o histórico de versões é apagado com ela. Esta ação não pode ser desfeita.",
          )
        ) {
          return;
        }
        startTransition(() => {
          deleteMemoriaAction(memoriaId);
        });
      }}
    >
      {pending ? "A apagar…" : "Apagar memória"}
    </ActionButton>
  );
}
