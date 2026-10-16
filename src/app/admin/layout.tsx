import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/series", label: "Séries" },
  { href: "/admin/genres", label: "Genres" },
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/audit", label: "Journal" },
];

const WEIGHT: Record<string, number> = {
  USER: 1,
  MODERATOR: 2,
  EDITOR: 3,
  ADMIN: 4,
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (WEIGHT[role] ?? 0) < WEIGHT.EDITOR) {
    redirect("/connecter");
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      <aside className="w-48 shrink-0">
        <nav className="sticky top-20 flex flex-col gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-text-2 hover:bg-surface-2 hover:text-text"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
