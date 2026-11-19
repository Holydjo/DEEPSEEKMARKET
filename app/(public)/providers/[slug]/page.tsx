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
import { PROVIDER_TYPE_LABEL } from "@/lib/constants";
import { getProviderForPublicPage } from "@/lib/search";
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
  const provider = await db.provider.findFirst({
    where: { slug, status: "APPROVED" },
    include: { photos: { take: 1 }, category: true },
  });

  if (!provider) return { title: "Provider not found" };

  const title = `${provider.displayName} — ${provider.category.name} in ${provider.neighbourhood}`;
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

  const { provider, similar, distanceFromPlateau } = data;
  const user = await getCurrentUser();
  const savedIds = await getSavedProviderIds(user?.id);
  const isSaved = savedIds.has(provider.id);
  const existingReview = user
    ? await db.review.findUnique({
        where: {
          providerId_authorUserId: { providerId: provider.id, authorUserId: user.id },
        },
      })
    : null;

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

  const openLabel = open
    ? `Open today until ${today?.closesAt}`
    : today?.isClosed
      ? "Closed today"
      : next
        ? `Opens ${dayShort(next.dayOfWeek)} at ${next.opensAt}`
        : "Hours unavailable";

  const placeFacts = [
    provider.servesAtHome && { label: "Home studio", icon: Home },
    provider.servesAtSalon && { label: "Salon", icon: Store },
    provider.servesAtShop && { label: "Shop", icon: Store },
    provider.travelsToClient && { label: `Travels up to ${provider.travelRadiusKm} km`, icon: Truck },
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
    priceRange: lowestPrice ? `From $${Math.round(lowestPrice / 100)}` : undefined,
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

  return (
    <div className="pb-28 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-hd pt-4">
        <nav className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden>/</span>
          <Link href={`/search?category=${provider.category.slug}`} className="hover:text-ink">
            {provider.category.name}
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
                alt={provider.photos[0]?.alt || `${provider.displayName} at work`}
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
              {gallery.length || 1} {gallery.length === 1 ? "photo" : "photos"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1 md:grid-rows-2">
            {[1, 2].map((index) =>
              gallery[index] ? (
                <div key={index} className="relative aspect-square overflow-hidden rounded-[14px] border border-line bg-surface-2 md:aspect-auto md:h-full">
                  <Image
                    src={gallery[index]}
                    alt={provider.photos[index]?.alt || `${provider.displayName} work ${index}`}
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
          <main>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <VerifiedBadge />
                <span className="pill">{PROVIDER_TYPE_LABEL[provider.type] ?? "Provider"}</span>
                <span className={`pill ${open ? "pill-pine" : ""}`}>
                  <span className="status-dot" /> {openLabel}
                </span>
              </div>
              <SaveButton
                providerId={provider.id}
                initialSaved={isSaved}
                isAuthed={Boolean(user)}
                variant="button"
              />
            </div>

            <h1 className="display mt-3 text-[clamp(2.2rem,4.4vw,3.7rem)]">
              {provider.displayName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted">
              <Rating value={provider.ratingAvg} count={provider.ratingCount} size="md" />
              <span aria-hidden>·</span>
              <span>{provider.category.name}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {provider.neighbourhood}, {provider.city}
              </span>
              <span aria-hidden>·</span>
              <span className="font-medium text-ink">{formatDistance(distanceFromPlateau)} from Le Plateau</span>
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
                  Replies in ~{provider.responseTimeHours} h
                </span>
              )}
              <span className="pill">
                <Languages className="h-3 w-3" aria-hidden />
                {provider.languages}
              </span>
              <span className="pill">Since {new Date(provider.createdAt).getFullYear()}</span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-line py-3 text-[10px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3 w-3" aria-hidden /> Exact address shared after you request
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3" aria-hidden /> {provider.services.length} services reviewed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3" aria-hidden /> {gallery.length} photos checked
              </span>
            </div>

            {/* Services */}
            <section id="services" className="mt-7 scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="eyebrow">Services &amp; prices</p>
                  <h2 className="display mt-2 text-[clamp(1.8rem,3vw,2.5rem)]">Choose your service.</h2>
                </div>
                <span className="text-[10px] text-muted">CAD · taxes may apply</span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                Final price and duration are confirmed by {provider.displayName.split(" ")[0]} before the appointment.
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
                          {index === 0 && <span className="pill pill-marigold !text-[8px]">Most requested</span>}
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
                          {formatServicePrice(item.priceCents, item.priceType)}
                        </p>
                      </div>
                      <Link
                        href={`/providers/${provider.slug}?request=1&service=${item.id}`}
                        className="btn btn-primary btn-sm shrink-0 justify-center"
                      >
                        Request
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
                  Services are being updated. You can still send a request and ask for details.
                </p>
              )}
            </section>

            {/* Hours + area */}
            <section className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl">Opening hours</h2>
                  <span className={`pill ${open ? "pill-pine" : ""}`}>
                    <span className="status-dot" /> {open ? "Open now" : "Closed"}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted">Appointments only · last booking one hour before close</p>
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
                        <span>{dayName(day)}</span>
                        <span>{row.isClosed ? "Closed" : `${row.opensAt} – ${row.closesAt}`}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[9px] leading-relaxed text-muted">
                  Hours are set by the provider. A request is not a confirmed booking until they reply.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl">Service area</h2>
                  <span className="text-[9.5px] text-muted">~{provider.travelRadiusKm} km</span>
                </div>
                <p className="mt-1 text-[10px] text-muted">
                  Based in {provider.neighbourhood}. Approximate area shown.
                </p>
                <div className="mt-3">
                  <ProviderMap
                    points={[]}
                    origin={{ lat: provider.lat, lng: provider.lng }}
                    radiusKm={provider.travelRadiusKm}
                    heightClass="h-[168px]"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {provider.areas.map((area) => (
                    <span key={area.id} className="pill !text-[9px]">{area.label}</span>
                  ))}
                </div>
                <p className="mt-3 text-[9px] leading-relaxed text-muted">
                  Travel fee, if any, is stated before you confirm. Your exact address is only
                  shared after the provider accepts.
                </p>
              </div>
            </section>

            {/* Reviews */}
            <section id="reviews" className="mt-8 scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="eyebrow">Reviews</p>
                  <h2 className="display mt-2 text-[clamp(1.8rem,3vw,2.5rem)]">What clients say.</h2>
                </div>
                <span className="text-[10px] text-muted">
                  {provider.ratingCount} reviews · recent ones shown
                </span>
              </div>

              {review === "success" && (
                <div role="status" className="mt-4 rounded-xl border border-pine/25 bg-pine-soft px-4 py-3 text-xs font-medium text-pine">
                  Thank you — your review is live.
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-line bg-surface p-4 text-center">
                  <p className="display text-5xl">{provider.ratingAvg.toFixed(1)}</p>
                  <div className="mt-1 flex justify-center"><StarRow value={provider.ratingAvg} /></div>
                  <p className="mt-1 text-[10px] text-muted">{provider.ratingCount} reviews</p>
                  <p className="mt-2 border-t border-line pt-2 text-[9px] text-pine">
                    {provider.reviews.filter((r) => r.isVerified).length} recent verified
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
                              <p className="text-[8.5px] text-muted">{formatRelative(item.createdAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <StarRow value={item.rating} />
                            {item.isVerified && (
                              <p className="mt-1 text-[7.5px] font-semibold text-pine">Booked via HOLYDO</p>
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
                        <p className="mt-2 text-sm font-semibold">New on HOLYDO</p>
                        <p className="mt-1 text-[10px] text-muted">Be the first to book and review.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
                <h3 className="text-lg">Leave a review</h3>
                {!user ? (
                  <p className="mt-1 text-[11px] text-muted">
                    <Link href={`/login?next=/providers/${provider.slug}`} className="font-semibold text-ink underline decoration-line underline-offset-4">
                      Log in
                    </Link>{" "}
                    to share your experience. Reviews linked to a completed request are marked verified.
                  </p>
                ) : existingReview ? (
                  <p className="mt-1 text-[11px] text-muted">
                    You reviewed this provider on {formatDateTime(existingReview.createdAt)}.
                  </p>
                ) : (
                  <ActionForm action={createReview} className="mt-3 grid gap-3">
                    <input type="hidden" name="providerId" value={provider.id} />
                    <input type="hidden" name="slug" value={provider.slug} />
                    <fieldset>
                      <legend className="label">Your rating</legend>
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
                      <label htmlFor="review-body" className="label">Your experience</label>
                      <textarea
                        id="review-body"
                        name="body"
                        required
                        minLength={10}
                        className="input textarea"
                        placeholder="What was the service like? Would you recommend it to a neighbour?"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[9px] text-muted">One review per provider. Be honest and specific.</p>
                      <SubmitButton className="btn btn-dark btn-sm" pendingLabel="Publishing…">
                        Publish review
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
                    <p className="eyebrow">Nearby</p>
                    <h2 className="display mt-2 text-2xl">Similar providers</h2>
                  </div>
                  <Link href={`/search?category=${provider.category.slug}`} className="link-underline text-[11px] font-semibold">
                    See all →
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
                    />
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sticky rail */}
          <aside className="lg:sticky lg:top-20">
            <div className="rounded-card border border-ink bg-surface p-5 shadow-[5px_5px_0_var(--color-ink)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.1em] text-muted">From</span>
                  <p className="display text-3xl">
                    {lowestPrice !== null ? `$${Math.round(lowestPrice / 100)}` : "Ask"}
                  </p>
                </div>
                <Rating value={provider.ratingAvg} count={provider.ratingCount} size="md" />
              </div>
              <p className="mt-1 text-[10.5px] text-muted">
                {provider.services.length} services · final price confirmed before booking
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
                <MessageSquare className="h-3.5 w-3.5" aria-hidden /> See services first
              </Link>

              <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-muted">
                <CalendarDays className="h-3 w-3" aria-hidden />
                Usually replies in ~{provider.responseTimeHours ?? 4} h · free to request
              </div>

              <div className="mt-4 grid gap-2 border-t border-line pt-3 text-[10px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted">Today</span>
                  <span className="text-right font-medium">
                    {today ? (today.isClosed ? "Closed" : `${today.opensAt} – ${today.closesAt}`) : "Not listed"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted">Service area</span>
                  <span className="text-right font-medium">
                    {provider.neighbourhood} + ~{provider.travelRadiusKm} km
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted">At your place?</span>
                  <span className="text-right font-medium">{provider.travelsToClient ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted">Languages</span>
                  <span className="text-right font-medium">{provider.languages}</span>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-[9px] leading-relaxed text-muted">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <LockKeyhole className="h-3 w-3" aria-hidden /> Contact stays private
                </span>
                Your phone and email are shared with this provider only after you send a request.
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-line bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    <BadgeCheck className="h-4 w-4" aria-hidden /> Checked by HOLYDO
                  </p>
                  <p className="mt-1 text-[9px] text-muted">Application · HD-{provider.id.slice(-4).toUpperCase()}</p>
                </div>
                <span className="flex h-12 w-12 rotate-[-8deg] flex-col items-center justify-center rounded-full border border-dashed border-ink text-center font-mono text-[4.5px] uppercase leading-tight">
                  <span className="font-display text-[7px] font-semibold">HOLYDO</span>
                  APPROVED
                </span>
              </div>
              <div className="mt-3 grid gap-1.5 text-[9.5px]">
                {[
                  "Identity & contact confirmed",
                  `${provider.services.length} services & prices reviewed`,
                  `${gallery.length} photos checked`,
                  `Approved ${formatRelative(provider.reviewedAt ?? provider.createdAt)}`,
                ].map((line) => (
                  <span key={line} className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-pine" aria-hidden /> {line}
                  </span>
                ))}
              </div>
              <Link href="/how-it-works#approval" className="mt-2 inline-block text-[9px] font-medium underline decoration-line underline-offset-2">
                How approval works →
              </Link>
            </div>

            <div className="mt-3 rounded-2xl border border-marigold/60 bg-marigold-soft/60 p-3.5 text-[9.5px] leading-relaxed text-ink/80">
              <strong className="font-semibold text-ink">Safety first.</strong> Never send a
              deposit before the provider confirms the appointment details in writing. Report
              anything that feels off to hello@holydo.market.
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky request bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-surface/95 px-3 py-2.5 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wide text-muted">From</p>
            <p className="text-base font-semibold">
              {lowestPrice !== null ? `$${Math.round(lowestPrice / 100)}` : "Ask"}
            </p>
          </div>
          <Link
            href={`/providers/${provider.slug}?request=1`}
            className="btn btn-primary flex-1 !py-2.5 text-xs"
          >
            Request appointment <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
