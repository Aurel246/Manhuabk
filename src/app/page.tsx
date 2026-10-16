import Link from "next/link";
import { listSeries } from "@/modules/catalog/service";
import { prisma } from "@/lib/prisma";
import { SeriesCardView } from "@/components/series-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [popular, newSeries, latestChapters] = await Promise.all([
    listSeries({ sort: "rating", limit: 6 }),
    listSeries({ sort: "updated", limit: 6 }),
    prisma.chapter.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: {
        id: true,
        chapterNumber: true,
        publishedAt: true,
        series: { select: { slug: true, title: true, coverKey: true, isDemo: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="rounded-2xl border border-border bg-surface p-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Manhuabk
        </h1>
        <p className="mt-3 text-text-2">
          Lecture de mangas, manhwas, manhuas et webtoons.
        </p>
        <Link
          href="/catalogue"
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition hover:bg-primary-hover"
        >
          Explorer le catalogue
        </Link>
      </section>

      <Section title="Derniers chapitres">
        {latestChapters.length === 0 ? (
          <Empty text="Aucun chapitre publié pour le moment." />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {latestChapters.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/series/${c.series.slug}/${c.id}`}
                  className="block rounded-xl border border-border bg-surface p-3 transition hover:border-primary"
                >
                  <p className="truncate text-sm font-semibold">
                    {c.series.title}
                  </p>
                  <p className="mt-1 font-mono text-xs text-text-2">
                    Ch. {c.chapterNumber.toString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Nouvelles séries">
        {newSeries.items.length === 0 ? (
          <Empty text="Aucune série pour le moment." />
        ) : (
          <Grid>
            {newSeries.items.map((s) => (
              <SeriesCardView key={s.id} series={s} />
            ))}
          </Grid>
        )}
      </Section>

      <Section title="Populaires">
        {popular.items.length === 0 ? (
          <Empty text="Pas encore de données de popularité." />
        ) : (
          <Grid>
            {popular.items.map((s) => (
              <SeriesCardView key={s.id} series={s} />
            ))}
          </Grid>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href="/catalogue" className="text-sm text-primary hover:underline">
          Voir tout →
        </Link>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-text-2">{text}</p>;
}
