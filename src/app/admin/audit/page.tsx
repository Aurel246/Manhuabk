import { requireEditor } from "@/modules/users/guards";
import { listAudit } from "@/modules/admin/manage";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireEditor();
  const logs = await listAudit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold">Journal d&apos;activité</h1>
      <p className="mt-1 text-sm text-text-2">
        100 dernières actions administratives.
      </p>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-2">
            <th className="py-2">Date</th>
            <th className="py-2">Acteur</th>
            <th className="py-2">Action</th>
            <th className="py-2">Entité</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="py-2.5 text-xs text-text-2">
                {l.createdAt.toLocaleString("fr-FR")}
              </td>
              <td className="py-2.5">{l.actor?.username ?? "—"}</td>
              <td className="py-2.5">
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
                  {l.action}
                </span>
              </td>
              <td className="py-2.5 text-text-2">
                {l.entity}
                {l.entityId ? ` · ${l.entityId.slice(0, 8)}` : ""}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-text-2">
                Aucune activité.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
