import { prisma } from "@/lib/prisma";

export type PopularWindow = "weekly" | "monthly" | "all";

const WINDOW_DAYS: Record<Exclude<PopularWindow, "all">, number> = {
  weekly: 7,
  monthly: 30,
};

export interface HeroItem {
  id: string;
  slug: string;
  title: string;
  coverKey: string | null;
  ratingAvg: number;
  synopsis: string | null;
  genres: string[];
}

export interface RankedSeries {
  id: string;
  slug: string;
  title: string;
  coverKey: string | null;
  ratingAvg: number;
  genres: string[];
  score: number; // chapitres publiés dans la fenêtre (ou total)
}

export interface TrendingItem {
  id: string;
  slug: string;
  title: string;
  coverKey: string | null;
  ratingAvg: number;
  lastChapterNumber: { toString(): string } | null;
  genres: string[];
}

export interface LatestUpdate {
  id: string;
  chapterId: string;
  chapterNumber: { toString(): string };
  publishedAt: Date | null;
  slug: string;
  title: string;
  coverKey: string | null;
}

const GENRE_SELECT = {
  seriesGenres: { select: { genre: { select: { name: true } } } },
} as const;

function genreNames(s: { seriesGenres: { genre: { name: string } }[] }): string[] {
  return s.seriesGenres.map((sg) => sg.genre.name);
}

/** Œuvres pour le bandeau/Carrousel — triées par note réelle, puis récentes. */
export async function getHeroItems(limit = 8): Promise<HeroItem[]> {
  const series = await prisma.series.findMany({
    where: { deletedAt: null, visibility: "PUBLIC" },
    orderBy: [{ ratingAvg: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      coverKey: true,
      ratingAvg: true,
      synopsis: true,
      ...GENRE_SELECT,
    },
  });
  return series.map((s) => ({ ...s, genres: genreNames(s) }));
}

/** Trending Today — séries avec chapitres publiés ces 7 derniers jours. */
export async function getTrending(limit = 10): Promise<TrendingItem[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const series = await prisma.series.findMany({
    where: {
      deletedAt: null,
      visibility: "PUBLIC",
      chapters: {
        some: { status: "PUBLISHED", deletedAt: null, publishedAt: { gte: since } },
      },
    },
    orderBy: [{ ratingAvg: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      coverKey: true,
      ratingAvg: true,
      ...GENRE_SELECT,
      chapters: {
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: { chapterNumber: "desc" },
        take: 1,
        select: { chapterNumber: true },
      },
    },
  });

  return series.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    coverKey: s.coverKey,
    ratingAvg: s.ratingAvg,
    genres: genreNames(s),
    lastChapterNumber: s.chapters[0]?.chapterNumber ?? null,
  }));
}

/**
 * Popular — classement filtré par activité réelle de publication.
 * weekly/monthly : nombre de chapitres publiés dans la fenêtre.
 * all : note réelle d'abord, puis nombre total de chapitres.
 */
export async function getPopularRanked(
  win: PopularWindow,
  limit = 10
): Promise<RankedSeries[]> {
  const since =
    win === "all"
      ? null
      : new Date(Date.now() - WINDOW_DAYS[win] * 24 * 60 * 60 * 1000);

  const series = await prisma.series.findMany({
    where: { deletedAt: null, visibility: "PUBLIC" },
    select: {
      id: true,
      slug: true,
      title: true,
      coverKey: true,
      ratingAvg: true,
      ...GENRE_SELECT,
      _count: {
        select: {
          chapters: {
            where: {
              status: "PUBLISHED",
              deletedAt: null,
              ...(since ? { publishedAt: { gte: since } } : {}),
            },
          },
        },
      },
    },
  });

  const ranked = series.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    coverKey: s.coverKey,
    ratingAvg: s.ratingAvg,
    genres: genreNames(s),
    score: s._count.chapters,
  }));

  if (win === "all") {
    ranked.sort(
      (a, b) => b.ratingAvg - a.ratingAvg || b.score - a.score
    );
  } else {
    ranked.sort((a, b) => b.score - a.score || b.ratingAvg - a.ratingAvg);
  }

  return ranked.slice(0, limit);
}

/** Dernières mises à jour — chapitres publiés les plus récents. */
export async function getLatestUpdates(limit = 10): Promise<LatestUpdate[]> {
  const chapters = await prisma.chapter.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      chapterNumber: true,
      publishedAt: true,
      series: { select: { id: true, slug: true, title: true, coverKey: true } },
    },
  });

  return chapters.map((c) => ({
    id: c.series.id,
    chapterId: c.id,
    chapterNumber: c.chapterNumber,
    publishedAt: c.publishedAt,
    slug: c.series.slug,
    title: c.series.title,
    coverKey: c.series.coverKey,
  }));
}
