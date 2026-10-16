import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_BYTES = 32; // 256 bits d'entropie
const TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

export type ConsumeResult =
  | { status: "ok"; userId: string }
  | { status: "not_found" }
  | { status: "expired" }
  | { status: "used" };

/** Génère un jeton opaque, cryptographiquement aléatoire et URL-safe. */
export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** Empreinte SHA-256 du jeton — seul le hash est stocké en base. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Crée un nouveau jeton de vérification pour un utilisateur.
 * Invalide les anciens jetons actifs (un seul actif à la fois).
 * Retourne le jeton en clair (à envoyer par e-mail, jamais journalisé).
 */
export async function createVerificationToken(userId: string): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = generateToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });
  return token;
}

/**
 * Consomme un jeton de vérification de façon atomique.
 * - vérifie l'existence, l'expiration et l'utilisation ;
 * - marque l'adresse comme vérifiée ;
 * - invalide le jeton (usedAt) — une seule utilisation possible.
 */
export async function consumeVerificationToken(
  token: string
): Promise<ConsumeResult> {
  const tokenHash = hashToken(token);

  return prisma.$transaction(async (tx) => {
    const record = await tx.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!record) return { status: "not_found" as const };
    if (record.usedAt) return { status: "used" as const };
    if (record.expiresAt.getTime() < Date.now())
      return { status: "expired" as const };

    // Réservation atomique : n'échoue que si le jeton a été utilisé entre-temps.
    const claimed = await tx.emailVerificationToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) return { status: "used" as const };

    await tx.user.updateMany({
      where: { id: record.userId, emailVerifiedAt: null },
      data: { emailVerifiedAt: new Date() },
    });

    return { status: "ok" as const, userId: record.userId };
  });
}
