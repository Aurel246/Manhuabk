"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/auth/password";
import { rateLimit } from "@/lib/rate-limit";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function loginRedirect() {
  redirect("/connecter");
}

export type LoginCheck = "ok" | "invalid" | "unverified" | "rate_limited";

/**
 * Vérifie les identifiants côté serveur AVANT d'ouvrir une session.
 * - "ok"           → identifiants valides ET adresse confirmée
 * - "unverified"   → identifiants valides mais adresse NON confirmée
 * - "invalid"      → identifiants incorrects / compte indisponible
 * - "rate_limited" → trop de tentatives
 *
 * On ne révèle « non confirmé » que si le mot de passe est correct :
 * l'émetteur connaît donc déjà les identifiants, aucun risque de fuite.
 */
export async function loginAction(
  email: string,
  password: string
): Promise<LoginCheck> {
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!normalized || !password) return "invalid";

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`login:${ip}:${normalized}`, 10, 60_000);
  if (!rl.ok) return "rate_limited";

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user || user.deletedAt || user.status !== "ACTIVE") return "invalid";

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return "invalid";

  if (!user.emailVerifiedAt) return "unverified";

  return "ok";
}
