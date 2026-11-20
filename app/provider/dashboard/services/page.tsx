import Link from "next/link";
import { ArrowRight, ChevronDown, ListChecks, Plus, Trash2 } from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { formatDuration, formatServicePrice } from "@/lib/format";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import {
  addServiceAction,
  deleteServiceAction,
  updateServiceAction,
} from "@/app/actions/provider";

export const dynamic = "force-dynamic";

export default async function ProviderServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [{ provider: base }, { locale, t }] = await Promise.all([
    requireProvider(),
    getTranslator(),
  ]);

  const services = await db.service.findMany({
    where: { providerId: base.id },
    orderBy: { sortOrder: "asc" },
  });

  const activeCount = services.filter((service) => service.isActive).length;
  const priceTypes: Array<[string, string]> = [
    ["FIXED", t("pcommon.priceFixed")],
    ["FROM", t("pcommon.priceFrom")],
    ["HOURLY", t("pcommon.priceHourly")],
  ];

  return (
    <div>
      {saved === "1" && (
        <div className="mb-4 rounded-xl border border-pine/20 bg-pine-soft px-4 py-3 text-[11px] font-medium text-pine">
          {t("pdash.servicesSaved")}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t("provider.services.eyebrow")}</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">{t("pdash.servicesTitle")}</h1>
          <p className="mt-1 text-[11px] text-muted">
            {activeCount === 1
              ? t("pdash.servicesSummaryOne", { count: activeCount })
              : t("pdash.servicesSummaryMany", { count: activeCount })}
          </p>
        </div>
        <Link href={`/providers/${base.slug}`} className="btn btn-outline btn-sm">
          <ListChecks className="h-3.5 w-3.5" aria-hidden /> {t("pcommon.viewPublic")}
        </Link>
      </div>

      <div className="mt-5 grid gap-4">
        <section className="card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl">{t("ponb.servicesSubtitle")}</h2>
            <span className="pill !text-[8.5px]">{t("pdash.servicesTotal", { count: services.length })}</span>
          </div>

          {services.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {services.map((service) => (
                <details key={service.id} className="group rounded-xl border border-line bg-paper">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-3.5 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-semibold">{service.name}</p>
                        <span className={`pill !text-[7.5px] ${service.isActive ? "pill-pine" : ""}`}>
                          {service.isActive ? t("pdash.servicesLive") : t("pdash.servicesHidden")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[9.5px] text-muted">
                        {formatServicePrice(service.priceCents, service.priceType, locale)}
                        {service.durationMin ? ` · ${formatDuration(service.durationMin)}` : ""}
                        {service.description ? ` · ${service.description}` : ""}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                  </summary>

                  <div className="border-t border-line p-3.5">
                    <ActionForm action={updateServiceAction} className="grid gap-3" locale={locale}>
                      <input type="hidden" name="serviceId" value={service.id} />
                      <div>
                        <label htmlFor={`name-${service.id}`} className="label">{t("pcommon.serviceName")}</label>
                        <input id={`name-${service.id}`} name="name" required defaultValue={service.name} className="input" />
                      </div>
                      <div>
                        <label htmlFor={`description-${service.id}`} className="label">{t("pcommon.description")}</label>
                        <input id={`description-${service.id}`} name="description" defaultValue={service.description ?? ""} className="input" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label htmlFor={`price-${service.id}`} className="label">{t("pcommon.price")}</label>
                          <input id={`price-${service.id}`} name="price" type="number" min="1" step="0.01" required defaultValue={(service.priceCents / 100).toFixed(2)} className="input" />
                        </div>
                        <div>
                          <label htmlFor={`type-${service.id}`} className="label">{t("pcommon.priceType")}</label>
                          <select id={`type-${service.id}`} name="priceType" defaultValue={service.priceType} className="input">
                            {priceTypes.map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`duration-${service.id}`} className="label">{t("pcommon.duration")}</label>
                          <input id={`duration-${service.id}`} name="durationMin" type="number" min="5" step="5" defaultValue={service.durationMin ?? ""} className="input" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-[10.5px]">
                        <input type="checkbox" name="isActive" value="1" defaultChecked={service.isActive} className="h-3.5 w-3.5 accent-ink" />
                        {t("pdash.servicesShowOnProfile")}
                      </label>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                        <p className="text-[9px] text-muted">{t("pdash.servicesSaveNote")}</p>
                        <div className="flex items-center gap-2">
                          <SubmitButton className="btn btn-outline btn-sm" pendingLabel={t("pcommon.saving")}>{t("pdash.servicesSaveChanges")}</SubmitButton>
                        </div>
                      </div>
                    </ActionForm>

                    <form action={deleteServiceAction} className="mt-2">
                      <input type="hidden" name="serviceId" value={service.id} />
                      <input type="hidden" name="returnTo" value="/provider/dashboard/services" />
                      <button className="inline-flex items-center gap-1 text-[9px] text-muted hover:text-clay">
                        <Trash2 className="h-3 w-3" aria-hidden /> {t("pdash.servicesDelete")}
                      </button>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-2 p-6 text-center">
              <ListChecks className="mx-auto h-5 w-5 text-muted" aria-hidden />
              <p className="mt-2 text-[11px] font-semibold">{t("pdash.servicesEmptyTitle")}</p>
              <p className="mt-1 text-[9.5px] text-muted">{t("pdash.servicesEmptyBody")}</p>
            </div>
          )}
        </section>

        <section className="card p-5 md:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-marigold-soft">
              <Plus className="h-3.5 w-3.5" aria-hidden />
            </span>
            <h2 className="text-xl">{t("pcommon.addServiceTitle")}</h2>
          </div>
          <ActionForm action={addServiceAction} className="mt-4 grid gap-3.5" locale={locale}>
            <input type="hidden" name="returnTo" value="/provider/dashboard/services" />
            <div>
              <label htmlFor="new-name" className="label">{t("pcommon.serviceName")}</label>
              <input id="new-name" name="name" required placeholder={t("pcommon.serviceNamePlaceholder")} className="input" />
            </div>
            <div>
              <label htmlFor="new-description" className="label">{t("pcommon.shortDescription")}</label>
              <input id="new-description" name="description" placeholder={t("pdash.servicesDescriptionPlaceholder")} className="input" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="new-price" className="label">{t("pcommon.price")}</label>
                <input id="new-price" name="price" type="number" min="1" step="1" required placeholder="120" className="input" />
              </div>
              <div>
                <label htmlFor="new-type" className="label">{t("pcommon.priceType")}</label>
                <select id="new-type" name="priceType" defaultValue="FROM" className="input">
                  {priceTypes.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="new-duration" className="label">{t("pcommon.duration")}</label>
                <input id="new-duration" name="durationMin" type="number" min="5" step="5" placeholder="240" className="input" />
              </div>
            </div>
            <SubmitButton className="btn btn-primary btn-sm sm:w-auto" pendingLabel={t("pcommon.adding")}>{t("pcommon.addServiceButton")}</SubmitButton>
          </ActionForm>
        </section>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[9.5px] text-muted">
        <span>{t("pdash.servicesFooter")}</span>
        <Link href="/provider/dashboard/profile" className="inline-flex items-center gap-1 font-medium text-ink">
          {t("pdash.servicesEditProfile")} <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
