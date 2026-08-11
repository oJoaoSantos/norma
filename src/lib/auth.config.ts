import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/db/schema";

/**
 * Config "leve", sem o Credentials provider (que importa `pg`/bcrypt e não
 * corre em Edge runtime). Usada pelo middleware só para ler/validar o JWT.
 * O provider completo vive em `lib/auth.ts`.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  // Necessário fora da Vercel — confia no host vindo do reverse proxy
  // (Caddy) em vez de exigir AUTH_URL fixo. Ver
  // https://authjs.dev/reference/nextjs#trusthost
  trustHost: true,
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.entidadeId = user.entidadeId ?? null;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.entidadeId = token.entidadeId as string | null;
      return session;
    },
  },
};
