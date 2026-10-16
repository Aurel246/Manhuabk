import { requireAdmin } from "@/modules/users/guards";
import { listUsersAdmin } from "@/modules/admin/manage";
import { UserRoleSelect } from "@/components/admin/user-role-select";

export const dynamic = "force-dynamic";

const ROLES = ["USER", "MODERATOR", "EDITOR", "ADMIN"] as const;

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listUsersAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-2">
            <th className="py-2">Pseudo</th>
            <th className="py-2">E-mail</th>
            <th className="py-2">Statut</th>
            <th className="py-2">Rôle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="py-2.5 font-medium">{u.username}</td>
              <td className="py-2.5 text-text-2">{u.email}</td>
              <td className="py-2.5">{u.status}</td>
              <td className="py-2.5">
                <UserRoleSelect userId={u.id} role={u.role} roles={ROLES} />
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-text-2">
                Aucun utilisateur.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
