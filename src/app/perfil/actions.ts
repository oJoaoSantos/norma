"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  changePasswordSchema,
  updateLayoutSchema,
  updateProfileSchema,
} from "@/lib/schemas/user";
import type { ActionState } from "@/lib/action-state";

export async function updateLayoutAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Sem sessão" };

  const parsed = updateLayoutSchema.safeParse({
    docxFonte: formData.get("docxFonte"),
    docxTamanhoPt: formData.get("docxTamanhoPt"),
    docxEspacamento: formData.get("docxEspacamento"),
    docxAlinhamento: formData.get("docxAlinhamento"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await db.update(users).set(parsed.data).where(eq(users.id, session.user.id));

  revalidatePath("/perfil");
  return { success: true };
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Sem sessão" };

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    numeroOrdem: formData.get("numeroOrdem"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await db
    .update(users)
    .set({ name: parsed.data.name, numeroOrdem: parsed.data.numeroOrdem })
    .where(eq(users.id, session.user.id));

  revalidatePath("/perfil");
  return { success: true };
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Sem sessão" };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!user) return { error: "Utilizador não encontrado" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Password atual incorreta" };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  return { success: true };
}
