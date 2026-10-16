import { auth } from "@/auth";
import { AppError } from "@/lib/errors";
import type { Role } from "@prisma/client";

const roleWeight: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  EDITOR: 3,
  ADMIN: 4,
};

export async function getSession() {
  return auth();
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new AppError("UNAUTHORIZED");
  // Vérification serveur : un compte non confirmé ne dispose d'aucun accès privé.
  if (session.user.emailVerified === false) throw new AppError("UNAUTHORIZED");
  return session.user;
}

export async function requireRole(minRole: Role) {
  const user = await requireUser();
  if (roleWeight[user.role] < roleWeight[minRole]) {
    throw new AppError("FORBIDDEN");
  }
  return user;
}

export async function requireEditor() {
  return requireRole("EDITOR");
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}
