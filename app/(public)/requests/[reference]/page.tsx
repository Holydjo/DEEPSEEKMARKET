import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Check, Clock, Mail, MapPin, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { BOOKING_STATUS_LABEL, PREFERRED_WINDOW_LABEL } from "@/lib/constants";
import { initials } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Appointment request",
  robots: { index: false, follow: false },
};

function statusTone(status: string): string {
  if (status === "ACCEPTED") return "pill-pine";
  if (status === "DECLINED" || status === "CANCELLED") return "border-clay/30 bg-clay-soft text-clay";
  if (status === "COMPLETED") return "bg-ink text-paper border-ink";
  return "pill-marigold";
}

export default async function RequestConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { reference } = await params;
  const { new: isNew } = await searchParams;

  const request = await db.bookingRequest.findUnique({
    where: { reference },
    include: {
      provider: { include: { photos: { take: 1 }, category: true } },
      service: true,
    },
  });

  if (!request) notFound();

  return (
    <div className="container-hd max-w-4xl py-8 md:py-12">
      {isNew === "1" && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-pine/20 bg-pine-soft p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine text-paper">
            <Check className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-pine">Your request is with the provider.</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-pine/80">
              This is not a confirmed appointment yet. Keep your reference handy —
              you’ll be contacted at the email and phone number you provided.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <p className="eyebrow">Request sent</p>
          <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">
            Thank you, {request.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
            {request.provider.displayName} has your request and will reply to confirm
            availability, the final price, and the exact location.
          </p>

          <div className="card mt-6 p-5">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                  {initials(request.provider.displayName)}
                </span>
                <div>
                  <Link href={`/providers/${request.provider.slug}`} className="text-sm font-semibold hover:underline">
                    {request.provider.displayName}
                  </Link>
                  <p className="text-[10px] text-muted">
                    {request.provider.category.name} · {request.provider.neighbourhood}
                  </p>
                </div>
              </div>
              <span className={`pill !text-[9px] ${statusTone(request.status)}`}>
                {BOOKING_STATUS_LABEL[request.status] ?? request.status}
              </span>
            </div>

            <div className="grid gap-3 py-4 text-[12px] sm:grid-cols-2">
              <div>
                <p className="label">Reference</p>
                <p className="font-mono text-[13px] font-semibold">{request.reference}</p>
              </div>
              <div>
                <p className="label">Service</p>
                <p className="font-medium">{request.service?.name ?? "Service to confirm"}</p>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Preferred date</p>
                  <p className="font-medium">{formatDate(request.preferredDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Preferred window</p>
                  <p className="font-medium">{PREFERRED_WINDOW_LABEL[request.preferredWindow] ?? request.preferredWindow}</p>
                </div>
              </div>
            </div>

            {request.message && (
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-muted">Your note</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{request.message}</p>
              </div>
            )}

            {request.providerNote && (
              <div className="mt-3 rounded-xl border border-pine/20 bg-pine-soft p-3">
                <p className="text-[9px] uppercase tracking-[0.1em] text-pine/70">Reply from the provider</p>
                <p className="mt-1 text-[11px] leading-relaxed text-pine">{request.providerNote}</p>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {[
              ["1", "Provider replies", "They confirm the date, time and final price, or suggest an alternative."],
              ["2", "You agree details", "Contact and address are shared only once the request is accepted."],
              ["3", "Appointment happens", "After the appointment, you can leave a verified review."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-xl border border-line bg-surface p-3.5">
                <span className="font-mono text-[9px] text-clay">0{number}</span>
                <p className="mt-1.5 text-[11.5px] font-semibold">{title}</p>
                <p className="mt-1 text-[9.5px] leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/search" className="btn btn-primary btn-sm">
              Keep browsing <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link href="/account#requests" className="btn btn-outline btn-sm">
              View your requests
            </Link>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <h2 className="text-lg">Your contact details</h2>
            <div className="mt-3 grid gap-2 text-[11px] text-ink-soft">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted" aria-hidden /> {request.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted" aria-hidden /> {request.phone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted" aria-hidden /> {request.provider.neighbourhood}, {request.provider.city}</p>
            </div>
            <p className="mt-3 border-t border-line pt-2 text-[9px] leading-relaxed text-muted">
              Sent {formatDateTime(request.createdAt)}. If anything changes, reply to the
              provider directly once they contact you.
            </p>
          </div>

          <div className="rounded-2xl border border-marigold/50 bg-marigold-soft/60 p-4 text-[9.5px] leading-relaxed text-ink/80">
            <strong className="text-ink">No payment has been taken.</strong> Never send a
            deposit before the provider confirms the appointment in writing.
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-[10px] font-semibold">Need to cancel?</p>
            <p className="mt-1 text-[9px] leading-relaxed text-muted">
              Contact the provider with your reference. In v1, cancellations are handled
              between you and the provider.
            </p>
            <a href="mailto:hello@holydo.market" className="mt-2 inline-block text-[9px] font-medium underline decoration-line underline-offset-2">
              Contact HOLYDO support →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
