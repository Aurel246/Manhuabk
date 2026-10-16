import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { ChapterInput } from "@/lib/validations/admin";
import { saveFile, deleteFile, newKey } from "@/modules/storage/service";
import { validateImageBuffer } from "@/modules/storage/validation";
import { logAudit } from "./audit";

export async function listChaptersAdmin(seriesId: string) {
  return prisma.chapter.findMany({
    where: { seriesId, deletedAt: null },
    orderBy: { chapterNumber: "asc" },
    include: { _count: { select: { pages: true } } },
  });
}

export async function getChapterAdmin(id: string) {
  const c = await prisma.chapter.findFirst({
    where: { id, deletedAt: null },
    include: {
      series: { select: { id: true, title: true, slug: true } },
      pages: { orderBy: { pageNumber: "asc" } },
    },
  });
  if (!c) throw new AppError("NOT_FOUND");
  return c;
}

export async function createChapter(input: ChapterInput, actorId: string) {
  const series = await prisma.series.findFirst({
    where: { id: input.seriesId, deletedAt: null },
  });
  if (!series) throw new AppError("NOT_FOUND", "Série introuvable.");

  const chapter = await prisma.chapter.create({
    data: {
      seriesId: input.seriesId,
      chapterNumber: input.chapterNumber,
      volumeNumber: input.volumeNumber,
      title: input.title,
      slug: input.slug ?? `chapitre-${input.chapterNumber}`,
      language: input.language,
      status: "DRAFT",
    },
  });
  await logAudit({
    actorId,
    action: "CREATE",
    entity: "chapter",
    entityId: chapter.id,
  });
  return chapter;
}

export async function updateChapter(
  id: string,
  input: Partial<ChapterInput>,
  actorId: string
) {
  const existing = await prisma.chapter.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError("NOT_FOUND");
  const chapter = await prisma.chapter.update({
    where: { id },
    data: {
      ...(input.chapterNumber !== undefined && {
        chapterNumber: input.chapterNumber,
      }),
      ...(input.volumeNumber !== undefined && {
        volumeNumber: input.volumeNumber,
      }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.slug != null && input.slug !== "" && { slug: input.slug }),
      ...(input.language !== undefined && { language: input.language }),
    },
  });
  await logAudit({
    actorId,
    action: "UPDATE",
    entity: "chapter",
    entityId: id,
  });
  return chapter;
}

export async function addChapterPages(
  chapterId: string,
  files: File[],
  actorId: string
) {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, deletedAt: null },
    include: { pages: { orderBy: { pageNumber: "desc" }, take: 1 } },
  });
  if (!chapter) throw new AppError("NOT_FOUND");

  let nextNumber = (chapter.pages[0]?.pageNumber ?? 0) + 1;
  const created: { pageNumber: number; storageKey: string }[] = [];
  const savedKeys: string[] = [];

  try {
    for (const file of files) {
      const data = Buffer.from(await file.arrayBuffer());
      const valid = await validateImageBuffer(data);
      const key = newKey(`chapters/${chapterId}`, valid.ext);
      await saveFile(key, valid.buffer);
      savedKeys.push(key);
      await prisma.chapterPage.create({
        data: {
          chapterId,
          pageNumber: nextNumber,
          storageKey: key,
        },
      });
      created.push({ pageNumber: nextNumber, storageKey: key });
      nextNumber++;
    }
  } catch (e) {
    // compensation : supprime les fichiers déjà sauvés si échec en cours
    for (const k of savedKeys) await deleteFile(k);
    throw e;
  }

  await logAudit({
    actorId,
    action: "ADD_PAGES",
    entity: "chapter",
    entityId: chapterId,
    meta: { count: created.length },
  });
  return created;
}

export async function reorderChapterPages(
  chapterId: string,
  orderedIds: string[],
  actorId: string
) {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, deletedAt: null },
    include: { pages: true },
  });
  if (!chapter) throw new AppError("NOT_FOUND");

  const validIds = new Set(chapter.pages.map((p) => p.id));
  if (
    orderedIds.length !== chapter.pages.length ||
    !orderedIds.every((id) => validIds.has(id))
  ) {
    throw new AppError("VALIDATION_ERROR", "Ordre des pages invalide.");
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.chapterPage.update({
      where: { id: orderedIds[i] },
      data: { pageNumber: i + 1 },
    });
  }
  await logAudit({
    actorId,
    action: "REORDER_PAGES",
    entity: "chapter",
    entityId: chapterId,
  });
}

export async function deleteChapterPage(
  chapterId: string,
  pageId: string,
  actorId: string
) {
  const page = await prisma.chapterPage.findFirst({
    where: { id: pageId, chapterId },
  });
  if (!page) throw new AppError("NOT_FOUND");
  await prisma.chapterPage.delete({ where: { id: pageId } });
  await deleteFile(page.storageKey);
  // renumérote les pages restantes
  const remaining = await prisma.chapterPage.findMany({
    where: { chapterId },
    orderBy: { pageNumber: "asc" },
  });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].pageNumber !== i + 1) {
      await prisma.chapterPage.update({
        where: { id: remaining[i].id },
        data: { pageNumber: i + 1 },
      });
    }
  }
  await logAudit({
    actorId,
    action: "DELETE_PAGE",
    entity: "chapter",
    entityId: chapterId,
    meta: { pageId },
  });
}

export async function publishChapter(chapterId: string, actorId: string) {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, deletedAt: null },
    include: { pages: { select: { id: true } } },
  });
  if (!chapter) throw new AppError("NOT_FOUND");
  if (chapter.pages.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Impossible de publier un chapitre sans page.");
  }
  const updated = await prisma.chapter.update({
    where: { id: chapterId },
    data: { status: "PUBLISHED", publishedAt: chapter.publishedAt ?? new Date() },
  });
  await logAudit({
    actorId,
    action: "PUBLISH",
    entity: "chapter",
    entityId: chapterId,
  });
  return updated;
}

export async function unpublishChapter(chapterId: string, actorId: string) {
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { status: "UNPUBLISHED" },
  });
  await logAudit({
    actorId,
    action: "UNPUBLISH",
    entity: "chapter",
    entityId: chapterId,
  });
}

export async function deleteChapter(chapterId: string, actorId: string) {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, deletedAt: null },
    include: { pages: { select: { storageKey: true } } },
  });
  if (!chapter) throw new AppError("NOT_FOUND");
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { deletedAt: new Date() },
  });
  for (const p of chapter.pages) await deleteFile(p.storageKey);
  await logAudit({
    actorId,
    action: "DELETE",
    entity: "chapter",
    entityId: chapterId,
  });
}
