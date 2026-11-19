export const PROVIDER_STATUSES = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const;

export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

export const PROVIDER_STATUS_LABEL: Record<ProviderStatus, string> = {
  DRAFT: "Draft",
  PENDING: "In review",
  APPROVED: "Approved",
  REJECTED: "Changes requested",
  SUSPENDED: "Suspended",
};

export const PROVIDER_TYPES = ["INDEPENDENT", "BUSINESS"] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const PROVIDER_TYPE_LABEL: Record<string, string> = {
  INDEPENDENT: "Independent provider",
  BUSINESS: "Business",
};

export const BOOKING_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "New request",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PREFERRED_WINDOWS = ["MORNING", "AFTERNOON", "EVENING"] as const;
export type PreferredWindow = (typeof PREFERRED_WINDOWS)[number];

export const PREFERRED_WINDOW_LABEL: Record<string, string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
};

export const PLACE_OPTIONS = [
  { key: "home", label: "At their home studio", short: "Home studio" },
  { key: "salon", label: "At a salon or studio", short: "Salon" },
  { key: "shop", label: "At a shop or storefront", short: "Shop" },
  { key: "travel", label: "Travels to the client", short: "Travels to you" },
] as const;

export type PlaceKey = (typeof PLACE_OPTIONS)[number]["key"];

export const ADMIN_ROLES = ["CUSTOMER", "PROVIDER", "ADMIN"] as const;
