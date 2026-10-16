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
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
        favorited
          ? "bg-primary text-white"
          : "border border-border hover:border-primary"
      }`}
      aria-pressed={favorited}
    >
      {favorited ? "★ En favoris" : "☆ Ajouter aux favoris"}
    </button>
  );
}
