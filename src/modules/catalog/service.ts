import { prisma } from "@/lib/prisma";
import type { Prisma, SeriesType, SeriesStatus } from "@prisma/client";

export const SERIES_CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  coverKey: true,
  type: true,
  status: true,
  isDemo: true,
  ratingAvg: true,
  updatedAt: true,
  chapters: {
    orderBy: { chapterNumber: "desc" as const },
    take: 1,
    select: { chapterNumber: true, publishedAt: true },
  },
} satisfies Prisma.SeriesSelect;

export type SeriesCard = Prisma.SeriesGetPayload<{
  select: typeof SERIES_CARD_SELECT;
}>;

export interface CatalogFilters {
  type?: SeriesType;
  status?: SeriesStatus;
  genre?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: "updated" | "title" | "rating";
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

const SORT_MAP = {
  updated: { updatedAt: "desc" as const },
  title: { title: "asc" as const },
  rating: { ratingAvg: "desc" as const },
};

export async function listSeries(
  filters: CatalogFilters
): Promise<Paginated<SeriesCard>> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(60, Math.max(1, filters.limit ?? 24));
  const skip = (page - 1) * limit;

  const where: Prisma.SeriesWhereInput = {
    deletedAt: null,
    visibility: "PUBLIC",
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.genre
      ? { seriesGenres: { some: { genre: { slug: filters.genre } } } }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { alternativeTitles: { has: filters.q } },
          ],
        }
      : {}),
  };

  const orderBy = SORT_MAP[filters.sort ?? "updated"];

  const [total, items] = await Promise.all([
    prisma.series.count({ where }),
    prisma.series.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: SERIES_CARD_SELECT,
    }),
  ]);

  return {
    items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getSeriesBySlug(slug: string) {
  return prisma.series.findFirst({
    where: { slug, deletedAt: null, visibility: "PUBLIC" },
    include: {
      seriesGenres: { include: { genre: true } },
      seriesAuthors: { include: { author: true } },
    },
  });
}

export async function getChaptersBySeries(
  seriesId: string,
  order: "asc" | "desc" = "desc"
) {
  return prisma.chapter.findMany({
    where: { seriesId, deletedAt: null, status: "PUBLISHED" },
    orderBy: { chapterNumber: order },
    select: {
      id: true,
      chapterNumber: true,
      volumeNumber: true,
      title: true,
      slug: true,
      language: true,
      publishedAt: true,
    },
  });
}

export async function searchSeries(q: string, limit = 12) {
  if (!q.trim()) return [];
  return prisma.series.findMany({
    where: {
      deletedAt: null,
      visibility: "PUBLIC",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { alternativeTitles: { has: q } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: SERIES_CARD_SELECT,
  });
}

export async function listGenres() {
  return prisma.genre.findMany({ orderBy: { order: "asc" } });
}
