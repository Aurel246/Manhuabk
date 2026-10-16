import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-xl font-semibold">Page introuvable</h1>
      <p className="mt-2 text-sm text-text-2">
        Cette page n’existe pas ou n’est plus disponible.
      </p>
      <Link
        href="/catalogue"
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover"
      >
        Retour au catalogue
      </Link>
    </div>
  );
}
