"use client";

import { useEffect, useRef, useActionState, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Check, X } from "lucide-react";
import { formatDuration, formatServicePrice } from "@/lib/format";
import { translate } from "@/lib/i18n/dictionary";
import { translateActionError } from "@/lib/i18n/errors";
import { windowLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/config";
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
  locale,
  initialServiceId,
  autoOpen = false,
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
  minDate,
  action,
  triggerLabel,
  triggerClassName = "btn btn-primary btn-block",
}: {
  providerId: string;
  providerName: string;
  services: DialogService[];
  locale: Locale;
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
  const errorText = state?.error ? translateActionError(locale, state.error) : null;
  const pathname = usePathname();
  const router = useRouter();
  const [year, month, day] = minDate.split("-").map(Number);
  const suggestedDate = new Date(Date.UTC(year, month - 1, day + 1))
    .toISOString()
    .slice(0, 10);

  const [values, setValues] = useState({
    serviceId: initialServiceId ?? services[0]?.id ?? "",
    preferredDate: suggestedDate,
    preferredWindow: "AFTERNOON",
    name: defaultName,
    phone: defaultPhone,
    email: defaultEmail,
    message: "",
  });

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

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
        {triggerLabel ?? translate(locale, "booking.requestAppointment")}
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
              {translate(locale, "booking.requestAppointment")}
            </p>
            <h2 id="booking-title" className="mt-1 text-2xl">
              {providerName}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line hover:border-ink"
            aria-label={translate(locale, "booking.closeForm")}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form action={formAction} className="grid gap-3.5 px-5 py-4">
          <input type="hidden" name="providerId" value={providerId} />

          {errorText && (
            <div role="alert" className="rounded-xl border border-clay/25 bg-clay-soft px-3 py-2 text-xs font-medium text-clay">
              {errorText}
            </div>
          )}

          <div>
            <label htmlFor="booking-service" className="label">
              {translate(locale, "booking.service")}
            </label>
            <select
              id="booking-service"
              name="serviceId"
              value={values.serviceId}
              onChange={(event) => update("serviceId", event.target.value)}
              className="input"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {formatServicePrice(service.priceCents, service.priceType, locale)}
                  {service.durationMin ? ` · ${formatDuration(service.durationMin)}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="booking-date" className="label">
                {translate(locale, "booking.preferredDate")}
              </label>
              <input
                id="booking-date"
                name="preferredDate"
                type="date"
                min={minDate}
                required
                value={values.preferredDate}
                onChange={(event) => update("preferredDate", event.target.value)}
                className="input"
              />
            </div>
            <div>
              <span className="label">{translate(locale, "booking.preferredWindow")}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(["MORNING", "AFTERNOON", "EVENING"] as const).map((value) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center justify-center rounded-lg border border-line bg-paper px-2 py-2.5 text-[10.5px] font-medium has-[:checked]:border-ink has-[:checked]:bg-marigold-soft"
                  >
                    <input
                      type="radio"
                      name="preferredWindow"
                      value={value}
                      checked={values.preferredWindow === value}
                      onChange={() => update("preferredWindow", value)}
                      className="sr-only"
                    />
                    {windowLabel(locale, value)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="booking-name" className="label">
                {translate(locale, "booking.name")}
              </label>
              <input id="booking-name" name="name" required value={values.name} onChange={(event) => update("name", event.target.value)} placeholder="Amina Kone" className="input" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="booking-phone" className="label">
                {translate(locale, "common.phone")}
              </label>
              <input id="booking-phone" name="phone" required value={values.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+1 514 …" className="input" autoComplete="tel" inputMode="tel" />
            </div>
          </div>

          <div>
            <label htmlFor="booking-email" className="label">
              {translate(locale, "common.email")}
            </label>
            <input id="booking-email" name="email" type="email" required value={values.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" className="input" autoComplete="email" />
          </div>

          <div>
            <label htmlFor="booking-message" className="label">
              {translate(locale, "booking.messageLabel")}{" "}
              <span className="font-normal normal-case tracking-normal text-muted">
                {translate(locale, "common.optional")}
              </span>
            </label>
            <textarea
              id="booking-message"
              name="message"
              value={values.message}
              onChange={(event) => update("message", event.target.value)}
              className="input textarea"
              placeholder={translate(locale, "booking.messagePlaceholder")}
            />
          </div>

          <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-[10px] leading-relaxed text-muted">
            <p className="flex items-center gap-1.5 font-medium text-ink">
              <Check className="h-3 w-3" aria-hidden /> {translate(locale, "booking.noPayment")}
            </p>
            <p className="mt-0.5">{translate(locale, "booking.noPaymentBody")}</p>
          </div>

          <button type="submit" disabled={pending} className="btn btn-primary btn-block">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {pending ? translate(locale, "booking.sending") : translate(locale, "booking.send")}
          </button>
          <p className="text-center text-[9.5px] text-muted">
            {translate(locale, "booking.privacy")}
          </p>
        </form>
      </dialog>
    </>
  );
}
