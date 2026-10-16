"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HeroItem } from "@/modules/catalog/home";
import { Cover } from "@/components/cover";
import { Rating } from "@/components/rating";

/**
 * Bandeau de couvertures : défilement horizontal avec aimantation (snap).
 * L'œuvre centrée est mise en avant (titre + note) et cliquable.
 */
export function HeroCarousel({ items }: { items: HeroItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Suit l'élément le plus proche du centre pendant le défilement.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const children = Array.from(el.children) as HTMLElement[];
        if (children.length === 0) return;
        const center = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        children.forEach((child, i) => {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const dist = Math.abs(childCenter - center);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        setActive(best);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (items.length === 0) return null;

  const current = items[active];

  return (
    <section className="relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[calc(50%-5rem)] py-4"
      >
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <Link
              key={item.id}
              href={`/series/${item.slug}`}
              className={`group relative aspect-[2/3] w-36 shrink-0 snap-center overflow-hidden rounded-xl border transition-all duration-300 sm:w-44 md:w-48 ${
                isActive
                  ? "scale-105 border-primary shadow-xl shadow-primary/30"
                  : "scale-95 border-border opacity-60 hover:opacity-100"
              }`}
              aria-label={item.title}
            >
              <Cover
                title={item.title}
                coverKey={item.coverKey}
                className="h-full w-full"
              />
              {!item.coverKey && (
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80">
                  {item.genres[0] ?? ""}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Légende de l'œuvre centrée */}
      {current && (
        <div className="pointer-events-none mx-auto mt-2 max-w-2xl px-4 text-center">
          <Link
            href={`/series/${current.slug}`}
            className="pointer-events-auto inline-block"
          >
            <h2 className="text-xl font-extrabold tracking-tight text-text transition hover:text-primary sm:text-2xl">
              {current.title}
            </h2>
          </Link>
          <div className="mt-1.5 flex items-center justify-center gap-3 text-xs text-text-2">
            {current.genres.length > 0 && (
              <span>{current.genres.slice(0, 3).join(" · ")}</span>
            )}
            <Rating value={current.ratingAvg} />
          </div>
        </div>
      )}
    </section>
  );
}
