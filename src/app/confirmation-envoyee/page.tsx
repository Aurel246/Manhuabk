import Link from "next/link";
import { ResendConfirmation } from "@/components/resend-confirmation";

export const metadata = { title: "Vérifie ton e-mail — Manhuabk" };

export default async function ConfirmationSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string }>;
}) {
  const { email, sent } = await searchParams;
  const masked = email ? maskEmail(email) : null;
  const sendFailed = sent === "0";

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl">
          ✉️
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight">
          Vérifie ton e-mail
        </h1>
        {sendFailed ? (
          <p className="mt-3 rounded-lg bg-danger/15 px-3 py-2 text-center text-sm text-danger">
            Le compte a été créé, mais l&apos;e-mail n&apos;a pas pu être
            envoyé. Vérifie la configuration e-mail (Resend) ou demande un
            renvoi.
          </p>
        ) : (
          <p className="mt-2 text-center text-sm text-text-2">
            {masked ? (
              <>
                Un e-mail de confirmation a été envoyé à{" "}
                <span className="font-medium text-text">{masked}</span>.
              </>
            ) : (
              "Un e-mail de confirmation vient d'être envoyé."
            )}
          </p>
        )}
        <p className="mt-3 text-center text-sm text-text-2">
          Clique sur le lien qu&apos;il contient pour activer ton compte. Le
          lien expire dans 24&nbsp;heures. Pense à vérifier tes spams.
        </p>

        <div className="mt-6">
          <ResendConfirmation email={email} />
        </div>

        <p className="mt-6 text-center text-sm text-text-2">
          Tu as déjà confirmé ?{" "}
          <Link
            href="/connecter"
            className="font-medium text-primary hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  return `${head}${"•".repeat(Math.max(1, local.length - 2))}@${domain}`;
}
