import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isApi = nextUrl.pathname.startsWith("/api/");
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  if (nextUrl.pathname.startsWith("/api/auth")) return;

  if (nextUrl.pathname.startsWith("/login")) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(role === "root" ? "/root" : "/", nextUrl),
      );
    }
    return;
  }

  const isRootRoute =
    nextUrl.pathname.startsWith("/root") ||
    nextUrl.pathname.startsWith("/api/root");

  // "root" não pertence a nenhuma entidade — não vê nada fora de /root,
  // nem sequer a homepage/"/ajuda" públicas. Verifica-se antes de qualquer
  // exceção pública, senão o root nunca seria redirecionado para /root.
  if (role === "root") {
    if (!isRootRoute) {
      return NextResponse.redirect(new URL("/root", nextUrl));
    }
    return;
  }
  if (isRootRoute) {
    if (isApi) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (nextUrl.pathname === "/") return;
  if (nextUrl.pathname === "/ajuda") return;

  if (!isLoggedIn) {
    if (isApi) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl),
    );
  }

  const isAdminRoute =
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname.startsWith("/api/admin");
  if (isAdminRoute && role !== "admin") {
    if (isApi) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Quem pode gerar/regenerar depende do nível de permissão no projeto
  // específico (partilha), não só do papel — validado nas próprias
  // páginas/rotas (precisam de consultar a BD, o que o middleware, a
  // correr em Edge, não pode fazer).
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
