import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  Home,
  Languages,
  LockKeyhole,
  MapPin,
  MessageSquare,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSavedProviderIds } from "@/lib/saved";
import { SaveButton } from "@/components/save-button";
import { formatDateTime, formatDuration, formatRelative, formatServicePrice, dayName, dayShort, initials, isOpenNow, nextOpenDay, todayHours, torontoNowParts, WEEK_ORDER } from "@/lib/format";
import { formatDistance } from "@/lib/location";
import { getProviderForPublicPage } from "@/lib/search";
import { getTranslator } from "@/lib/i18n/server";
import { categoryLabel } from "@/lib/i18n/categories";
import { providerTypeLabel } from "@/lib/i18n/labels";
import { BookingDialog } from "@/components/booking-dialog";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { ProviderMap } from "@/components/provider-map";
import { Rating, StarRow } from "@/components/rating";
import { VerifiedBadge } from "@/components/verified-badge";
import { CategoryIcon } from "@/components/category-icon";
import { SearchResultCard } from "@/components/search-result-card";
import { createBookingRequest, createReview } from "@/app/actions/requests";

export const dynamic = "force-dynamic";

function minBookingDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { locale, t } = await getTranslator();
  const provider = await db.provider.findFirst({
    where: { slug, status: "APPROVED" },
    include: { photos: { take: 1 }, category: true },
  });

  if (!provider) return { title: t("provider.notFound") };

  const title = t("provider.meta.title", {
    name: provider.displayName,
    category: categoryLabel(locale, provider.category?.slug, provider.category?.name ?? ""),
    neighbourhood: provider.neighbourhood,
  });
  const description = provider.about.slice(0, 155);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: provider.photos[0]?.url ? [{ url: provider.photos[0].url }] : undefined,
    },
    alternates: { canonical: `/providers/${provider.slug}` },
  };
}

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ request?: string; service?: string; review?: string }>;
}) {
  const { slug } = await params;
  const { request, service, review } = await searchParams;
  const data = await getProviderForPublicPage(slug);
  if (!data) notFound();

  const { locale, t } = await getTranslator();
  const { provider, similar, distanceFromPlateau } = data;
  const user = await getCurrentUser();
  const savedIds = await getSavedProviderIds(user?.id);
  const isSaved = savedIds.has(provider.id);
  const [existingReview, completedRequest] = user
    ? await Promise.all([
        db.review.findUnique({
          where: {
            providerId_authorUserId: { providerId: provider.id, authorUserId: user.id },
          },
        }),
        db.bookingRequest.findFirst({
          where: {
            providerId: provider.id,
            customerUserId: user.id,
            status: "COMPLETED",
          },
          select: { id: true },
        }),
      ])
    : [null, null];

  // A view is a lightweight signal for the provider dashboard. Failure must not
  // prevent the profile from rendering.
  await db.provider.update({
    where: { id: provider.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => undefined);

  const open = isOpenNow(provider.hours);
  const today = todayHours(provider.hours);
  const next = nextOpenDay(provider.hours);
  const nowDay = torontoNowParts().day;
  const lowestPrice = provider.services.length
    ? Math.min(...provider.services.map((item) => item.priceCents))
    : null;
  const gallery = provider.photos.map((photo) => photo.url);
  const autoOpen = request === "1";
  const category = categoryLabel(locale, provider.category.slug, provider.category.name);

  const openLabel = open
    ? t("provider.open.until", { time: today?.closesAt ?? "" })
    : today?.isClosed
      ? t("provider.open.closedToday")
      : next
        ? t("provider.open.opensAt", {
            day: dayShort(next.dayOfWeek, locale),
            time: next.opensAt,
          })
        : t("provider.open.hoursUnavailable");

  const placeFacts = [
    provider.servesAtHome && { label: t("provider.fact.home"), icon: Home },
    provider.servesAtSalon && { label: t("provider.fact.salon"), icon: Store },
    provider.servesAtShop && { label: t("provider.fact.shop"), icon: Store },
    provider.travelsToClient && {
      label: t("provider.fact.travels", { radius: provider.travelRadiusKm }),
      icon: Truck,
    },
  ].filter(Boolean) as Array<{ label: string; icon: typeof Home }>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": provider.type === "BUSINESS" ? "LocalBusiness" : "ProfessionalService",
    name: provider.displayName,
    description: provider.about,
    image: gallery.slice(0, 4).map((url) => `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${url}`),
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/providers/${provider.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: provider.city,
      addressRegion: "QC",
      addressCountry: "CA",
    },
    areaServed: provider.areas.map((area) => area.label),
    priceRange: lowestPrice ? t("price.from", { price: `$${Math.round(lowestPrice / 100)}` }) : undefined,
    aggregateRating:
      provider.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: provider.ratingAvg,
            reviewCount: provider.ratingCount,
          }
        : undefined,
    makesOffer: provider.services.map((item) => ({
      "@type": "Offer",
      name: item.name,
      priceCurrency: "CAD",
      price: (item.priceCents / 100).toFixed(2),
      description: item.description ?? undefined,
    })),
  };

  const approvalChecks = [
    t("provider.aside.checkIdentity"),
    t("provider.aside.checkServices", { count: provider.services.length }),
    t("provider.aside.checkPhotos", { count: gallery.length }),
    t("provider.aside.checkApproved", {
      when: formatRelative(provider.reviewedAt ?? provider.createdAt, locale),
    }),
  ];

  return (
    <div className="pb-28 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-hd pt-4">
        <nav className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted" aria-label={t("provider.breadcrumb")}>
          <Link href="/" className="hover:text-ink">{t("provider.breadcrumb.home")}</Link>
          <span aria-hidden>/</span>
          <Link href={`/search?category=${provider.category.slug}`} className="hover:text-ink">
            {category}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{provider.displayName}</span>
        </nav>

        {/* Gallery */}
        <div className="mt-3 grid gap-1.5 md:grid-cols-[1.7fr_0.75fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-line bg-surface-2 md:aspect-auto md:h-[430px]">
            {gallery[0] ? (
              <Image
                src={gallery[0]}
                alt={provider.photos[0]?.alt || t("provider.photoAlt", { name: provider.displayName })}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CategoryIcon name={provider.category.icon} className="h-12 w-12 text-ink/30" />
              </div>
            )}
            <span className="absolute bottom-3 right-3 rounded-full border border-ink bg-surface/95 px-2.5 py-1 text-[9.5px] font-medium">
              {gallery.length === 1
                ? t("provider.photos.one", { count: gallery.length || 1 })
                : t("provider.photos.many", { count: gallery.length || 1 })}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1 md:grid-rows-2">
            {[1, 2].map((index) =>
              gallery[index] ? (
                <div key={index} className="relative aspect-square overflow-hidden rounded-[14px] border border-line bg-surface-2 md:aspect-auto md:h-full">
                  <Image
                    src={gallery[index]}
                    alt={provider.photos[index]?.alt || t("provider.photoAltWork", { name: provider.displayName, index })}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div key={index} className="flex aspect-square items-center justify-center rounded-[14px] border border-dashed border-line bg-surface-2 md:aspect-auto md:h-full">
                  <CategoryIcon name={provider.category.icon} className="h-6 w-6 text-ink/25" />
                </div>
              ),
            )}
          </div>
        </div>

        {/* Body */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <VerifiedBadge locale={locale} />
                <span className="pill">{providerTypeLabel(locale, provider.type)}</span>
                <span className={`pill ${open ? "pill-pine" : ""}`}>
                  <span className="status-dot" /> {openLabel}
                </span>
              </div>
              <SaveButton
                providerId={provider.id}
                initialSaved={isSaved}
                isAuthed={Boolean(user)}
                locale={locale}
                variant="button"
              />
            </div>

            <h1 className="display mt-3 text-[clamp(2.2rem,4.4vw,3.7rem)]">
              {provider.displayName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted">
              <Rating value={provider.ratingAvg} count={provider.ratingCount} size="md" locale={locale} />
              <span aria-hidden>·</span>
              <span>{category}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {provider.neighbourhood}, {provider.city}
              </span>
              <span aria-hidden>·</span>
              <span className="font-medium text-ink">
                {t("provider.distanceFromPlateau", {
                  distance: formatDistance(distanceFromPlateau, locale),
                })}
              </span>
            </div>

            <p className="mt-4 max-w-[680px] text-[14px] leading-relaxed text-ink-soft">
              {provider.about}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {placeFacts.map((fact) => (
                <span key={fact.label} className="pill">
                  <fact.icon className="h-3 w-3" aria-hidden />
                  {fact.label}
                </span>
              ))}
              {provider.responseTimeHours && (
                <span className="pill">
                  <Clock className="h-3 w-3" aria-hidden />
                  {t("provider.repliesIn", { hours: provider.responseTimeHours })}
                </span>
              )}
              <span className="pill">
                <Languages className="h-3 w-3" aria-hidden />
                {provider.languages}
              </span>
              <span className="pill">
                {t("provider.since", { year: new Date(provider.createdAt).getFullYear() })}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-line py-3 text-[10px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3 w-3" aria-hidden /> {t("provider.addressPrivate")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3" aria-hidden />{" "}
                {t("provider.servicesReviewed", { count: provider.services.length })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3" aria-hidden />{" "}
                {t("provider.photosChecked", { count: gallery.length })}
              </span>
            </div>

            {/* Services */}
            <section id="services" className="mt-7 scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="eyebrow">{t("provider.services.eyebrow")}</p>
                  <h2 className="display mt-2 text-[clamp(1.8rem,3vw,2.5rem)]">
                    {t("provider.services.title")}
                  </h2>
                </div>
                <span className="text-[10px] text-muted">{t("provider.services.currency")}</span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                {t("provider.services.confirm", { name: provider.displayName.split(" ")[0] })}
              </p>

              {provider.services.length > 0 ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
                  {provider.services.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 border-b border-line p-4 last:border-0 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[15px] font-semibold">{item.name}</h3>
                          {index === 0 && (
                            <span className="pill pill-marigold !text-[8px]">
                              {t("provider.services.mostRequested")}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.description}</p>
                        )}
                        {item.durationMin && (
                          <p className="mt-1 text-[9.5px] tracking-wide text-muted">
                            {formatDuration(item.durationMin)}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 sm:w-28 sm:text-right">
                        <p className="text-sm font-semibold">
                          {formatServicePrice(item.priceCents, item.priceType, locale)}
                        </p>
                      </div>
                      <Link
                        href={`/providers/${provider.slug}?request=1&service=${item.id}`}
                        className="btn btn-primary btn-sm shrink-0 justify-center"
                      >
                        {t("provider.services.request")}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
                  {t("provider.services.empty")}
                </p>
              )}
            </section>

            {/* Hours + area */}
            <section className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl">{t("provider.hours.title")}</h2>
                  <span className={`pill ${open ? "pill-pine" : ""}`}>
                    <span className="status-dot" />{" "}
                    {open ? t("provider.open.openNow") : t("provider.open.closed")}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted">{t("provider.hours.note")}</p>
                <div className="mt-3 text-[11px]">
                  {WEEK_ORDER.map((day) => {
                    const row = provider.hours.find((hour) => hour.dayOfWeek === day);
                    const isToday = day === nowDay;
                    if (!row) return null;
                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between border-b border-line py-1.5 last:border-0 ${
                          isToday ? "-mx-2 rounded-md bg-marigold-soft px-2 font-semibold" : ""
                        }`}
                      >
                        <span>{dayName(day, locale)}</span>
                        <span>
                          {row.isClosed
                            ? t("provider.open.closed")
                            : `${row.opensAt} – ${row.closesAt}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[9px] leading-relaxed text-muted">
                  {t("provider.hours.disclaimer")}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl">{t("provider.area.title")}</h2>
                  <span className="text-[9.5px] text-muted">
                    {t("provider.area.radius", { radius: provider.travelRadiusKm })}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted">
                  {t("provider.area.based", { hood: provider.neighbourhood })}
                </p>
                <div className="mt-3">
                  <ProviderMap
                    points={[]}
                    origin={{ lat: provider.lat, lng: provider.lng }}
                    radiusKm={provider.travelRadiusKm}
                    locale={locale}
                    heightClass="h-[168px]"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {provider.areas.map((area) => (
                    <span key={area.id} className="pill !text-[9px]">{area.label}</span>
                  ))}
                </div>
                <p className="mt-3 text-[9px] leading-relaxed text-muted">
                  {t("provider.area.fee")}
                </p>
              </div>
            </section>

            {/* Reviews */}
            <section id="reviews" className="mt-8 scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="eyebrow">{t("provider.reviews.eyebrow")}</p>
                  <h2 className="display mt-2 text-[clamp(1.8rem,3vw,2.5rem)]">
                    {t("provider.reviews.title")}
                  </h2>
                </div>
                <span className="text-[10px] text-muted">
                  {t("provider.reviews.count", { count: provider.ratingCount })}
                </span>
              </div>

              {review === "success" && (
                <div role="status" className="mt-4 rounded-xl border border-pine/25 bg-pine-soft px-4 py-3 text-xs font-medium text-pine">
                  {t("provider.reviews.thanks")}
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-line bg-surface p-4 text-center">
                  <p className="display text-5xl">{provider.ratingAvg.toFixed(1).replace(".", locale === "fr" ? "," : ".")}</p>
                  <div className="mt-1 flex justify-center">
                    <StarRow value={provider.ratingAvg} locale={locale} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">
                    {t("provider.reviews.countShort", { count: provider.ratingCount })}
                  </p>
                  <p className="mt-2 border-t border-line pt-2 text-[9px] text-pine">
                    {t("provider.reviews.verifiedRecent", {
                      count: provider.reviews.filter((r) => r.isVerified).length,
                    })}
                  </p>
                </div>
                <div className="grid gap-2">
                  {provider.reviews.length > 0 ? (
                    provider.reviews.slice(0, 3).map((item) => (
                      <article key={item.id} className="rounded-xl border border-line bg-surface p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[8px] font-bold">
                              {initials(item.author.name)}
                            </span>
                            <div>
                              <p className="text-[11px] font-semibold">{item.author.name}</p>
                              <p className="text-[8.5px] text-muted">
                                {formatRelative(item.createdAt, locale)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <StarRow value={item.rating} locale={locale} />
                            {item.isVerified && (
                              <p className="mt-1 text-[7.5px] font-semibold text-pine">
                                {t("provider.reviews.bookedVia")}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{item.body}</p>
                      </article>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-line bg-surface p-6 text-center">
                      <div>
                        <Star className="mx-auto h-5 w-5 text-muted" aria-hidden />
                        <p className="mt-2 text-sm font-semibold">{t("provider.reviews.newTitle")}</p>
                        <p className="mt-1 text-[10px] text-muted">{t("provider.reviews.newBody")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
                <h3 className="text-lg">{t("provider.reviews.formTitle")}</h3>
                {!user ? (
                  <p className="mt-1 text-[11px] text-muted">
                    <Link href={`/login?next=/providers/${provider.slug}`} className="font-semibold text-ink underline decoration-line underline-offset-4">
                      {t("provider.reviews.login")}
                    </Link>{" "}
                    {t("provider.reviews.loginSuffix")}
                  </p>
                ) : existingReview ? (
                  <p className="mt-1 text-[11px] text-muted">
                    {t("provider.reviews.already", {
                      date: formatDateTime(existingReview.createdAt, locale),
                    })}
                  </p>
                ) : !completedRequest ? (
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    {t("provider.reviews.verifiedOnly")}
                  </p>
                ) : (
                  <ActionForm action={createReview} className="mt-3 grid gap-3" locale={locale}>
                    <input type="hidden" name="providerId" value={provider.id} />
                    <input type="hidden" name="slug" value={provider.slug} />
                    <fieldset>
                      <legend className="label">{t("provider.reviews.ratingLabel")}</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {[5, 4, 3, 2, 1].map((value) => (
                          <label
                            key={value}
                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[10px] has-[:checked]:border-ink has-[:checked]:bg-marigold-soft"
                          >
                            <input
                              type="radio"
                              name="rating"
                              value={value}
                              defaultChecked={value === 5}
                              className="sr-only"
                            />
                            {value} <Star className="h-3 w-3 fill-ink" aria-hidden />
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div>
                      <label htmlFor="review-body" className="label">
                        {t("provider.reviews.experienceLabel")}
                      </label>
                      <textarea
                        id="review-body"
                        name="body"
                        required
                        minLength={10}
                        className="input textarea"
                        placeholder={t("provider.reviews.placeholder")}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[9px] text-muted">{t("provider.reviews.note")}</p>
                      <SubmitButton
                        className="btn btn-dark btn-sm"
                        pendingLabel={t("provider.reviews.publishing")}
                      >
                        {t("provider.reviews.publish")}
                      </SubmitButton>
                    </div>
                  </ActionForm>
                )}
              </div>
            </section>

            {/* Similar */}
            {similar.length > 0 && (
              <section className="mt-9">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="eyebrow">{t("provider.similar.eyebrow")}</p>
                    <h2 className="display mt-2 text-2xl">{t("provider.similar.title")}</h2>
                  </div>
                  <Link href={`/search?category=${provider.category.slug}`} className="link-underline text-[11px] font-semibold">
                    {t("provider.similar.seeAll")}
                  </Link>
                </div>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {similar.map((item) => (
                    <SearchResultCard
                      key={item.provider.id}
                      provider={item.provider}
                      distanceKm={item.distanceKm}
                      minPriceCents={item.minPriceCents}
                      openNow={isOpenNow(item.provider.hours)}
                      saved={savedIds.has(item.provider.id)}
                      isAuthed={Boolean(user)}
                      locale={locale}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sticky rail */}
          <aside className="lg:sticky lg:top-20">
            <div className="rounded-card border border-ink bg-surface p-5 shadow-[5px_5px_0_var(--color-ink)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.1em] text-muted">
                    {t("provider.aside.from")}
                  </span>
                  <p className="display text-3xl">
                    {lowestPrice !== null ? `$${Math.round(lowestPrice / 100)}` : t("provider.aside.ask")}
                  </p>
                </div>
                <Rating value={provider.ratingAvg} count={provider.ratingCount} size="md" locale={locale} />
              </div>
              <p className="mt-1 text-[10.5px] text-muted">
                {t("provider.aside.servicesNote", { count: provider.services.length })}
              </p>

              <div className="mt-3">
                <BookingDialog
                  providerId={provider.id}
                  providerName={provider.displayName}
                  services={provider.services.map((item) => ({
                    id: item.id,
                    name: item.name,
                    priceCents: item.priceCents,
                    priceType: item.priceType,
                    durationMin: item.durationMin,
                  }))}
                  locale={locale}
                  initialServiceId={service}
                  autoOpen={autoOpen}
                  defaultName={user?.name ?? ""}
                  defaultEmail={user?.email ?? ""}
                  defaultPhone={user?.phone ?? ""}
                  minDate={minBookingDate()}
                  action={createBookingRequest}
                />
              </div>
              <Link href="#services" className="btn btn-outline btn-block mt-2">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden /> {t("provider.aside.seeServices")}
              </Link>

              <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-muted">
                <CalendarDays className="h-3 w-3" aria-hidden />
                {t("provider.aside.responseNote", { hours: provider.responseTimeHours ?? 4 })}
              </div>

              <div className="mt-4 grid gap-2 border-t border-line pt-3 text-[10px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted">{t("provider.aside.today")}</span>
                  <span className="text-right font-medium">
                    {today
                      ? today.isClosed
                        ? t("provider.open.closed")
                        : `${today.opensAt} – ${today.closesAt}`
                      : t("provider.aside.notListed")}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted">{t("provider.aside.serviceArea")}</span>
                  <span className="text-right font-medium">
                    {provider.neighbourhood} + ~{provider.travelRadiusKm} km
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted">{t("provider.aside.atYourPlace")}</span>
                  <span className="text-right font-medium">
                    {provider.travelsToClient ? t("common.yes") : t("common.no")}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted">{t("provider.aside.languages")}</span>
                  <span className="text-right font-medium">{provider.languages}</span>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-[9px] leading-relaxed text-muted">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <LockKeyhole className="h-3 w-3" aria-hidden /> {t("provider.aside.privateTitle")}
                </span>
                {t("provider.aside.privateBody")}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-line bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    <BadgeCheck className="h-4 w-4" aria-hidden /> {t("provider.aside.checked")}
                  </p>
                  <p className="mt-1 text-[9px] text-muted">
                    {t("provider.aside.application", { id: provider.id.slice(-4).toUpperCase() })}
                  </p>
                </div>
                <span className="flex h-12 w-12 rotate-[-8deg] flex-col items-center justify-center rounded-full border border-dashed border-ink text-center font-mono text-[4.5px] uppercase leading-tight">
                  <span className="font-display text-[7px] font-semibold">HOLYDO</span>
                  {t("provider.aside.stamp")}
                </span>
              </div>
              <div className="mt-3 grid gap-1.5 text-[9.5px]">
                {approvalChecks.map((line) => (
                  <span key={line} className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-pine" aria-hidden /> {line}
                  </span>
                ))}
              </div>
              <Link href="/how-it-works#approval" className="mt-2 inline-block text-[9px] font-medium underline decoration-line underline-offset-2">
                {t("provider.aside.howApproval")}
              </Link>
            </div>

            <div className="mt-3 rounded-2xl border border-marigold/60 bg-marigold-soft/60 p-3.5 text-[9.5px] leading-relaxed text-ink/80">
              <strong className="font-semibold text-ink">{t("provider.aside.safetyTitle")}</strong>{" "}
              {t("provider.aside.safetyBody")}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky request bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-surface/95 px-3 py-2.5 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-muted">{t("provider.aside.from")}</p>
            <p className="text-base font-semibold">
              {lowestPrice !== null ? `$${Math.round(lowestPrice / 100)}` : t("provider.aside.ask")}
            </p>
          </div>
          <Link
            href={`/providers/${provider.slug}?request=1`}
            className="btn btn-primary flex-1 !py-2.5 text-xs"
          >
            {t("provider.mobile.request")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
