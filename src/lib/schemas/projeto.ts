import { z } from "zod";

export const createProjetoSchema = z.object({
  nome: z.string().min(1, "Obrigatório"),
  descricao: z.string().min(1, "Obrigatório"),
});
