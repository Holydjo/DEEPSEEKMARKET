import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  ImagePlus,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { placeLabel } from "@/lib/i18n/labels";
import type { MessageKey } from "@/lib/i18n/dictionary";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { CategoryIcon } from "@/components/category-icon";
import { MONTREAL } from "@/lib/location";
import { dayName, formatServicePrice, WEEK_ORDER } from "@/lib/format";
import { PLACE_OPTIONS } from "@/lib/constants";
import {
  addServiceAction,
  deleteProviderPhotoAction,
  deleteServiceAction,
  saveBusinessStep,
  saveHoursStep,
  saveLocationStep,
  submitProviderApplication,
  uploadProviderPhotoAction,
} from "@/app/actions/provider";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("ponb.metaTitle"), robots: { index: false } };
}

const STEPS: ReadonlyArray<{ key: string; n: number; labelKey: MessageKey }> = [
  { key: "account", n: 1, labelKey: "ponb.stepAccount" },
  { key: "business", n: 2, labelKey: "ponb.stepBusiness" },
  { key: "services", n: 3, labelKey: "ponb.stepServices" },
  { key: "photos", n: 4, labelKey: "ponb.stepPhotos" },
  { key: "location", n: 5, labelKey: "ponb.stepLocation" },
  { key: "hours", n: 6, labelKey: "ponb.stepHours" },
  { key: "review", n: 7, labelKey: "ponb.stepReview" },
] as const;

type StepKey = "account" | "business" | "services" | "photos" | "location" | "hours" | "review";

function stepHref(step: string) {
  return `/provider/onboarding?step=${step}`;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; saved?: string }>;
}) {
  const { step: requestedStep, saved } = await searchParams;
  const [{ provider: base }, { locale, t }] = await Promise.all([
    requireProvider(),
    getTranslator(),
  ]);

  if (base.status === "PENDING" || base.status === "APPROVED" || base.status === "SUSPENDED") {
    redirect("/provider/dashboard");
  }

  const provider = await db.provider.findUnique({
    where: { id: base.id },
    include: {
      category: true,
      services: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
      hours: true,
      areas: true,
    },
  });
  if (!provider) redirect("/provider/join");

  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const requested = STEPS.some((item) => item.key === requestedStep) ? (requestedStep as StepKey) : null;
  const current: StepKey = requested ?? "business";
  const currentIndex = STEPS.findIndex((item) => item.key === current);
  const currentStep = STEPS[currentIndex];
  const currentLabel = t(currentStep.labelKey);
  const progress = Math.round(((currentIndex + 1) / STEPS.length) * 100);

  const hasSettings =
    provider.servesAtHome || provider.servesAtSalon || provider.servesAtShop || provider.travelsToClient;
  const completion: Record<StepKey, boolean> = {
    account: true,
    business:
      provider.displayName.length > 1 &&
      provider.about.length >= 80 &&
      hasSettings &&
      Boolean(provider.categoryId),
    services: provider.services.length > 0,
    photos: provider.photos.length > 0,
    location: provider.addressLine.length >= 5 && provider.areas.length > 0,
    hours: provider.hours.some((hour) => !hour.isClosed),
    review:
      provider.about.length >= 80 &&
      provider.services.length > 0 &&
      provider.photos.length > 0 &&
      provider.addressLine.length >= 5 &&
      provider.hours.some((hour) => !hour.isClosed),
  };

  const hoodSlug = MONTREAL.neighbourhoods.find((hood) => hood.name === provider.neighbourhood)?.slug ?? "le-plateau";
  const lowest = provider.services.length
    ? Math.min(...provider.services.map((service) => service.priceCents))
    : null;
  const photo = provider.photos[0]?.url;

  const businessTypes: Array<[string, string, string]> = [
    ["INDEPENDENT", t("providerType.INDEPENDENT"), t("ponb.independentHint")],
    ["BUSINESS", t("providerType.BUSINESS"), t("ponb.businessHint")],
  ];
  const placeOptions: Array<[string, string, boolean]> = [
    ["servesAtHome", t("pcommon.placeHome"), provider.servesAtHome],
    ["servesAtSalon", t("ponb.placeSalonRent"), provider.servesAtSalon],
    ["servesAtShop", t("pcommon.placeShop"), provider.servesAtShop],
    ["travelsToClient", t("pcommon.placeTravel"), provider.travelsToClient],
  ];
  const reviewChecklist: Array<[string, boolean, string]> = [
    [t("ponb.checkAccount"), true, "/provider/dashboard/profile"],
    [t("ponb.checkProfile"), completion.business, stepHref("business")],
    [t("ponb.checkServices"), completion.services, stepHref("services")],
    [t("ponb.checkPhotos"), completion.photos, stepHref("photos")],
    [t("ponb.checkLocation"), completion.location, stepHref("location")],
    [t("ponb.checkHours"), completion.hours, stepHref("hours")],
  ];
  const checkItems = [
    t("ponb.checkIdentity"),
    t("ponb.checkServices"),
    t("ponb.checkOriginalPhotos"),
    t("ponb.checkLocationHours"),
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper/95">
        <div className="container-hd flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted sm:inline">
              {t("pcommon.application")}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <LocaleSwitcher locale={locale} compact />
            <Link href="/provider/dashboard" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("pcommon.saveExit")}
            </Link>
            <span className="hidden text-line sm:inline">·</span>
            <span className="hidden text-muted sm:inline">{t("ponb.needHelp")}</span>
          </div>
        </div>
      </header>

      <section aria-label={t("ponb.progressLabel")} className="border-b border-line bg-surface">
        <div className="container-hd py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[9px] text-paper">
                  {currentStep.n}
                </span>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                  {t("pcommon.stepProgress", { step: currentStep.n, total: 7, label: currentLabel })}
                </p>
              </div>
              <h1 className="display mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">
                {current === "business" && t("ponb.businessTitle")}
                {current === "services" && t("ponb.servicesTitle")}
                {current === "photos" && t("ponb.photosTitle")}
                {current === "location" && t("ponb.locationTitle")}
                {current === "hours" && t("ponb.hoursTitle")}
                {current === "review" && t("ponb.reviewTitle")}
              </h1>
            </div>
            <p className="text-[10px] text-muted">{t("ponb.autosave")}</p>
          </div>
          <div className="mt-3 flex gap-1" aria-hidden>
            {STEPS.map((item) => (
              <span
                key={item.key}
                className={`h-1.5 flex-1 rounded-full ${
                  item.n <= currentStep.n ? "bg-ink" : "bg-line"
                }`}
              />
            ))}
          </div>
          <p className="sr-only">{t("ponb.progress", { progress })}</p>
        </div>
      </section>

      {saved === "1" && (
        <div className="container-hd pt-3">
          <div role="status" className="rounded-xl border border-pine/20 bg-pine-soft px-4 py-2.5 text-[11px] font-medium text-pine">
            {t("ponb.saved")}
          </div>
        </div>
      )}

      {base.status === "REJECTED" && base.reviewNote && (
        <div className="container-hd pt-3">
          <div className="rounded-2xl border border-clay/30 bg-clay-soft p-4">
            <p className="text-[11px] font-semibold text-clay">{t("ponb.reviewerNote")}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-clay/85">{base.reviewNote}</p>
            <p className="mt-1 text-[9px] text-clay/70">{t("ponb.reviewerNoteHelp")}</p>
          </div>
        </div>
      )}

      <div className="container-hd grid gap-8 py-6 md:py-8 lg:grid-cols-[190px_minmax(0,1fr)_280px] lg:gap-7">
        {/* Step rail */}
        <aside aria-label={t("ponb.railTitle")} className="hidden lg:block">
          <div className="sticky top-6">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{t("ponb.railTitle")}</p>
            <div className="relative">
              <div className="absolute bottom-4 left-[9px] top-4 w-px bg-line" aria-hidden />
              <div className="relative grid gap-1">
                {STEPS.map((item) => {
                  const done = completion[item.key as StepKey];
                  const active = item.key === current;
                  return (
                    <Link
                      key={item.key}
                      href={item.key === "account" ? "/provider/dashboard/profile" : stepHref(item.key)}
                      className={`flex items-start gap-2.5 rounded-lg px-1.5 py-2 ${
                        active ? "bg-surface" : "hover:bg-surface/60"
                      }`}
                    >
                      <span
                        className={`relative z-10 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border text-[8px] ${
                          done
                            ? "border-pine bg-pine text-paper"
                            : active
                              ? "border-ink bg-marigold-soft text-ink"
                              : "border-line bg-paper text-muted"
                        }`}
                      >
                        {done ? <Check className="h-2.5 w-2.5" aria-hidden /> : item.n}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[10.5px] font-semibold ${active ? "text-ink" : "text-ink/70"}`}>
                          {t(item.labelKey)}
                        </span>
                        <span className="block text-[8px] text-muted">
                          {done
                            ? t("ponb.railComplete")
                            : active
                              ? t("ponb.railInProgress")
                              : item.key === "review"
                                ? t("ponb.railAdminReview")
                                : t("ponb.railRequired")}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3">
              <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted">{t("ponb.humanTitle")}</p>
              <p className="mt-1 text-[9px] leading-relaxed text-muted">
                {t("ponb.humanBody")}
              </p>
            </div>
          </div>
        </aside>

        {/* Step form */}
        <main className="min-w-0">
          {current === "business" && (
            <ActionForm action={saveBusinessStep} className="grid gap-4" locale={locale}>
              <section className="card p-5 md:p-6">
                <h2 className="text-xl">{t("ponb.typeTitle")}</h2>
                <p className="mt-1 text-[11px] text-muted">{t("ponb.typeHelp")}</p>

                <fieldset className="mt-5">
                  <legend className="label">{t("ponb.typeLegend")}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {businessTypes.map(([value, title, text]) => (
                      <label
                        key={value}
                        className="cursor-pointer rounded-xl border border-line bg-paper p-3.5 transition-colors has-[:checked]:border-ink has-[:checked]:bg-marigold-soft/50"
                      >
                        <input
                          type="radio"
                          name="type"
                          value={value}
                          defaultChecked={provider.type === value}
                          className="sr-only"
                        />
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold">{title}</span>
                          <span className="flex h-3 w-3 items-center justify-center rounded-full border border-ink">
                            {provider.type === value && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
                          </span>
                        </span>
                        <span className="mt-1 block text-[9.5px] leading-relaxed text-muted">{text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1.3fr_1fr]">
                  <div>
                    <label htmlFor="displayName" className="label">{t("ponb.displayName")} <span className="text-clay">*</span></label>
                    <input id="displayName" name="displayName" required minLength={2} maxLength={60} defaultValue={provider.displayName} className="input" />
                    <p className="mt-1 text-[9.5px] text-muted">{t("ponb.displayNameHelp")}</p>
                  </div>
                  <div>
                    <label htmlFor="categoryId" className="label">{t("ponb.category")} <span className="text-clay">*</span></label>
                    <select id="categoryId" name="categoryId" required defaultValue={provider.categoryId} className="input">
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[9.5px] text-muted">{t("ponb.categoryHelp")}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="tagline" className="label">{t("ponb.tagline")} <span className="font-normal normal-case tracking-normal text-muted">{t("common.optional")}</span></label>
                  <input id="tagline" name="tagline" maxLength={90} defaultValue={provider.tagline ?? ""} placeholder={t("ponb.taglinePlaceholder")} className="input" />
                </div>

                <div className="mt-4">
                  <label htmlFor="about" className="label">{t("ponb.about")} <span className="text-clay">*</span></label>
                  <textarea
                    id="about"
                    name="about"
                    required
                    minLength={80}
                    maxLength={1200}
                    defaultValue={provider.about}
                    placeholder={t("ponb.aboutPlaceholder")}
                    className="input textarea min-h-36"
                  />
                  <p className="mt-1 text-[9.5px] text-muted">{t("ponb.aboutHelp")}</p>
                </div>
              </section>

              <section className="card p-5 md:p-6">
                <h2 className="text-xl">{t("ponb.placesTitle")}</h2>
                <p className="mt-1 text-[11px] text-muted">{t("ponb.placesHelp")}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {placeOptions.map(([name, label, checked]) => (
                    <label key={name} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 text-[11px] has-[:checked]:border-ink has-[:checked]:bg-marigold-soft/40">
                      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="h-3.5 w-3.5 accent-ink" />
                      {label}
                    </label>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="label">{t("pcommon.city")}</span>
                    <div className="input flex items-center justify-between">
                      <span>Montréal, QC</span>
                      <span className="text-[10px] text-muted">{t("pcommon.launchCity")}</span>
                    </div>
                    <input type="hidden" name="city" value="montreal" />
                  </div>
                  <div>
                    <label htmlFor="hood" className="label">{t("pcommon.neighbourhood")} <span className="text-clay">*</span></label>
                    <select id="hood" name="hood" required defaultValue={hoodSlug} className="input">
                      {MONTREAL.neighbourhoods.map((hood) => (
                        <option key={hood.slug} value={hood.slug}>{hood.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-[9.5px] leading-relaxed text-muted">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  {t("ponb.addressNote")}
                </div>
              </section>

              <div className="flex items-center justify-between gap-3">
                <Link href="/provider/dashboard" className="btn btn-outline btn-sm">{t("pcommon.saveExit")}</Link>
                <SubmitButton className="btn btn-primary" pendingLabel={t("pcommon.saving")}>
                  {t("ponb.continueServices")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </SubmitButton>
              </div>
            </ActionForm>
          )}

          {current === "services" && (
            <div className="grid gap-4">
              <section className="card p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl">{t("ponb.servicesSubtitle")}</h2>
                    <p className="mt-1 text-[11px] text-muted">{t("ponb.servicesHelp")}</p>
                  </div>
                  <span className={`pill !text-[9px] ${completion.services ? "pill-pine" : "pill-marigold"}`}>
                    {t("ponb.servicesAdded", { count: provider.services.length })}
                  </span>
                </div>

                {provider.services.length > 0 ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-line">
                    {provider.services.map((service) => (
                      <div key={service.id} className="flex items-center gap-3 border-b border-line p-3 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold">{service.name}</p>
                          <p className="text-[9.5px] text-muted">
                            {formatServicePrice(service.priceCents, service.priceType, locale)}
                            {service.durationMin ? ` · ${service.durationMin} min` : ""}
                          </p>
                        </div>
                        <form action={deleteServiceAction}>
                          <input type="hidden" name="serviceId" value={service.id} />
                          <input type="hidden" name="returnTo" value={stepHref("services")} />
                          <button className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted hover:border-clay hover:text-clay" title={t("ponb.servicesRemove", { name: service.name })}>
                            <Trash2 className="h-3 w-3" aria-hidden />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2 p-5 text-center text-[10.5px] text-muted">
                    {t("ponb.servicesEmpty")}
                  </div>
                )}
              </section>

              <section className="card p-5 md:p-6">
                <h2 className="text-xl">{t("pcommon.addServiceTitle")}</h2>
                <ActionForm action={addServiceAction} className="mt-4 grid gap-3.5" locale={locale}>
                  <input type="hidden" name="returnTo" value={stepHref("services")} />
                  <div>
                    <label htmlFor="service-name" className="label">{t("pcommon.serviceName")} <span className="text-clay">*</span></label>
                    <input id="service-name" name="name" required placeholder={t("pcommon.serviceNamePlaceholder")} className="input" />
                  </div>
                  <div>
                    <label htmlFor="service-description" className="label">{t("pcommon.shortDescription")}</label>
                    <input id="service-description" name="description" placeholder={t("pcommon.serviceDescriptionPlaceholder")} className="input" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="service-price" className="label">{t("pcommon.price")} <span className="text-clay">*</span></label>
                      <input id="service-price" name="price" type="number" min="1" step="1" required placeholder="120" className="input" />
                    </div>
                    <div>
                      <label htmlFor="service-type" className="label">{t("pcommon.priceType")}</label>
                      <select id="service-type" name="priceType" className="input" defaultValue="FROM">
                        <option value="FIXED">{t("pcommon.priceFixed")}</option>
                        <option value="FROM">{t("pcommon.priceFrom")}</option>
                        <option value="HOURLY">{t("pcommon.priceHourly")}</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="service-duration" className="label">{t("pcommon.duration")}</label>
                      <input id="service-duration" name="durationMin" type="number" min="5" step="5" placeholder="240" className="input" />
                    </div>
                  </div>
                  <SubmitButton className="btn btn-primary btn-sm sm:w-auto" pendingLabel={t("pcommon.adding")}>
                    {t("pcommon.addServiceButton")}
                  </SubmitButton>
                </ActionForm>
              </section>

              <div className="flex items-center justify-between gap-3">
                <Link href={stepHref("business")} className="btn btn-outline btn-sm">← {t("common.back")}</Link>
                <Link
                  href={stepHref("photos")}
                  aria-disabled={!completion.services}
                  className={`btn btn-primary ${!completion.services ? "pointer-events-none opacity-40" : ""}`}
                >
                  {t("ponb.continuePhotos")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          )}

          {current === "photos" && (
            <div className="grid gap-4">
              <section className="card p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl">{t("ponb.photosSubtitle")}</h2>
                    <p className="mt-1 text-[11px] text-muted">{t("ponb.photosHelp")}</p>
                  </div>
                  <span className={`pill !text-[9px] ${completion.photos ? "pill-pine" : "pill-marigold"}`}>
                    {provider.photos.length} / 8
                  </span>
                </div>

                {provider.photos.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {provider.photos.map((photoItem) => (
                      <div key={photoItem.id} className="group relative overflow-hidden rounded-xl border border-line bg-surface-2">
                        <div className="relative aspect-square">
                          <Image src={photoItem.url} alt={photoItem.alt} fill sizes="(max-width: 768px) 45vw, 200px" className="object-cover" />
                        </div>
                        <form action={deleteProviderPhotoAction} className="absolute right-1.5 top-1.5">
                          <input type="hidden" name="photoId" value={photoItem.id} />
                          <input type="hidden" name="returnTo" value={stepHref("photos")} />
                          <button className="flex h-7 w-7 items-center justify-center rounded-full border border-ink bg-surface/95 text-ink hover:bg-clay-soft" title={t("ponb.photosRemove")}>
                            <Trash2 className="h-3 w-3" aria-hidden />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2 p-8 text-center">
                    <ImagePlus className="mx-auto h-6 w-6 text-muted" aria-hidden />
                    <p className="mt-2 text-[11px] font-semibold">{t("ponb.photosEmptyTitle")}</p>
                    <p className="mt-1 text-[9.5px] text-muted">{t("ponb.photosEmptyBody")}</p>
                  </div>
                )}
              </section>

              <section className="card p-5 md:p-6">
                <h2 className="text-xl">{t("ponb.uploadTitle")}</h2>
                <ActionForm action={uploadProviderPhotoAction} className="mt-4 grid gap-3.5" locale={locale}>
                  <input type="hidden" name="returnTo" value={stepHref("photos")} />
                  <div>
                    <label htmlFor="photo" className="label">{t("ponb.photoFile")} <span className="text-clay">*</span></label>
                    <input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                      className="block w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[11px] file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-[10px] file:font-semibold file:text-paper"
                    />
                  </div>
                  <div>
                    <label htmlFor="alt" className="label">{t("ponb.photoAlt")} <span className="font-normal normal-case tracking-normal text-muted">{t("common.optional")}</span></label>
                    <input id="alt" name="alt" maxLength={120} placeholder={t("ponb.photoAltPlaceholder")} className="input" />
                  </div>
                  <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-[9.5px] leading-relaxed text-muted">
                    <strong className="text-ink">{t("ponb.goodPhotosLabel")}</strong> {t("ponb.goodPhotosBody")}
                  </div>
                  <SubmitButton className="btn btn-primary btn-sm sm:w-auto" pendingLabel={t("pcommon.uploading")}>
                    {t("ponb.uploadPhoto")}
                  </SubmitButton>
                </ActionForm>
              </section>

              <div className="flex items-center justify-between gap-3">
                <Link href={stepHref("services")} className="btn btn-outline btn-sm">← {t("common.back")}</Link>
                <Link
                  href={stepHref("location")}
                  aria-disabled={!completion.photos}
                  className={`btn btn-primary ${!completion.photos ? "pointer-events-none opacity-40" : ""}`}
                >
                  {t("ponb.continueLocation")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          )}

          {current === "location" && (
            <ActionForm action={saveLocationStep} className="grid gap-4" locale={locale}>
              <section className="card p-5 md:p-6">
                <h2 className="text-xl">{t("pcommon.locationTitle")}</h2>
                <p className="mt-1 text-[11px] text-muted">{t("ponb.locationHelp")}</p>

                <div className="mt-4">
                  <label htmlFor="addressLine" className="label">{t("pcommon.privateAddress")} <span className="text-clay">*</span></label>
                  <input id="addressLine" name="addressLine" required minLength={5} defaultValue={provider.addressLine} placeholder="1240 Avenue du Mont-Royal E" className="input" />
                  <p className="mt-1 text-[9.5px] text-muted">{t("ponb.addressHelp")}</p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="label">{t("pcommon.city")}</span>
                    <div className="input flex items-center justify-between"><span>Montréal, QC</span><span className="text-[10px] text-muted">{t("pcommon.launchCity")}</span></div>
                    <input type="hidden" name="city" value="montreal" />
                  </div>
                  <div>
                    <label htmlFor="location-hood" className="label">{t("pcommon.neighbourhood")} <span className="text-clay">*</span></label>
                    <select id="location-hood" name="hood" required defaultValue={hoodSlug} className="input">
                      {MONTREAL.neighbourhoods.map((hood) => (
                        <option key={hood.slug} value={hood.slug}>{hood.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="travelRadiusKm" className="label">{t("ponb.travelRadius")} <span className="text-clay">*</span></label>
                  <select id="travelRadiusKm" name="travelRadiusKm" defaultValue={provider.travelRadiusKm} className="input">
                    {[1, 2, 3, 5, 8, 10, 15, 25, 40].map((km) => (
                      <option key={km} value={km}>{t("pcommon.upToKm", { km })}</option>
                    ))}
                  </select>
                </div>

                <fieldset className="mt-4">
                  <legend className="label">{t("ponb.areas")}</legend>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {MONTREAL.neighbourhoods.map((hood) => (
                      <label key={hood.slug} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-2 text-[10px] has-[:checked]:border-ink has-[:checked]:bg-marigold-soft/40">
                        <input
                          type="checkbox"
                          name="areas"
                          value={hood.name}
                          defaultChecked={provider.areas.some((area) => area.label === hood.name) || (!provider.areas.length && hood.slug === hoodSlug)}
                          className="h-3 w-3 accent-ink"
                        />
                        {hood.name}
                      </label>
                    ))}
                  </div>
                  <p className="mt-1 text-[9.5px] text-muted">{t("pcommon.areasHelp")}</p>
                </fieldset>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-[9.5px] leading-relaxed text-muted">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  {t("ponb.mapNote")}
                </div>
              </section>

              <div className="flex items-center justify-between gap-3">
                <Link href={stepHref("photos")} className="btn btn-outline btn-sm">← {t("common.back")}</Link>
                <SubmitButton className="btn btn-primary" pendingLabel={t("pcommon.saving")}>
                  {t("ponb.continueHours")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </SubmitButton>
              </div>
            </ActionForm>
          )}

          {current === "hours" && (
            <ActionForm action={saveHoursStep} className="grid gap-4" locale={locale}>
              <section className="card p-5 md:p-6">
                <h2 className="text-xl">{t("pcommon.hoursTitle")}</h2>
                <p className="mt-1 text-[11px] text-muted">{t("ponb.hoursHelp")}</p>

                <div className="mt-4 overflow-hidden rounded-xl border border-line">
                  {WEEK_ORDER.map((day) => {
                    const row = provider.hours.find((hour) => hour.dayOfWeek === day);
                    const defaultClosed = row ? row.isClosed : day === 0 || day === 1;
                    const label = dayName(day, locale);
                    return (
                      <div key={day} className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line p-2.5 last:border-0 sm:grid-cols-[110px_1fr_1fr_auto]">
                        <span className="text-[11px] font-semibold">{label}</span>
                        <input
                          type="time"
                          name={`open-${day}`}
                          defaultValue={row?.opensAt ?? "09:00"}
                          aria-label={t("pcommon.openingTime", { day: label })}
                          className="input !py-2 text-[11px] sm:col-auto"
                        />
                        <input
                          type="time"
                          name={`close-${day}`}
                          defaultValue={row?.closesAt ?? "17:00"}
                          aria-label={t("pcommon.closingTime", { day: label })}
                          className="input !py-2 text-[11px]"
                        />
                        <label className="flex items-center gap-1.5 text-[9.5px] text-muted">
                          <input type="checkbox" name={`closed-${day}`} value="1" defaultChecked={defaultClosed} className="h-3 w-3 accent-ink" />
                          {t("pcommon.closed")}
                        </label>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[9.5px] text-muted">
                  {t("ponb.hoursNote")}
                </p>
              </section>

              <div className="flex items-center justify-between gap-3">
                <Link href={stepHref("location")} className="btn btn-outline btn-sm">← {t("common.back")}</Link>
                <SubmitButton className="btn btn-primary" pendingLabel={t("pcommon.saving")}>
                  {t("ponb.continueReview")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </SubmitButton>
              </div>
            </ActionForm>
          )}

          {current === "review" && (
            <div className="grid gap-4">
              <section className="card p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl">{t("ponb.readyTitle")}</h2>
                    <p className="mt-1 text-[11px] text-muted">{t("ponb.readyHelp")}</p>
                  </div>
                  <span className="flex h-14 w-14 rotate-[-8deg] flex-col items-center justify-center rounded-full border border-dashed border-ink text-center font-mono text-[5.5px] uppercase leading-tight">
                    <span className="font-display text-[8px] font-semibold">HOLYDO</span>
                    {t("ponb.stamp")}
                  </span>
                </div>

                <div className="mt-5 grid gap-2">
                  {reviewChecklist.map(([label, done, href]) => (
                    <div key={label} className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full ${done ? "bg-pine text-paper" : "border border-line text-muted"}`}>
                        {done ? <Check className="h-2.5 w-2.5" aria-hidden /> : <span className="h-1 w-1 rounded-full bg-current" />}
                      </span>
                      <span className="text-[11px] font-medium">{label}</span>
                      <Link href={href} className="ml-auto text-[9px] text-muted underline decoration-line underline-offset-2">
                        {t("pcommon.edit")}
                      </Link>
                    </div>
                  ))}
                </div>

                {!completion.review && (
                  <div className="mt-4 rounded-xl border border-marigold/60 bg-marigold-soft/50 px-3 py-2.5 text-[10px] leading-relaxed text-ink/75">
                    {t("ponb.incomplete")}
                  </div>
                )}

                <div className="mt-5 rounded-xl bg-surface-2 p-4">
                  <p className="text-[11px] font-semibold">{t("ponb.afterTitle")}</p>
                  <ol className="mt-2 grid gap-1.5 text-[9.5px] leading-relaxed text-muted">
                    <li>1. {t("ponb.after1Before")} <strong className="text-ink">{t("ponb.after1Status")}</strong> {t("ponb.after1After")}</li>
                    <li>2. {t("ponb.after2")}</li>
                    <li>3. {t("ponb.after3")}</li>
                    <li>4. {t("ponb.after4")}</li>
                  </ol>
                </div>

                <ActionForm action={submitProviderApplication} className="mt-5" locale={locale}>
                  <SubmitButton
                    className="btn btn-primary btn-block"
                    pendingLabel={t("ponb.submitting")}
                    disabled={!completion.review}
                  >
                    {t("ponb.submit")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </SubmitButton>
                  <p className="mt-2 text-center text-[9px] text-muted">
                    {t("ponb.terms")}
                  </p>
                </ActionForm>
              </section>

              <Link href={stepHref("hours")} className="btn btn-outline btn-sm sm:w-auto">← {t("ponb.backHours")}</Link>
            </div>
          )}
        </main>

        {/* Live preview */}
        <aside aria-label={t("ponb.previewTitle")} className="hidden lg:block">
          <div className="sticky top-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{t("ponb.previewTitle")}</span>
              <Sparkles className="h-3.5 w-3.5 text-muted" aria-hidden />
            </div>
            <div className="overflow-hidden rounded-card border border-line bg-surface">
              <div className="relative aspect-[16/10] bg-surface-2">
                {photo ? (
                  <Image src={photo} alt={provider.displayName} fill sizes="280px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <CategoryIcon name={provider.category.icon} className="h-7 w-7 text-ink/30" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-semibold">{provider.displayName}</p>
                  <span className="verified !text-[7px]">{t("ponb.previewBadge")}</span>
                </div>
                <p className="mt-0.5 text-[9px] text-muted">
                  {provider.category.name} · {provider.type === "BUSINESS" ? t("providerType.BUSINESS") : t("common.independent")}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[9px] text-muted">
                  <MapPin className="h-2.5 w-2.5" aria-hidden /> {provider.neighbourhood}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {PLACE_OPTIONS.filter((option) =>
                    option.key === "home" ? provider.servesAtHome : option.key === "salon" ? provider.servesAtSalon : option.key === "shop" ? provider.servesAtShop : provider.travelsToClient,
                  ).slice(0, 2).map((option) => (
                    <span key={option.key} className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[8px]">{placeLabel(locale, option.key)}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
                  <span className="text-[10px] font-semibold">{lowest !== null ? t("price.from", { price: `$${Math.round(lowest / 100)}` }) : t("ponb.addServices")}</span>
                  <span className="rounded-full border border-line px-2 py-1 text-[8px]">{t("common.view")}</span>
                </div>
              </div>
            </div>
            <p className="mt-1.5 text-[8.5px] leading-relaxed text-muted">
              {t("ponb.previewNote")}
            </p>

            <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {t("pcommon.whatWeCheck")}
              </div>
              <div className="mt-2 grid gap-1.5 text-[9px] text-muted">
                {checkItems.map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="h-2.5 w-2.5 text-pine" aria-hidden /> {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[8.5px] text-muted">
              <Clock className="h-3 w-3" aria-hidden /> {t("ponb.previewTarget")}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[8.5px] text-muted">
              <BadgeCheck className="h-3 w-3" aria-hidden /> {t("ponb.previewHuman")}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile step strip */}
      <nav aria-label={t("ponb.progressLabel")} className="border-t border-line bg-surface lg:hidden">
        <div className="container-hd no-scrollbar flex gap-2 overflow-x-auto py-3">
          {STEPS.map((item) => (
            <Link
              key={item.key}
              href={item.key === "account" ? "/provider/dashboard/profile" : stepHref(item.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] ${
                item.key === current ? "border-ink bg-marigold-soft font-semibold" : "border-line bg-paper text-muted"
              }`}
            >
              {completion[item.key as StepKey] && <Check className="h-2.5 w-2.5 text-pine" aria-hidden />}
              {item.n}. {t(item.labelKey)}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
