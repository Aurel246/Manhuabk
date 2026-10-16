import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function main() {
  console.log("Seed de démonstration (données = is_demo: true)…");

  const passwordHash = await hashPassword("demo-password");

  const admin = await prisma.user.upsert({
    where: { email: "admin@manhuabk.dev" },
    update: {},
    create: {
      username: "admin",
      email: "admin@manhuabk.dev",
      passwordHash,
      role: "ADMIN",
      locale: "fr",
    },
  });

  const genres = await Promise.all(
    [
      { name: "Action", slug: "action", order: 1 },
      { name: "Aventure", slug: "aventure", order: 2 },
      { name: "Fantasy", slug: "fantasy", order: 3 },
      { name: "Romance", slug: "romance", order: 4 },
      { name: "Comédie", slug: "comedie", order: 5 },
    ].map((g) =>
      prisma.genre.upsert({
        where: { slug: g.slug },
        update: {},
        create: g,
      })
    )
  );

  const series = await prisma.series.upsert({
    where: { slug: "legende-du-demo" },
    update: {},
    create: {
      slug: "legende-du-demo",
      title: "Légende du Démo",
      alternativeTitles: ["Demo Legend", "デモ伝説"],
      synopsis:
        "Série de démonstration pour tester la plateforme. Contenu fictif identifié comme tel (is_demo).",
      type: "MANHWA",
      status: "ONGOING",
      publicationYear: 2026,
      originalLanguage: "ko",
      readingDirection: "ltr",
      isDemo: true,
      license: "demo-only",
      provenance: "seed",
      seriesGenres: {
        create: genres.slice(0, 3).map((g) => ({ genreId: g.id })),
      },
      chapters: {
        create: [
          {
            chapterNumber: 1,
            title: "Chapitre 1",
            slug: "chapitre-1",
            language: "fr",
            status: "PUBLISHED",
            publishedAt: new Date(),
            isDemo: true,
          },
          {
            chapterNumber: 2,
            title: "Chapitre 2",
            slug: "chapitre-2",
            language: "fr",
            status: "PUBLISHED",
            publishedAt: new Date(),
            isDemo: true,
          },
        ],
      },
    },
  });

  console.log(
    `Seed terminé. Admin: ${admin.email} / demo-password — Série: ${series.slug}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
