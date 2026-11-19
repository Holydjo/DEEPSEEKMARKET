import Link from "next/link";
import { CalendarCheck, Check, Clock, Mail, Phone, X } from "lucide-react";
import { requireProvider } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime, initials } from "@/lib/format";
import { BOOKING_STATUS_LABEL, PREFERRED_WINDOW_LABEL } from "@/lib/constants";
import { updateRequestStatusAction } from "@/app/actions/provider";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "PENDING", "ACCEPTED", "COMPLETED", "DECLINED"] as const;

function statusTone(status: string): string {
  if (status === "ACCEPTED") return "pill-pine";
  if (status === "DECLINED" || status === "CANCELLED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "COMPLETED") return "pill-dark";
  return "pill-marigold";
}

export default async function ProviderRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; updated?: string; error?: string }>;
}) {
  const { status, updated, error } = await searchParams;
  const { provider } = await requireProvider();

  const activeFilter = FILTERS.includes((status ?? "ALL") as (typeof FILTERS)[number])
    ? (status ?? "ALL")
    : "ALL";

  const [requests, grouped] = await Promise.all([
    db.bookingRequest.findMany({
      where: {
        providerId: provider.id,
        ...(activeFilter === "ALL" ? {} : { status: activeFilter }),
      },
      include: { service: true },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    db.bookingRequest.groupBy({
      by: ["status"],
      where: { providerId: provider.id },
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));
  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);
  const statusOrder: Record<string, number> = {
    PENDING: 0,
    ACCEPTED: 1,
    COMPLETED: 2,
    DECLINED: 3,
    CANCELLED: 4,
  };
  const sortedRequests = [...requests].sort(
    (a, b) =>
      (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9) ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return (
    <div>
      {updated === "1" && (
        <div className="mb-4 rounded-xl border border-pine/20 bg-pine-soft px-4 py-3 text-[11px] font-medium text-pine">
          Request updated. The customer will see the new status when they check their request.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-clay/25 bg-clay-soft px-4 py-3 text-[11px] font-medium text-clay">
          That update could not be applied. Refresh and try again.
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">Appointment requests.</h1>
          <p className="mt-1 text-[11px] text-muted">
            {counts.get("PENDING") ?? 0} waiting · {total} total. Reply with a clear next step.
          </p>
        </div>
        <span className="pill pill-pine !text-[9px]">No commission on requests</span>
      </div>

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto border-b border-line pb-2">
        {FILTERS.map((filter) => {
          const count = filter === "ALL" ? total : counts.get(filter) ?? 0;
          return (
            <Link
              key={filter}
              href={filter === "ALL" ? "/provider/dashboard/requests" : `/provider/dashboard/requests?status=${filter}`}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[9.5px] ${
                activeFilter === filter ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-soft hover:border-ink"
              }`}
            >
              {filter === "ALL" ? "All" : BOOKING_STATUS_LABEL[filter] ?? filter}
              <span className={`ml-1.5 ${activeFilter === filter ? "text-paper/60" : "text-muted"}`}>{count}</span>
            </Link>
          );
        })}
      </div>

      {requests.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {sortedRequests.map((request) => (
            <article key={request.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-[9px] font-bold">
                    {initials(request.name)}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold">{request.name}</p>
                    <p className="text-[9px] text-muted">
                      {formatDateTime(request.createdAt)} · ref {request.reference}
                    </p>
                  </div>
                </div>
                <span className={`pill !text-[8px] ${statusTone(request.status)}`}>
                  {BOOKING_STATUS_LABEL[request.status] ?? request.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 rounded-xl bg-surface-2 p-3 sm:grid-cols-3">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.1em] text-muted">Service</p>
                  <p className="mt-0.5 text-[11px] font-medium">{request.service?.name ?? "To confirm"}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.1em] text-muted">Preferred date</p>
                  <p className="mt-0.5 text-[11px] font-medium">{formatDate(request.preferredDate)}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.1em] text-muted">Window</p>
                  <p className="mt-0.5 text-[11px] font-medium">
                    {PREFERRED_WINDOW_LABEL[request.preferredWindow] ?? request.preferredWindow}
                  </p>
                </div>
              </div>

              {request.message && (
                <div className="mt-2.5 border-l-2 border-marigold pl-3 text-[10.5px] leading-relaxed text-ink-soft">
                  “{request.message}”
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-[9.5px]">
                <a href={`mailto:${request.email}`} className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                  <Mail className="h-3 w-3" aria-hidden /> {request.email}
                </a>
                <a href={`tel:${request.phone}`} className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                  <Phone className="h-3 w-3" aria-hidden /> {request.phone}
                </a>
                <span className="ml-auto inline-flex items-center gap-1 text-[8.5px] text-muted">
                  <CalendarCheck className="h-3 w-3" aria-hidden /> {formatDate(request.preferredDate)}
                </span>
              </div>

              {request.providerNote && (
                <div className="mt-2 rounded-lg border border-line bg-surface px-2.5 py-2 text-[9.5px] text-muted">
                  <strong className="text-ink">Your note:</strong> {request.providerNote}
                </div>
              )}

              {request.status === "PENDING" && (
                <form action={updateRequestStatusAction} className="mt-3 border-t border-line pt-3">
                  <input type="hidden" name="requestId" value={request.id} />
                  <label htmlFor={`note-${request.id}`} className="label">Reply note <span className="font-normal normal-case tracking-normal text-muted">(optional, shared with the customer)</span></label>
                  <textarea
                    id={`note-${request.id}`}
                    name="providerNote"
                    className="input textarea min-h-16 text-[11px]"
                    placeholder="Yes, Saturday at 10 am works. The studio is at…"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button name="status" value="ACCEPTED" className="btn btn-primary btn-sm">
                      <Check className="h-3.5 w-3.5" aria-hidden /> Accept request
                    </button>
                    <button name="status" value="DECLINED" className="btn btn-outline btn-sm">
                      <X className="h-3.5 w-3.5" aria-hidden /> Decline
                    </button>
                  </div>
                </form>
              )}

              {request.status === "ACCEPTED" && (
                <form action={updateRequestStatusAction} className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <input type="hidden" name="requestId" value={request.id} />
                  <p className="mr-auto flex items-center gap-1.5 text-[9.5px] text-muted">
                    <Clock className="h-3 w-3" aria-hidden /> Accepted {request.respondedAt ? formatDateTime(request.respondedAt) : ""}
                  </p>
                  <button name="status" value="COMPLETED" className="btn btn-dark btn-sm">
                    Mark completed
                  </button>
                  <button name="status" value="CANCELLED" className="btn btn-ghost btn-sm">
                    Cancel
                  </button>
                </form>
              )}

              {(request.status === "COMPLETED" || request.status === "DECLINED" || request.status === "CANCELLED") && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[9px] text-muted">
                  <span>Last updated {request.respondedAt ? formatDateTime(request.respondedAt) : formatDateTime(request.createdAt)}</span>
                  <Link href={`/requests/${request.reference}`} className="ml-auto font-medium text-ink underline decoration-line underline-offset-2">
                    Customer view →
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
          <CalendarCheck className="mx-auto h-6 w-6 text-muted" aria-hidden />
          <p className="mt-3 text-sm font-semibold">
            {activeFilter === "ALL" ? "No requests yet" : `No ${BOOKING_STATUS_LABEL[activeFilter]?.toLowerCase() ?? ""} requests`}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[10.5px] leading-relaxed text-muted">
            When a customer sends a request from your public profile, it lands here with their
            preferred date and contact details.
          </p>
          <Link href={`/providers/${provider.slug}`} className="btn btn-outline btn-sm mt-4">
            View public profile
          </Link>
        </div>
      )}

      <p className="mt-4 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[9px] leading-relaxed text-muted">
        <strong className="text-ink">Demo note:</strong> email and SMS notifications are not enabled in this
        build. Reply to the customer using the email or phone shown on the request. Never ask for a
        deposit before confirming the details in writing.
      </p>
    </div>
  );
}
