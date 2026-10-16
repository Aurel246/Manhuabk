import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logAudit } from "./audit";

export async function listGenresAdmin() {
  return prisma.genre.findMany({ orderBy: { order: "asc" } });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createGenre(name: string, actorId: string) {
  const slug = slugify(name);
  if (!slug) throw new AppError("VALIDATION_ERROR", "Nom de genre invalide.");
  const exists = await prisma.genre.findFirst({
    where: { OR: [{ slug }, { name }] },
  });
  if (exists) throw new AppError("CONFLICT", "Ce genre existe déjà.");
  const genre = await prisma.genre.create({ data: { name, slug } });
  await logAudit({ actorId, action: "CREATE", entity: "genre", entityId: genre.id });
  return genre;
}

export async function deleteGenre(id: string, actorId: string) {
  const used = await prisma.seriesGenre.count({ where: { genreId: id } });
  if (used > 0) {
    throw new AppError(
      "CONFLICT",
      `Genre utilisé par ${used} série(s). Retire-le d'abord.`
    );
  }
  await prisma.genre.delete({ where: { id } });
  await logAudit({ actorId, action: "DELETE", entity: "genre", entityId: id });
}

export async function listUsersAdmin() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function setUserRole(
  userId: string,
  role: "USER" | "MODERATOR" | "EDITOR" | "ADMIN",
  actorId: string
) {
  if (userId === actorId) {
    throw new AppError("VALIDATION_ERROR", "Tu ne peux pas modifier ton propre rôle.");
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAudit({
    actorId,
    action: "SET_ROLE",
    entity: "user",
    entityId: userId,
    meta: { role },
  });
}

export async function listAudit(limit = 50) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { username: true } } },
  });
}
