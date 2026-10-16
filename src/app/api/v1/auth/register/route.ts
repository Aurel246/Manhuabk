import { NextResponse } from "next/server";
import { registerUser } from "@/modules/users/service";
import { isAppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

    let email = "";
    try {
      const parsed = await req.json();
      // On limite avant validation, mais on relit le body pour la clé.
      email = String(parsed?.email ?? "").toLowerCase();
      const rl = rateLimit(`register:${ip}:${email}`, 5, 60_000);
      if (!rl.ok) {
        return NextResponse.json(
          {
            error: {
              code: "RATE_LIMITED",
              message: "Trop de tentatives. Réessayez dans une minute.",
            },
          },
          {
            status: 429,
            headers: { "Retry-After": String(rl.retryAfterSeconds) },
          }
        );
      }
      const user = await registerUser(parsed);
      return NextResponse.json({ user }, { status: 201 });
    } catch (err) {
      if (isAppError(err)) {
        return NextResponse.json(
          { error: { code: err.code, message: err.message } },
          { status: err.status }
        );
      }
      logger.error("register failed", { err: String(err) });
      return NextResponse.json(
        {
          error: { code: "INTERNAL_ERROR", message: "Une erreur est survenue." },
        },
        { status: 500 }
      );
    }
  } catch (err) {
    logger.error("register body read failed", { err: String(err) });
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Corps invalide." } },
      { status: 400 }
    );
  }
}
