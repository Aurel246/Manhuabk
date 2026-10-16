import { requireEditor } from "@/modules/users/guards";
import { listGenres } from "@/modules/catalog/service";
import { createSeriesAction } from "@/modules/admin/actions-series";
import { SeriesForm } from "@/components/admin/series-form";

export const dynamic = "force-dynamic";

export default async function NewSeriesPage() {
  await requireEditor();
  const genres = await listGenres();

  return (
    <div>
      <h1 className="text-2xl font-bold">Nouvelle série</h1>
      <div className="mt-6">
        <SeriesForm action={createSeriesAction} genres={genres} />
      </div>
    </div>
  );
}
