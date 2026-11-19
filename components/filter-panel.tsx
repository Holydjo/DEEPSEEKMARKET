import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";
import type { SearchFilters } from "@/lib/search";
import { RADIUS_OPTIONS } from "@/lib/location";
import { SubmitButton } from "./submit-button";

const TYPE_OPTIONS = [
  { value: "", label: "Any provider" },
  { value: "INDEPENDENT", label: "Independent" },
  { value: "BUSINESS", label: "Business" },
];

const PLACE_OPTIONS = [
  { value: "", label: "Anywhere" },
  { value: "home", label: "Home studio" },
  { value: "salon", label: "Salon or studio" },
  { value: "shop", label: "Shop or storefront" },
  { value: "travel", label: "Travels to you" },
];

const PRICE_OPTIONS = [
  { value: "", label: "Any price" },
  { value: "40", label: "Up to $40" },
  { value: "60", label: "Up to $60" },
  { value: "90", label: "Up to $90" },
  { value: "120", label: "Up to $120" },
  { value: "200", label: "Up to $200" },
];

function countActive(filters: SearchFilters): number {
  let count = 0;
  if (filters.type) count += 1;
  if (filters.place) count += 1;
  if (filters.priceMax) count += 1;
  if (filters.rating) count += 1;
  if (filters.openNow) count += 1;
  if (filters.radius !== 5) count += 1;
  return count;
}

export function FilterPanel({
  filters,
  idPrefix,
  className = "",
}: {
  filters: SearchFilters;
  idPrefix: string;
  className?: string;
}) {
  const active = countActive(filters);

  return (
    <form action="/search" method="get" className={className}>
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="city" value={filters.city} />
      {filters.hood && <input type="hidden" name="hood" value={filters.hood} />}
      {filters.lat && <input type="hidden" name="lat" value={filters.lat} />}
      {filters.lng && <input type="hidden" name="lng" value={filters.lng} />}
      {filters.category && <input type="hidden" name="category" value={filters.category} />}
      {filters.sort !== "recommended" && <input type="hidden" name="sort" value={filters.sort} />}

      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold">
          <Filter className="h-3.5 w-3.5" aria-hidden /> Filters
          {active > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-bold text-white">
              {active}
            </span>
          )}
        </p>
        <Link
          href={`/search?city=${filters.city}${filters.hood ? `&hood=${filters.hood}` : ""}`}
          className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-ink"
        >
          <RotateCcw className="h-3 w-3" aria-hidden /> Reset
        </Link>
      </div>

      <div className="px-4">
        <fieldset className="border-b border-line py-3.5">
          <legend className="mb-2 font-mono text-[9px] uppercase tracking-[0.11em] text-muted">
            Provider type
          </legend>
          <div className="grid gap-1.5">
            {TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-[11.5px]">
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  defaultChecked={filters.type === option.value}
                  className="h-3.5 w-3.5 accent-ink"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-b border-line py-3.5">
          <legend className="mb-2 font-mono text-[9px] uppercase tracking-[0.11em] text-muted">
            Where they work
          </legend>
          <div className="grid gap-1.5">
            {PLACE_OPTIONS.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-[11.5px]">
                <input
                  type="radio"
                  name="place"
                  value={option.value}
                  defaultChecked={filters.place === option.value}
                  className="h-3.5 w-3.5 accent-ink"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="border-b border-line py-3.5">
          <label htmlFor={`${idPrefix}-price`} className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.11em] text-muted">
            Max price
          </label>
          <select
            id={`${idPrefix}-price`}
            name="priceMax"
            defaultValue={filters.priceMax ?? ""}
            className="w-full rounded-lg border border-line bg-paper px-2.5 py-2 text-[11.5px]"
          >
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="border-b border-line py-3.5">
          <legend className="mb-2 font-mono text-[9px] uppercase tracking-[0.11em] text-muted">
            Rating
          </legend>
          <div className="grid gap-1.5">
            {[
              { value: "", label: "Any rating" },
              { value: "4.5", label: "4.5 & up" },
              { value: "4", label: "4.0 & up" },
            ].map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-[11.5px]">
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  defaultChecked={String(filters.rating ?? "") === option.value}
                  className="h-3.5 w-3.5 accent-ink"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="border-b border-line py-3.5">
          <label className="flex cursor-pointer items-center gap-2 text-[11.5px]">
            <input
              type="checkbox"
              name="openNow"
              value="1"
              defaultChecked={filters.openNow}
              className="h-3.5 w-3.5 accent-ink"
            />
            Open today
          </label>
        </div>

        <div className="py-3.5">
          <label htmlFor={`${idPrefix}-radius`} className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.11em] text-muted">
            Distance
          </label>
          <select
            id={`${idPrefix}-radius`}
            name="radius"
            defaultValue={filters.radius}
            className="w-full rounded-lg border border-line bg-paper px-2.5 py-2 text-[11.5px]"
          >
            {RADIUS_OPTIONS.map((radius) => (
              <option key={radius} value={radius}>
                Within {radius} km
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-line p-3">
        <SubmitButton className="btn btn-primary btn-block btn-sm" pendingLabel="Applying…">
          Apply filters
        </SubmitButton>
      </div>
    </form>
  );
}
