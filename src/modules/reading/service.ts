import { prisma } from "@/lib/prisma";

export async function isFavorite(userId: string, seriesId: string) {
  const f = await prisma.favorite.findUnique({
    where: { userId_seriesId: { userId, seriesId } },
  });
  return !!f;
}

export async function toggleFavorite(userId: string, seriesId: string) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_seriesId: { userId, seriesId } },
  });
  if (existing) {
    await prisma.favorite.delete({
      where: { userId_seriesId: { userId, seriesId } },
    });
    return { favorited: false };
  }
  await prisma.favorite.create({ data: { userId, seriesId } });
  return { favorited: true };
}

export async function listFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      series: {
        select: {
          id: true,
          slug: true,
          title: true,
          coverKey: true,
          type: true,
          status: true,
          isDemo: true,
        },
      },
    },
  });
}

export async function recordHistory(
  userId: string,
  seriesId: string,
  chapterId: string
) {
  await prisma.readingHistory.upsert({
    where: { userId_seriesId: { userId, seriesId } },
    update: { chapterId, readAt: new Date() },
    create: { userId, seriesId, chapterId },
  });
}

export async function listHistory(userId: string, limit = 30) {
  return prisma.readingHistory.findMany({
    where: { userId },
    orderBy: { readAt: "desc" },
    take: limit,
    include: {
      series: {
        select: { slug: true, title: true, coverKey: true, type: true, isDemo: true },
      },
      chapter: { select: { id: true, chapterNumber: true } },
    },
  });
}

export async function saveProgress(
  userId: string,
  seriesId: string,
  chapterId: string,
  pageNum: number,
  scrollPct: number
) {
  const existing = await prisma.readingProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });

  // Ne jamais écraser une progression plus récente (conflit multi-appareils)
  if (existing) {
    // updated_at serveur = référence ; on accepte la nouvelle valeur uniquement
    // si le client confirme une progression "au moins aussi loin".
    if (
      existing.pageNum > pageNum ||
      (existing.pageNum === pageNum && existing.scrollPct > scrollPct)
    ) {
      return { saved: false, current: existing };
    }
  }

  const progress = await prisma.readingProgress.upsert({
    where: { userId_chapterId: { userId, chapterId } },
    update: { seriesId, pageNum, scrollPct },
    create: { userId, seriesId, chapterId, pageNum, scrollPct },
  });
  return { saved: true, current: progress };
}

export async function getProgress(userId: string, chapterId: string) {
  return prisma.readingProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });
}

// Dernière lecture d'une série pour "Reprendre"
export async function getSeriesResume(
  userId: string,
  seriesId: string
) {
  const history = await prisma.readingHistory.findUnique({
    where: { userId_seriesId: { userId, seriesId } },
    include: {
      chapter: { select: { id: true, chapterNumber: true, status: true } },
    },
  });
  if (!history || history.chapter.status !== "PUBLISHED") return null;
  const progress = await getProgress(userId, history.chapter.id);
  return {
    chapterId: history.chapter.id,
    chapterNumber: history.chapter.chapterNumber,
    pageNum: progress?.pageNum ?? 0,
  };
}
