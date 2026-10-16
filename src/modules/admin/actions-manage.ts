"use server";

import { revalidatePath } from "next/cache";
import { requireEditor, requireAdmin } from "@/modules/users/guards";
import {
  createGenre,
  deleteGenre,
  setUserRole,
} from "@/modules/admin/manage";
import { isAppError } from "@/lib/errors";

export type ActionResult = { ok: boolean; error?: string };

export async function createGenreAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, error: "Nom requis." };
    await createGenre(name, user.id);
    revalidatePath("/admin/genres");
    revalidatePath("/genres");
    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function deleteGenreAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireEditor();
    await deleteGenre(id, user.id);
    revalidatePath("/admin/genres");
    revalidatePath("/genres");
    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}

export async function setUserRoleAction(
  userId: string,
  role: "USER" | "MODERATOR" | "EDITOR" | "ADMIN"
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await setUserRole(userId, role, admin.id);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    throw e;
  }
}
