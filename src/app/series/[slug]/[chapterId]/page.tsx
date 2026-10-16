import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getChapterForReading,
  getAdjacentChapters,
} from "@/modules/chapters/service";
import { imageUrl } from "@/lib/image-url";
import { auth } from "@/auth";
import { recordHistory } from "@/modules/reading/service";
import { ProgressTracker } from "@/components/progress-tracker";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterId: string }>;
}): Promise<Metadata> {
  const { slug, chapterId } = await params;
  const chapter = await getChapterForReading(chapterId);
  if (!chapter || chapter.series.slug !== slug) return { title: "Introuvable" };

  const title = `${chapter.series.title} — Ch. ${chapter.chapterNumber.toString()}`;
  return {
    title,
    description: `Lecture de ${title} sur Manhuabk.`,
    alternates: {
      canonical: `${SITE_URL}/series/${slug}/${chapterId}`,
    },
    // pages de lecture : pas d'indexation agressive des chapitres
    robots: { index: false, follow: true },
  };
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapterId: string }>;
}) {
  const { slug, chapterId } = await params;
  const chapter = await getChapterForReading(chapterId);
  if (!chapter || chapter.series.slug !== slug) notFound();

  const { prev, next } = await getAdjacentChapters(
    chapter.series.id,
    chapter.chapterNumber.toString()
  );

  const session = await auth();
  const userId = session?.user?.id;
  if (userId) {
    await recordHistory(userId, chapter.series.id, chapter.id);
  }

  return (
    <div className="min-h-screen bg-bg-2">
      {/* Barre de navigation fixe (épurée) */}
      <div className="sticky top-16 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-3 py-2.5 text-sm">
          <Link
            href={`/series/${slug}`}
            className="flex items-center gap-1.5 text-text-2 transition hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Série</span>
          </Link>
          <span className="min-w-0 flex-1 truncate text-center font-medium">
            {chapter.series.title}
            <span className="text-text-2"> · Ch. {chapter.chapterNumber.toString()}</span>
          </span>
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] uppercase text-text-3">
            {chapter.language}
          </span>
        </div>
        {/* Navigation chapitres en haut */}
        <div className="mx-auto flex max-w-3xl items-stretch border-t border-border text-sm">
          {prev ? (
            <Link
              href={`/series/${slug}/${prev.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 py-2 text-text-2 transition hover:bg-surface hover:text-text"
            >
              ← Ch. {prev.chapterNumber.toString()}
            </Link>
          ) : (
            <span className="flex flex-1 items-center justify-center py-2 text-text-3">Début</span>
          )}
          <div className="w-px bg-border" />
          {next ? (
            <Link
              href={`/series/${slug}/${next.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 py-2 text-text-2 transition hover:bg-surface hover:text-text"
            >
              Ch. {next.chapterNumber.toString()} →
            </Link>
          ) : (
            <span className="flex flex-1 items-center justify-center py-2 text-text-3">Fin</span>
          )}
        </div>
      </div>

      {/* Pages */}
      <div className="mx-auto max-w-3xl">
        {chapter.pages.length === 0 ? (
          <p className="py-24 text-center text-text-2">
            Aucune page dans ce chapitre.
          </p>
        ) : (
          <div className="space-y-0">
            {chapter.pages.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.pageNumber}
                data-page={p.pageNumber}
                src={imageUrl(p.storageKey)!}
                alt={`Page ${p.pageNumber}`}
                width={p.width ?? undefined}
                height={p.height ?? undefined}
                loading={p.pageNumber <= 2 ? "eager" : "lazy"}
                decoding="async"
                className="mx-auto block h-auto w-full"
              />
            ))}
          </div>
        )}
      </div>

      {userId && chapter.pages.length > 0 && (
        <ProgressTracker
          seriesId={chapter.series.id}
          chapterId={chapter.id}
          totalPages={chapter.pages.length}
        />
      )}

      {/* Navigation en bas */}
      <nav className="mx-auto flex max-w-3xl items-stretch gap-3 border-t border-border py-4 text-sm">
        {prev ? (
          <Link
            href={`/series/${slug}/${prev.id}`}
            className="flex flex-1 items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-primary hover:text-primary"
          >
            ← Ch. {prev.chapterNumber.toString()}
          </Link>
        ) : (
          <span className="flex flex-1 items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 text-text-3">
            Début
          </span>
        )}
        {next ? (
          <Link
            href={`/series/${slug}/${next.id}`}
            className="flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover"
          >
            Ch. {next.chapterNumber.toString()} →
          </Link>
        ) : (
          <Link
            href={`/series/${slug}`}
            className="flex flex-1 items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-primary hover:text-primary"
          >
            Retour à la série
          </Link>
        )}
      </nav>
    </div>
  );
}
