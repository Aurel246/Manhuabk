export function imageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  // URL absolue (ex. couverture distante) → directe
  if (/^https?:\/\//i.test(key)) return key;
  const cdn = process.env.CDN_URL;
  if (cdn) return `${cdn.replace(/\/$/, "")}/${key}`;
  return `/api/images/${key}`;
}
