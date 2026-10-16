import type { SeriesCard } from "@/modules/catalog/service";
import Link from "next/link";
import { imageUrl } from "@/lib/image-url";

export function SeriesCardView({ series }: { series: SeriesCard }) {
  const cover = imageUrl(series.coverKey);
  const last = series.chapters[0];

  return (
    <Link
      href={`/series/${series.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition hover:border-primary focus-visible:border-primary"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-2">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`Couverture de ${series.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-2">
            Pas de couverture
          </div>
        )}
        {series.isDemo && (
          <span className="absolute left-2 top-2 rounded bg-warning/90 px-1.5 py-0.5 text-[10px] font-semibold text-black">
            Démo
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {series.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-text-2">
          <span className="rounded bg-surface-2 px-1.5 py-0.5">
            {series.type}
          </span>
          {last && (
            <span className="font-mono">Ch. {last.chapterNumber.toString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
