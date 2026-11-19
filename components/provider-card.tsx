import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
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

export function ProviderCard({
  provider,
  distanceKm,
  minPriceCents,
  locale,
  openNow,
  priority = false,
  saved = false,
  isAuthed = false,
}: {
  provider: ProviderCardData;
  distanceKm: number | null;
  minPriceCents: number | null;
  locale: Locale;
  openNow?: boolean;
  priority?: boolean;
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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:shadow-[4px_4px_0_var(--color-ink)]">
      <Link
        href={`/providers/${provider.slug}`}
        className="relative block aspect-[16/11] overflow-hidden bg-surface-2"
        aria-label={`${translate(locale, "common.view")} ${provider.displayName}`}
      >
        {photo ? (
          <Image
            src={photo}
            alt={provider.photos[0]?.alt || `${provider.displayName} — ${category}`}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,var(--color-marigold-soft),var(--color-surface-2))] text-ink/70">
            <CategoryIcon name={provider.category.icon} className="h-8 w-8" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
              {category}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <VerifiedBadge compact locale={locale} />
          {openNow && (
            <span className="pill border-pine/20 bg-pine-soft text-[9px] font-semibold text-pine">
              <span className="status-dot" /> {translate(locale, "common.openToday")}
            </span>
          )}
        </div>
        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-ink bg-surface opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>

      <div className="absolute right-3 top-3 z-20">
        <SaveButton
          providerId={provider.id}
          initialSaved={saved}
          isAuthed={isAuthed}
          locale={locale}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-sans text-[15px] font-semibold tracking-[-0.01em]">
              <Link href={`/providers/${provider.slug}`} className="hover:underline">
                {provider.displayName}
              </Link>
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] text-muted">
              <span>{category}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3" aria-hidden />
                {provider.neighbourhood}
              </span>
              {distanceKm !== null && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-medium text-ink">{formatDistance(distanceKm, locale)}</span>
                </>
              )}
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <Rating value={provider.ratingAvg} count={provider.ratingCount} locale={locale} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {placeTags.slice(0, 3).map((tag) => (
            <span key={tag.key} className="rounded-full bg-surface-2 px-2 py-1 text-[10px] text-ink-soft">
              {placeLabel(locale, tag.key)}
            </span>
          ))}
          {provider.responseTimeHours && (
            <span className="rounded-full bg-surface-2 px-2 py-1 text-[10px] text-ink-soft">
              {translate(locale, "provider.repliesIn", { hours: provider.responseTimeHours })}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="text-sm font-semibold">
            {minPriceCents !== null ? (
              <>
                <span className="text-[10px] font-normal uppercase tracking-wide text-muted">
                  {translate(locale, "common.from")}{" "}
                </span>
                {formatMoney(minPriceCents)}
              </>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-normal text-muted">
                <Sparkles className="h-3 w-3" /> {translate(locale, "home.card.askPricing")}
              </span>
            )}
          </span>
          <Link
            href={`/providers/${provider.slug}`}
            className="btn btn-sm border-line bg-surface hover:border-ink"
          >
            {translate(locale, "common.viewProfile")}
          </Link>
        </div>
      </div>
    </article>
  );
}
