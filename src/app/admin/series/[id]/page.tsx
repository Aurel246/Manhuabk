import { notFound } from "next/navigation";
import Link from "next/link";
import { requireEditor } from "@/modules/users/guards";
import { getSeriesAdminById } from "@/modules/admin/series";
import { listGenres } from "@/modules/catalog/service";
import {
  updateSeriesAction,
  deleteSeriesAction,
} from "@/modules/admin/actions-series";
import { SeriesForm } from "@/components/admin/series-form";
import { DeleteSeriesButton } from "@/components/admin/delete-series-button";

export const dynamic = "force-dynamic";

export default async function EditSeriesPage({
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
  const genres = await listGenres();
  const bound = updateSeriesAction.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Éditer — {series!.title}</h1>
        <div className="flex gap-3">
          <Link
            href={`/series/${series!.slug}`}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary"
          >
            Voir la page
          </Link>
          <Link
            href={`/admin/series/${series!.id}/chapitres`}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary"
          >
            Chapitres
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <SeriesForm
          action={bound}
          id={series!.id}
          series={series!}
          genres={genres}
        />
      </div>
      <div className="mt-12 border-t border-border pt-6">
        <h2 className="text-lg font-semibold text-danger">Zone dangereuse</h2>
        <p className="mt-1 text-sm text-text-2">
          La suppression rend la série inaccessible (suppression douce).
        </p>
        <div className="mt-3">
          <DeleteSeriesButton id={series!.id} action={deleteSeriesAction} />
        </div>
      </div>
    </div>
  );
}
