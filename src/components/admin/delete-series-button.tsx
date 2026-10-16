"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/modules/admin/actions-series";

export function DeleteSeriesButton({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-danger px-4 py-2 text-sm text-danger hover:bg-danger/10"
      >
        Supprimer la série
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">Confirmer la suppression ?</span>
      <button
        onClick={() => startTransition(() => void action(id))}
        disabled={pending}
        className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Suppression…" : "Oui, supprimer"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-border px-4 py-2 text-sm"
      >
        Annuler
      </button>
    </div>
  );
}
