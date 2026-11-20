import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  MapPin,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSavedProviderIds } from "@/lib/saved";
import {
  getCategoriesWithCounts,
  getFeaturedProviders,
  getNeighbourhoodCounts,
} from "@/lib/search";
import { MONTREAL, formatDistance } from "@/lib/location";
import { initials } from "@/lib/format";
import { getTranslator } from "@/lib/i18n/server";
import { categoryLabel } from "@/lib/i18n/categories";
import { SearchForm } from "@/components/search-form";
import { CategoryIcon } from "@/components/category-icon";
import { ProviderCard } from "@/components/provider-card";
import { Rating } from "@/components/rating";
import { VerifiedBadge } from "@/components/verified-badge";

export const dynamic = "force-dynamic";

const FEATURED_HOODS = [
  { slug: "le-plateau", image: "/images/places/plateau.jpg" },
  { slug: "rosemont", image: "/images/places/rosemont.jpg" },
  { slug: "villeray", image: "/images/places/villeray.jpg" },
  { slug: "little-burgundy", image: "/images/places/little-burgundy.jpg" },
];

export default async function HomePage() {
  const [{ locale, t }, user] = await Promise.all([getTranslator(), getCurrentUser()]);
  const [categories, featured, hoodCounts, providerStats, reviewCount, savedIds] = await Promise.all([
    getCategoriesWithCounts(),
    getFeaturedProviders(3),
    getNeighbourhoodCounts(),
    db.provider.aggregate({
      where: { status: "APPROVED" },
      _count: { _all: true },
      _avg: { ratingAvg: true },
    }),
    db.review.count({ where: { status: "PUBLISHED" } }),
    getSavedProviderIds(user?.id),
  ]);

  const heroProvider =
    featured.find((item) => item.provider.slug === "nadia-braids-studio") ?? featured[0];
  const approvedCount = providerStats._count._all;
  const avgRating =
    providerStats._avg.ratingAvg
      ?.toFixed(1)
      .replace(".", locale === "fr" ? "," : ".") ?? "—";

  const popular = [
    { label: t("home.popular.knotless"), q: "knotless" },
    { label: t("home.popular.deepClean"), q: "deep clean" },
    { label: t("home.popular.phoneRepair"), q: "phone" },
    { label: t("home.popular.silkPress"), q: "silk press" },
    { label: t("home.popular.kidsBraids"), q: "kids braids" },
  ];

  const trustChecks = [
    t("home.trust.check1"),
    t("home.trust.check2"),
    t("home.trust.check3"),
    t("home.trust.check4"),
  ];

  const applicationChecks: Array<[string, string]> = [
    [t("home.application.check1"), t("home.application.date1")],
    [t("home.application.check2"), t("home.application.date1")],
    [t("home.application.check3"), t("home.application.date2")],
  ];

  const dashboardRequests: Array<[string, string, string, boolean]> = [
    [t("home.dash.service1"), t("home.dash.when1"), t("home.dash.new"), true],
    [t("home.dash.service2"), t("home.dash.when2"), t("home.dash.new"), true],
    [t("home.dash.service3"), t("home.dash.when3"), t("home.dash.accepted"), false],
  ];

  const howSteps = [
    {
      n: "01",
      title: t("home.how.step1.title"),
      text: t("home.how.step1.text"),
      icon: Search,
    },
    {
      n: "02",
      title: t("home.how.step2.title"),
      text: t("home.how.step2.text"),
      icon: Star,
    },
    {
      n: "03",
      title: t("home.how.step3.title"),
      text: t("home.how.step3.text"),
      icon: BadgeCheck,
    },
  ];

  return (
    <>
      {/* ------------------------------------------------ HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full bg-marigold/25 blur-3xl"
          aria-hidden
        />
        <div className="container-hd relative grid items-center gap-10 py-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:py-16 lg:py-20">
          <div className="animate-rise">
            <p className="eyebrow">{t("home.hero.eyebrow")}</p>
            <h1 className="display text-hero mt-4">
              {t("home.hero.titleStart")}{" "}
              <span className="relative inline-block italic text-clay">
                {t("home.hero.titleAccent")}
                <svg
                  viewBox="0 0 300 14"
                  className="absolute -bottom-2 left-0 h-3 w-full text-marigold"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path d="M2 10c54-7 110-8 160-5 44 2 88 1 136-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-[470px] text-[15px] leading-relaxed text-muted">
              {t("home.hero.body")}
            </p>

            <div className="mt-6 max-w-[620px]">
              <SearchForm locale={locale} variant="hero" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                {t("home.popular")}
              </span>
              {popular.map((item) => (
                <Link
                  key={item.q}
                  href={`/search?q=${encodeURIComponent(item.q)}&hood=le-plateau`}
                  className="rounded-full border border-line bg-surface px-2.5 py-1.5 text-[10.5px] transition-colors hover:border-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                {["Nadia Bélanger", "Awa Diallo", "Aïcha Traoré", "Marc-Olivier Gagnon"].map((name, index) => (
                  <span
                    key={name}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper bg-surface-2 text-[8px] font-bold"
                    style={{ zIndex: 4 - index }}
                  >
                    {initials(name)}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted">
                <span className="font-semibold text-ink">
                  {t("home.hero.statProviders", { count: approvedCount })}
                </span>{" "}
                {t("home.hero.statRest", {
                  hoods: MONTREAL.neighbourhoods.length,
                  rating: avgRating,
                })}
              </p>
            </div>
          </div>

          {/* Collage */}
          <div className="relative mx-auto h-[420px] w-full max-w-[500px] sm:h-[500px] md:h-[560px]">
            <div className="absolute right-0 top-0 h-[82%] w-[78%] overflow-hidden rounded-[30px] border border-ink bg-surface-2 shadow-[6px_6px_0_var(--color-ink)]">
              <Image
                src="/images/hero-main.jpg"
                alt={t("home.hero.imageAlt")}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 400px"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-[6%] left-0 h-[38%] w-[42%] overflow-hidden rounded-2xl border-[3px] border-paper bg-surface-2 shadow-[0_10px_30px_-12px_rgba(23,19,15,.5)]">
              <Image
                src="/images/hero-detail.jpg"
                alt={t("home.hero.imageAlt2")}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>

            <div className="absolute right-3 top-[6%] flex h-[86px] w-[86px] rotate-[-9deg] flex-col items-center justify-center rounded-full border-[1.5px] border-dashed border-ink bg-paper/90 text-center font-mono text-[6.5px] uppercase leading-tight tracking-[0.08em]">
              <span>{t("home.collage.approvedBy")}</span>
              <span className="my-0.5 font-display text-[13px] font-semibold normal-case tracking-tight">HOLYDO</span>
              <span>{t("home.collage.date")}</span>
            </div>

            {heroProvider && (
              <Link
                href={`/providers/${heroProvider.provider.slug}`}
                className="absolute bottom-[6%] right-0 w-[62%] max-w-[250px] rounded-2xl border border-ink bg-surface p-3 shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <Rating
                    value={heroProvider.provider.ratingAvg}
                    count={heroProvider.provider.ratingCount}
                    locale={locale}
                  />
                  <VerifiedBadge compact locale={locale} />
                </div>
                <p className="mt-1.5 truncate font-sans text-sm font-semibold">
                  {heroProvider.provider.displayName}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {heroProvider.provider.neighbourhood}
                  {heroProvider.distanceKm !== null && (
                    <> · {formatDistance(heroProvider.distanceKm, locale)}</>
                  )}
                </p>
                <p className="mt-2 flex items-center justify-between border-t border-line pt-2 text-[11px]">
                  <span className="font-semibold">
                    {heroProvider.minPriceCents !== null
                      ? `${t("common.from")} $${Math.round(heroProvider.minPriceCents / 100)}`
                      : t("home.card.askPricing")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                    {t("common.view")} <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </span>
                </p>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ PROOF STRIP */}
      <div className="border-b border-line bg-surface">
        <div className="container-hd grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-baseline gap-2 px-1 py-3.5 sm:px-6">
            <span className="font-display text-2xl">{approvedCount}</span>
            <span className="text-[11px] text-muted">{t("home.proof.providers")}</span>
          </div>
          <div className="flex items-baseline gap-2 px-1 py-3.5 sm:px-6">
            <span className="font-display text-2xl">{MONTREAL.neighbourhoods.length}</span>
            <span className="text-[11px] text-muted">{t("home.proof.hoods")}</span>
          </div>
          <div className="flex items-baseline gap-2 px-1 py-3.5 sm:px-6">
            <span className="font-display text-2xl">{avgRating}<span className="text-sm">/5</span></span>
            <span className="text-[11px] text-muted">
              {t("home.proof.rating", { count: reviewCount })}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ CATEGORIES */}
      <section id="categories" className="section-pad">
        <div className="container-hd">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t("home.categories.eyebrow")}</p>
              <h2 className="display text-section mt-3">{t("home.categories.title")}</h2>
            </div>
            <Link href="/search" className="link-underline inline-flex items-center gap-1.5 text-xs font-semibold">
              {t("home.categories.all", { count: categories.length })}{" "}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-[2px_2px_0_var(--color-ink)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink bg-marigold-soft transition-colors group-hover:bg-marigold">
                  <CategoryIcon name={category.icon} className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">
                    {categoryLabel(locale, category.slug, category.name)}
                  </span>
                  <span className="block text-[10px] text-muted">
                    {category.providerCount === 1
                      ? t("home.category.providerOne", { count: category.providerCount })
                      : t("home.category.providerMany", { count: category.providerCount })}
                  </span>
                </span>
                <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ FEATURED */}
      <section className="border-y border-line bg-surface-2/45">
        <div className="container-hd section-pad">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t("home.featured.eyebrow")}</p>
              <h2 className="display text-section mt-3">{t("home.featured.title")}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="pill pill-dark">{t("home.featured.nearby")}</span>
              <span className="pill">{t("home.featured.topRated")}</span>
              <Link href="/search?hood=le-plateau" className="link-underline ml-2 text-xs font-semibold">
                {t("home.featured.seeAll")}
              </Link>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, index) => (
              <ProviderCard
                key={item.provider.id}
                provider={item.provider}
                distanceKm={item.distanceKm}
                minPriceCents={item.minPriceCents}
                openNow={item.openNow}
                priority={index === 0}
                saved={savedIds.has(item.provider.id)}
                isAuthed={Boolean(user)}
                locale={locale}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
            <p className="text-[11px] text-muted">
              <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-clay" aria-hidden />
              {t("home.featured.help")}
            </p>
            <Link href="/search" className="text-[11px] font-semibold underline decoration-line underline-offset-4">
              {t("home.featured.browseAll")}
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ TRUST */}
      <section className="relative overflow-hidden bg-pine text-paper">
        <div className="container-hd grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow !text-paper/75 before:!bg-paper/40">{t("home.trust.eyebrow")}</p>
            <h2 className="display mt-3 max-w-[560px] text-[clamp(2.1rem,4vw,3.4rem)] text-paper">
              {t("home.trust.title")}
            </h2>
            <p className="mt-4 max-w-[470px] text-sm leading-relaxed text-paper/70">
              {t("home.trust.body")}
            </p>
            <div className="mt-6 grid max-w-[500px] gap-2.5 sm:grid-cols-2">
              {trustChecks.map((item) => (
                <span key={item} className="flex items-center gap-2 text-[11.5px] text-paper/85">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-paper/40">
                    <Check className="h-2.5 w-2.5" aria-hidden />
                  </span>
                  {item}
                </span>
              ))}
            </div>
            <Link
              href="/how-it-works#approval"
              className="mt-6 inline-flex items-center gap-1.5 text-[11.5px] font-semibold underline decoration-paper/30 underline-offset-4 hover:decoration-paper"
            >
              {t("home.trust.link")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {heroProvider && (
            <div className="rounded-2xl border border-ink bg-surface p-4 text-ink shadow-[6px_6px_0_rgba(0,0,0,.35)] sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                  {t("home.application.label")}
                </span>
                <span className="pill pill-pine !text-[9px]">{t("home.application.approved")}</span>
              </div>
              <div className="flex items-center gap-3 py-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                  {initials(heroProvider.provider.displayName)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{heroProvider.provider.displayName}</p>
                  <p className="text-[10px] text-muted">
                    {heroProvider.provider.type === "BUSINESS"
                      ? t("common.business")
                      : t("common.independent")}{" "}
                    · {categoryLabel(locale, heroProvider.provider.category.slug, heroProvider.provider.category.name)}{" "}
                    · {heroProvider.provider.neighbourhood}
                  </p>
                </div>
              </div>
              <div className="grid gap-2.5 border-t border-line pt-3 text-[11px]">
                {applicationChecks.map(([label, date]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pine-soft text-pine">
                      <Check className="h-2.5 w-2.5" aria-hidden />
                    </span>
                    <span className="text-ink/85">{label}</span>
                    <span className="ml-auto shrink-0 font-mono text-[8px] uppercase text-muted">{date}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[10px] text-muted">
                  {t("home.application.reviewedBy")}{" "}
                  <span className="font-semibold text-ink">{t("home.application.reviewer")}</span>
                </span>
                <span className="flex h-11 w-11 rotate-[-8deg] flex-col items-center justify-center rounded-full border border-dashed border-ink text-center font-mono text-[5px] uppercase leading-tight">
                  <span className="font-display text-[8px] font-semibold">HOLYDO</span>
                  {t("home.application.stamp")}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ PROVIDER CTA */}
      <section className="border-y border-ink bg-marigold">
        <div className="container-hd grid items-center gap-8 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-14">
          <div>
            <p className="eyebrow !text-ink before:!bg-ink">{t("home.cta.eyebrow")}</p>
            <h2 className="display mt-3 max-w-[600px] text-[clamp(2rem,3.8vw,3.2rem)]">
              {t("home.cta.title")}
            </h2>
            <p className="mt-3 max-w-[470px] text-[13px] leading-relaxed text-ink/75">
              {t("home.cta.body")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/provider/join" className="btn btn-dark">
                {t("home.cta.button")} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <span className="text-[10px] text-ink/80">{t("home.cta.note")}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-ink bg-surface p-4 shadow-[5px_5px_0_var(--color-ink)] md:rotate-[1.2deg]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                  {t("home.dash.eyebrow")}
                </p>
                <p className="font-display text-lg">{t("home.dash.requests")}</p>
              </div>
              <span className="pill pill-pine">{t("home.dash.live")}</span>
            </div>
            <div className="mt-3 border-t border-line pt-3">
              {dashboardRequests.map(([service, when, status, isNew]) => (
                <div key={service} className="flex items-center justify-between gap-2 border-b border-line py-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[11.5px] font-semibold">{service}</p>
                    <p className="text-[9.5px] text-muted">{when}</p>
                  </div>
                  <span className={`pill !text-[8px] ${isNew ? "pill-marigold" : "pill-pine"}`}>
                    {status}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="text-[10px] text-muted">{t("home.dash.views")}</span>
                <span className="text-xs font-semibold">148 <span className="text-[9px] font-medium text-pine">↑ 22%</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ NEIGHBOURHOODS */}
      <section className="section-pad">
        <div className="container-hd">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t("home.hoods.eyebrow")}</p>
              <h2 className="display text-section mt-3">{t("home.hoods.title")}</h2>
            </div>
            <Link href="/search" className="link-underline text-xs font-semibold">
              {t("home.hoods.all")}
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {FEATURED_HOODS.map((item) => {
              const hood = MONTREAL.neighbourhoods.find((h) => h.slug === item.slug);
              if (!hood) return null;
              const count = hoodCounts.get(hood.name) ?? 0;
              return (
                <Link
                  key={hood.slug}
                  href={`/search?city=montreal&hood=${hood.slug}`}
                  className="group overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-[3px_3px_0_var(--color-ink)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={`${hood.name}, Montréal`}
                      fill
                      sizes="(max-width: 768px) 50vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3.5">
                    <p className="text-[13px] font-semibold">{hood.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {t(count === 1 ? "home.hoods.countOne" : "home.hoods.count", { count })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ HOW IT WORKS */}
      <section className="border-t border-line bg-surface">
        <div className="container-hd section-pad">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center before:hidden">{t("home.how.eyebrow")}</p>
            <h2 className="display text-section mt-3">{t("home.how.title")}</h2>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {howSteps.map((step) => (
              <div key={step.n} className="rounded-2xl border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink bg-marigold-soft">
                    <step.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="font-mono text-[10px] text-muted">{step.n}</span>
                </div>
                <h3 className="mt-5 text-lg">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
