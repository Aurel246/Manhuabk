import { requireEditor } from "@/modules/users/guards";
import { getAdminStats } from "@/modules/admin/series";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireEditor();
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Séries" value={stats.series} />
        <Stat label="Chapitres publiés" value={stats.chapters} />
        <Stat label="Utilisateurs actifs" value={stats.users} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Derniers chapitres</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border text-sm">
          {stats.recentChapters.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex-1 truncate">{c.series.title}</span>
              <span className="font-mono text-text-2">
                Ch. {c.chapterNumber.toString()}
              </span>
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
                {c.status}
              </span>
            </li>
          ))}
          {stats.recentChapters.length === 0 && (
            <li className="px-4 py-3 text-text-2">Aucun chapitre.</li>
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Séries récentes</h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border text-sm">
          {stats.recentSeries.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex-1 truncate">{s.title}</span>
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
                {s.status}
              </span>
            </li>
          ))}
          {stats.recentSeries.length === 0 && (
            <li className="px-4 py-3 text-text-2">Aucune série.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-2">{label}</p>
    </div>
  );
}
