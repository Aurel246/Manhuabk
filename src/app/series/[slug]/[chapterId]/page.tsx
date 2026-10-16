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
    <div className="mx-auto max-w-3xl px-2 py-4 sm:px-4">
      <div className="sticky top-14 z-30 flex items-center gap-3 rounded-lg border border-border bg-bg/90 px-3 py-2 text-sm backdrop-blur">
        <Link href={`/series/${slug}`} className="text-text-2 hover:text-text">
          ← Série
        </Link>
        <span className="flex-1 truncate font-medium">
          Ch. {chapter.chapterNumber.toString()}
          {chapter.title ? ` — ${chapter.title}` : ""}
        </span>
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs uppercase text-text-2">
          {chapter.language}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        {chapter.pages.length === 0 ? (
          <p className="py-16 text-center text-text-2">
            Aucune page dans ce chapitre.
          </p>
        ) : (
          chapter.pages.map((p) => (
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
          ))
        )}
      </div>

      {userId && chapter.pages.length > 0 && (
        <ProgressTracker
          seriesId={chapter.series.id}
          chapterId={chapter.id}
          totalPages={chapter.pages.length}
        />
      )}

      <nav className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
        {prev ? (
          <Link
            href={`/series/${slug}/${prev.id}`}
            className="rounded-lg border border-border px-4 py-2 hover:border-primary"
          >
            ← Ch. {prev.chapterNumber.toString()}
          </Link>
        ) : (
          <span className="text-text-2">Début</span>
        )}
        {next ? (
          <Link
            href={`/series/${slug}/${next.id}`}
            className="rounded-lg border border-border px-4 py-2 hover:border-primary"
          >
            Ch. {next.chapterNumber.toString()} →
          </Link>
        ) : (
          <span className="text-text-2">Fin</span>
        )}
      </nav>
    </div>
  );
}
