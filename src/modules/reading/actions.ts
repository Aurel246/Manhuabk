"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/modules/users/guards";
import { toggleFavorite, saveProgress, recordHistory } from "./service";
import { prisma } from "@/lib/prisma";
import { isAppError } from "@/lib/errors";

export type ActionResult = { ok: boolean; error?: string; favorited?: boolean };

export async function toggleFavoriteAction(
  seriesId: string
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const res = await toggleFavorite(user.id, seriesId);
    revalidatePath("/compte");
    revalidatePath("/series/[slug]", "page");
    return { ok: true, favorited: res.favorited };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function saveProgressAction(input: {
  seriesId: string;
  chapterId: string;
  pageNum: number;
  scrollPct: number;
}): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await saveProgress(
      user.id,
      input.seriesId,
      input.chapterId,
      input.pageNum,
      input.scrollPct
    );
    await recordHistory(user.id, input.seriesId, input.chapterId);
    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function getResumeForSeries(seriesId: string) {
  const user = await requireUser();
  const { getSeriesResume } = await import("./service");
  return getSeriesResume(user.id, seriesId);
}

// Pour la page compte : profil
export async function getProfile() {
  const user = await requireUser();
  return prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}
