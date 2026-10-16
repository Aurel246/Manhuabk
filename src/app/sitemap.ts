import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalogue`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/genres`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/recherche`, changeFrequency: "monthly", priority: 0.3 },
  ];

  let seriesRoutes: MetadataRoute.Sitemap = [];
  try {
    const series = await prisma.series.findMany({
      where: { deletedAt: null, visibility: "PUBLIC" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });
    seriesRoutes = series.map((s) => ({
      url: `${SITE_URL}/series/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // base indisponible au build → on renvoie les routes statiques
  }

  return [...staticRoutes, ...seriesRoutes];
}
