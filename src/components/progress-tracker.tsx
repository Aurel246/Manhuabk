"use client";

import { useEffect, useRef } from "react";
import { saveProgressAction } from "@/modules/reading/actions";

export function ProgressTracker({
  seriesId,
  chapterId,
  totalPages,
}: {
  seriesId: string;
  chapterId: string;
  totalPages: number;
}) {
  const savedRef = useRef({ pageNum: 1, scrollPct: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const imgs = Array.from(
      document.querySelectorAll<HTMLImageElement>("img[data-page]")
    );
    if (imgs.length === 0) return;

    let current = 1;

    const save = () => {
      const payload = {
        seriesId,
        chapterId,
        pageNum: savedRef.current.pageNum,
        scrollPct: savedRef.current.scrollPct,
      };
      void saveProgressAction(payload);
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(save, 3000);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const page = Number(
              (entry.target as HTMLElement).dataset.page ?? "1"
            );
            if (page) current = page;
          }
        }
        const scrollPct = Math.min(
          100,
          Math.round(
            (window.scrollY /
              Math.max(1, document.body.scrollHeight - window.innerHeight)) *
              100
          )
        );
        savedRef.current = { pageNum: current, scrollPct };
        schedule();
      },
      { threshold: [0.1, 0.5] }
    );

    imgs.forEach((img) => observer.observe(img));

    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      if (timerRef.current) clearTimeout(timerRef.current);
      save(); // sauvegarde finale au démontage
    };
  }, [seriesId, chapterId, totalPages]);

  return null;
}
