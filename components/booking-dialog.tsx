"use client";

import { useEffect, useRef, useActionState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Check, X } from "lucide-react";
import { formatDuration, formatServicePrice } from "@/lib/format";
import type { ActionState } from "@/lib/types";

type DialogService = {
  id: string;
  name: string;
  priceCents: number;
  priceType: string;
  durationMin: number | null;
};

export function BookingDialog({
  providerId,
  providerName,
  services,
  initialServiceId,
  autoOpen = false,
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
  minDate,
  action,
  triggerLabel = "Request an appointment",
  triggerClassName = "btn btn-primary btn-block",
}: {
  providerId: string;
  providerName: string;
  services: DialogService[];
  initialServiceId?: string;
  autoOpen?: boolean;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  minDate: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(action, null);
  const pathname = usePathname();
  const router = useRouter();
  const [year, month, day] = minDate.split("-").map(Number);
  const suggestedDate = new Date(Date.UTC(year, month - 1, day + 1))
    .toISOString()
    .slice(0, 10);

  useEffect(() => {
    if (autoOpen && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [autoOpen]);

  function close() {
    dialogRef.current?.close();
  }

  function handleClose() {
    if (autoOpen) router.replace(pathname, { scroll: false });
  }

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => dialogRef.current?.showModal()}
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto w-[min(560px,92vw)] max-h-[92vh] overflow-y-auto rounded-3xl border border-ink bg-surface p-0 text-ink shadow-[8px_8px_0_rgba(0,0,0,.25)]"
        aria-labelledby="booking-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
              Request an appointment
            </p>
            <h2 id="booking-title" className="mt-1 text-2xl">
              {providerName}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line hover:border-ink"
            aria-label="Close request form"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form action={formAction} className="grid gap-3.5 px-5 py-4">
          <input type="hidden" name="providerId" value={providerId} />

          {state?.error && (
            <div role="alert" className="rounded-xl border border-clay/25 bg-clay-soft px-3 py-2 text-xs font-medium text-clay">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="booking-service" className="label">Service</label>
            <select
              id="booking-service"
              name="serviceId"
              defaultValue={initialServiceId ?? services[0]?.id ?? ""}
              className="input"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {formatServicePrice(service.priceCents, service.priceType)}
                  {service.durationMin ? ` · ${formatDuration(service.durationMin)}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="booking-date" className="label">Preferred date</label>
              <input
                id="booking-date"
                name="preferredDate"
                type="date"
                min={minDate}
                required
                defaultValue={suggestedDate}
                className="input"
              />
            </div>
            <div>
              <span className="label">Preferred window</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  ["MORNING", "Morning"],
                  ["AFTERNOON", "Afternoon"],
                  ["EVENING", "Evening"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center justify-center rounded-lg border border-line bg-paper px-2 py-2.5 text-[10.5px] font-medium has-[:checked]:border-ink has-[:checked]:bg-marigold-soft"
                  >
                    <input
                      type="radio"
                      name="preferredWindow"
                      value={value}
                      defaultChecked={value === "AFTERNOON"}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="booking-name" className="label">Your name</label>
              <input id="booking-name" name="name" required defaultValue={defaultName} placeholder="Amina Kone" className="input" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="booking-phone" className="label">Phone</label>
              <input id="booking-phone" name="phone" required defaultValue={defaultPhone} placeholder="+1 514 …" className="input" autoComplete="tel" inputMode="tel" />
            </div>
          </div>

          <div>
            <label htmlFor="booking-email" className="label">Email</label>
            <input id="booking-email" name="email" type="email" required defaultValue={defaultEmail} placeholder="you@example.com" className="input" autoComplete="email" />
          </div>

          <div>
            <label htmlFor="booking-message" className="label">
              Anything the provider should know? <span className="font-normal normal-case tracking-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="booking-message"
              name="message"
              className="input textarea"
              placeholder="Hair length, access details, a reference photo you’ll send…"
            />
          </div>

          <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-[10px] leading-relaxed text-muted">
            <p className="flex items-center gap-1.5 font-medium text-ink">
              <Check className="h-3 w-3" aria-hidden /> No payment now
            </p>
            <p className="mt-0.5">
              This is a request, not a confirmed booking. The provider will reply with
              availability and the final price before anything is agreed.
            </p>
          </div>

          <button type="submit" disabled={pending} className="btn btn-primary btn-block">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {pending ? "Sending request…" : "Send request"}
          </button>
          <p className="text-center text-[9.5px] text-muted">
            Your contact details are shared only with this provider.
          </p>
        </form>
      </dialog>
    </>
  );
}
