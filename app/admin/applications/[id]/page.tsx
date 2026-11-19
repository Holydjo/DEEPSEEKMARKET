import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock,
  ExternalLink,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatDateTime, formatRelative, dayName, WEEK_ORDER, initials } from "@/lib/format";
import { PROVIDER_STATUS_LABEL, PROVIDER_TYPE_LABEL } from "@/lib/constants";
import { approveProviderAction, rejectProviderAction, reinstateProviderAction, suspendProviderAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  APPROVE: "Approved",
  REJECT: "Requested changes",
  SUSPEND: "Suspended",
  REINSTATE: "Reinstated",
  HIDE_REVIEW: "Hid a review",
  PUBLISH_REVIEW: "Published a review",
};

function statusTone(status: string): string {
  if (status === "APPROVED") return "pill-pine";
  if (status === "PENDING") return "pill-marigold";
  if (status === "REJECTED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "SUSPENDED") return "pill-dark";
  return "";
}

export default async function AdminApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const { id } = await params;
  const { done, error } = await searchParams;

  const provider = await db.provider.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      category: true,
      reviewedBy: { select: { name: true } },
      services: { orderBy: { sortOrder: "asc" } },
      photos: { orderBy: { sortOrder: "asc" } },
      hours: true,
      areas: true,
      adminActions: {
        include: { admin: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!provider) notFound();

  const hasSettings =
    provider.servesAtHome || provider.servesAtSalon || provider.servesAtShop || provider.travelsToClient;
  const openDays = provider.hours.filter((hour) => !hour.isClosed);

  const checklist = [
    ["Identity & contact", Boolean(provider.user.email && provider.phone)],
    ["Public profile", provider.displayName.length > 1 && provider.about.length >= 80],
    ["Services & prices", provider.services.length > 0],
    ["Photos", provider.photos.length > 0],
    ["Location", provider.addressLine.length >= 5 && provider.areas.length > 0],
    ["Opening hours", openDays.length > 0],
    ["Service settings", hasSettings],
  ] as const;

  return (
    <div>
      <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-[10px] text-muted hover:text-ink">
        <ArrowLeft className="h-3 w-3" aria-hidden /> All applications
      </Link>

      {done && (
        <div className="mt-3 rounded-xl border border-pine/20 bg-pine-soft px-4 py-3 text-[11px] font-medium text-pine">
          {done === "approved" && "Profile approved and made public."}
          {done === "rejected" && "Changes requested. The provider will see your note."}
        </div>
      )}
      {error === "note" && (
        <div className="mt-3 rounded-xl border border-clay/25 bg-clay-soft px-4 py-3 text-[11px] font-medium text-clay">
          Add a note explaining what needs to change before requesting changes.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
            {initials(provider.displayName)}
          </span>
          <div>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
              Application · HD-{provider.id.slice(-4).toUpperCase()}
            </p>
            <h1 className="display mt-1 text-[clamp(1.8rem,3.3vw,2.5rem)]">{provider.displayName}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted">
              <span className={`pill !text-[8px] ${statusTone(provider.status)}`}>
                {PROVIDER_STATUS_LABEL[provider.status as keyof typeof PROVIDER_STATUS_LABEL] ?? provider.status}
              </span>
              <span>{PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}</span>
              <span>·</span>
              <span>{provider.category.name}</span>
              <span>·</span>
              <span>{provider.neighbourhood}, {provider.city}</span>
            </p>
          </div>
        </div>
        {provider.status === "APPROVED" && (
          <Link href={`/providers/${provider.slug}`} className="btn btn-outline btn-sm">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Public profile
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="grid gap-3">
          {/* Photos */}
          {provider.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {provider.photos.slice(0, 3).map((photo) => (
                <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface-2">
                  <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 768px) 33vw, 260px" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <section className="card p-4 md:p-5">
            <h2 className="text-lg">The profile</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{provider.about || "No about section yet."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {provider.servesAtHome && <span className="pill">Home studio</span>}
              {provider.servesAtSalon && <span className="pill">Salon</span>}
              {provider.servesAtShop && <span className="pill">Shop</span>}
              {provider.travelsToClient && <span className="pill">Travels to client · ~{provider.travelRadiusKm} km</span>}
            </div>
            <div className="mt-4 grid gap-2 border-t border-line pt-3 text-[10px] sm:grid-cols-2">
              <p><span className="text-muted">Applicant:</span> {provider.user.name}</p>
              <p><span className="text-muted">Email:</span> {provider.user.email}</p>
              <p><span className="text-muted">Phone:</span> {provider.phone}</p>
              <p><span className="text-muted">Public email:</span> {provider.email}</p>
              <p><span className="text-muted">Private address:</span> {provider.addressLine}</p>
              <p><span className="text-muted">Language(s):</span> {provider.languages}</p>
            </div>
          </section>

          <section className="card p-4 md:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Services &amp; prices</h2>
              <span className="text-[9px] text-muted">{provider.services.length} services</span>
            </div>
            <div className="mt-2 divide-y divide-line">
              {provider.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between gap-2 py-2 text-[10.5px] first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    {service.description && <p className="text-[9px] text-muted">{service.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(service.priceCents / 100).toFixed(0)}</p>
                    <p className="text-[8px] text-muted">{service.priceType}{service.durationMin ? ` · ${service.durationMin} min` : ""}</p>
                  </div>
                </div>
              ))}
              {provider.services.length === 0 && <p className="py-2 text-[10px] text-muted">No services.</p>}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="card p-4">
              <h2 className="flex items-center gap-1.5 text-lg"><Clock className="h-4 w-4" aria-hidden /> Hours</h2>
              <div className="mt-2 grid gap-1 text-[10px]">
                {WEEK_ORDER.map((day) => {
                  const row = provider.hours.find((hour) => hour.dayOfWeek === day);
                  return (
                    <div key={day} className="flex items-center justify-between border-b border-line py-1 last:border-0">
                      <span>{dayName(day)}</span>
                      <span className={row?.isClosed ? "text-muted" : "font-medium"}>
                        {row?.isClosed ? "Closed" : row ? `${row.opensAt} – ${row.closesAt}` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card p-4">
              <h2 className="flex items-center gap-1.5 text-lg"><MapPin className="h-4 w-4" aria-hidden /> Service area</h2>
              <p className="mt-1 text-[9.5px] text-muted">
                Base: {provider.neighbourhood} · radius ~{provider.travelRadiusKm} km
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {provider.areas.map((area) => (
                  <span key={area.id} className="pill !text-[8.5px]">{area.label}</span>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-surface-2 px-2.5 py-2 text-[8.5px] leading-relaxed text-muted">
                Exact address is private on the public profile. Confirm the area makes sense for
                the declared travel radius.
              </div>
            </section>
          </div>
        </div>

        {/* Decision rail */}
        <aside className="grid gap-3 lg:sticky lg:top-20">
          <section className="card p-4">
            <h2 className="flex items-center gap-1.5 text-lg"><ShieldCheck className="h-4 w-4" aria-hidden /> Review checklist</h2>
            <div className="mt-3 grid gap-1.5">
              {checklist.map(([label, done]) => (
                <div key={label} className="flex items-center gap-2 text-[10px]">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${done ? "bg-pine text-paper" : "border border-clay/40 bg-clay-soft text-clay"}`}>
                    {done ? <Check className="h-2.5 w-2.5" aria-hidden /> : <X className="h-2.5 w-2.5" aria-hidden />}
                  </span>
                  <span className={done ? "text-ink" : "text-clay"}>{label}</span>
                </div>
              ))}
            </div>
            {provider.submittedAt && (
              <p className="mt-3 border-t border-line pt-2 text-[8.5px] text-muted">
                Submitted {formatDateTime(provider.submittedAt)}
              </p>
            )}
          </section>

          <section className="card p-4">
            <h2 className="text-lg">Decision</h2>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
              Approving publishes the profile immediately. Requesting changes keeps it private
              and shows your note to the provider.
            </p>

            {(provider.status === "PENDING" || provider.status === "REJECTED") && (
              <div className="mt-3 grid gap-4">
                <form action={approveProviderAction} className="grid gap-2">
                  <input type="hidden" name="providerId" value={provider.id} />
                  <label htmlFor="approve-note" className="label">Internal approval note <span className="font-normal normal-case tracking-normal text-muted">(optional)</span></label>
                  <input id="approve-note" name="note" placeholder="Identity and portfolio checked." className="input !py-2 text-[10px]" />
                  <button className="btn btn-primary btn-sm">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Approve &amp; publish
                  </button>
                </form>

                {provider.status === "PENDING" && (
                  <form action={rejectProviderAction} className="grid gap-2 border-t border-line pt-3">
                    <input type="hidden" name="providerId" value={provider.id} />
                    <label htmlFor="reject-note" className="label">What needs to change? <span className="text-clay">*</span></label>
                    <textarea
                      id="reject-note"
                      name="note"
                      required
                      minLength={5}
                      placeholder="Please add two more photos of your own work and confirm the salon address."
                      className="input textarea min-h-20 text-[10px]"
                    />
                    <button className="btn btn-outline btn-sm">
                      <X className="h-3.5 w-3.5" aria-hidden /> Request changes
                    </button>
                  </form>
                )}
              </div>
            )}

            {provider.status === "APPROVED" && (
              <form action={suspendProviderAction} className="mt-3 grid gap-2">
                <input type="hidden" name="providerId" value={provider.id} />
                <label htmlFor="suspend-note" className="label">Suspension reason <span className="text-clay">*</span></label>
                <textarea id="suspend-note" name="note" required minLength={5} className="input textarea min-h-20 text-[10px]" placeholder="Reason shown to the provider." />
                <button className="btn btn-outline btn-sm"><X className="h-3.5 w-3.5" aria-hidden /> Suspend profile</button>
              </form>
            )}

            {provider.status === "SUSPENDED" && (
              <form action={reinstateProviderAction} className="mt-3 grid gap-2">
                <input type="hidden" name="providerId" value={provider.id} />
                <label htmlFor="reinstate-note" className="label">Reinstatement note</label>
                <input id="reinstate-note" name="note" className="input !py-2 text-[10px]" placeholder="Issue resolved." />
                <button className="btn btn-primary btn-sm"><BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Reinstate profile</button>
              </form>
            )}

            {provider.reviewNote && (
              <div className="mt-3 rounded-lg border border-line bg-surface-2 px-2.5 py-2 text-[9px] leading-relaxed text-muted">
                <strong className="text-ink">Latest note:</strong> {provider.reviewNote}
                {provider.reviewedBy && (
                  <span className="mt-1 block text-[8px]">
                    {provider.reviewedBy.name} · {provider.reviewedAt ? formatRelative(provider.reviewedAt) : ""}
                  </span>
                )}
              </div>
            )}
          </section>

          <section className="card p-4">
            <h2 className="text-lg">Audit trail</h2>
            {provider.adminActions.length > 0 ? (
              <div className="mt-2 grid gap-2">
                {provider.adminActions.map((action) => (
                  <div key={action.id} className="border-b border-line pb-2 text-[9px] last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink">{ACTION_LABEL[action.action] ?? action.action}</span>
                      <span className="text-muted">{formatRelative(action.createdAt)}</span>
                    </div>
                    <p className="text-[8px] text-muted">by {action.admin.name}</p>
                    {action.note && <p className="mt-0.5 text-[8.5px] text-ink-soft">{action.note}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[9px] text-muted">No decisions yet.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
