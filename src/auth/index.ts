import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "./password";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: Role;
      locale: string;
      emailVerified: boolean;
    };
  }
  interface User {
    id: string;
    username: string;
    email: string;
    role: Role;
    locale: string;
    emailVerified: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connecter",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || user.deletedAt || user.status !== "ACTIVE") return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        // Adresse non confirmée → aucune session ouverte (côté serveur).
        if (!user.emailVerifiedAt) return null;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          locale: user.locale,
          emailVerified: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.locale = user.locale;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as Role;
        session.user.locale = token.locale as string;
        // Par défaut vrai (anciens jets créés avant la vérification) ;
        // false n'apparaît que si le claim l'indique explicitement.
        Object.assign(session.user, {
          emailVerified: (token as Record<string, unknown>).emailVerified !== false,
        });
      }
      return session;
    },
  },
});
