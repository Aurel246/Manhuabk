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
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-primary"
            >
              Manhuabk
            </Link>
            <nav className="flex items-center gap-4 text-sm text-text-2">
              <Link href="/catalogue" className="hover:text-text">
                Catalogue
              </Link>
              <Link href="/genres" className="hover:text-text">
                Genres
              </Link>
              <Link href="/recherche" className="hover:text-text">
                Recherche
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-3 text-sm">
              {isStaff && (
                <Link href="/admin" className="text-primary hover:underline">
                  Admin
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href="/compte"
                    className="text-text-2 hover:text-text"
                  >
                    {user.username}
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/connecter"
                    className="text-text-2 hover:text-text"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="rounded-lg bg-primary px-3 py-1.5 font-medium text-white transition hover:bg-primary-hover"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-8 text-center text-sm text-text-2">
          <p>
            Manhuabk — contenus dont les droits sont autorisés. Données de
            démonstration identifiées comme telles.
          </p>
        </footer>
      </body>
    </html>
  );
}
