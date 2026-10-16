"use client";

import { useState, useTransition } from "react";
import { setUserRoleAction } from "@/modules/admin/actions-manage";

export function UserRoleSelect({
  userId,
  role,
  roles,
}: {
  userId: string;
  role: string;
  roles: readonly string[];
}) {
  const [current, setCurrent] = useState(role);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    setError(null);
    startTransition(() =>
      void setUserRoleAction(userId, next as never).then((r) => {
        if (r.ok) setCurrent(next);
        else setError(r.error ?? "Échec.");
      })
    );
  }

  return (
    <div>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-sm"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
