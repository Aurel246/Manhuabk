import Link from "next/link";
import { ResendConfirmation } from "@/components/resend-confirmation";

export const metadata = { title: "Confirmation — Manhuabk" };

type Result = "ok" | "expired" | "invalid" | "used";

const COPY: Record<
  Result,
  { icon: string; title: string; body: string; ok?: boolean }
> = {
  ok: {
    icon: "✓",
    title: "Adresse confirmée",
    body: "Ton adresse e-mail est vérifiée. Tu peux maintenant te connecter et profiter de Manhuabk.",
    ok: true,
  },
  expired: {
    icon: "⏳",
    title: "Lien expiré",
    body: "Ce lien de confirmation n'est plus valide (il expire 24 heures après son envoi). Demande un nouveau lien ci-dessous.",
  },
  invalid: {
    icon: "⚠️",
    title: "Lien invalide",
    body: "Ce lien de confirmation n'est pas valide ou a déjà été utilisé. Demandez un nouveau lien ci-dessous.",
  },
  used: {
    icon: "✓",
    title: "Lien déjà utilisé",
    body: "Ce lien a déjà servi à confirmer une adresse. S'il s'agissait de la tienne, ton compte est peut-être déjà actif — essaie de te connecter.",
  },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const { result } = await searchParams;
  const key: Result =
    result === "ok" || result === "expired" || result === "used"
      ? result
      : "invalid";
  const c = COPY[key];

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            c.ok ? "bg-primary/15 text-primary" : "bg-danger/15 text-danger"
          }`}
        >
          {c.icon}
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight">
          {c.title}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-text-2">
          {c.body}
        </p>

        {c.ok ? (
          <Link
            href="/connecter"
            className="mt-6 block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Se connecter
          </Link>
        ) : (
          <div className="mt-6">
            <p className="mb-3 text-center text-sm font-medium text-text-2">
              Renvoyer un lien de confirmation
            </p>
            <ResendConfirmation />
          </div>
        )}

        <p className="mt-6 text-center text-sm text-text-2">
          <Link href="/" className="font-medium text-primary hover:underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
