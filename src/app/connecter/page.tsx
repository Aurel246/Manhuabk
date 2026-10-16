"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    startTransition(async () => {
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
    });
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold">Connexion</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
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
          <span className="mb-1.5 block text-sm text-text-2">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-4 text-sm text-text-2">
        Pas de compte ?{" "}
        <Link href="/inscription" className="text-primary hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
