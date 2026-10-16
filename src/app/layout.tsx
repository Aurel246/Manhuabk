import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
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
  { href: "/catalogue", label: "Catalogue" },
  { href: "/genres", label: "Genres" },
  { href: "/compte", label: "Favoris" },
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
        <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5">
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-baseline gap-0.5 text-xl font-extrabold tracking-tight"
            >
              <span className="text-text">Manhua</span>
              <span className="text-primary">bk</span>
            </Link>

            {/* Barre de recherche */}
            <form
              action="/recherche"
              method="get"
              className="relative hidden min-w-0 flex-1 max-w-md md:block"
            >
              <input
                type="search"
                name="q"
                placeholder="Rechercher un manga, manhwa…"
                className="w-full rounded-full border border-border bg-surface-2 py-2 pl-10 pr-4 text-sm text-text placeholder:text-text-3 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </form>

            {/* Liens de navigation (desktop) */}
            <nav className="hidden items-center gap-1 text-sm lg:flex">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-text-2 transition hover:bg-surface-2 hover:text-text"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Profil / auth */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {isStaff && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg border border-primary/40 bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/20 sm:block"
                >
                  Admin
                </Link>
              )}
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/compte"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-2 transition hover:bg-surface-2 hover:text-text"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold uppercase text-white">
                      {user.username?.charAt(0) ?? "?"}
                    </span>
                    <span className="hidden max-w-[8rem] truncate sm:block">
                      {user.username}
                    </span>
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/connecter"
                    className="rounded-lg px-3 py-2 text-sm text-text-2 transition hover:bg-surface-2 hover:text-text"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recherche + nav mobile */}
          <div className="border-t border-border md:hidden">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
              <form action="/recherche" method="get" className="relative flex-1">
                <input
                  type="search"
                  name="q"
                  placeholder="Rechercher…"
                  className="w-full rounded-full border border-border bg-surface-2 py-2 pl-9 pr-4 text-sm text-text placeholder:text-text-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring"
                />
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>
              </form>
            </div>
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-1 px-2 pb-2 text-sm lg:hidden">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex-1 rounded-lg px-2 py-2 text-center text-text-2 transition hover:bg-surface-2 hover:text-text"
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
            <div className="flex items-baseline gap-0.5 text-lg font-extrabold">
              <span className="text-text">Manhua</span>
              <span className="text-primary">bk</span>
            </div>
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
