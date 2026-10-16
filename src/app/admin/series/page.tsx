import Link from "next/link";
import { requireEditor } from "@/modules/users/guards";
import { listSeriesAdmin } from "@/modules/admin/series";

export const dynamic = "force-dynamic";

export default async function AdminSeriesPage() {
  await requireEditor();
  const series = await listSeriesAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Séries</h1>
        <Link
          href="/admin/series/nouvelle"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          + Nouvelle série
        </Link>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-2">
            <th className="py-2">Titre</th>
            <th className="py-2">Type</th>
            <th className="py-2">Statut</th>
            <th className="py-2">Visibilité</th>
            <th className="py-2">Chapitres</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {series.map((s) => (
            <tr key={s.id}>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.title}</span>
                  {s.isDemo && (
                    <span className="rounded bg-warning/90 px-1 text-[10px] font-semibold text-black">
                      Démo
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-text-2">/{s.slug}</span>
              </td>
              <td className="py-2.5">{s.type}</td>
              <td className="py-2.5">{s.status}</td>
              <td className="py-2.5">{s.visibility}</td>
              <td className="py-2.5 font-mono">{s._count.chapters}</td>
              <td className="py-2.5">
                <Link
                  href={`/admin/series/${s.id}`}
                  className="text-primary hover:underline"
                >
                  Éditer
                </Link>
              </td>
            </tr>
          ))}
          {series.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-text-2">
                Aucune série. Crée la première.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
