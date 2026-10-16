"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/modules/reading/actions";

export function FavoriteButton({
  seriesId,
  initial,
  loggedIn,
}: {
  seriesId: string;
  initial: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initial);
  const [pending, startTransition] = useTransition();

  function click() {
    if (!loggedIn) {
      router.push("/connecter");
      return;
    }
    const next = !favorited;
    setFavorited(next); // optimiste
    startTransition(() =>
      void toggleFavoriteAction(seriesId).then((r) => {
        if (!r.ok) {
          setFavorited(!next); // rollback
        } else {
          router.refresh();
        }
      })
    );
  }

  return (
    <button
      onClick={click}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${
        favorited
          ? "bg-primary text-white shadow-lg shadow-primary/25"
          : "border border-border-strong bg-surface text-text hover:border-primary hover:text-primary"
      }`}
      aria-pressed={favorited}
    >
      <span aria-hidden="true">{favorited ? "★" : "☆"}</span>
      {favorited ? "En favoris" : "Ajouter aux favoris"}
    </button>
  );
}
