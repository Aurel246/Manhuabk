import Link from "next/link";
import { HeroCarousel } from "@/components/hero-carousel";
import { Cover } from "@/components/cover";
import { Rating } from "@/components/rating";
import {
  getHeroItems,
  getTrending,
  getPopularRanked,
  getLatestUpdates,
  type PopularWindow,
} from "@/modules/catalog/home";

export const dynamic = "force-dynamic";

const TABS: { key: PopularWindow; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "all", label: "All Time" },
];

function parseTab(v: string | string[] | undefined): PopularWindow {
  return v === "monthly" || v === "all" ? v : "weekly";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tab = parseTab(sp.tab);

  const [hero, trending, popular, latest] = await Promise.all([
    getHeroItems(8),
    getTrending(10),
    getPopularRanked(tab, 10),
    getLatestUpdates(10),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      {/* ===== Bandeau de couvertures ===== */}
      {hero.length > 0 && (
        <div className="pt-4">
          <HeroCarousel items={hero} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* ===== Colonne principale ===== */}
        <div className="min-w-0">
          {/* Trending Today */}
          <SectionTitle title="Trending Today" href="/catalogue?sort=updated" />
          {trending.length === 0 ? (
            <Empty text="Aucune activité récente. Les séries avec de nouveaux chapitres apparaîtront ici." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {trending.map((t) => (
                <TrendingCard key={t.id} item={t} />
              ))}
            </div>
          )}

          {/* Latest Updates */}
          <div className="mt-12">
            <SectionTitle title="Latest Updates" href="/catalogue?sort=updated" />
            {latest.length === 0 ? (
              <Empty text="Aucun chapitre publié pour le moment." />
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {latest.map((u) => (
                  <li key={u.chapterId}>
                    <Link
                      href={`/series/${u.slug}/${u.chapterId}`}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5 transition hover:border-primary/60 hover:bg-surface-2"
                    >
                      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md">
                        <Cover title={u.title} coverKey={u.coverKey} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold transition group-hover:text-primary">
                          {u.title}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-text-2">
                          Ch. {u.chapterNumber.toString()}
                        </p>
                      </div>
                      <span className="shrink-0 text-right text-[11px] text-text-3">
                        {u.publishedAt
                          ? new Date(u.publishedAt).toLocaleDateString("fr-FR")
                          : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ===== Colonne latérale : Popular ===== */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-lg font-extrabold tracking-tight">Popular</h2>

            {/* Onglets */}
            <div className="mt-3 flex gap-1 rounded-lg bg-bg-2 p-1">
              {TABS.map((t) => (
                <Link
                  key={t.key}
                  href={`/?tab=${t.key}`}
                  className={`flex-1 rounded-md px-2 py-1.5 text-center text-xs font-semibold transition ${
                    tab === t.key
                      ? "bg-primary text-white shadow"
                      : "text-text-2 hover:text-text"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </div>

            {popular.length === 0 ? (
              <p className="mt-4 text-sm text-text-2">
                Aucune donnée pour cet onglet.
              </p>
            ) : (
              <ol className="mt-3 space-y-1">
                {popular.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      href={`/series/${p.slug}`}
                      className="group flex items-center gap-3 rounded-lg p-2 transition hover:bg-surface-2"
                    >
                      <span
                        className={`w-6 shrink-0 text-center text-sm font-black ${
                          i < 3 ? "text-primary" : "text-text-3"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md">
                        <Cover title={p.title} coverKey={p.coverKey} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold transition group-hover:text-primary">
                          {p.title}
                        </p>
                        <p className="truncate text-[11px] text-text-3">
                          {p.genres.slice(0, 2).join(" · ") || "—"}
                        </p>
                        <div className="mt-0.5">
                          <Rating value={p.ratingAvg} />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function TrendingCard({
  item,
}: {
  item: {
    id: string;
    slug: string;
    title: string;
    coverKey: string | null;
    ratingAvg: number;
    lastChapterNumber: { toString(): string } | null;
  };
}) {
  return (
    <Link
      href={`/series/${item.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Cover
          title={item.title}
          coverKey={item.coverKey}
          className="h-full w-full transition duration-300 group-hover:scale-105"
        />
        {item.lastChapterNumber && (
          <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            Ch. {item.lastChapterNumber.toString()}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-primary">
          {item.title}
        </h3>
        <div className="mt-1">
          <Rating value={item.ratingAvg} />
        </div>
      </div>
    </Link>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
        <span className="h-6 w-1.5 rounded-full bg-primary" />
        {title}
      </h2>
      <Link
        href={href}
        className="text-sm text-text-2 transition hover:text-primary"
      >
        Voir tout →
      </Link>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-text-2">
      {text}
    </p>
  );
}
