import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditor } from "@/modules/users/guards";
import { getChapterAdmin } from "@/modules/admin/chapters";
import { ChapterManager } from "@/components/admin/chapter-manager";

export const dynamic = "force-dynamic";

export default async function AdminChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  let chapter;
  try {
    chapter = await getChapterAdmin(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Ch. {chapter!.chapterNumber.toString()}
            {chapter!.title ? ` — ${chapter!.title}` : ""}
          </h1>
          <p className="mt-1 text-sm text-text-2">
            Série :{" "}
            <Link
              href={`/admin/series/${chapter!.series.id}/chapitres`}
              className="text-primary hover:underline"
            >
              {chapter!.series.title}
            </Link>{" "}
            · statut{" "}
            <span className="font-medium text-text">{chapter!.status}</span>
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ChapterManager
          chapterId={chapter!.id}
          seriesSlug={chapter!.series.slug}
          pages={chapter!.pages}
          status={chapter!.status}
        />
      </div>
    </div>
  );
}
