import { z } from "zod";

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "arquiteto", label: "Arquiteto" },
  { value: "engenheiro", label: "Engenheiro" },
] as const;

export const createUserSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  role: z.enum(["admin", "arquiteto", "engenheiro"]),
});

const optionalPassword = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  z.string().min(8, "Mínimo 8 caracteres").optional(),
);

export const updateUserSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "arquiteto", "engenheiro"]),
  password: optionalPassword,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Obrigatório"),
  newPassword: z.string().min(8, "Mínimo 8 caracteres"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  numeroOrdem: z.string().min(1, "Obrigatório"),
});

export const DOCX_FONTE_OPTIONS = [
  "Times New Roman",
  "Calibri",
  "Arial",
  "Garamond",
  "Georgia",
] as const;

export const DOCX_ESPACAMENTO_OPTIONS = [
  { value: "simples", label: "Simples" },
  { value: "media", label: "1,5 linhas" },
  { value: "duplo", label: "Duplo" },
] as const;

export const DOCX_ALINHAMENTO_OPTIONS = [
  { value: "esquerda", label: "Esquerda" },
  { value: "justificado", label: "Justificado" },
] as const;

export const updateLayoutSchema = z.object({
  docxFonte: z.enum(DOCX_FONTE_OPTIONS),
  docxTamanhoPt: z.coerce.number().int().min(8).max(16),
  docxEspacamento: z.enum(["simples", "media", "duplo"]),
  docxAlinhamento: z.enum(["esquerda", "justificado"]),
});
