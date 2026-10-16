import type { SeriesCard } from "@/modules/catalog/service";
import Link from "next/link";
import { Cover } from "@/components/cover";
import { Rating } from "@/components/rating";

const STATUS_LABEL: Record<string, string> = {
  ONGOING: "En cours",
  COMPLETED: "Terminé",
  HIATUS: "Pause",
  CANCELLED: "Annulé",
};

const STATUS_STYLE: Record<string, string> = {
  ONGOING: "bg-success/90 text-black",
  COMPLETED: "bg-info/90 text-white",
  HIATUS: "bg-warning/90 text-black",
  CANCELLED: "bg-danger/90 text-white",
};

export function SeriesCardView({ series }: { series: SeriesCard }) {
  const last = series.chapters[0];
  const status = series.status as string;

  return (
    <Link
      href={`/series/${series.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 focus-visible:border-primary"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Cover
          title={series.title}
          coverKey={series.coverKey}
          className="h-full w-full transition duration-300 group-hover:scale-105"
        />

        <span
          className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            STATUS_STYLE[status] ?? "bg-surface-3 text-text-2"
          }`}
        >
          {STATUS_LABEL[status] ?? status}
        </span>

        {series.isDemo && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            Démo
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-primary">
          {series.title}
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <Rating value={series.ratingAvg} />
          {last && (
            <span className="font-mono text-xs text-text-3">
              Ch. {last.chapterNumber.toString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
