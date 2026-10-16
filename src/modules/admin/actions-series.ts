"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/modules/users/guards";
import {
  createSeries,
  updateSeries,
  softDeleteSeries,
} from "@/modules/admin/series";
import { seriesInputSchema } from "@/lib/validations/admin";
import { isAppError } from "@/lib/errors";

export type ActionResult = { ok: boolean; error?: string };

export async function createSeriesAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const raw = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      alternativeTitles: String(formData.get("alternativeTitles") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      synopsis: formData.get("synopsis") || undefined,
      type: formData.get("type"),
      status: formData.get("status"),
      publicationYear: formData.get("publicationYear")
        ? Number(formData.get("publicationYear"))
        : null,
      originalLanguage: formData.get("originalLanguage") || null,
      visibility: formData.get("visibility"),
      genreIds: formData.getAll("genreIds").map(String),
    };
    const parsed = seriesInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }
    const series = await createSeries(parsed.data, user.id);
    revalidatePath("/admin/series");
    revalidatePath("/catalogue");
    redirect(`/admin/series/${series.id}`);
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function updateSeriesAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const raw = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      alternativeTitles: String(formData.get("alternativeTitles") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      synopsis: formData.get("synopsis") || undefined,
      type: formData.get("type"),
      status: formData.get("status"),
      publicationYear: formData.get("publicationYear")
        ? Number(formData.get("publicationYear"))
        : null,
      originalLanguage: formData.get("originalLanguage") || null,
      visibility: formData.get("visibility"),
      genreIds: formData.getAll("genreIds").map(String),
    };
    const parsed = seriesInputSchema.partial().safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }
    await updateSeries(id, parsed.data, user.id);
    revalidatePath("/admin/series");
    revalidatePath("/catalogue");
    revalidatePath(`/series/${parsed.data.slug}`);
    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function deleteSeriesAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await softDeleteSeries(id, user.id);
    revalidatePath("/admin/series");
    revalidatePath("/catalogue");
    redirect("/admin/series");
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}
