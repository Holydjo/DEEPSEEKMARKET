import type { Locale } from "./config";

/**
 * Category names are UI copy, not provider-authored content: the same category
 * slug is shown in English or French depending on the visitor's locale. The
 * database value stays the English source of truth and is used as the fallback
 * for any category we have not translated yet.
 */
const FR_CATEGORY_LABELS: Record<string, string> = {
  hair: "Coiffure",
  braids: "Tresses",
  beauty: "Beauté",
  nails: "Ongles",
  cleaning: "Ménage",
  repairs: "Réparations",
  tutoring: "Soutien scolaire",
  moving: "Déménagement",
  photography: "Photographie",
  wellness: "Bien-être",
  pets: "Animaux",
  events: "Événements",
};

export function categoryLabel(
  locale: Locale,
  slug: string | null | undefined,
  fallback: string,
): string {
  if (locale !== "fr" || !slug) return fallback;
  return FR_CATEGORY_LABELS[slug] ?? fallback;
}
