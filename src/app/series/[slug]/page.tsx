import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeriesBySlug, getChaptersBySeries } from "@/modules/catalog/service";
import { imageUrl } from "@/lib/image-url";
import { auth } from "@/auth";
import { isFavorite, getSeriesResume } from "@/modules/reading/service";
import { FavoriteButton } from "@/components/favorite-button";
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2">
          {imageUrl(series.coverKey) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl(series.coverKey)!}
              alt={`Couverture de ${series.title}`}
              className="aspect-[2/3] w-full object-cover"
            />
          ) : (
            <div className="aspect-[2/3] w-full" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{series.title}</h1>
          {series.alternativeTitles.length > 0 && (
            <p className="mt-1 text-sm text-text-2">
              {series.alternativeTitles.join(" · ")}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-surface-2 px-2 py-1">{series.type}</span>
            <span className="rounded bg-surface-2 px-2 py-1">{series.status}</span>
            {series.publicationYear && (
              <span className="rounded bg-surface-2 px-2 py-1">
                {series.publicationYear}
              </span>
            )}
            {series.originalLanguage && (
              <span className="rounded bg-surface-2 px-2 py-1 uppercase">
                {series.originalLanguage}
              </span>
            )}
            {series.isDemo && (
              <span className="rounded bg-warning/90 px-2 py-1 font-semibold text-black">
                Démo
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {series.seriesGenres.map((sg) => (
              <Link
                key={sg.genre.id}
                href={`/catalogue?genre=${sg.genre.slug}`}
                className="rounded-full border border-border px-3 py-1 text-xs text-text-2 hover:border-primary hover:text-text"
              >
                {sg.genre.name}
              </Link>
            ))}
          </div>
          <p className="mt-2 text-sm text-text-2">
            {series.seriesAuthors.map((sa) => `${sa.role === "ARTIST" ? "Artiste" : "Auteur"} : ${sa.author.name}`).join(" · ")}
          </p>
          {series.synopsis && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-2">
              {series.synopsis}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {startChapterId && (
              <Link
                href={`/series/${series.slug}/${startChapterId}`}
                className="inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover"
              >
                {resume ? `Reprendre (Ch. ${resume.chapterNumber.toString()})` : "Commencer la lecture"}
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

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Chapitres ({chapters.length})
        </h2>
        {chapters.length === 0 ? (
          <p className="mt-3 text-sm text-text-2">Aucun chapitre publié.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {chapters.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/series/${series.slug}/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2"
                >
                  <span className="font-mono text-text-2">
                    Ch. {fmtNum(c.chapterNumber)}
                  </span>
                  <span className="flex-1 truncate">
                    {c.title ?? ""}
                  </span>
                  <span className="text-xs text-text-2">
                    {c.publishedAt
                      ? new Date(c.publishedAt).toLocaleDateString("fr-FR")
                      : ""}
                  </span>
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] uppercase">
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
