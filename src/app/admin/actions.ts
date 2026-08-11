"use server";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createUserSchema, updateUserSchema } from "@/lib/schemas/user";
import type { ActionState } from "@/lib/action-state";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin" || !session.user.entidadeId) {
    throw new Error("Sem permissão");
  }
  return session;
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await db.insert(users).values({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: parsed.data.role,
      entidadeId: session.user.entidadeId,
    });
  } catch {
    return { error: "Já existe um utilizador com este email." };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateUserAction(
  userId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const set: {
    name: string;
    email: string;
    role: typeof parsed.data.role;
    passwordHash?: string;
  } = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    role: parsed.data.role,
  };
  if (parsed.data.password) {
    set.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  try {
    await db
      .update(users)
      .set(set)
      .where(and(eq(users.id, userId), eq(users.entidadeId, session.user.entidadeId!)));
  } catch {
    return { error: "Já existe um utilizador com este email." };
  }

  revalidatePath("/admin");
  return {};
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  const session = await requireAdmin();
  await db
    .update(users)
    .set({ active })
    .where(and(eq(users.id, userId), eq(users.entidadeId, session.user.entidadeId!)));
  revalidatePath("/admin");
}
