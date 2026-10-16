"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionResult } from "@/modules/admin/actions-series";

type Genre = { id: string; name: string };

type SeriesLike = {
  id?: string;
  title?: string;
  slug?: string;
  alternativeTitles?: string[];
  synopsis?: string | null;
  type?: string;
  status?: string;
  publicationYear?: number | null;
  originalLanguage?: string | null;
  visibility?: string;
  seriesGenres?: { genreId: string }[];
};

export function SeriesForm({
  action,
  id,
  series,
  genres,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  id?: string;
  series?: SeriesLike;
  genres: Genre[];
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const selected = new Set(series?.seriesGenres?.map((g) => g.genreId) ?? []);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <Field label="Titre *">
        <input
          name="title"
          defaultValue={series?.title ?? ""}
          required
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Slug * (lettres minuscules, chiffres, -)">
        <input
          name="slug"
          defaultValue={series?.slug ?? ""}
          required
          pattern="[a-z0-9-]+"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm"
        />
      </Field>
      <Field label="Titres alternatifs (séparés par des virgules)">
        <input
          name="alternativeTitles"
          defaultValue={series?.alternativeTitles?.join(", ") ?? ""}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Synopsis">
        <textarea
          name="synopsis"
          defaultValue={series?.synopsis ?? ""}
          rows={5}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select
            name="type"
            defaultValue={series?.type ?? "MANGA"}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          >
            {["MANGA", "MANHWA", "MANHUA", "WEBTOON", "OTHER"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Statut">
          <select
            name="status"
            defaultValue={series?.status ?? "ONGOING"}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          >
            {["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Année">
          <input
            name="publicationYear"
            type="number"
            defaultValue={series?.publicationYear ?? ""}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Langue originale">
          <input
            name="originalLanguage"
            defaultValue={series?.originalLanguage ?? ""}
            placeholder="ko, ja, zh…"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Visibilité">
          <select
            name="visibility"
            defaultValue={series?.visibility ?? "PUBLIC"}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
          >
            {["PUBLIC", "UNLISTED", "PRIVATE"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Genres">
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <label
              key={g.id}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs"
            >
              <input
                type="checkbox"
                name="genreIds"
                value={g.id}
                defaultChecked={selected.has(g.id)}
              />
              {g.name}
            </label>
          ))}
        </div>
      </Field>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : id ? "Enregistrer" : "Créer la série"}
        </button>
        <Link
          href="/admin/series"
          className="rounded-lg border border-border px-5 py-2.5 text-sm hover:border-primary"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-text-2">{label}</span>
      {children}
    </label>
  );
}
