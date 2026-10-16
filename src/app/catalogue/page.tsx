import Link from "next/link";
import { listSeries, listGenres } from "@/modules/catalog/service";
import { SeriesCardView } from "@/components/series-card";

const TYPES = ["MANGA", "MANHWA", "MANHUA", "WEBTOON"] as const;
const STATUSES = ["ONGOING", "COMPLETED", "HIATUS"] as const;
const SORTS = [
  { key: "updated", label: "Mises à jour" },
  { key: "title", label: "Titre" },
  { key: "rating", label: "Note" },
] as const;

function buildQuery(
  base: Record<string, string | undefined>,
  patch: Record<string, string | undefined>
) {
  const merged = { ...base, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) =>
    typeof sp[k] === "string" ? (sp[k] as string) : undefined;

  const filters = {
    type: get("type") as never,
    status: get("status") as never,
    genre: get("genre"),
    q: get("q"),
    sort: (get("sort") as never) ?? "updated",
    page: Number(get("page") ?? 1) || 1,
  };

  const [{ items, meta }, genres] = await Promise.all([
    listSeries(filters),
    listGenres(),
  ]);

  const base = {
    type: filters.type,
    status: filters.status,
    genre: filters.genre,
    q: filters.q,
    sort: filters.sort,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Catalogue</h1>

      <form className="mt-6 flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Rechercher…"
          className="w-56 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        />
        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        >
          <option value="">Type</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        >
          <option value="">Statut</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="genre"
          defaultValue={filters.genre ?? ""}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        >
          <option value="">Genre</option>
          {genres.map((g) => (
            <option key={g.id} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={filters.sort}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Filtrer
        </button>
      </form>

      <p className="mt-4 text-sm text-text-2">
        {meta.total} série{meta.total > 1 ? "s" : ""}
      </p>

      {items.length === 0 ? (
        <p className="mt-10 text-text-2">
          Aucune série ne correspond à ces filtres.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((s) => (
            <SeriesCardView key={s.id} series={s} />
          ))}
        </div>
      )}

      {meta.pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2 text-sm">
          {meta.page > 1 && (
            <Link
              href={`/catalogue${buildQuery(base, { page: String(meta.page - 1) })}`}
              className="rounded-lg border border-border px-3 py-1.5 hover:border-primary"
            >
              Précédent
            </Link>
          )}
          <span className="px-3 text-text-2">
            {meta.page} / {meta.pages}
          </span>
          {meta.page < meta.pages && (
            <Link
              href={`/catalogue${buildQuery(base, { page: String(meta.page + 1) })}`}
              className="rounded-lg border border-border px-3 py-1.5 hover:border-primary"
            >
              Suivant
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
