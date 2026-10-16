import { fr, type Dictionary } from "./fr";
import { en } from "./en";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale as Locale] ?? dictionaries[defaultLocale];
}

export type { Dictionary };
