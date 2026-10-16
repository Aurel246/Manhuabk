import { prisma } from "@/lib/prisma";

export async function getChapterForReading(chapterId: string) {
  return prisma.chapter.findFirst({
    where: { id: chapterId, deletedAt: null, status: "PUBLISHED" },
    select: {
      id: true,
      chapterNumber: true,
      volumeNumber: true,
      title: true,
      language: true,
      publishedAt: true,
      series: {
        select: {
          id: true,
          slug: true,
          title: true,
          coverKey: true,
          readingDirection: true,
        },
      },
      pages: {
        orderBy: { pageNumber: "asc" },
        select: {
          pageNumber: true,
          storageKey: true,
          width: true,
          height: true,
        },
      },
    },
  });
}

export async function getAdjacentChapters(
  seriesId: string,
  chapterNumber: string
) {
  const current = Number(chapterNumber);
  const [prev, next] = await Promise.all([
    prisma.chapter.findFirst({
      where: {
        seriesId,
        deletedAt: null,
        status: "PUBLISHED",
        chapterNumber: { lt: current },
      },
      orderBy: { chapterNumber: "desc" },
      select: { id: true, chapterNumber: true },
    }),
    prisma.chapter.findFirst({
      where: {
        seriesId,
        deletedAt: null,
        status: "PUBLISHED",
        chapterNumber: { gt: current },
      },
      orderBy: { chapterNumber: "asc" },
      select: { id: true, chapterNumber: true },
    }),
  ]);
  return { prev, next };
}
