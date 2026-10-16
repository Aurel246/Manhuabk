export function imageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  const cdn = process.env.CDN_URL;
  if (cdn) return `${cdn.replace(/\/$/, "")}/${key}`;
  return `/api/images/${key}`;
}
