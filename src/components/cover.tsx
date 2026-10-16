import { imageUrl } from "@/lib/image-url";

// Palettes dégradées (violet/indigo/rose/…) utilisées quand il n'y a pas d'image.
const PALETTES = [
  "from-violet-600 to-indigo-700",
  "from-fuchsia-600 to-purple-700",
  "from-rose-600 to-pink-700",
  "from-blue-600 to-indigo-700",
  "from-emerald-600 to-teal-700",
  "from-amber-600 to-orange-700",
  "from-cyan-600 to-blue-700",
  "from-purple-600 to-fuchsia-700",
];

/** Hash simple et déterministe à partir du titre → index de palette. */
function paletteFor(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = (h * 31 + title.charCodeAt(i)) >>> 0;
  }
  return PALETTES[h % PALETTES.length];
}

/**
 * Couverture. Sans image : placeholder dégradé déterministe (couleur liée au titre).
 * `ratio` gère le format via les classes passées par le parent.
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
        className={`flex flex-col items-center justify-center bg-gradient-to-br ${paletteFor(title)} ${className}`}
      >
        <span className="text-center text-3xl font-black leading-none text-white/90 drop-shadow">
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
