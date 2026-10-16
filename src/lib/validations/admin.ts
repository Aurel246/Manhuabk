import { z } from "zod";

export const seriesInputSchema = z.object({
  title: z.string().min(1, "Titre requis").max(300),
  slug: z
    .string()
    .min(1)
    .max(300)
    .regex(/^[a-z0-9-]+$/, "Slug : lettres minuscules, chiffres et -"),
  alternativeTitles: z.array(z.string()).default([]),
  synopsis: z.string().optional(),
  type: z.enum(["MANGA", "MANHWA", "MANHUA", "WEBTOON", "OTHER"]).default("MANGA"),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS", "CANCELLED"]).default("ONGOING"),
  publicationYear: z.number().int().optional().nullable(),
  originalLanguage: z.string().optional().nullable(),
  readingDirection: z.string().default("ltr"),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PUBLIC"),
  ageRating: z.string().optional().nullable(),
  license: z.string().optional().nullable(),
  provenance: z.string().optional().nullable(),
  genreIds: z.array(z.string()).default([]),
});

export const chapterInputSchema = z.object({
  seriesId: z.string().min(1),
  chapterNumber: z.coerce.number(),
  volumeNumber: z.coerce.number().optional().nullable(),
  title: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  language: z.string().default("fr"),
});

export type SeriesInput = z.infer<typeof seriesInputSchema>;
export type ChapterInput = z.infer<typeof chapterInputSchema>;
