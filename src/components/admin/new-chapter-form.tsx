"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/modules/admin/actions-chapters";

export function NewChapterForm({
  action,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {state?.error && (
        <p className="w-full rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="mb-1 block text-xs text-text-2">N° chapitre *</span>
        <input
          name="chapterNumber"
          type="number"
          step="any"
          required
          className="w-28 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-text-2">Volume</span>
        <input
          name="volumeNumber"
          type="number"
          step="any"
          className="w-24 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
      </label>
      <label className="block flex-1">
        <span className="mb-1 block text-xs text-text-2">Titre</span>
        <input
          name="title"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-text-2">Langue</span>
        <input
          name="language"
          defaultValue="fr"
          className="w-20 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {pending ? "Création…" : "Créer (brouillon)"}
      </button>
    </form>
  );
}
