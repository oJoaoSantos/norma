"use client";

import { useTransition } from "react";
import { leaveProjetoAction } from "../actions";
import { ActionButton } from "@/components/ActionButton";

export function LeaveProjetoButton({ projetoId }: { projetoId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <ActionButton
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Sair deste projeto? Perdes o acesso a ele.")) return;
        startTransition(() => {
          leaveProjetoAction(projetoId);
        });
      }}
    >
      {pending ? "A sair…" : "Sair do projeto"}
    </ActionButton>
  );
}
