import { Search, MapPin, ChevronDown } from "lucide-react";
import { MONTREAL, RADIUS_OPTIONS } from "@/lib/location";
import { LocationButton } from "./location-button";

export function SearchForm({
  variant = "hero",
  defaultQuery = "",
  defaultHood = "le-plateau",
  defaultRadius = 5,
}: {
  variant?: "hero" | "strip";
  defaultQuery?: string;
  defaultHood?: string;
  defaultRadius?: number;
}) {
  const hero = variant === "hero";

  return (
    <form action="/search" method="get" className="w-full">
      <input type="hidden" name="city" value="montreal" />
      <div
        className={`flex flex-col gap-0 border-ink bg-surface sm:flex-row sm:items-center ${
          hero
            ? "rounded-[22px] border p-1.5 shadow-[5px_5px_0_var(--color-ink)]"
            : "rounded-2xl border"
        }`}
      >
        <div className={`flex min-w-0 flex-1 items-center gap-2.5 px-3.5 ${hero ? "py-3" : "py-2.5"}`}>
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <div className="min-w-0 flex-1">
            <label htmlFor={`q-${variant}`} className="block font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
              What do you need?
            </label>
            <input
              id={`q-${variant}`}
              type="search"
              name="q"
              defaultValue={defaultQuery}
              placeholder="Braids, deep clean, phone repair…"
              className="w-full bg-transparent text-[13px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-muted/65"
            />
          </div>
        </div>

        <div className="mx-3.5 h-px bg-line sm:mx-0 sm:h-9 sm:w-px" />

        <div className="flex min-w-0 items-center gap-2 px-3.5 py-2.5 sm:w-[200px] lg:w-[230px]">
          <MapPin className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <div className="min-w-0 flex-1">
            <label htmlFor={`hood-${variant}`} className="block font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
              Where?
            </label>
            <div className="relative">
              <select
                id={`hood-${variant}`}
                name="hood"
                defaultValue={defaultHood}
                className="w-full appearance-none bg-transparent pr-5 text-[12.5px] font-medium text-ink outline-none"
              >
                <option value="">All of Montréal</option>
                {MONTREAL.neighbourhoods.map((hood) => (
                  <option key={hood.slug} value={hood.slug}>
                    {hood.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-muted" aria-hidden />
            </div>
          </div>
        </div>

        {!hero && (
          <>
            <div className="mx-3.5 h-px bg-line sm:mx-0 sm:h-9 sm:w-px" />
            <div className="hidden items-center gap-2 px-3.5 py-2.5 sm:flex">
              <label htmlFor={`radius-${variant}`} className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
                Radius
              </label>
              <select
                id={`radius-${variant}`}
                name="radius"
                defaultValue={defaultRadius}
                className="appearance-none bg-transparent text-[12px] font-medium text-ink outline-none"
              >
                {RADIUS_OPTIONS.map((radius) => (
                  <option key={radius} value={radius}>
                    {radius} km
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          className={`btn btn-primary shrink-0 gap-1.5 ${hero ? "m-1 py-3.5 sm:px-6" : "m-1.5 py-2.5 btn-sm"}`}
        >
          <Search className="h-4 w-4 sm:hidden" aria-hidden />
          <span>Search</span>
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
        <LocationButton query={defaultQuery} radius={defaultRadius} />
        <span className="hidden text-[10px] text-muted sm:inline">
          Every profile reviewed by a person · No booking fees
        </span>
      </div>
    </form>
  );
}
