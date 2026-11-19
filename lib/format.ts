import type { Locale } from "./i18n/config";
import { translate } from "./i18n/dictionary";

export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

export function formatServicePrice(
  cents: number,
  priceType = "FIXED",
  locale: Locale = "en",
): string {
  if (priceType === "FROM") {
    return translate(locale, "price.from", { price: formatMoney(cents) });
  }
  if (priceType === "HOURLY") {
    return translate(locale, "price.perHour", { price: formatMoney(cents) });
  }
  return formatMoney(cents);
}

export function formatDuration(minutes?: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} h ${m.toString().padStart(2, "0")}`;
  if (h) return `${h} h`;
  return `${m} min`;
}

export function formatDate(date: Date | string, locale: Locale = "en"): string {
  return formatDateForLocale(date, locale);
}

/** ISO date (YYYY-MM-DD) in the launch market, optionally offset by days. */
export function todayInToronto(offsetDays = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const date = new Date(Date.UTC(get("year"), get("month") - 1, get("day") + offsetDays));
  return date.toISOString().slice(0, 10);
}

/** Locale-aware date for notifications and emails. */
export function formatDateForLocale(
  date: Date | string,
  locale: "en" | "fr",
): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

const shortDateFmt = new Intl.DateTimeFormat("en-CA", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatShortDate(date: Date | string): string {
  return shortDateFmt.format(new Date(date));
}

export function formatDateTime(date: Date | string, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Toronto",
  }).format(new Date(date));
}

export function formatRelative(date: Date | string, locale: Locale = "en"): string {
  const then = new Date(date).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return translate(locale, "format.relative.today");
  if (days === 1) return translate(locale, "format.relative.yesterday");
  if (days < 30) return translate(locale, "format.relative.daysAgo", { count: days });
  const months = Math.floor(days / 30);
  if (months === 1) return translate(locale, "format.relative.monthAgo");
  if (months < 12) return translate(locale, "format.relative.monthsAgo", { count: months });
  const years = Math.floor(months / 12);
  return translate(
    locale,
    years === 1 ? "format.relative.yearAgo" : "format.relative.yearsAgo",
    { count: years },
  );
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const WEEKDAYS_FR = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
] as const;

const WEEKDAYS_FR_SHORT = [
  "dim.",
  "lun.",
  "mar.",
  "mer.",
  "jeu.",
  "ven.",
  "sam.",
] as const;

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export function dayName(day: number, locale: Locale = "en"): string {
  if (locale === "fr") return WEEKDAYS_FR[day] ?? "";
  return WEEKDAYS[day] ?? "";
}

export function dayShort(day: number, locale: Locale = "en"): string {
  if (locale === "fr") return WEEKDAYS_FR_SHORT[day] ?? "";
  return dayName(day).slice(0, 3);
}

type HourRow = { dayOfWeek: number; opensAt: string; closesAt: string; isClosed: boolean };

/** Current local time in the launch market, independent of server timezone. */
export function torontoNowParts(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return { day, minutes: hour * 60 + minute };
}

export function isOpenNow(hours: HourRow[]): boolean {
  const now = torontoNowParts();
  const today = hours.find((h) => h.dayOfWeek === now.day);
  if (!today || today.isClosed) return false;
  const [openH, openM] = today.opensAt.split(":").map(Number);
  const [closeH, closeM] = today.closesAt.split(":").map(Number);
  const open = openH * 60 + openM;
  const close = closeH * 60 + closeM;
  return now.minutes >= open && now.minutes < close;
}

export function todayHours(hours: HourRow[]): HourRow | undefined {
  const now = torontoNowParts();
  return hours.find((h) => h.dayOfWeek === now.day);
}

export function nextOpenDay(hours: HourRow[]): HourRow | undefined {
  const now = torontoNowParts();
  for (let offset = 1; offset <= 7; offset += 1) {
    const day = (now.day + offset) % 7;
    const row = hours.find((h) => h.dayOfWeek === day);
    if (row && !row.isClosed) return row;
  }
  return undefined;
}

export function getInitials(name: string): string {
  return initials(name);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
