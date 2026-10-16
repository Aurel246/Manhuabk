import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeriesBySlug, getChaptersBySeries } from "@/modules/catalog/service";
import { imageUrl } from "@/lib/image-url";
import { auth } from "@/auth";
import { isFavorite, getSeriesResume } from "@/modules/reading/service";
import { FavoriteButton } from "@/components/favorite-button";
import { Cover } from "@/components/cover";
import { Rating } from "@/components/rating";
import { SITE_URL } from "@/lib/site";

function fmtNum(n: { toString(): string } | null | undefined) {
  return n ? n.toString() : "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return { title: "Introuvable" };

  const cover = imageUrl(series.coverKey);
  const description =
    series.synopsis?.slice(0, 160) ??
    `Lecture de ${series.title} — ${series.type} ${series.status}.`;

  return {
    title: series.title,
    description,
    alternates: { canonical: `${SITE_URL}/series/${series.slug}` },
    openGraph: {
      title: series.title,
      description,
      type: "website",
      url: `${SITE_URL}/series/${series.slug}`,
      siteName: "Manhuabk",
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: series.title,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();

  const chapters = await getChaptersBySeries(series.id, "desc");

  const session = await auth();
  const userId = session?.user?.id;
  let favorited = false;
  let resume: { chapterId: string; chapterNumber: { toString(): string } } | null =
    null;
  if (userId) {
    [favorited, resume] = await Promise.all([
      isFavorite(userId, series.id),
      getSeriesResume(userId, series.id),
    ]);
  }

  // "Lire" cible le dernier chapitre lû (reprise) sinon le dernier publié
  const startChapterId =
    resume?.chapterId ?? (chapters.length > 0 ? chapters[chapters.length - 1].id : null);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      {/* Bandeau décoratif */}
      <div className="relative mt-0 h-40 overflow-hidden border-b border-border sm:h-56">
        {imageUrl(series.coverKey) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl(series.coverKey)!}
            alt=""
            className="h-full w-full scale-110 object-cover object-center opacity-25 blur-lg"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 via-bg-2 to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      </div>

      <div className="relative -mt-24 flex flex-col gap-8 sm:flex-row">
        {/* Couverture */}
        <div className="w-40 shrink-0 overflow-hidden rounded-xl border-2 border-border-strong shadow-2xl sm:w-48">
          <div className="aspect-[2/3] w-full">
            <Cover
              title={series.title}
              coverKey={series.coverKey}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Infos */}
        <div className="min-w-0 flex-1 pt-16 sm:pt-24">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {series.title}
          </h1>
          <div className="mt-2">
            <Rating value={series.ratingAvg} size="md" />
          </div>
          {series.alternativeTitles.length > 0 && (
            <p className="mt-1 text-sm text-text-2">
              {series.alternativeTitles.join(" · ")}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-primary-soft px-2.5 py-1 font-medium text-primary">
              {series.type}
            </span>
            <span className="rounded-md bg-surface-2 px-2.5 py-1">
              {series.status}
            </span>
            {series.publicationYear && (
              <span className="rounded-md bg-surface-2 px-2.5 py-1">
                {series.publicationYear}
              </span>
            )}
            {series.originalLanguage && (
              <span className="rounded-md bg-surface-2 px-2.5 py-1 uppercase">
                {series.originalLanguage}
              </span>
            )}
            {series.isDemo && (
              <span className="rounded-md bg-warning/90 px-2.5 py-1 font-semibold text-black">
                Démo
              </span>
            )}
          </div>

          {series.seriesGenres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {series.seriesGenres.map((sg) => (
                <Link
                  key={sg.genre.id}
                  href={`/catalogue?genre=${sg.genre.slug}`}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2 transition hover:border-primary hover:text-primary"
                >
                  {sg.genre.name}
                </Link>
              ))}
            </div>
          )}

          {series.seriesAuthors.length > 0 && (
            <p className="mt-3 text-sm text-text-2">
              {series.seriesAuthors
                .map(
                  (sa) =>
                    `${sa.role === "ARTIST" ? "Artiste" : "Auteur"} : ${sa.author.name}`
                )
                .join(" · ")}
            </p>
          )}

          {series.synopsis && (
            <div className="mt-5 rounded-xl border border-border bg-surface p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-2">
                Synopsis
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-2">
                {series.synopsis}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {startChapterId && (
              <Link
                href={`/series/${series.slug}/${startChapterId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {resume
                  ? `Reprendre (Ch. ${resume.chapterNumber.toString()})`
                  : "Commencer la lecture"}
              </Link>
            )}
            <FavoriteButton
              seriesId={series.id}
              initial={favorited}
              loggedIn={!!userId}
            />
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="h-5 w-1 rounded-full bg-primary" />
          Chapitres ({chapters.length})
        </h2>
        {chapters.length === 0 ? (
          <p className="mt-3 text-sm text-text-2">Aucun chapitre publié.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {chapters.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/series/${series.slug}/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-surface-2"
                >
                  <span className="font-mono text-text-2">
                    Ch. {fmtNum(c.chapterNumber)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {c.title ?? ""}
                  </span>
                  <span className="hidden text-xs text-text-2 sm:block">
                    {c.publishedAt
                      ? new Date(c.publishedAt).toLocaleDateString("fr-FR")
                      : ""}
                  </span>
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] uppercase text-text-3">
                    {c.language}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
