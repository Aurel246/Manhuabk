import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listFavorites, listHistory } from "@/modules/reading/service";
import { SeriesCardView } from "@/components/series-card";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/connecter");

  const [profile, favorites, history] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, email: true, role: true, createdAt: true },
    }),
    listFavorites(session.user.id),
    listHistory(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Mon compte</h1>
        <LogoutButton />
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">Profil</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-text-2">Pseudo</dt>
            <dd className="mt-0.5 font-medium">{profile?.username}</dd>
          </div>
          <div>
            <dt className="text-text-2">E-mail</dt>
            <dd className="mt-0.5 font-medium">{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-text-2">Rôle</dt>
            <dd className="mt-0.5 font-medium">{profile?.role}</dd>
          </div>
          <div>
            <dt className="text-text-2">Inscrit le</dt>
            <dd className="mt-0.5 font-medium">
              {profile?.createdAt.toLocaleDateString("fr-FR")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="h-5 w-1 rounded-full bg-primary" />
          Favoris ({favorites.length})
        </h2>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-text-2">
            Aucun favori —{" "}
            <Link href="/catalogue" className="text-primary hover:underline">
              explore le catalogue
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {favorites.map((f) => (
              <SeriesCardView
                key={f.series.id}
                series={{
                  id: f.series.id,
                  slug: f.series.slug,
                  title: f.series.title,
                  coverKey: f.series.coverKey,
                  type: f.series.type,
                  status: f.series.status,
                  isDemo: f.series.isDemo,
                  ratingAvg: f.series.ratingAvg,
                  updatedAt: f.createdAt,
                  chapters: [],
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="h-5 w-1 rounded-full bg-primary" />
          Historique de lecture
        </h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-text-2">
            Aucune lecture pour le moment.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface text-sm">
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/series/${h.series.slug}/${h.chapter.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-2"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {h.series.title}
                  </span>
                  <span className="font-mono text-text-2">
                    Ch. {h.chapter.chapterNumber.toString()}
                  </span>
                  <span className="text-xs text-text-2">
                    {h.readAt.toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
