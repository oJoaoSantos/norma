import { z } from "zod";

export const adminFieldsSchema = z.object({
  adminName: z.string().min(1, "Obrigatório"),
  adminEmail: z.string().email("Email inválido"),
  adminPassword: z.string().min(8, "Mínimo 8 caracteres"),
});

export const createEntidadeSchema = adminFieldsSchema.extend({
  nome: z.string().min(1, "Obrigatório"),
});

export const updateAdminFieldsSchema = z.object({
  adminName: z.string().min(1, "Obrigatório"),
  adminEmail: z.string().email("Email inválido"),
  adminPassword: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().min(8, "Mínimo 8 caracteres").optional(),
  ),
});
