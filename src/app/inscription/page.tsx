"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
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
        // connexion automatique
        const login = await signIn("credentials", {
          email: payload.email,
          password: payload.password,
          redirect: false,
        });
        if (login?.error) {
          router.push("/connecter");
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
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold">Créer un compte</h1>
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
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-text-2">E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
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
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Création…" : "Créer mon compte"}
        </button>
      </form>
      <p className="mt-4 text-sm text-text-2">
        Déjà inscrit ?{" "}
        <Link href="/connecter" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
