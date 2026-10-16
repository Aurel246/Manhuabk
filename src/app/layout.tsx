import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth } from "@/auth";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Lecture de mangas, manhwas et manhuas`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "fr_FR",
  },
};

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/compte", label: "Favoris" },
  { href: "/catalogue", label: "Catalogue" },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const isStaff =
    user?.role === "EDITOR" || user?.role === "ADMIN" || user?.role === "MODERATOR";

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg">
        {/* ===== Barre de navigation violette ===== */}
        <header className="sticky top-0 z-40 bg-primary shadow-lg shadow-primary/20">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-5">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 text-lg font-extrabold tracking-tight text-white"
            >
              Manhuabk
            </Link>

            {/* Liens */}
            <nav className="hidden items-center gap-1 text-sm md:flex">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2 font-medium text-white/85 transition hover:bg-white/15 hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Recherche (droite) */}
            <form
              action="/recherche"
              method="get"
              className="relative ml-auto hidden w-full max-w-xs sm:block md:max-w-sm"
            >
              <input
                type="search"
                name="q"
                placeholder="Rechercher…"
                className="w-full rounded-full border border-white/20 bg-black/25 py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-white/60 transition focus:border-white/40 focus:bg-black/35 focus:outline-none"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </form>

            {/* Actions droite */}
            <div className="flex items-center gap-1 sm:gap-2">
              {isStaff && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg bg-black/25 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-black/40 lg:block"
                >
                  Admin
                </Link>
              )}

              {/* Notifications */}
              <Link
                href="/compte"
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>

              {user ? (
                <Link
                  href="/compte"
                  className="flex items-center gap-2 rounded-full p-0.5 transition hover:bg-white/15"
                  aria-label="Mon compte"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold uppercase text-primary">
                    {user.username?.charAt(0) ?? "?"}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/connecter"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/15"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-white/90"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Rangée mobile : recherche + liens */}
          <div className="border-t border-white/15 md:hidden">
            <div className="mx-auto max-w-7xl px-4 py-2">
              <form action="/recherche" method="get" className="relative">
                <input
                  type="search"
                  name="q"
                  placeholder="Rechercher…"
                  className="w-full rounded-full border border-white/20 bg-black/25 py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
                />
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </form>
            </div>
            <nav className="mx-auto flex max-w-7xl items-center justify-around px-2 pb-2 text-sm md:hidden">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex-1 rounded-lg px-2 py-1.5 text-center font-medium text-white/85 transition hover:bg-white/15"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border bg-bg-2 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="text-lg font-extrabold text-text">Manhuabk</div>
            <p className="max-w-md text-sm text-text-3">
              Contenus dont les droits sont autorisés. Données de démonstration
              identifiées comme telles.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
