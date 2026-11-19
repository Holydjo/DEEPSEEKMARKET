import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { formatDistance, haversineKm, resolveOrigin, type Origin } from "./location";
import { filtersToQuery, parseSearchParams, type SearchFilters, type SearchParamValue } from "./search-params";

export { filtersToQuery };
export type { SearchFilters };
import { isOpenNow } from "./format";

export const providerCardInclude = {
  category: true,
  services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
  photos: { orderBy: { sortOrder: "asc" }, take: 4 },
  hours: true,
} satisfies Prisma.ProviderInclude;

export type ProviderCardData = Prisma.ProviderGetPayload<{
  include: typeof providerCardInclude;
}>;

export type SearchResult = {
  provider: ProviderCardData;
  distanceKm: number | null;
  minPriceCents: number | null;
  openNow: boolean;
};

export type MapPoint = {
  id: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  minPriceCents: number | null;
};

export type SearchResponse = {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  origin: Origin;
  mapPoints: MapPoint[];
  filters: SearchFilters;
};

function minPrice(provider: ProviderCardData): number | null {
  if (!provider.services.length) return null;
  return Math.min(...provider.services.map((service) => service.priceCents));
}

function matchesQuery(provider: ProviderCardData, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const haystack = [
    provider.displayName,
    provider.tagline ?? "",
    provider.about,
    provider.category.name,
    provider.neighbourhood,
    ...provider.services.map((s) => `${s.name} ${s.description ?? ""}`),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export async function searchProviders(params: Record<string, SearchParamValue>): Promise<SearchResponse> {
  const filters = parseSearchParams(params);
  const origin = resolveOrigin(filters);
  const pageSize = 12;

  const where: Prisma.ProviderWhereInput = { status: "APPROVED" };
  if (filters.category) where.category = { slug: filters.category };
  if (filters.type === "INDEPENDENT" || filters.type === "BUSINESS") where.type = filters.type;
  if (filters.rating) where.ratingAvg = { gte: filters.rating };
  if (filters.place === "home") where.servesAtHome = true;
  if (filters.place === "salon") where.servesAtSalon = true;
  if (filters.place === "shop") where.servesAtShop = true;
  if (filters.place === "travel") where.travelsToClient = true;

  const providers = await db.provider.findMany({
    where,
    include: providerCardInclude,
    orderBy: [{ featured: "desc" }, { ratingAvg: "desc" }, { ratingCount: "desc" }],
  });

  const filtered: SearchResult[] = [];
  for (const provider of providers) {
    if (!matchesQuery(provider, filters.q)) continue;

    const distanceKm = haversineKm(origin, { lat: provider.lat, lng: provider.lng });
    if (distanceKm > filters.radius) continue;

    const lowest = minPrice(provider);
    if (filters.priceMax && (lowest === null || lowest > filters.priceMax * 100)) continue;
    if (filters.openNow && !isOpenNow(provider.hours)) continue;

    filtered.push({
      provider,
      distanceKm,
      minPriceCents: lowest,
      openNow: isOpenNow(provider.hours),
    });
  }

  const sorted = [...filtered];
  switch (filters.sort) {
    case "distance":
      sorted.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      break;
    case "rating":
      sorted.sort(
        (a, b) =>
          b.provider.ratingAvg - a.provider.ratingAvg ||
          b.provider.ratingCount - a.provider.ratingCount,
      );
      break;
    case "price":
      sorted.sort((a, b) => (a.minPriceCents ?? 0) - (b.minPriceCents ?? 0));
      break;
    default:
      sorted.sort(
        (a, b) =>
          Number(b.provider.featured) - Number(a.provider.featured) ||
          b.provider.ratingAvg - a.provider.ratingAvg ||
          b.provider.ratingCount - a.provider.ratingCount ||
          (a.distanceKm ?? 0) - (b.distanceKm ?? 0),
      );
  }

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(filters.page, pageCount);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const mapPoints: MapPoint[] = sorted.slice(0, 60).map(({ provider, minPriceCents }) => ({
    id: provider.id,
    slug: provider.slug,
    name: provider.displayName,
    lat: provider.lat,
    lng: provider.lng,
    minPriceCents,
  }));

  return {
    results: paged,
    total,
    page,
    pageSize,
    pageCount,
    origin,
    mapPoints,
    filters: { ...filters, page },
  };
}

export type CategoryWithCount = Awaited<ReturnType<typeof getCategoriesWithCounts>>[number];

export async function getCategoriesWithCounts() {
  const [categories, counts] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.provider.groupBy({
      by: ["categoryId"],
      where: { status: "APPROVED" },
      _count: { _all: true },
    }),
  ]);

  const countMap = new Map(counts.map((row) => [row.categoryId, row._count._all]));
  return categories.map((category) => ({
    ...category,
    providerCount: countMap.get(category.id) ?? 0,
  }));
}

export async function getNeighbourhoodCounts() {
  const rows = await db.provider.groupBy({
    by: ["neighbourhood"],
    where: { status: "APPROVED" },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.neighbourhood, row._count._all]));
}

export async function getFeaturedProviders(limit = 3): Promise<SearchResult[]> {
  const origin = resolveOrigin({ city: "montreal", hood: "le-plateau" });
  const providers = await db.provider.findMany({
    where: { status: "APPROVED" },
    include: providerCardInclude,
    orderBy: [{ featured: "desc" }, { ratingAvg: "desc" }, { ratingCount: "desc" }],
    take: limit,
  });

  return providers.map((provider) => {
    const lowest = minPrice(provider);
    return {
      provider,
      distanceKm: haversineKm(origin, { lat: provider.lat, lng: provider.lng }),
      minPriceCents: lowest,
      openNow: isOpenNow(provider.hours),
    };
  });
}

export async function getProviderForPublicPage(slug: string) {
  const provider = await db.provider.findFirst({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      user: { select: { name: true, createdAt: true } },
      services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
      hours: { orderBy: { dayOfWeek: "asc" } },
      areas: { orderBy: { label: "asc" } },
      reviews: {
        where: { status: "PUBLISHED" },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: { select: { reviews: { where: { status: "PUBLISHED" } } } },
    },
  });

  if (!provider) return null;

  const similar = await db.provider.findMany({
    where: {
      status: "APPROVED",
      categoryId: provider.categoryId,
      id: { not: provider.id },
    },
    include: providerCardInclude,
    orderBy: { ratingAvg: "desc" },
    take: 2,
  });

  return {
    provider,
    similar: similar.map((item) => ({
      provider: item,
      minPriceCents: minPrice(item),
      distanceKm: haversineKm(
        { lat: provider.lat, lng: provider.lng },
        { lat: item.lat, lng: item.lng },
      ),
    })),
    distanceFromPlateau: haversineKm(
      { lat: 45.5234, lng: -73.579 },
      { lat: provider.lat, lng: provider.lng },
    ),
  };
}

export { formatDistance };
