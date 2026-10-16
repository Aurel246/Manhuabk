import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { SeriesInput } from "@/lib/validations/admin";
import { logAudit } from "./audit";

export async function getAdminStats() {
  const [series, chapters, users, recentChapters, recentSeries] =
    await Promise.all([
      prisma.series.count({ where: { deletedAt: null } }),
      prisma.chapter.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.chapter.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          chapterNumber: true,
          status: true,
          createdAt: true,
          series: { select: { title: true, slug: true } },
        },
      }),
      prisma.series.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, status: true, updatedAt: true },
      }),
    ]);
  return { series, chapters, users, recentChapters, recentSeries };
}

export async function listSeriesAdmin() {
  return prisma.series.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
      visibility: true,
      isDemo: true,
      updatedAt: true,
      _count: { select: { chapters: { where: { deletedAt: null } } } },
    },
  });
}

export async function getSeriesAdminById(id: string) {
  const s = await prisma.series.findFirst({
    where: { id, deletedAt: null },
    include: { seriesGenres: { select: { genreId: true } } },
  });
  if (!s) throw new AppError("NOT_FOUND");
  return s;
}

export async function createSeries(input: SeriesInput, actorId: string) {
  const exists = await prisma.series.findUnique({ where: { slug: input.slug } });
  if (exists) throw new AppError("CONFLICT", "Ce slug existe déjà.");

  const series = await prisma.series.create({
    data: {
      title: input.title,
      slug: input.slug,
      alternativeTitles: input.alternativeTitles,
      synopsis: input.synopsis,
      type: input.type,
      status: input.status,
      publicationYear: input.publicationYear,
      originalLanguage: input.originalLanguage,
      readingDirection: input.readingDirection,
      visibility: input.visibility,
      ageRating: input.ageRating,
      license: input.license,
      provenance: input.provenance,
      seriesGenres: {
        create: input.genreIds.map((genreId) => ({ genreId })),
      },
    },
  });
  await logAudit({
    actorId,
    action: "CREATE",
    entity: "series",
    entityId: series.id,
  });
  return series;
}

export async function updateSeries(
  id: string,
  input: Partial<SeriesInput>,
  actorId: string
) {
  const existing = await prisma.series.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("NOT_FOUND");

  if (input.slug && input.slug !== existing.slug) {
    const dup = await prisma.series.findUnique({ where: { slug: input.slug } });
    if (dup) throw new AppError("CONFLICT", "Ce slug existe déjà.");
  }

  const { genreIds, ...data } = input;
  const series = await prisma.series.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.alternativeTitles !== undefined && {
        alternativeTitles: data.alternativeTitles,
      }),
      ...(data.synopsis !== undefined && { synopsis: data.synopsis }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.publicationYear !== undefined && {
        publicationYear: data.publicationYear,
      }),
      ...(data.originalLanguage !== undefined && {
        originalLanguage: data.originalLanguage,
      }),
      ...(data.readingDirection !== undefined && {
        readingDirection: data.readingDirection,
      }),
      ...(data.visibility !== undefined && { visibility: data.visibility }),
      ...(data.ageRating !== undefined && { ageRating: data.ageRating }),
      ...(data.license !== undefined && { license: data.license }),
      ...(data.provenance !== undefined && { provenance: data.provenance }),
      ...(genreIds !== undefined && {
        seriesGenres: {
          deleteMany: {},
          create: genreIds.map((genreId) => ({ genreId })),
        },
      }),
    },
  });
  await logAudit({
    actorId,
    action: "UPDATE",
    entity: "series",
    entityId: id,
  });
  return series;
}

export async function softDeleteSeries(id: string, actorId: string) {
  const existing = await prisma.series.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("NOT_FOUND");
  await prisma.series.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  await logAudit({
    actorId,
    action: "DELETE",
    entity: "series",
    entityId: id,
  });
}
