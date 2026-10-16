"use client";

import { useActionState, useState, useTransition } from "react";
import type { ActionResult } from "@/modules/admin/actions-manage";

type Genre = { id: string; name: string; slug: string };

export function GenreManager({
  genres,
  createAction,
  deleteAction,
}: {
  genres: Genre[];
  createAction: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  deleteAction: (id: string) => Promise<ActionResult>;
}) {
  const [state, formAction, pending] = useActionState(createAction, null);
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function remove(id: string) {
    if (!confirm("Supprimer ce genre ?")) return;
    setErr(null);
    startTransition(() =>
      void deleteAction(id).then((r) => {
        if (!r.ok) setErr(r.error ?? "Échec.");
      })
    );
  }

  return (
    <div className="space-y-6">
      {(state?.error || err) && (
        <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
          {state?.error ?? err}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-lg bg-success/15 px-3 py-2 text-sm text-success">
          Genre ajouté.
        </p>
      )}
      <form action={formAction} className="flex gap-3">
        <input
          name="name"
          required
          placeholder="Nouveau genre…"
          className="w-64 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Ajout…" : "Ajouter"}
        </button>
      </form>
      <ul className="divide-y divide-border rounded-xl border border-border text-sm">
        {genres.map((g) => (
          <li key={g.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex-1">{g.name}</span>
            <span className="font-mono text-xs text-text-2">/{g.slug}</span>
            <button
              onClick={() => remove(g.id)}
              className="rounded border border-danger px-2 py-1 text-xs text-danger hover:bg-danger/10"
            >
              Supprimer
            </button>
          </li>
        ))}
        {genres.length === 0 && (
          <li className="px-4 py-4 text-text-2">Aucun genre.</li>
        )}
      </ul>
    </div>
  );
}
