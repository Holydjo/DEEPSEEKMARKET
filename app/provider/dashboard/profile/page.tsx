import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, ImagePlus, Info, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
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
  const { provider: base } = await requireProvider();

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

  return (
    <div>
      {saved === "1" && (
        <div className="mb-4 rounded-xl border border-pine/20 bg-pine-soft px-4 py-3 text-[11px] font-medium text-pine">
          Profile saved.
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Public profile</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">Your storefront.</h1>
          <p className="mt-1 text-[11px] text-muted">
            What customers see, plus the private details we use for verification.
          </p>
        </div>
        {provider.status === "APPROVED" ? (
          <Link href={`/providers/${provider.slug}`} className="btn btn-outline btn-sm">
            <Eye className="h-3.5 w-3.5" aria-hidden /> View public profile
          </Link>
        ) : (
          <span className="pill"><ShieldCheck className="h-3 w-3" aria-hidden /> Private until approved</span>
        )}
      </div>

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto border-b border-line pb-2">
        {[
          ["#identity", "Identity"],
          ["#contact", "Contact"],
          ["#photos", "Photos"],
          ["#location", "Location & area"],
          ["#hours", "Hours"],
        ].map(([href, label]) => (
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
              <h2 className="text-xl">Identity &amp; story</h2>
              <p className="mt-1 text-[11px] text-muted">This is the heart of your public profile.</p>
            </div>
            <span className={`pill !text-[8.5px] ${hasPlaces ? "pill-pine" : "pill-marigold"}`}>
              {hasPlaces ? "Settings complete" : "Add a service setting"}
            </span>
          </div>

          <ActionForm action={updateProviderProfileAction} className="mt-4 grid gap-4">
            <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />

            <fieldset>
              <legend className="label">Provider type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ["INDEPENDENT", "Independent provider", "I work for myself."],
                  ["BUSINESS", "Business", "A registered business or team."],
                ].map(([value, label, hint]) => (
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
                <label htmlFor="displayName" className="label">Public display name</label>
                <input id="displayName" name="displayName" required minLength={2} maxLength={60} defaultValue={provider.displayName} className="input" />
              </div>
              <div>
                <label htmlFor="categoryId" className="label">Main category</label>
                <select id="categoryId" name="categoryId" defaultValue={provider.categoryId} className="input">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tagline" className="label">Tagline</label>
              <input id="tagline" name="tagline" maxLength={90} defaultValue={provider.tagline ?? ""} placeholder="Gentle braids, done with care" className="input" />
            </div>

            <div>
              <label htmlFor="about" className="label">About you &amp; your work</label>
              <textarea id="about" name="about" required minLength={80} maxLength={1200} defaultValue={provider.about} className="input textarea min-h-36" />
              <p className="mt-1 text-[9px] text-muted">Minimum 80 characters. Your own voice works better than a template.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="label">Phone (private)</label>
                <input id="phone" name="phone" required defaultValue={provider.phone} className="input" />
              </div>
              <div>
                <label htmlFor="email" className="label">Email (private)</label>
                <input id="email" name="email" type="email" required defaultValue={provider.email} className="input" />
              </div>
              <div>
                <label htmlFor="website" className="label">Website</label>
                <input id="website" name="website" type="url" defaultValue={provider.website ?? ""} placeholder="https://" className="input" />
              </div>
              <div>
                <label htmlFor="instagram" className="label">Instagram</label>
                <input id="instagram" name="instagram" defaultValue={provider.instagram ?? ""} placeholder="@yourstudio" className="input" />
              </div>
              <div>
                <label htmlFor="languages" className="label">Languages</label>
                <input id="languages" name="languages" required defaultValue={provider.languages} placeholder="English, French" className="input" />
              </div>
              <div>
                <label htmlFor="responseTimeHours" className="label">Typical reply time (hours)</label>
                <input id="responseTimeHours" name="responseTimeHours" type="number" min={1} max={72} defaultValue={provider.responseTimeHours ?? 4} className="input" />
              </div>
            </div>

            <div id="contact" className="scroll-mt-24">
              <p className="label">Where you welcome clients</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ["servesAtHome", "At my home studio", provider.servesAtHome],
                  ["servesAtSalon", "At a salon or studio", provider.servesAtSalon],
                  ["servesAtShop", "At my shop or storefront", provider.servesAtShop],
                  ["travelsToClient", "I travel to the client", provider.travelsToClient],
                ].map(([name, label, checked]) => (
                  <label key={String(name)} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 text-[11px] has-[:checked]:border-ink has-[:checked]:bg-marigold-soft/40">
                    <input type="checkbox" name={String(name)} value="1" defaultChecked={Boolean(checked)} className="h-3.5 w-3.5 accent-ink" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="max-w-md text-[9px] leading-relaxed text-muted">
                Changing your display name, business type or category may trigger a short re-review.
                Services, prices and hours go live immediately.
              </p>
              <SubmitButton className="btn btn-primary btn-sm" pendingLabel="Saving…">Save profile</SubmitButton>
            </div>
          </ActionForm>
        </section>

        {/* Photos */}
        <section id="photos" className="scroll-mt-24 card p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl">Photos</h2>
              <p className="mt-1 text-[11px] text-muted">Up to 8 photos. The first photo is your cover.</p>
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
                    <button className="flex h-7 w-7 items-center justify-center rounded-full border border-ink bg-surface/95 hover:bg-clay-soft" title="Remove photo">
                      <Trash2 className="h-3 w-3" aria-hidden />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2 p-6 text-center">
              <ImagePlus className="mx-auto h-5 w-5 text-muted" aria-hidden />
              <p className="mt-2 text-[11px] text-muted">Add at least one photo of your actual work.</p>
            </div>
          )}

          <ActionForm action={uploadProviderPhotoAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />
            <div>
              <label htmlFor="photo-upload" className="label">Add a photo</label>
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
              <label htmlFor="photo-alt" className="label">Description</label>
              <input id="photo-alt" name="alt" maxLength={120} placeholder="Knotless braids, finished" className="input !py-2 text-[10px]" />
            </div>
            <SubmitButton className="btn btn-dark btn-sm" pendingLabel="Uploading…">Upload</SubmitButton>
          </ActionForm>
          <p className="mt-2 text-[9px] text-muted">JPG, PNG or WebP · max 6 MB · original work only.</p>
        </section>

        {/* Location */}
        <section id="location" className="scroll-mt-24 card p-5 md:p-6">
          <h2 className="text-xl">Location &amp; travel area</h2>
          <p className="mt-1 text-[11px] text-muted">Your street address is private; customers see an approximate area.</p>

          <ActionForm action={saveLocationStep} className="mt-4 grid gap-4">
            <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />
            <div>
              <label htmlFor="addressLine" className="label">Private street address</label>
              <input id="addressLine" name="addressLine" required minLength={5} defaultValue={provider.addressLine} className="input" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="label">City</span>
                <div className="input flex items-center justify-between"><span>Montréal, QC</span><span className="text-[10px] text-muted">Launch city</span></div>
                <input type="hidden" name="city" value="montreal" />
              </div>
              <div>
                <label htmlFor="hood" className="label">Neighbourhood</label>
                <select id="hood" name="hood" defaultValue={hoodSlug} className="input">
                  {MONTREAL.neighbourhoods.map((hood) => (
                    <option key={hood.slug} value={hood.slug}>{hood.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="travelRadiusKm" className="label">Travel radius</label>
              <select id="travelRadiusKm" name="travelRadiusKm" defaultValue={provider.travelRadiusKm} className="input">
                {[1, 2, 3, 5, 8, 10, 15, 25, 40].map((km) => (
                  <option key={km} value={km}>Up to {km} km</option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="label">Neighbourhoods served</legend>
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
                Exact address is shared only after you accept a request.
              </p>
              <SubmitButton className="btn btn-primary btn-sm" pendingLabel="Saving…">Save location</SubmitButton>
            </div>
          </ActionForm>
        </section>

        {/* Hours */}
        <section id="hours" className="scroll-mt-24 card p-5 md:p-6">
          <h2 className="text-xl">Opening hours</h2>
          <p className="mt-1 text-[11px] text-muted">Set at least one open day. Customers see this as a guide, not a confirmed slot.</p>

          <ActionForm action={saveHoursStep} className="mt-4 grid gap-4">
            <input type="hidden" name="returnTo" value="/provider/dashboard/profile" />
            <div className="overflow-hidden rounded-xl border border-line">
              {WEEK_ORDER.map((day) => {
                const row = provider.hours.find((hour) => hour.dayOfWeek === day);
                const defaultClosed = row ? row.isClosed : day === 0 || day === 1;
                return (
                  <div key={day} className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line p-2.5 last:border-0 sm:grid-cols-[110px_1fr_1fr_auto]">
                    <span className="text-[11px] font-semibold">{dayName(day)}</span>
                    <input type="time" name={`open-${day}`} defaultValue={row?.opensAt ?? "09:00"} aria-label={`${dayName(day)} opening time`} className="input !py-2 text-[11px]" />
                    <input type="time" name={`close-${day}`} defaultValue={row?.closesAt ?? "17:00"} aria-label={`${dayName(day)} closing time`} className="input !py-2 text-[11px]" />
                    <label className="flex items-center gap-1.5 text-[9.5px] text-muted">
                      <input type="checkbox" name={`closed-${day}`} value="1" defaultChecked={defaultClosed} className="h-3 w-3 accent-ink" />
                      Closed
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[9px] text-muted">
                <MapPin className="h-3 w-3" aria-hidden /> Times are local to Montréal.
              </p>
              <SubmitButton className="btn btn-primary btn-sm" pendingLabel="Saving…">Save hours</SubmitButton>
            </div>
          </ActionForm>
        </section>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[9.5px] text-muted">
        <span>Category: <strong className="text-ink">{provider.category.name}</strong></span>
        <Link href="/provider/dashboard/services" className="inline-flex items-center gap-1 font-medium text-ink">
          Manage services <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
