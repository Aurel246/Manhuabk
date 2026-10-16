"use client";

import { useState, useTransition } from "react";

interface ResendConfirmationProps {
  /** E-mail pré-rempli (optionnel). S'il est absent, un champ est affiché. */
  email?: string;
  label?: string;
}

export function ResendConfirmation({
  email: presetEmail,
  label = "Renvoyer l'e-mail de confirmation",
}: ResendConfirmationProps) {
  const [email, setEmail] = useState(presetEmail ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/auth/resend-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 429) {
          setIsError(true);
          setMessage(data?.error?.message ?? "Trop de demandes. Réessayez.");
          return;
        }
        setIsError(false);
        setMessage(
          data?.message ??
            "Si une adresse non confirmée correspond, un e-mail a été envoyé."
        );
      } catch {
        setIsError(true);
        setMessage("Erreur réseau. Réessayez.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {!presetEmail && (
        <label className="block">
          <span className="mb-1.5 block text-sm text-text-2">
            Adresse e-mail
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="toi@exemple.com"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
          />
        </label>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? "Envoi…" : label}
      </button>
      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            isError ? "bg-danger/15 text-danger" : "bg-primary/15 text-primary"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
