"use client";

import { useRef, useState, useTransition } from "react";
import {
  uploadPagesAction,
  publishChapterAction,
  unpublishChapterAction,
  deleteChapterAction,
  reorderPagesAction,
  type ActionResult,
} from "@/modules/admin/actions-chapters";
import { imageUrl } from "@/lib/image-url";

type Page = {
  id: string;
  pageNumber: number;
  storageKey: string;
  width: number | null;
  height: number | null;
};

export function ChapterManager({
  chapterId,
  seriesSlug,
  pages: initialPages,
  status,
}: {
  chapterId: string;
  seriesSlug: string;
  pages: Page[];
  status: string;
}) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleUpload(formData: FormData) {
    setUploading(true);
    setMsg(null);
    void uploadPagesAction(chapterId, formData).then((res: ActionResult) => {
      setUploading(false);
      if (res.ok) {
        setMsg({ type: "ok", text: `${res.count} page(s) ajoutée(s).` });
        // recharge les pages via refresh du parent (revalidate) — simple : location.reload
        window.location.reload();
      } else {
        setMsg({ type: "err", text: res.error ?? "Échec." });
      }
    });
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    const next = [...pages];
    [next[index], next[target]] = [next[target], next[index]];
    setPages(next);
    void reorderPagesAction(
      chapterId,
      next.map((p) => p.id)
    );
  }

  function publish() {
    setMsg(null);
    startTransition(() =>
      void publishChapterAction(chapterId).then((r) => {
        if (r.ok) {
          setMsg({ type: "ok", text: "Chapitre publié." });
          window.location.reload();
        } else setMsg({ type: "err", text: r.error ?? "Échec." });
      })
    );
  }

  function unpublish() {
    startTransition(() =>
      void unpublishChapterAction(chapterId).then((r) => {
        if (r.ok) window.location.reload();
      })
    );
  }

  function removeChapter() {
    if (!confirm("Supprimer définitivement ce chapitre et ses pages ?")) return;
    startTransition(() =>
      void deleteChapterAction(chapterId).then((r) => {
        if (r.ok === false && r.error) setMsg({ type: "err", text: r.error });
      })
    );
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "bg-success/15 text-success"
              : "bg-danger/15 text-danger"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">Importer des images</h2>
        <p className="mt-1 text-xs text-text-2">
          JPEG, PNG ou WebP — 10 Mo max / fichier. Ajout en fin de chapitre.
        </p>
        <form ref={formRef} action={handleUpload} className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="files"
            multiple
            accept="image/jpeg,image/png,image/webp"
            required
            className="text-sm text-text-2 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:text-white"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {uploading ? "Envoi en cours…" : "Envoyer"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Pages ({pages.length})
          </h2>
          <div className="flex gap-2 text-sm">
            {status === "PUBLISHED" ? (
              <button
                onClick={unpublish}
                disabled={pending}
                className="rounded-lg border border-border px-4 py-2 hover:border-primary disabled:opacity-50"
              >
                Dépublier
              </button>
            ) : (
              <button
                onClick={publish}
                disabled={pending || pages.length === 0}
                className="rounded-lg bg-success px-4 py-2 font-medium text-white disabled:opacity-50"
                title={pages.length === 0 ? "Ajoute des pages d'abord" : ""}
              >
                {pending ? "Publication…" : "Publier"}
              </button>
            )}
          </div>
        </div>

        {pages.length === 0 ? (
          <p className="mt-4 text-sm text-text-2">
            Aucune page. Importe des images ci-dessus.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pages.map((p, i) => (
              <li
                key={p.id}
                className="overflow-hidden rounded-lg border border-border bg-surface-2"
              >
                <div className="relative aspect-[2/3] w-full bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl(p.storageKey)!}
                    alt={`Page ${p.pageNumber}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-xs">
                    {p.pageNumber}
                  </span>
                </div>
                <div className="flex justify-between p-1.5 text-xs">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded border border-border px-2 py-1 disabled:opacity-30"
                    aria-label="Monter"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === pages.length - 1}
                    className="rounded border border-border px-2 py-1 disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    ↓
                  </button>
                  <a
                    href={`/series/${seriesSlug}/${chapterId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-border px-2 py-1 text-text-2"
                    title="Ouvrir le chapitre"
                  >
                    ⤢
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border pt-5">
        <button
          onClick={removeChapter}
          disabled={pending}
          className="rounded-lg border border-danger px-4 py-2 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
        >
          Supprimer le chapitre
        </button>
      </div>
    </div>
  );
}
