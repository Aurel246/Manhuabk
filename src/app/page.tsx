import Link from "next/link";
import { listSeries, SERIES_CARD_SELECT } from "@/modules/catalog/service";
import { prisma } from "@/lib/prisma";
import { SeriesCardView } from "@/components/series-card";
import { imageUrl } from "@/lib/image-url";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [popular, updated, newSeries, latestChapters] = await Promise.all([
    listSeries({ sort: "rating", limit: 6 }),
    listSeries({ sort: "updated", limit: 6 }),
    prisma.series.findMany({
      where: { deletedAt: null, visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: SERIES_CARD_SELECT,
    }),
    prisma.chapter.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: {
        id: true,
        chapterNumber: true,
        publishedAt: true,
        series: {
          select: { slug: true, title: true, coverKey: true, isDemo: true },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      {/* Hero */}
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-bg-2 to-surface">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative px-6 py-14 sm:px-12 sm:py-20">
          <span className="inline-block rounded-full border border-primary/40 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Manga · Manhwa · Manhua
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Lis tes mangas favoris,{" "}
            <span className="text-primary">chapitre après chapitre</span>
          </h1>
          <p className="mt-4 max-w-xl text-text-2">
            Une plateforme rapide et épurée pour découvrir et lire des milliers
            de chapitres. Crée ton compte pour suivre tes favoris et reprendre
            ta lecture là où tu t&apos;étais arrêté.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogue"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover"
            >
              Explorer le catalogue
            </Link>
            <Link
              href="/inscription"
              className="rounded-lg border border-border-strong px-6 py-3 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      <Section title="Populaires" href="/catalogue?sort=rating">
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

      <Section title="Dernières mises à jour" href="/catalogue?sort=updated">
        {updated.items.length === 0 ? (
          <Empty text="Aucune série pour le moment." />
        ) : (
          <Grid>
            {updated.items.map((s) => (
              <SeriesCardView key={s.id} series={s} />
            ))}
          </Grid>
        )}
      </Section>

      <Section title="Nouvelles séries" href="/catalogue">
        {newSeries.length === 0 ? (
          <Empty text="Aucune série pour le moment." />
        ) : (
          <Grid>
            {newSeries.map((s) => (
              <SeriesCardView key={s.id} series={s} />
            ))}
          </Grid>
        )}
      </Section>

      <section className="mt-14">
        <SectionTitle title="Derniers chapitres" href="/catalogue" />
        {latestChapters.length === 0 ? (
          <Empty text="Aucun chapitre publié pour le moment." />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {latestChapters.map((c) => {
              const cover = imageUrl(c.series.coverKey);
              return (
                <li key={c.id}>
                  <Link
                    href={`/series/${c.series.slug}/${c.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-primary/60 hover:bg-surface-2"
                  >
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-surface-3 text-lg font-black text-primary/30">
                          {c.series.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold transition group-hover:text-primary">
                        {c.series.title}
                      </p>
                      <p className="mt-1 font-mono text-xs text-text-2">
                        Ch. {c.chapterNumber.toString()}
                      </p>
                    </div>
                    <span className="text-primary opacity-0 transition group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <span className="h-5 w-1 rounded-full bg-primary" />
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

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <SectionTitle title={title} href={href} />
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
