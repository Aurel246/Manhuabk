export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;

  constructor(code: ErrorCode, message?: string) {
    super(message ?? defaultMessage(code));
    this.code = code;
    this.status = statusForCode(code);
    this.name = "AppError";
  }
}

function defaultMessage(code: ErrorCode): string {
  switch (code) {
    case "VALIDATION_ERROR":
      return "Données invalides.";
    case "UNAUTHORIZED":
      return "Authentification requise.";
    case "FORBIDDEN":
      return "Accès refusé.";
    case "NOT_FOUND":
      return "Ressource introuvable.";
    case "CONFLICT":
      return "Conflit de données.";
    case "PAYLOAD_TOO_LARGE":
      return "Fichier trop volumineux.";
    case "RATE_LIMITED":
      return "Trop de requêtes. Réessayez plus tard.";
    default:
      return "Une erreur est survenue.";
  }
}

function statusForCode(code: ErrorCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "PAYLOAD_TOO_LARGE":
      return 413;
    case "RATE_LIMITED":
      return 429;
    default:
      return 500;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
