import { searchSeries } from "@/modules/catalog/service";
import { SeriesCardView } from "@/components/series-card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const results = q ? await searchSeries(q) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Recherche</h1>
      <form className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Titre ou titre alternatif…"
          autoFocus
          className="w-full max-w-md rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Rechercher
        </button>
      </form>

      {q && (
        <p className="mt-4 text-sm text-text-2">
          {results.length} résultat{results.length > 1 ? "s" : ""} pour « {q} »
        </p>
      )}

      {q && results.length === 0 ? (
        <p className="mt-8 text-text-2">
          Aucun résultat. Vérifie l’orthographe ou essaie un autre terme.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((s) => (
            <SeriesCardView key={s.id} series={s} />
          ))}
        </div>
      )}
    </div>
  );
}
