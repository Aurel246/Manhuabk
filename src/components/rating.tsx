/**
 * Note des lecteurs — affiche uniquement si une vraie note existe (ratingAvg > 0).
 * N'invente jamais de note : si ratingAvg est 0 ou absent, affiche un libellé neutre.
 */
export function Rating({
  value,
  size = "sm",
  showValue = true,
}: {
  value: number | null | undefined;
  size?: "sm" | "md";
  showValue?: boolean;
}) {
  const avg = value ?? 0;
  const has = avg > 0;

  const text = size === "md" ? "text-sm" : "text-xs";

  if (!has) {
    return (
      <span className={`inline-flex items-center gap-1 text-text-3 ${text}`}>
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.05 3.6c.3-.92 1.6-.92 1.9 0l1.52 4.68a1 1 0 00.95.69h4.92c.97 0 1.37 1.24.59 1.81l-3.98 2.89a1 1 0 00-.36 1.12l1.52 4.68c.3.92-.75 1.68-1.54 1.11l-3.98-2.89a1 1 0 00-1.18 0l-3.98 2.89c-.78.57-1.83-.19-1.53-1.1l1.52-4.69a1 1 0 00-.36-1.12L3.07 10.8c-.78-.57-.38-1.81.6-1.81h4.91a1 1 0 00.95-.7l1.52-4.67z" />
        </svg>
        <span>—</span>
      </span>
    );
  }

  const rounded = Math.round(avg * 10) / 10;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium text-accent ${text}`}
      title={`Note moyenne : ${rounded} / 5`}
    >
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.05 3.6c.3-.92 1.6-.92 1.9 0l1.52 4.68a1 1 0 00.95.69h4.92c.97 0 1.37 1.24.59 1.81l-3.98 2.89a1 1 0 00-.36 1.12l1.52 4.68c.3.92-.75 1.68-1.54 1.11l-3.98-2.89a1 1 0 00-1.18 0l-3.98 2.89c-.78.57-1.83-.19-1.53-1.1l1.52-4.69a1 1 0 00-.36-1.12L3.07 10.8c-.78-.57-.38-1.81.6-1.81h4.91a1 1 0 00.95-.7l1.52-4.67z" />
      </svg>
      {showValue && <span>{rounded.toFixed(1)}</span>}
    </span>
  );
}
