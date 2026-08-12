import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { entidades } from "@/lib/db/schema";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function AppHeader() {
  const session = await auth();
  const user = session?.user;

  const entidade =
    user && user.role !== "root" && user.entidadeId
      ? await db.query.entidades.findFirst({ where: eq(entidades.id, user.entidadeId) })
      : null;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const navLinks: { href: string; label: string }[] =
    user?.role === "root"
      ? [{ href: "/root", label: "Entidades" }]
      : [
          { href: "/ajuda", label: "Ajuda" },
          ...(user ? [{ href: "/projetos", label: "Projetos" }] : []),
          ...(user ? [{ href: "/memorias", label: "Memórias" }] : []),
          ...(user?.role === "admin" ? [{ href: "/admin", label: "Utilizadores" }] : []),
        ];

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/NormaIcon.png"
            alt="Norma"
            width={26}
            height={29}
            className="dark:invert"
          />
          <span className="font-semibold tracking-tight">Norma</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm sm:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {l.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3 border-l border-zinc-200 pl-5 dark:border-zinc-800">
              {entidade && (
                <span className="text-zinc-400 dark:text-zinc-500">{entidade.nome}</span>
              )}
              {user.role === "root" ? (
                <span className="text-zinc-500 dark:text-zinc-400">{user.name}</span>
              ) : (
                <Link
                  href="/perfil"
                  className="text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  {user.name}
                </Link>
              )}
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  Sair
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded bg-black px-3 py-1.5 text-white dark:bg-white dark:text-black"
            >
              Entrar
            </Link>
          )}

          <ThemeToggle />
        </nav>

        <MobileNav
          navLinks={navLinks}
          userName={user?.name ?? null}
          userRole={user?.role ?? null}
          entidadeNome={entidade?.nome ?? null}
          onSignOut={user ? handleSignOut : undefined}
        />
      </div>
    </header>
  );
}
