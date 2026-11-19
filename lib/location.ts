export type Neighbourhood = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
};

export type City = {
  slug: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  neighbourhoods: Neighbourhood[];
};

export const MONTREAL: City = {
  slug: "montreal",
  name: "Montréal",
  province: "QC",
  lat: 45.5019,
  lng: -73.5674,
  neighbourhoods: [
    { slug: "le-plateau", name: "Le Plateau", lat: 45.5234, lng: -73.579 },
    { slug: "rosemont", name: "Rosemont", lat: 45.549, lng: -73.586 },
    { slug: "villeray", name: "Villeray", lat: 45.551, lng: -73.615 },
    { slug: "little-burgundy", name: "Little Burgundy", lat: 45.487, lng: -73.573 },
    { slug: "mile-end", name: "Mile End", lat: 45.526, lng: -73.601 },
    { slug: "little-italy", name: "Little Italy", lat: 45.53, lng: -73.611 },
    { slug: "outremont", name: "Outremont", lat: 45.514, lng: -73.609 },
    { slug: "verdun", name: "Verdun", lat: 45.459, lng: -73.568 },
    { slug: "hochelaga", name: "Hochelaga", lat: 45.543, lng: -73.552 },
    { slug: "cote-des-neiges", name: "Côte-des-Neiges", lat: 45.498, lng: -73.632 },
    { slug: "saint-henri", name: "Saint-Henri", lat: 45.477, lng: -73.586 },
    { slug: "old-montreal", name: "Old Montréal", lat: 45.508, lng: -73.554 },
    { slug: "centre-ville", name: "Centre-ville", lat: 45.5019, lng: -73.5674 },
  ],
};

export const CITIES: City[] = [MONTREAL];

export const RADIUS_OPTIONS = [1, 3, 5, 10, 25] as const;
export const DEFAULT_RADIUS_KM = 5;

export function getCity(slug?: string | null): City | undefined {
  return CITIES.find((city) => city.slug === slug);
}

export function getNeighbourhood(
  citySlug: string | undefined,
  hoodSlug: string | undefined,
): Neighbourhood | undefined {
  return getCity(citySlug)?.neighbourhoods.find((hood) => hood.slug === hoodSlug);
}

export type Origin = {
  lat: number;
  lng: number;
  label: string;
  kind: "coordinates" | "neighbourhood" | "city";
};

/**
 * Resolve a search origin without ever guessing precise coordinates.
 * Priority: explicit device coordinates → chosen neighbourhood → city centre.
 */
export function resolveOrigin(input: {
  lat?: number | string | null;
  lng?: number | string | null;
  city?: string | null;
  hood?: string | null;
}): Origin {
  const lat = typeof input.lat === "string" ? Number(input.lat) : input.lat;
  const lng = typeof input.lng === "string" ? Number(input.lng) : input.lng;

  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  ) {
    return {
      lat: Math.round(lat * 1000) / 1000,
      lng: Math.round(lng * 1000) / 1000,
      label: "your location",
      kind: "coordinates",
    };
  }

  const city = getCity(input.city) ?? MONTREAL;
  const hood = getNeighbourhood(city.slug, input.hood ?? undefined);

  if (hood) {
    return {
      lat: hood.lat,
      lng: hood.lng,
      label: `${hood.name}, ${city.name}`,
      kind: "neighbourhood",
    };
  }

  return {
    lat: city.lat,
    lng: city.lng,
    label: `${city.name} centre`,
    kind: "city",
  };
}

/** Great-circle distance in kilometres. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number | null, locale: "en" | "fr" = "en"): string {
  if (km === null) return "";
  if (km < 1) return `${Math.max(50, Math.round(km * 1000 / 50) * 50)} m`;
  const value = km < 10 ? km.toFixed(1) : String(Math.round(km));
  return `${locale === "fr" ? value.replace(".", ",") : value} km`;
}

export function neighbourhoodBySlug(slug: string): Neighbourhood | undefined {
  return MONTREAL.neighbourhoods.find((hood) => hood.slug === slug);
}
