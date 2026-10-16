"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/modules/users/guards";
import {
  createChapter,
  addChapterPages,
  publishChapter,
  unpublishChapter,
  deleteChapter,
  reorderChapterPages,
} from "@/modules/admin/chapters";
import { chapterInputSchema } from "@/lib/validations/admin";
import { isAppError } from "@/lib/errors";

export type ActionResult = { ok: boolean; error?: string; count?: number };

export async function createChapterAction(
  seriesId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const raw = {
      seriesId,
      chapterNumber: formData.get("chapterNumber"),
      volumeNumber: formData.get("volumeNumber") || null,
      title: formData.get("title") || null,
      language: formData.get("language") || "fr",
    };
    const parsed = chapterInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }
    const chapter = await createChapter(parsed.data, user.id);
    revalidatePath(`/admin/series/${seriesId}/chapitres`);
    redirect(`/admin/chapters/${chapter.id}`);
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function uploadPagesAction(
  chapterId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) {
      return { ok: false, error: "Aucun fichier sélectionné." };
    }
    const created = await addChapterPages(chapterId, files, user.id);
    revalidatePath(`/admin/chapters/${chapterId}`);
    return { ok: true, count: created.length };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    return { ok: false, error: e instanceof Error ? e.message : "Échec de l'upload." };
  }
}

export async function publishChapterAction(chapterId: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await publishChapter(chapterId, user.id);
    revalidatePath(`/admin/chapters/${chapterId}`);
    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function unpublishChapterAction(chapterId: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await unpublishChapter(chapterId, user.id);
    revalidatePath(`/admin/chapters/${chapterId}`);
    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function deleteChapterAction(chapterId: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await deleteChapter(chapterId, user.id);
    const chapter = await import("@/lib/prisma").then((m) =>
      m.prisma.chapter.findUnique({ where: { id: chapterId }, select: { seriesId: true } })
    );
    revalidatePath(`/admin/series/${chapter?.seriesId}/chapitres`);
    redirect(`/admin/series/${chapter?.seriesId}/chapitres`);
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function reorderPagesAction(
  chapterId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await reorderChapterPages(chapterId, orderedIds, user.id);
    revalidatePath(`/admin/chapters/${chapterId}`);
    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}
