import { DEFAULT_RADIUS_KM } from "./location";

export type SearchFilters = {
  q: string;
  category: string;
  city: string;
  hood: string;
  lat?: string;
  lng?: string;
  radius: number;
  type: string;
  place: string;
  priceMax?: number;
  rating?: number;
  openNow: boolean;
  sort: string;
  page: number;
};

export type SearchParamValue = string | string[] | undefined;

function first(value: SearchParamValue): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/**
 * Pure URL → filter parsing. Kept outside the database layer so it can be
 * unit-tested and reused by client-side filter controls.
 */
export function parseSearchParams(
  params: Record<string, SearchParamValue>,
): SearchFilters {
  const radiusRaw = Number(first(params.radius));
  const pageRaw = Number(first(params.page));
  const priceRaw = Number(first(params.priceMax));
  const ratingRaw = Number(first(params.rating));

  return {
    q: first(params.q).trim(),
    category: first(params.category).trim(),
    city: first(params.city) || "montreal",
    hood: first(params.hood).trim(),
    lat: first(params.lat) || undefined,
    lng: first(params.lng) || undefined,
    radius: Number.isFinite(radiusRaw) && radiusRaw > 0 ? radiusRaw : DEFAULT_RADIUS_KM,
    type: first(params.type).trim(),
    place: first(params.place).trim(),
    priceMax: Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : undefined,
    rating: Number.isFinite(ratingRaw) && ratingRaw > 0 ? ratingRaw : undefined,
    openNow: first(params.openNow) === "1",
    sort: first(params.sort) || "recommended",
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1,
  };
}

/**
 * Serialise filters back to a query string, omitting defaults. Overrides let
 * chips and sort links remove a single filter without rebuilding the page.
 */
export function filtersToQuery(
  filters: SearchFilters,
  overrides: Record<string, string | number | undefined> = {},
): string {
  const params = new URLSearchParams();
  const add = (key: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  };
  add("q", filters.q);
  add("category", filters.category);
  add("city", filters.city !== "montreal" ? filters.city : "");
  add("hood", filters.hood);
  add("lat", filters.lat);
  add("lng", filters.lng);
  add("radius", filters.radius !== DEFAULT_RADIUS_KM ? filters.radius : "");
  add("type", filters.type);
  add("place", filters.place);
  add("priceMax", filters.priceMax);
  add("rating", filters.rating);
  add("openNow", filters.openNow ? "1" : "");
  add("sort", filters.sort !== "recommended" ? filters.sort : "");
  add("page", filters.page > 1 ? filters.page : "");
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "") {
      params.delete(key);
      continue;
    }
    // Overrides also normalise values back to defaults so "reset to page 1"
    // or "sort by recommended" produces a clean URL.
    if (key === "page" && Number(value) <= 1) {
      params.delete(key);
    } else if (key === "sort" && value === "recommended") {
      params.delete(key);
    } else if (key === "radius" && Number(value) === DEFAULT_RADIUS_KM) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
