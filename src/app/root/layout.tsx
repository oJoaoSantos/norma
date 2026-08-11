import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Plataforma</h1>
        <nav className="mt-4 flex gap-4 border-b border-zinc-200 text-sm dark:border-zinc-800">
          <Link
            href="/root"
            className="border-b-2 border-transparent pb-2 hover:border-black dark:hover:border-white"
          >
            Entidades
          </Link>
          <Link
            href="/root/legislacao"
            className="border-b-2 border-transparent pb-2 hover:border-black dark:hover:border-white"
          >
            Legislação
          </Link>
        </nav>
      </div>
      {children}
    </main>
  );
}
