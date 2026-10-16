"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/modules/auth/actions";
import { ResendConfirmation } from "@/components/resend-confirmation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    startTransition(async () => {
      try {
        const check = await loginAction(email, password);
        if (check === "unverified") {
          setUnverifiedEmail(email);
          return;
        }
        if (check === "rate_limited") {
          setError("Trop de tentatives. Réessayez dans une minute.");
          return;
        }
        if (check !== "ok") {
          setError("Identifiants invalides.");
          return;
        }
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (res?.error) {
          setError("Identifiants invalides.");
        } else {
          router.push("/");
          router.refresh();
        }
      } catch {
        setError("Erreur réseau.");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold tracking-tight">Connexion</h1>
        <p className="mt-1 text-sm text-text-2">
          Content de te revoir sur Manhuabk.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          {unverifiedEmail && (
            <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-3 text-sm text-primary">
              <p>
                Ton adresse e-mail n&apos;a pas encore été confirmée. Consulte
                ta boîte de réception pour activer ton compte.
              </p>
              <div className="mt-3">
                <ResendConfirmation email={unverifiedEmail} />
              </div>
            </div>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm text-text-2">E-mail</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-text-2">
              Mot de passe
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-2">
          Pas de compte ?{" "}
          <Link
            href="/inscription"
            className="font-medium text-primary hover:underline"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
