import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, ImagePlus, Info, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { MONTREAL } from "@/lib/location";
import { dayName, WEEK_ORDER } from "@/lib/format";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import {
  deleteProviderPhotoAction,
  saveHoursStep,
  saveLocationStep,
  updateProviderProfileAction,
  uploadProviderPhotoAction,
} from "@/app/actions/provider";

export const dynamic = "force-dynamic";

export default async function ProviderProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [{ provider: base }, { locale, t }] = await Promise.all([
    requireProvider(),
    getTranslator(),
  ]);

  const provider = await db.provider.findUnique({
    where: { id: base.id },
    include: {
      category: true,
      photos: { orderBy: { sortOrder: "asc" } },
      hours: true,
      areas: true,
    },
  });
  if (!provider) return null;

  const categories = await db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const hoodSlug = MONTREAL.neighbourhoods.find((hood) => hood.name === provider.neighbourhood)?.slug ?? "le-plateau";
  const hasPlaces =
    provider.servesAtHome || provider.servesAtSalon || provider.servesAtShop || provider.travelsToClient;

  const tabs: Array<[string, string]> = [
    ["#identity", t("pdash.profileTabIdentity")],
    ["#contact", t("pdash.profileTabContact")],
    ["#photos", t("pdash.profileTabPhotos")],
    ["#location", t("pdash.profileTabLocation")],
    ["#hours", t("pdash.profileTabHours")],
  ];
  const providerTypes: Array<[string, string, string]> = [
    ["INDEPENDENT", t("providerType.INDEPENDENT"), t("pdash.profileIndependentHint")],
    ["BUSINESS", t("providerType.BUSINESS"), t("pdash.profileBusinessHint")],
  ];
  const placeOptions: Array<[string, string, boolean]> = [
    ["servesAtHome", t("pcommon.placeHome"), provider.servesAtHome],
    ["servesAtSalon", t("pdash.profilePlaceSalon"), provider.servesAtSalon],
    ["servesAtShop", t("pcommon.placeShop"), provider.servesAtShop],
    ["travelsToClient", t("pcommon.placeTravel"), provider.travelsToClient],
  ];

  return (
    <div>
      {saved === "1" && (
        <div className="mb-4 rounded-xl border border-pine/20 bg-pine-soft px-4 py-3 text-[11px] font-medium text-pine">
          {t("pdash.profileSaved")}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t("pdash.profileEyebrow")}</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">{t("pdash.profileTitle")}</h1>
          <p className="mt-1 text-[11px] text-muted">
            {t("pdash.profileSubtitle")}
          </p>
        </div>
        {provider.status === "APPROVED" ? (
          <Link href={`/providers/${provider.slug}`} className="btn btn-outline btn-sm">
            <Eye className="h-3.5 w-3.5" aria-hidden /> {t("pcommon.viewPublic")}
          </Link>
        ) : (
          <span className="pill"><ShieldCheck className="h-3 w-3" aria-hidden /> {t("pcommon.privateUntilApproved")}</span>
        )}
      </div>

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto border-b border-line pb-2">
        {tabs.map(([href, label]) => (
          <a key={href} href={href} className="shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 text-[9.5px] hover:border-ink">
            {label}
          </a>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {/* Identity */}
        <section id="identity" className="scroll-mt-24 card p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl">{t("pdash.profileIdentityTitle")}</h2>
              <p className="mt-1 text-[11px] text-muted">{t("pdash.profileIdentityHelp")}</p>
            </div>
            <span className={`pill !text-[8.5px] ${hasPlaces ? "pill-pine" : "pill-marigold"}`}>
              {hasPlaces ? t("pdash.profileSettingsComplete") : t("pdash.profileAddSetting")}
            </span>
          </div>

          <ActionForm action={updateProviderProfileAction} className="mt-4 grid gap-4" locale={locale}>
            <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />

            <fieldset>
              <legend className="label">{t("pdash.profileProviderType")}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {providerTypes.map(([value, label, hint]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-paper p-3 text-[11px] has-[:checked]:border-ink has-[:checked]:bg-marigold-soft/40">
                    <input type="radio" name="type" value={value} defaultChecked={provider.type === value} className="h-3.5 w-3.5 accent-ink" />
                    <span>
                      <span className="block font-semibold">{label}</span>
                      <span className="block text-[9px] text-muted">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
              <div>
                <label htmlFor="displayName" className="label">{t("ponb.displayName")}</label>
                <input id="displayName" name="displayName" required minLength={2} maxLength={60} defaultValue={provider.displayName} className="input" />
              </div>
              <div>
                <label htmlFor="categoryId" className="label">{t("ponb.category")}</label>
                <select id="categoryId" name="categoryId" defaultValue={provider.categoryId} className="input">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tagline" className="label">{t("pdash.profileTagline")}</label>
              <input id="tagline" name="tagline" maxLength={90} defaultValue={provider.tagline ?? ""} placeholder={t("ponb.taglinePlaceholder")} className="input" />
            </div>

            <div>
              <label htmlFor="about" className="label">{t("ponb.about")}</label>
              <textarea id="about" name="about" required minLength={80} maxLength={1200} defaultValue={provider.about} className="input textarea min-h-36" />
              <p className="mt-1 text-[9px] text-muted">{t("pdash.profileAboutHelp")}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="label">{t("pdash.profilePhone")}</label>
                <input id="phone" name="phone" required defaultValue={provider.phone} className="input" />
              </div>
              <div>
                <label htmlFor="email" className="label">{t("pdash.profileEmail")}</label>
                <input id="email" name="email" type="email" required defaultValue={provider.email} className="input" />
              </div>
              <div>
                <label htmlFor="website" className="label">{t("pdash.profileWebsite")}</label>
                <input id="website" name="website" type="url" defaultValue={provider.website ?? ""} placeholder="https://" className="input" />
              </div>
              <div>
                <label htmlFor="instagram" className="label">{t("pdash.profileInstagram")}</label>
                <input id="instagram" name="instagram" defaultValue={provider.instagram ?? ""} placeholder={t("pdash.profileInstagramPlaceholder")} className="input" />
              </div>
              <div>
                <label htmlFor="languages" className="label">{t("pdash.profileLanguages")}</label>
                <input id="languages" name="languages" required defaultValue={provider.languages} placeholder={t("pdash.profileLanguagesPlaceholder")} className="input" />
              </div>
              <div>
                <label htmlFor="responseTimeHours" className="label">{t("pdash.profileReplyTime")}</label>
                <input id="responseTimeHours" name="responseTimeHours" type="number" min={1} max={72} defaultValue={provider.responseTimeHours ?? 4} className="input" />
              </div>
            </div>

            <div id="contact" className="scroll-mt-24">
              <p className="label">{t("pdash.profilePlaces")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {placeOptions.map(([name, label, checked]) => (
                  <label key={name} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 text-[11px] has-[:checked]:border-ink has-[:checked]:bg-marigold-soft/40">
                    <input type="checkbox" name={name} value="1" defaultChecked={checked} className="h-3.5 w-3.5 accent-ink" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="max-w-md text-[9px] leading-relaxed text-muted">
                {t("pdash.profileReReviewNote")}
              </p>
              <SubmitButton className="btn btn-primary btn-sm" pendingLabel={t("pcommon.saving")}>{t("pdash.profileSave")}</SubmitButton>
            </div>
          </ActionForm>
        </section>

        {/* Photos */}
        <section id="photos" className="scroll-mt-24 card p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl">{t("pdash.profilePhotosTitle")}</h2>
              <p className="mt-1 text-[11px] text-muted">{t("pdash.profilePhotosHelp")}</p>
            </div>
            <span className={`pill !text-[9px] ${provider.photos.length > 0 ? "pill-pine" : "pill-marigold"}`}>
              {provider.photos.length} / 8
            </span>
          </div>

          {provider.photos.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {provider.photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-line bg-surface-2">
                  <div className="relative aspect-square">
                    <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 768px) 45vw, 180px" className="object-cover" />
                  </div>
                  <form action={deleteProviderPhotoAction} className="absolute right-1.5 top-1.5">
                    <input type="hidden" name="photoId" value={photo.id} />
                    <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />
                    <button className="flex h-7 w-7 items-center justify-center rounded-full border border-ink bg-surface/95 hover:bg-clay-soft" title={t("ponb.photosRemove")}>
                      <Trash2 className="h-3 w-3" aria-hidden />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2 p-6 text-center">
              <ImagePlus className="mx-auto h-5 w-5 text-muted" aria-hidden />
              <p className="mt-2 text-[11px] text-muted">{t("pdash.profilePhotosEmpty")}</p>
            </div>
          )}

          <ActionForm action={uploadProviderPhotoAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" locale={locale}>
            <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />
            <div>
              <label htmlFor="photo-upload" className="label">{t("pdash.profileAddPhoto")}</label>
              <input
                id="photo-upload"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                className="block w-full rounded-xl border border-line bg-surface px-2.5 py-2 text-[10px] file:mr-2 file:rounded-full file:border-0 file:bg-ink file:px-2.5 file:py-1 file:text-[9px] file:font-semibold file:text-paper"
              />
            </div>
            <div>
              <label htmlFor="photo-alt" className="label">{t("pdash.profilePhotoDescription")}</label>
              <input id="photo-alt" name="alt" maxLength={120} placeholder={t("pdash.profilePhotoAltPlaceholder")} className="input !py-2 text-[10px]" />
            </div>
            <SubmitButton className="btn btn-dark btn-sm" pendingLabel={t("pcommon.uploading")}>{t("pdash.profileUpload")}</SubmitButton>
          </ActionForm>
          <p className="mt-2 text-[9px] text-muted">{t("pdash.profilePhotoNote")}</p>
        </section>

        {/* Location */}
        <section id="location" className="scroll-mt-24 card p-5 md:p-6">
          <h2 className="text-xl">{t("pcommon.locationTitle")}</h2>
          <p className="mt-1 text-[11px] text-muted">{t("pdash.profileLocationHelp")}</p>

          <ActionForm action={saveLocationStep} className="mt-4 grid gap-4" locale={locale}>
            <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />
            <div>
              <label htmlFor="addressLine" className="label">{t("pcommon.privateAddress")}</label>
              <input id="addressLine" name="addressLine" required minLength={5} defaultValue={provider.addressLine} className="input" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="label">{t("pcommon.city")}</span>
                <div className="input flex items-center justify-between"><span>Montréal, QC</span><span className="text-[10px] text-muted">{t("pcommon.launchCity")}</span></div>
                <input type="hidden" name="city" value="montreal" />
              </div>
              <div>
                <label htmlFor="hood" className="label">{t("pcommon.neighbourhood")}</label>
                <select id="hood" name="hood" defaultValue={hoodSlug} className="input">
                  {MONTREAL.neighbourhoods.map((hood) => (
                    <option key={hood.slug} value={hood.slug}>{hood.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="travelRadiusKm" className="label">{t("pdash.profileTravelRadius")}</label>
              <select id="travelRadiusKm" name="travelRadiusKm" defaultValue={provider.travelRadiusKm} className="input">
                {[1, 2, 3, 5, 8, 10, 15, 25, 40].map((km) => (
                  <option key={km} value={km}>{t("pcommon.upToKm", { km })}</option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="label">{t("pdash.profileAreas")}</legend>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {MONTREAL.neighbourhoods.map((hood) => (
                  <label key={hood.slug} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-2 text-[10px] has-[:checked]:border-ink has-[:checked]:bg-marigold-soft/40">
                    <input type="checkbox" name="areas" value={hood.name} defaultChecked={provider.areas.some((area) => area.label === hood.name)} className="h-3 w-3 accent-ink" />
                    {hood.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="flex items-start gap-1.5 text-[9px] text-muted">
                <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                {t("pdash.profileAddressNote")}
              </p>
              <SubmitButton className="btn btn-primary btn-sm" pendingLabel={t("pcommon.saving")}>{t("pdash.profileSaveLocation")}</SubmitButton>
            </div>
          </ActionForm>
        </section>

        {/* Hours */}
        <section id="hours" className="scroll-mt-24 card p-5 md:p-6">
          <h2 className="text-xl">{t("pcommon.hoursTitle")}</h2>
          <p className="mt-1 text-[11px] text-muted">{t("pdash.profileHoursHelp")}</p>

          <ActionForm action={saveHoursStep} className="mt-4 grid gap-4" locale={locale}>
            <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />
            <div className="overflow-hidden rounded-xl border border-line">
              {WEEK_ORDER.map((day) => {
                const row = provider.hours.find((hour) => hour.dayOfWeek === day);
                const defaultClosed = row ? row.isClosed : day === 0 || day === 1;
                const label = dayName(day, locale);
                return (
                  <div key={day} className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line p-2.5 last:border-0 sm:grid-cols-[110px_1fr_1fr_auto]">
                    <span className="text-[11px] font-semibold">{label}</span>
                    <input type="time" name={`open-${day}`} defaultValue={row?.opensAt ?? "09:00"} aria-label={t("pcommon.openingTime", { day: label })} className="input !py-2 text-[11px]" />
                    <input type="time" name={`close-${day}`} defaultValue={row?.closesAt ?? "17:00"} aria-label={t("pcommon.closingTime", { day: label })} className="input !py-2 text-[11px]" />
                    <label className="flex items-center gap-1.5 text-[9.5px] text-muted">
                      <input type="checkbox" name={`closed-${day}`} value="1" defaultChecked={defaultClosed} className="h-3 w-3 accent-ink" />
                      {t("pcommon.closed")}
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[9px] text-muted">
                <MapPin className="h-3 w-3" aria-hidden /> {t("pdash.profileHoursLocal")}
              </p>
              <SubmitButton className="btn btn-primary btn-sm" pendingLabel={t("pcommon.saving")}>{t("pdash.profileSaveHours")}</SubmitButton>
            </div>
          </ActionForm>
        </section>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[9.5px] text-muted">
        <span>{t("pdash.profileCategoryLabel")} <strong className="text-ink">{provider.category.name}</strong></span>
        <Link href="/provider/dashboard/services" className="inline-flex items-center gap-1 font-medium text-ink">
          {t("pdash.linkServices")} <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
