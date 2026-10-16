"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      username: String(form.get("username") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error?.message ?? "Inscription impossible.");
          return;
        }
        const data = await res.json().catch(() => ({ emailSent: true }));
        const sent = data?.emailSent ? 1 : 0;
        router.push(
          `/confirmation-envoyee?email=${encodeURIComponent(
            payload.email
          )}&sent=${sent}`
        );
        router.refresh();
      } catch {
        setError("Erreur réseau.");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Créer un compte
        </h1>
        <p className="mt-1 text-sm text-text-2">
          Rejoins Manhuabk et suis tes mangas favoris.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm text-text-2">Pseudo</span>
            <input
              name="username"
              required
              minLength={3}
              autoComplete="username"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
            />
          </label>
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
              Mot de passe (8 min)
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            {pending ? "Création…" : "Créer mon compte"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-2">
          Déjà inscrit ?{" "}
          <Link href="/connecter" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
