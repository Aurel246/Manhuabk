import Link from "next/link";
import { listGenres } from "@/modules/catalog/service";

export const dynamic = "force-dynamic";

export default async function GenresPage() {
  const genres = await listGenres();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Genres</h1>
      {genres.length === 0 ? (
        <p className="mt-6 text-text-2">Aucun genre pour le moment.</p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/catalogue?genre=${g.slug}`}
              className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-primary"
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
