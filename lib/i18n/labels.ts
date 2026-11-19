import { translate, type MessageKey } from "./dictionary";
import type { Locale } from "./config";

/**
 * Locale-aware labels for enum-like values that are stored in English in the
 * database and in `lib/constants.ts`. Admin and provider screens keep using
 * the English constants; customer-facing screens use these helpers.
 */

const PROVIDER_TYPE_KEYS: Record<string, MessageKey> = {
  INDEPENDENT: "providerType.INDEPENDENT",
  BUSINESS: "providerType.BUSINESS",
};

export function providerTypeLabel(locale: Locale, type: string): string {
  if (locale === "en") {
    if (type === "BUSINESS") return "Business";
    if (type === "INDEPENDENT") return "Independent provider";
    return "Provider";
  }
  return translate(locale, PROVIDER_TYPE_KEYS[type] ?? "common.provider");
}

const BOOKING_STATUS_KEYS: Record<string, MessageKey> = {
  PENDING: "status.PENDING",
  ACCEPTED: "status.ACCEPTED",
  DECLINED: "status.DECLINED",
  COMPLETED: "status.COMPLETED",
  CANCELLED: "status.CANCELLED",
};

export function bookingStatusLabel(locale: Locale, status: string): string {
  const key = BOOKING_STATUS_KEYS[status];
  return key ? translate(locale, key) : status;
}

const WINDOW_KEYS: Record<string, MessageKey> = {
  MORNING: "window.MORNING",
  AFTERNOON: "window.AFTERNOON",
  EVENING: "window.EVENING",
};

export function windowLabel(locale: Locale, window: string): string {
  const key = WINDOW_KEYS[window];
  return key ? translate(locale, key) : window;
}

const PLACE_KEYS: Record<string, MessageKey> = {
  home: "place.home",
  salon: "place.salon",
  shop: "place.shop",
  travel: "place.travel",
};

export function placeLabel(locale: Locale, place: string): string {
  const key = PLACE_KEYS[place];
  return key ? translate(locale, key) : place;
}

/**
 * French needs a prepositional form after "près" ("près du Plateau", not
 * "près de Le Plateau"). Neighbourhood names themselves stay untouched.
 */
export function nearPlace(locale: Locale, name: string): string {
  if (locale !== "fr") return name;
  const value = name.trim();
  if (value === "Centre-ville") return "du centre-ville";
  if (/^Le\s+/i.test(value)) return `du ${value.slice(3)}`;
  if (/^Les\s+/i.test(value)) return `des ${value.slice(4)}`;
  if (/^(L’|L')/i.test(value)) return `de l’${value.slice(2)}`;
  if (/^[AEIOUYÉÈÊÂÎÔÛ]/.test(value)) return `d’${value}`;
  return `de ${value}`;
}
