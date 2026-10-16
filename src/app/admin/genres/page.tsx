import { requireEditor } from "@/modules/users/guards";
import { listGenresAdmin } from "@/modules/admin/manage";
import { createGenreAction, deleteGenreAction } from "@/modules/admin/actions-manage";
import { GenreManager } from "@/components/admin/genre-manager";

export const dynamic = "force-dynamic";

export default async function AdminGenresPage() {
  await requireEditor();
  const genres = await listGenresAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Genres</h1>
      <div className="mt-6">
        <GenreManager
          genres={genres}
          createAction={createGenreAction}
          deleteAction={deleteGenreAction}
        />
      </div>
    </div>
  );
}
