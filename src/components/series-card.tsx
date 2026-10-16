import type { SeriesCard } from "@/modules/catalog/service";
import Link from "next/link";
import { imageUrl } from "@/lib/image-url";

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
  const cover = imageUrl(series.coverKey);
  const last = series.chapters[0];
  const status = series.status as string;

  return (
    <Link
      href={`/series/${series.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 focus-visible:border-primary"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-2">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`Couverture de ${series.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-2 to-surface-3 px-2 text-center">
            <span className="text-3xl font-black text-primary/30">
              {series.title.charAt(0).toUpperCase()}
            </span>
            <span className="line-clamp-2 text-[11px] leading-tight text-text-3">
              {series.title}
            </span>
          </div>
        )}

        {/* Bandeau statut */}
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

        {/* Voile au survol avec dernier chapitre */}
        {last && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 to-transparent p-2 text-xs font-medium text-white transition duration-200 group-hover:translate-y-0">
            Lire Ch. {last.chapterNumber.toString()} →
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-primary">
          {series.title}
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-text-2">
          <span className="rounded bg-surface-2 px-1.5 py-0.5 uppercase tracking-wide">
            {series.type}
          </span>
          {last && (
            <span className="font-mono text-text-3">
              Ch. {last.chapterNumber.toString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
