import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SpotlightArea } from "@/components/SpotlightArea";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <SpotlightArea className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="hero-glow pointer-events-none absolute inset-[-40%] rounded-full blur-2xl" />
          <Image
            src="/NormaLogo.png"
            alt="Norma"
            width={200}
            height={200}
            className="relative dark:invert"
            priority
          />
        </div>

        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Assistente de criação de Memórias Descritivas.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <>
              <Link
                href="/projetos"
                className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-all hover:scale-[1.03] hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                Projetos
              </Link>
              <Link
                href="/memorias"
                className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 transition-all hover:scale-[1.03] hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Memórias
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-all hover:scale-[1.03] hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Entrar
            </Link>
          )}
        </div>
      </main>

      <div className="relative flex items-center justify-center gap-2 pb-10 text-zinc-400 dark:text-zinc-600">
        <span className="text-xs tracking-wide">Concebido por</span>
        <Image
          src="/CumeLogo.png"
          alt="Cume"
          width={54}
          height={16}
          className="opacity-70 dark:invert"
        />
      </div>
    </SpotlightArea>
  );
}
