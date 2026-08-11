"use client";

import { useTransition } from "react";
import { deleteProjetoAction } from "../actions";
import { ActionButton } from "@/components/ActionButton";

export function DeleteProjetoButton({ projetoId }: { projetoId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <ActionButton
      type="button"
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Apagar este projeto? Todas as memórias e versões associadas serão apagadas. Esta ação não pode ser desfeita.",
          )
        ) {
          return;
        }
        startTransition(() => {
          deleteProjetoAction(projetoId);
        });
      }}
    >
      {pending ? "A apagar…" : "Apagar projeto"}
    </ActionButton>
  );
}
