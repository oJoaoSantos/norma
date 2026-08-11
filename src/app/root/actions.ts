"use server";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { entidades, legislacaoConcelhos, users } from "@/lib/db/schema";
import {
  adminFieldsSchema,
  createEntidadeSchema,
  updateAdminFieldsSchema,
} from "@/lib/schemas/entidade";
import type { ActionState } from "@/lib/action-state";

async function requireRoot() {
  const session = await auth();
  if (session?.user?.role !== "root") {
    throw new Error("Sem permissão");
  }
  return session;
}

export async function createEntidadeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRoot();

  const parsed = createEntidadeSchema.safeParse({
    nome: formData.get("nome"),
    adminName: formData.get("adminName"),
    adminEmail: formData.get("adminEmail"),
    adminPassword: formData.get("adminPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const [entidade] = await db
    .insert(entidades)
    .values({ nome: parsed.data.nome })
    .returning();

  const passwordHash = await bcrypt.hash(parsed.data.adminPassword, 12);

  try {
    await db.insert(users).values({
      name: parsed.data.adminName,
      email: parsed.data.adminEmail.toLowerCase(),
      passwordHash,
      role: "admin",
      entidadeId: entidade.id,
    });
  } catch {
    return { error: "Já existe um utilizador com este email." };
  }

  revalidatePath("/root");
  return { success: true };
}

export async function toggleEntidadeActiveAction(
  entidadeId: string,
  active: boolean,
) {
  await requireRoot();
  await db.update(entidades).set({ active }).where(eq(entidades.id, entidadeId));
  revalidatePath("/root");
}

export async function upsertLegislacaoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRoot();

  const concelho = String(formData.get("concelho") ?? "").trim();
  const conteudo = String(formData.get("conteudo") ?? "").trim();
  if (!concelho || !conteudo) {
    return { error: "Concelho e conteúdo são obrigatórios." };
  }

  await db
    .insert(legislacaoConcelhos)
    .values({ concelho, conteudo })
    .onConflictDoUpdate({
      target: legislacaoConcelhos.concelho,
      set: { conteudo, updatedAt: new Date() },
    });

  revalidatePath("/root/legislacao");
  return { success: true };
}

export async function createAdminForEntidadeAction(
  entidadeId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRoot();

  const parsed = adminFieldsSchema.safeParse({
    adminName: formData.get("adminName"),
    adminEmail: formData.get("adminEmail"),
    adminPassword: formData.get("adminPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.adminPassword, 12);

  try {
    await db.insert(users).values({
      name: parsed.data.adminName,
      email: parsed.data.adminEmail.toLowerCase(),
      passwordHash,
      role: "admin",
      entidadeId,
    });
  } catch {
    return { error: "Já existe um utilizador com este email." };
  }

  revalidatePath(`/root/entidades/${entidadeId}`);
  return { success: true };
}

export async function updateAdminAction(
  userId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  await requireRoot();
  const admin = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!admin || admin.role !== "admin") throw new Error("Não encontrado");

  const parsed = updateAdminFieldsSchema.safeParse({
    adminName: formData.get("adminName"),
    adminEmail: formData.get("adminEmail"),
    adminPassword: formData.get("adminPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const set: { name: string; email: string; passwordHash?: string } = {
    name: parsed.data.adminName,
    email: parsed.data.adminEmail.toLowerCase(),
  };
  if (parsed.data.adminPassword) {
    set.passwordHash = await bcrypt.hash(parsed.data.adminPassword, 12);
  }

  try {
    await db.update(users).set(set).where(and(eq(users.id, userId), eq(users.role, "admin")));
  } catch {
    return { error: "Já existe um utilizador com este email." };
  }

  revalidatePath(`/root/entidades/${admin.entidadeId}`);
  return {};
}

export async function toggleAdminActiveAction(userId: string, active: boolean) {
  await requireRoot();
  const admin = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!admin || admin.role !== "admin") throw new Error("Não encontrado");

  await db
    .update(users)
    .set({ active })
    .where(and(eq(users.id, userId), eq(users.role, "admin")));

  revalidatePath(`/root/entidades/${admin.entidadeId}`);
}
