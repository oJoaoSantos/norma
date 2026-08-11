import Image from "next/image";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";

  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: callbackUrl,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(
          `/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
      }
      throw error;
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/NormaLogo.png"
          alt="Norma"
          width={56}
          height={56}
          className="dark:invert"
        />
        <h1 className="text-xl font-semibold">Entrar na Norma</h1>
      </div>

      <form action={authenticate} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        {params.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Email ou password incorretos.
          </p>
        )}

        <button
          type="submit"
          className="mt-2 rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Entrar
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        As contas são criadas por um administrador. Contacta o teu admin se
        não tens acesso.
      </p>
    </main>
  );
}
