import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/modules/email/tokens";
import { sendVerificationEmail } from "@/modules/email/service";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const GENERIC_MESSAGE =
  "Si une adresse non confirmée correspond, un e-mail de confirmation vient d'être envoyé.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Renvoie un e-mail de confirmation.
 * - réponse identique que l'adresse existe ou non (aucune fuite) ;
 * - limitation de fréquence (IP et IP+e-mail) contre les abus ;
 * - nouveau jeton généré, anciens jetons invalidés.
 */
export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();

    // Format invalide → on répond comme si tout allait bien.
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const byIp = rateLimit(`resend:${ip}`, 5, 60_000);
    const byEmail = rateLimit(`resend:${ip}:${email}`, 3, 60_000);
    if (!byIp.ok || !byEmail.ok) {
      const retry = Math.max(
        byIp.retryAfterSeconds,
        byEmail.retryAfterSeconds
      );
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Trop de demandes. Réessayez dans une minute.",
          },
        },
        { status: 429, headers: { "Retry-After": String(retry) } }
      );
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
          deletedAt: true,
          status: true,
        },
      });

      if (
        user &&
        !user.deletedAt &&
        user.status === "ACTIVE" &&
        !user.emailVerifiedAt
      ) {
        const token = await createVerificationToken(user.id);
        await sendVerificationEmail(user.email, token);
      }
    } catch (err) {
      logger.error("resend processing failed", {
        err: err instanceof Error ? err.message : String(err),
      });
    }

    // Toujours la même réponse, quelle que soit l'existence de l'adresse.
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  } catch {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }
}
