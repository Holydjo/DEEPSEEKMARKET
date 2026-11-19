import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { ProviderCardData } from "@/lib/search";
import { PLACE_OPTIONS } from "@/lib/constants";
import { formatDistance } from "@/lib/location";
import { formatMoney } from "@/lib/format";
import { translate } from "@/lib/i18n/dictionary";
import { categoryLabel } from "@/lib/i18n/categories";
import { placeLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/config";
import { CategoryIcon } from "./category-icon";
import { Rating } from "./rating";
import { VerifiedBadge } from "./verified-badge";
import { SaveButton } from "./save-button";

export function SearchResultCard({
  provider,
  distanceKm,
  minPriceCents,
  locale,
  openNow,
  saved = false,
  isAuthed = false,
}: {
  provider: ProviderCardData;
  distanceKm: number | null;
  minPriceCents: number | null;
  locale: Locale;
  openNow?: boolean;
  saved?: boolean;
  isAuthed?: boolean;
}) {
  const photo = provider.photos[0]?.url ?? provider.coverUrl;
  const category = categoryLabel(locale, provider.category.slug, provider.category.name);
  const placeTags = PLACE_OPTIONS.filter((option) => {
    if (option.key === "home") return provider.servesAtHome;
    if (option.key === "salon") return provider.servesAtSalon;
    if (option.key === "shop") return provider.servesAtShop;
    return provider.travelsToClient;
  });

  return (
    <article className="group relative flex overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-ink hover:shadow-[3px_3px_0_var(--color-ink)]">
      <Link
        href={`/providers/${provider.slug}`}
        className="relative w-[108px] shrink-0 overflow-hidden bg-surface-2 sm:w-[150px]"
        aria-label={`${translate(locale, "common.view")} ${provider.displayName}`}
      >
        {photo ? (
          <Image
            src={photo}
            alt={provider.photos[0]?.alt || `${provider.displayName}`}
            fill
            sizes="(max-width: 640px) 110px, 150px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-2">
            <CategoryIcon name={provider.category.icon} className="h-6 w-6 text-ink/50" />
          </div>
        )}
      </Link>

      <div className="absolute left-2 top-2 z-20">
        <SaveButton
          providerId={provider.id}
          initialSaved={saved}
          isAuthed={isAuthed}
          locale={locale}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-[13.5px] font-semibold leading-tight sm:text-[15px]">
                <Link href={`/providers/${provider.slug}`} className="hover:underline">
                  {provider.displayName}
                </Link>
              </h3>
              <VerifiedBadge compact locale={locale} />
              {openNow && (
                <span className="pill pill-pine !text-[8.5px]">
                  ● {translate(locale, "common.openToday")}
                </span>
              )}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10.5px] text-muted">
              <span>{category}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" aria-hidden />
                {provider.neighbourhood}
              </span>
              {distanceKm !== null && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-medium text-ink">{formatDistance(distanceKm, locale)}</span>
                </>
              )}
              {provider.responseTimeHours && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {translate(locale, "provider.repliesIn", {
                      hours: provider.responseTimeHours,
                    })}
                  </span>
                </>
              )}
            </p>
          </div>
          <Rating value={provider.ratingAvg} count={provider.ratingCount} locale={locale} />
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {placeTags.slice(0, 3).map((tag) => (
            <span key={tag.key} className="rounded-full bg-surface-2 px-2 py-0.5 text-[9.5px] text-ink-soft">
              {placeLabel(locale, tag.key)}
            </span>
          ))}
          {provider.languages.split(",").slice(0, 2).map((language) => (
            <span key={language} className="rounded-full bg-surface-2 px-2 py-0.5 text-[9.5px] text-ink-soft">
              {language.trim()}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <p className="text-sm font-semibold">
            {minPriceCents !== null ? (
              <>
                <span className="text-[9px] font-normal uppercase tracking-wide text-muted">
                  {translate(locale, "common.from")}{" "}
                </span>
                {formatMoney(minPriceCents)}
              </>
            ) : (
              <span className="text-[10px] font-normal text-muted">
                {translate(locale, "home.card.askPricing")}
              </span>
            )}
          </p>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/providers/${provider.slug}`}
              className="btn btn-sm border-line bg-surface !px-3 !py-1.5 text-[10px] hover:border-ink"
            >
              {translate(locale, "common.view")}
            </Link>
            <Link
              href={`/providers/${provider.slug}?request=1`}
              className="btn btn-primary btn-sm !px-3 !py-1.5 text-[10px]"
            >
              {translate(locale, "common.request")} <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
