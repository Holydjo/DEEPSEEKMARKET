export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

export function formatServicePrice(cents: number, priceType = "FIXED"): string {
  if (priceType === "FROM") return `From ${formatMoney(cents)}`;
  if (priceType === "HOURLY") return `${formatMoney(cents)}/hr`;
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

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date | string): string {
  return dateFmt.format(new Date(date));
}

const shortDateFmt = new Intl.DateTimeFormat("en-CA", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatShortDate(date: Date | string): string {
  return shortDateFmt.format(new Date(date));
}

const torontoDateTimeFmt = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Toronto",
});

export function formatDateTime(date: Date | string): string {
  return torontoDateTimeFmt.format(new Date(date));
}

export function formatRelative(date: Date | string): string {
  const then = new Date(date).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  return `${Math.floor(months / 12)} year${months >= 24 ? "s" : ""} ago`;
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

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export function dayName(day: number): string {
  return WEEKDAYS[day] ?? "";
}

export function dayShort(day: number): string {
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
