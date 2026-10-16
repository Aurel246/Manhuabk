import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditor } from "@/modules/users/guards";
import { getSeriesAdminById } from "@/modules/admin/series";
import { listChaptersAdmin } from "@/modules/admin/chapters";
import { createChapterAction } from "@/modules/admin/actions-chapters";
import { NewChapterForm } from "@/components/admin/new-chapter-form";

export const dynamic = "force-dynamic";

export default async function SeriesChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  let series;
  try {
    series = await getSeriesAdminById(id);
  } catch {
    notFound();
  }
  const chapters = await listChaptersAdmin(id);
  const bound = createChapterAction.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Chapitres — <span className="text-primary">{series!.title}</span>
        </h1>
        <Link
          href={`/admin/series/${series!.id}`}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary"
        >
          Éditer la série
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">Nouveau chapitre</h2>
        <div className="mt-3">
          <NewChapterForm action={bound} />
        </div>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-2">
            <th className="py-2">N°</th>
            <th className="py-2">Titre</th>
            <th className="py-2">Statut</th>
            <th className="py-2">Pages</th>
            <th className="py-2">Langue</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {chapters.map((c) => (
            <tr key={c.id}>
              <td className="py-2.5 font-mono">{c.chapterNumber.toString()}</td>
              <td className="py-2.5">{c.title ?? "—"}</td>
              <td className="py-2.5">
                <StatusBadge status={c.status} />
              </td>
              <td className="py-2.5 font-mono">{c._count.pages}</td>
              <td className="py-2.5 uppercase">{c.language}</td>
              <td className="py-2.5 text-right">
                <Link
                  href={`/admin/chapters/${c.id}`}
                  className="text-primary hover:underline"
                >
                  Gérer
                </Link>
              </td>
            </tr>
          ))}
          {chapters.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-text-2">
                Aucun chapitre. Crée le premier ci-dessus.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "PUBLISHED"
      ? "bg-success/20 text-success"
      : status === "DRAFT"
        ? "bg-warning/20 text-warning"
        : "bg-surface-2 text-text-2";
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${color}`}>{status}</span>
  );
}
