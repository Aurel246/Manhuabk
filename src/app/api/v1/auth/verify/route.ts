import { NextRequest, NextResponse } from "next/server";
import { consumeVerificationToken } from "@/modules/email/tokens";
import { logger } from "@/lib/logger";

const resultFor = {
  ok: "ok",
  not_found: "invalid",
  expired: "expired",
  used: "used",
} as const;

function redirect(req: NextRequest, result: string) {
  return NextResponse.redirect(
    new URL(`/confirmation?result=${result}`, req.url)
  );
}

/**
 * Lien de confirmation reçu par e-mail (GET).
 * Valide le jeton côté serveur, puis redirige vers la page de confirmation.
 * Le jeton est consommé de façon atomique (une seule utilisation).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return redirect(req, "invalid");

  try {
    const outcome = await consumeVerificationToken(token);
    return redirect(req, resultFor[outcome.status]);
  } catch (err) {
    // Ne jamais journaliser le jeton.
    logger.error("email verification failed", {
      err: err instanceof Error ? err.message : String(err),
    });
    return redirect(req, "invalid");
  }
}
