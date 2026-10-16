"use client";

import { useTransition } from "react";
import { logoutAction } from "@/modules/auth/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => void logoutAction())}
      disabled={pending}
      className="text-text-2 hover:text-text disabled:opacity-50"
    >
      {pending ? "…" : "Déconnexion"}
    </button>
  );
}
