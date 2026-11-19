import Link from "next/link";
import {
  ChevronDown,
  MapPin,
  SearchX,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  filtersToQuery,
  getCategoriesWithCounts,
  searchProviders,
  type SearchFilters,
} from "@/lib/search";
import { MONTREAL, neighbourhoodBySlug } from "@/lib/location";
import { getCurrentUser } from "@/lib/auth";
import { getSavedProviderIds } from "@/lib/saved";
import { getTranslator } from "@/lib/i18n/server";
import { translate, type MessageKey } from "@/lib/i18n/dictionary";
import { categoryLabel } from "@/lib/i18n/categories";
import { nearPlace } from "@/lib/i18n/labels";
import { SearchForm } from "@/components/search-form";
import { FilterPanel } from "@/components/filter-panel";
import { SearchResultCard } from "@/components/search-result-card";
import { MapToggle } from "@/components/map-toggle";
import { CategoryIcon } from "@/components/category-icon";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t("search.meta.title"),
    description: t("search.meta.description"),
  };
}

const SORT_KEYS: Record<string, MessageKey> = {
  recommended: "search.sort.recommended",
  distance: "search.sort.distance",
  rating: "search.sort.rating",
  price: "search.sort.price",
};

function activeFilterCount(filters: SearchFilters): number {
  let count = 0;
  if (filters.type) count += 1;
  if (filters.place) count += 1;
  if (filters.priceMax) count += 1;
  if (filters.rating) count += 1;
  if (filters.openNow) count += 1;
  if (filters.radius !== 5) count += 1;
  return count;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ locale, t }, user] = await Promise.all([getTranslator(), getCurrentUser()]);
  const [search, categories, savedIds] = await Promise.all([
    searchProviders(params),
    getCategoriesWithCounts(),
    getSavedProviderIds(user?.id),
  ]);

  const { filters, origin } = search;
  const selectedCategory = categories.find((category) => category.slug === filters.category);
  const selectedCategoryLabel = selectedCategory
    ? categoryLabel(locale, selectedCategory.slug, selectedCategory.name)
    : null;
  const hood = neighbourhoodBySlug(filters.hood);
  const filterCount = activeFilterCount(filters);
  const locationLabel =
    filters.lat && filters.lng
      ? t("search.location.yours")
      : hood?.name ?? t("search.location.centre", { city: MONTREAL.name });
  const locationNear =
    locale === "fr"
      ? filters.lat && filters.lng
        ? `de ${t("search.location.yours")}`
        : hood
          ? nearPlace(locale, hood.name)
          : `du ${t("search.location.centre", { city: MONTREAL.name })}`
      : locationLabel;

  const placeLabels: Record<string, string> = {
    home: translate(locale, "place.home"),
    salon: translate(locale, "place.salon"),
    shop: translate(locale, "place.shop"),
    travel: translate(locale, "place.travel"),
  };

  const chips: Array<{ label: string; href: string }> = [];
  const addChip = (label: string, overrides: Record<string, string | number | undefined>) => {
    chips.push({ label, href: `/search${filtersToQuery(filters, { ...overrides, page: 1 })}` });
  };

  if (filters.q) addChip(`“${filters.q}”`, { q: undefined });
  if (selectedCategoryLabel) addChip(selectedCategoryLabel, { category: undefined });
  if (filters.type) {
    addChip(
      filters.type === "BUSINESS" ? t("common.business") : t("common.independent"),
      { type: undefined },
    );
  }
  if (filters.place) {
    addChip(placeLabels[filters.place] ?? filters.place, { place: undefined });
  }
  if (filters.priceMax) addChip(t("search.chip.under", { amount: filters.priceMax }), { priceMax: undefined });
  if (filters.rating) {
    addChip(
      t("search.chip.rating", {
        rating: locale === "fr" ? String(filters.rating).replace(".", ",") : filters.rating,
      }),
      { rating: undefined },
    );
  }
  if (filters.openNow) addChip(t("search.chip.openToday"), { openNow: undefined });
  if (filters.lat && filters.lng) addChip(t("search.chip.nearMe"), { lat: undefined, lng: undefined });

  const searchDefaults = {
    q: filters.q,
    hood: filters.hood || (filters.lat ? "" : "le-plateau"),
    radius: filters.radius,
  };

  const sortLabel = t(SORT_KEYS[filters.sort] ?? "search.sort.recommended");
  const sortMeta = sortLabel.toLowerCase();
  const titleLocation = locale === "fr" ? locationNear : locationLabel;
  const mailtoQuery = filters.q || selectedCategoryLabel || t("search.mailto.localService");

  return (
    <div className="border-b border-line">
      {/* Search header */}
      <section className="border-b border-line bg-surface">
        <div className="container-hd py-4 md:py-5">
          <SearchForm
            locale={locale}
            variant="strip"
            defaultQuery={searchDefaults.q}
            defaultHood={searchDefaults.hood}
            defaultRadius={searchDefaults.radius}
          />
          <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="mr-1 shrink-0 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
              {t("search.categories")}
            </span>
            <Link
              href={`/search${filtersToQuery(filters, { category: undefined, page: 1 })}`}
              className={`pill shrink-0 ${!filters.category ? "pill-dark" : "hover:border-ink"}`}
            >
              {t("search.all")}
            </Link>
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/search${filtersToQuery(filters, { category: category.slug, page: 1 })}`}
                className={`pill shrink-0 ${filters.category === category.slug ? "pill-dark" : "hover:border-ink"}`}
              >
                {categoryLabel(locale, category.slug, category.name)}
                <span className="opacity-55">{category.providerCount}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-hd pb-16 pt-5 md:pt-7">
        {/* Result heading */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow !text-[9px]">{t("search.results")}</span>
              <span className="pill pill-pine !text-[8.5px]">{t("search.approvedOnly")}</span>
            </div>
            <h1 className="display mt-2 text-[clamp(1.8rem,3.2vw,2.7rem)]">
              {search.total === 1
                ? t("search.title.one", { count: search.total, location: titleLocation })
                : t("search.title.many", { count: search.total, location: titleLocation })}
            </h1>
            <p className="mt-1 text-[11.5px] text-muted">
              {selectedCategoryLabel ? `${selectedCategoryLabel} · ` : ""}
              {t("search.meta.line", {
                radius: filters.radius,
                sort: sortMeta,
              })}
              {filters.q ? t("search.meta.matching", { query: filters.q }) : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <details className="relative">
              <summary className="pill cursor-pointer list-none !py-2 hover:border-ink [&::-webkit-details-marker]:hidden">
                {t("search.sort.label", { sort: sortLabel })}
                <ChevronDown className="h-3 w-3" aria-hidden />
              </summary>
              <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-44 rounded-xl border border-ink bg-surface p-1.5 shadow-[3px_3px_0_var(--color-ink)]">
                {Object.entries(SORT_KEYS).map(([value, key]) => (
                  <Link
                    key={value}
                    href={`/search${filtersToQuery(filters, { sort: value === "recommended" ? undefined : value, page: 1 })}`}
                    className={`block rounded-lg px-2.5 py-2 text-[11px] ${
                      filters.sort === value ? "bg-ink text-paper" : "hover:bg-surface-2"
                    }`}
                  >
                    {translate(locale, key)}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {chips.map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] hover:border-ink"
              >
                {chip.label}
                <span aria-hidden>×</span>
              </Link>
            ))}
            <Link href="/search" className="ml-1 text-[10px] font-medium underline decoration-line underline-offset-2">
              {t("search.chip.clearAll")}
            </Link>
          </div>
        )}

        {/* Main grid */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[226px_minmax(0,1fr)_318px] lg:items-start">
          {/* Filters */}
          <aside className="lg:sticky lg:top-20">
            <details className="group lg:hidden">
              <summary className="btn btn-outline btn-sm w-full list-none [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                {t("filter.title")} {filterCount > 0 && <span className="rounded-full bg-clay px-1.5 py-0.5 text-[9px] font-bold text-white">{filterCount}</span>}
                <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface">
                <FilterPanel filters={filters} idPrefix="mobile" locale={locale} />
              </div>
            </details>
            <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface lg:block">
              <FilterPanel filters={filters} idPrefix="desktop" locale={locale} />
            </div>
          </aside>

          {/* Map */}
          <aside className="order-2 lg:order-3 lg:sticky lg:top-20">
            <MapToggle
              points={search.mapPoints}
              origin={{ lat: origin.lat, lng: origin.lng }}
              radiusKm={filters.radius}
              locale={locale}
            />
            <div className="mt-2 hidden items-center justify-between text-[9.5px] text-muted lg:flex">
              <span>
                <MapPin className="mr-1 inline h-3 w-3" aria-hidden />
                {t("search.map.pins", {
                  count: search.mapPoints.length,
                  radius: filters.radius,
                })}
              </span>
              <span>{t("search.map.approx")}</span>
            </div>
            <div className="mt-3 hidden items-center gap-2.5 rounded-2xl border border-line bg-surface p-3 lg:flex">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marigold-soft">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div>
                <p className="text-[10.5px] font-semibold">{t("search.ask.title")}</p>
                <p className="text-[9px] text-muted">{t("search.ask.body")}</p>
              </div>
              <a
                href={`mailto:hello@holydo.market?subject=${encodeURIComponent(
                  `${t("search.mailto.subject")}${filters.q ? `: ${filters.q}` : ""}`,
                )}`}
                className="btn btn-sm ml-auto !px-2.5 !py-1.5 text-[9px]"
              >
                {t("search.ask.button")}
              </a>
            </div>
          </aside>

          {/* Results */}
          <div className="order-3 lg:order-2">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9.5px] text-muted">
                {search.total === 0
                  ? t("search.noMatches")
                  : t("search.showing", {
                      from: (search.page - 1) * search.pageSize + 1,
                      to: Math.min(search.page * search.pageSize, search.total),
                      total: search.total,
                    })}
              </span>
              <span className="text-[9.5px] text-muted">{t("search.currency")}</span>
            </div>

            {search.results.length > 0 ? (
              <div className="grid gap-2.5">
                {search.results.map((result) => (
                  <SearchResultCard
                    key={result.provider.id}
                    provider={result.provider}
                    distanceKm={result.distanceKm}
                    minPriceCents={result.minPriceCents}
                    openNow={result.openNow}
                    saved={savedIds.has(result.provider.id)}
                    isAuthed={Boolean(user)}
                    locale={locale}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-surface p-6 text-center sm:p-10">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface-2">
                  <SearchX className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-2xl">
                  {selectedCategoryLabel
                    ? t("search.empty.titleCategory", {
                        category:
                          locale === "en"
                            ? (selectedCategory?.name.toLowerCase() ?? "")
                            : selectedCategoryLabel,
                        radius: filters.radius,
                      })
                    : t("search.empty.titleProviders", { radius: filters.radius })}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
                  {t("search.empty.body")}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link
                    href={`/search${filtersToQuery(filters, { radius: Math.min(filters.radius * 2, 25), page: 1 })}`}
                    className="btn btn-primary btn-sm"
                  >
                    {t("search.empty.extend", { radius: Math.min(filters.radius * 2, 25) })}
                  </Link>
                  <Link href="/search" className="btn btn-outline btn-sm">
                    {t("search.empty.startOver")}
                  </Link>
                  <a
                    href={`mailto:hello@holydo.market?subject=${encodeURIComponent(t("search.mailto.providerSubject"))}&body=${encodeURIComponent(
                      t("search.mailto.providerBody", {
                        query: mailtoQuery,
                        location: titleLocation,
                      }),
                    )}`}
                    className="btn btn-ghost btn-sm"
                  >
                    {t("search.empty.request")}
                  </a>
                </div>
                <div className="mt-6 border-t border-line pt-4">
                  <p className="mb-2 text-[9px] uppercase tracking-[0.12em] text-muted">
                    {t("search.empty.browseCategories")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {categories.slice(0, 5).map((category) => (
                      <Link
                        key={category.id}
                        href={`/search?category=${category.slug}&hood=${filters.hood || "le-plateau"}`}
                        className="pill hover:border-ink"
                      >
                        <CategoryIcon name={category.icon} className="h-3 w-3" aria-hidden />
                        {categoryLabel(locale, category.slug, category.name)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {search.pageCount > 1 && (
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <Link
                  href={`/search${filtersToQuery(filters, { page: Math.max(1, search.page - 1) })}`}
                  aria-disabled={search.page === 1}
                  className={`btn btn-sm ${search.page === 1 ? "pointer-events-none opacity-40" : "btn-outline"}`}
                >
                  {t("search.pagination.previous")}
                </Link>
                <span className="text-[10px] text-muted">
                  {t("search.pagination.page", {
                    page: search.page,
                    pages: search.pageCount,
                  })}
                </span>
                <Link
                  href={`/search${filtersToQuery(filters, { page: Math.min(search.pageCount, search.page + 1) })}`}
                  aria-disabled={search.page === search.pageCount}
                  className={`btn btn-sm ${search.page === search.pageCount ? "pointer-events-none opacity-40" : "btn-outline"}`}
                >
                  {t("search.pagination.next")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
