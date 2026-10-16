import { PrismaClient, SeriesType, SeriesStatus } from "@prisma/client";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;

interface DemoSeries {
  slug: string;
  title: string;
  alt: string[];
  synopsis: string;
  type: SeriesType;
  status: SeriesStatus;
  year: number;
  lang: string;
  rating: number;
  genres: string[]; // slugs
  chapters: number; // nombre de chapitres
  recentChapters: number; // publiés dans les 7 derniers jours
}

const SERIES: DemoSeries[] = [
  {
    slug: "lepee-de-cendres",
    title: "L'Épée de Cendres",
    alt: ["Ashen Sword"],
    synopsis:
      "Un forgeron maudit reforgé une lame capable de consumer les ténèbres. Pourtant, chaque coup rapproche son porteur de la cendre… (contenu de démonstration).",
    type: "MANGA",
    status: "ONGOING",
    year: 2024,
    lang: "ja",
    rating: 4.5,
    genres: ["action", "fantasy", "aventure"],
    chapters: 24,
    recentChapters: 3,
  },
  {
    slug: "nebuleuse-coeur",
    title: "Nébuleuse Cœur",
    alt: ["Nebula Heart"],
    synopsis:
      "Dans une station orbitale oubliée, une astronome découvre qu'un signal lointain répond à ses pensées. (contenu de démonstration).",
    type: "MANHWA",
    status: "ONGOING",
    year: 2025,
    lang: "ko",
    rating: 4.2,
    genres: ["romance", "drama", "sci-fi"],
    chapters: 18,
    recentChapters: 2,
  },
  {
    slug: "chroniques-du-rift",
    title: "Chroniques du Rift",
    alt: ["裂隙纪事"],
    synopsis:
      "Chaque siècle, le Rift s'ouvre et avale un royaume. Une carte vivante guide les derniers survivants. (contenu de démonstration).",
    type: "MANHUA",
    status: "ONGOING",
    year: 2023,
    lang: "zh",
    rating: 4.0,
    genres: ["aventure", "fantasy", "action"],
    chapters: 31,
    recentChapters: 4,
  },
  {
    slug: "le-jardin-des-ames",
    title: "Le Jardin des Âmes",
    alt: ["Soul Garden"],
    synopsis:
      "Un jardinier peut voir les regrets sous forme de fleurs. En les cultivant, il aide les vivants à faire leurs adieux. (contenu de démonstration).",
    type: "WEBTOON",
    status: "COMPLETED",
    year: 2022,
    lang: "ko",
    rating: 4.7,
    genres: ["romance", "comedie", "drama"],
    chapters: 40,
    recentChapters: 0,
  },
  {
    slug: "circuit-noir",
    title: "Circuit Noir",
    alt: ["Black Circuit"],
    synopsis:
      "Dans une mégalopole pilotée par une IA, un runner freelance dérobe le seul code capable de la réveiller. (contenu de démonstration).",
    type: "MANHWA",
    status: "ONGOING",
    year: 2025,
    lang: "ko",
    rating: 3.9,
    genres: ["action", "sci-fi"],
    chapters: 15,
    recentChapters: 2,
  },
  {
    slug: "brume-d-automne",
    title: "Brume d'Automne",
    alt: ["Autumn Mist"],
    synopsis:
      "Un village coupé du monde par une brume qui efface la mémoire. Une scribe tente d'en écrire la vérité avant de l'oublier. (contenu de démonstration).",
    type: "MANGA",
    status: "HIATUS",
    year: 2021,
    lang: "ja",
    rating: 4.1,
    genres: ["drama", "historique", "mystere"],
    chapters: 12,
    recentChapters: 0,
  },
  {
    slug: "souveraine-des-cimes",
    title: "Souveraine des Cimes",
    alt: ["Peak Sovereign"],
    synopsis:
      "Bannie au sommet d'une montagne immortelle, elle y apprend un art qui défie le ciel. (contenu de démonstration).",
    type: "MANHWA",
    status: "ONGOING",
    year: 2024,
    lang: "ko",
    rating: 4.6,
    genres: ["fantasy", "aventure", "action"],
    chapters: 27,
    recentChapters: 3,
  },
  {
    slug: "eclats-de-verre",
    title: "Éclats de Verre",
    alt: ["Glass Shards"],
    synopsis:
      "Chaque meurtre laisse un éclat de verre invisible. Un inspecteur collectionne les pièces d'un puzzle qui le concerne. (contenu de démonstration).",
    type: "MANHUA",
    status: "COMPLETED",
    year: 2020,
    lang: "zh",
    rating: 4.3,
    genres: ["thriller", "mystere", "drama"],
    chapters: 36,
    recentChapters: 0,
  },
  {
    slug: "reve-lucide",
    title: "Rêve Lucide",
    alt: ["Lucid Dream"],
    synopsis:
      "Elle pénètre les rêves des autres pour réparer leurs cauchemars — jusqu'à ce qu'un rêve l'y retienne. (contenu de démonstration).",
    type: "WEBTOON",
    status: "ONGOING",
    year: 2025,
    lang: "ko",
    rating: 4.4,
    genres: ["fantasy", "romance", "drama"],
    chapters: 20,
    recentChapters: 2,
  },
  {
    slug: "forge-titanesque",
    title: "Forge Titanesque",
    alt: ["Titan Forge"],
    synopsis:
      "Dans les forges souterraines, des artisans construisent des colosses pour une guerre qui n'a jamais fini. (contenu de démonstration).",
    type: "MANGA",
    status: "ONGOING",
    year: 2023,
    lang: "ja",
    rating: 4.0,
    genres: ["action", "aventure", "fantasy"],
    chapters: 22,
    recentChapters: 2,
  },
];

const GENRES = [
  { name: "Action", slug: "action", order: 1 },
  { name: "Aventure", slug: "aventure", order: 2 },
  { name: "Fantasy", slug: "fantasy", order: 3 },
  { name: "Romance", slug: "romance", order: 4 },
  { name: "Comédie", slug: "comedie", order: 5 },
  { name: "Drama", slug: "drama", order: 6 },
  { name: "Sci-fi", slug: "sci-fi", order: 7 },
  { name: "Thriller", slug: "thriller", order: 8 },
  { name: "Mystère", slug: "mystere", order: 9 },
  { name: "Historique", slug: "historique", order: 10 },
];

async function main() {
  console.log("Seed des séries de démonstration…");

  const genreBySlug = new Map<string, string>();
  for (const g of GENRES) {
    const rec = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name, order: g.order },
      create: g,
    });
    genreBySlug.set(g.slug, rec.id);
  }

  const now = Date.now();

  for (const s of SERIES) {
    // Dates des chapitres : les `recentChapters` derniers sont dans les 7 jours.
    const total = s.chapters;
    const recent = s.recentChapters;
    const chapterDates: Date[] = [];
    for (let i = 0; i < total; i++) {
      if (i < recent) {
        // 0..recent-1 → dans les 7 derniers jours
        chapterDates.push(new Date(now - i * 2 * DAY));
      } else {
        // au-delà → plus ancien (jusqu'à ~1 an)
        const back = 10 + (i - recent) * 12;
        chapterDates.push(new Date(now - back * DAY));
      }
    }

    await prisma.series.upsert({
      where: { slug: s.slug },
      update: { coverKey: `https://picsum.photos/seed/${s.slug}/400/600` },
      create: {
        slug: s.slug,
        title: s.title,
        alternativeTitles: s.alt,
        synopsis: s.synopsis,
        type: s.type,
        status: s.status,
        publicationYear: s.year,
        originalLanguage: s.lang,
        readingDirection: "ltr",
        isDemo: true,
        ratingAvg: s.rating,
        coverKey: `https://picsum.photos/seed/${s.slug}/400/600`,
        license: "demo-only",
        provenance: "seed-demo",
        seriesGenres: {
          create: s.genres.map((slug) => ({
            genreId: genreBySlug.get(slug)!,
          })),
        },
        chapters: {
          create: Array.from({ length: total }, (_, i) => {
            const num = i + 1;
            return {
              chapterNumber: num,
              title: `Chapitre ${num}`,
              slug: `chapitre-${num}`,
              language: "fr",
              status: "PUBLISHED" as const,
              publishedAt: chapterDates[i],
              isDemo: true,
            };
          }),
        },
      },
    });
    console.log(`  + ${s.title}`);
  }

  console.log(`Seed terminé : ${SERIES.length} séries de démonstration ajoutées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
