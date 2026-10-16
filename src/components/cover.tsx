import { imageUrl } from "@/lib/image-url";

/**
 * Couverture avec placeholder soigné si aucune image.
 * `ratio` permet le format portrait (2/3) ou carré.
 */
export function Cover({
  title,
  coverKey,
  className = "",
  imgClassName = "",
  eager = false,
}: {
  title: string;
  coverKey: string | null | undefined;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const src = imageUrl(coverKey);

  if (!src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-surface-2 via-surface to-surface-3 ${className}`}
      >
        <span className="text-2xl font-black leading-none text-primary/40">
          {title.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Couverture de ${title}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`h-full w-full object-cover ${imgClassName} ${className}`}
    />
  );
}
