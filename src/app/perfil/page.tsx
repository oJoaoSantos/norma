import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { entidades, users } from "@/lib/db/schema";
import { SettingsSection } from "@/components/SettingsSection";
import { ROLE_OPTIONS } from "@/lib/schemas/user";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { LayoutForm } from "./LayoutForm";
import { ProfileForm } from "./ProfileForm";

const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]));

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

export default async function PerfilPage() {
  const session = await auth();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session!.user.id),
  });

  const nome = user?.name ?? "";
  const role = session?.user?.role;
  const entidade = user?.entidadeId
    ? await db.query.entidades.findFirst({ where: eq(entidades.id, user.entidadeId) })
    : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-lg font-medium text-white dark:bg-white dark:text-black">
          {initials(nome)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{nome || "Perfil"}</h1>
          <p className="text-sm text-zinc-500">
            {session?.user?.email}
            {role && ` · ${ROLE_LABEL[role]}`}
            {entidade && ` · ${entidade.nome}`}
          </p>
        </div>
      </div>

      <SettingsSection
        title="Dados do técnico"
        description="Usado automaticamente como técnico responsável quando geras uma Memória Descritiva em teu nome."
      >
        <ProfileForm
          name={user?.name ?? ""}
          numeroOrdem={user?.numeroOrdem ?? null}
        />
      </SettingsSection>

      <SettingsSection
        title="Formatação do documento"
        description="Aplica-se ao texto corrido dos documentos que exportares em .docx."
      >
        <LayoutForm
          docxFonte={user?.docxFonte ?? "Times New Roman"}
          docxTamanhoPt={user?.docxTamanhoPt ?? 11}
          docxEspacamento={user?.docxEspacamento ?? "simples"}
          docxAlinhamento={user?.docxAlinhamento ?? "justificado"}
        />
      </SettingsSection>

      <SettingsSection title="Password">
        <ChangePasswordForm />
      </SettingsSection>
    </main>
  );
}
