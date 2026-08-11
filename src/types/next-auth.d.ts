import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/db/schema";

declare module "next-auth" {
  interface User {
    role: Role;
    entidadeId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      entidadeId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    entidadeId: string | null;
  }
}
