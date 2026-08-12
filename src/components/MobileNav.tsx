"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileNav({
  navLinks,
  userName,
  userRole,
  entidadeNome,
  onSignOut,
}: {
  navLinks: { href: string; label: string }[];
  userName: string | null;
  userRole: string | null;
  entidadeNome: string | null;
  onSignOut?: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded border border-zinc-200 dark:border-zinc-800"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <nav className="flex flex-col gap-3 text-sm">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {userName && (
            <div className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
              {entidadeNome && (
                <span className="text-zinc-400 dark:text-zinc-500">{entidadeNome}</span>
              )}
              {userRole === "root" ? (
                <span className="text-zinc-500 dark:text-zinc-400">{userName}</span>
              ) : (
                <Link
                  href="/perfil"
                  onClick={() => setOpen(false)}
                  className="text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  {userName}
                </Link>
              )}
              {onSignOut && (
                <form action={onSignOut}>
                  <button
                    type="submit"
                    className="text-left text-zinc-500 hover:underline dark:text-zinc-400"
                  >
                    Sair
                  </button>
                </form>
              )}
            </div>
          )}

          {!userName && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded bg-black px-3 py-1.5 text-center text-sm text-white dark:bg-white dark:text-black"
            >
              Entrar
            </Link>
          )}

          <div className="mt-3 flex justify-center border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l18 12" />
    </svg>
  );
}
