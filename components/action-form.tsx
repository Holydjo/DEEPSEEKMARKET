"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import type { ActionState } from "@/lib/types";
import { translateActionError } from "@/lib/i18n/errors";
import type { Locale } from "@/lib/i18n/config";

type ServerAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  className = "",
  id,
  hideMessages = false,
  locale,
}: {
  action: ServerAction;
  children: ReactNode;
  className?: string;
  id?: string;
  hideMessages?: boolean;
  locale?: Locale;
}) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastValues = useRef<Map<string, string[]>>(new Map());
  const errorText =
    state?.error && locale ? translateActionError(locale, state.error) : state?.error;

  function handleAction(formData: FormData) {
    const snapshot = new Map<string, string[]>();
    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string") continue;
      snapshot.set(key, [...(snapshot.get(key) ?? []), value]);
    }
    lastValues.current = snapshot;
    return formAction(formData);
  }

  // React resets uncontrolled forms after a server action. Restore the values
  // when validation fails so a customer does not have to re-type everything.
  useEffect(() => {
    if (!state?.error || !formRef.current) return;
    const form = formRef.current;
    for (const [name, values] of lastValues.current.entries()) {
      const elements = Array.from(form.elements).filter(
        (element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
          "name" in element && (element as HTMLInputElement).name === name,
      );
      for (const element of elements) {
        if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
          element.checked = values.includes(element.value);
        } else if (!(element instanceof HTMLInputElement && element.type === "file")) {
          element.value = values[0] ?? "";
        }
      }
    }
  }, [state]);

  return (
    <form ref={formRef} action={handleAction} className={className} id={id}>
      {!hideMessages && state?.error && (
        <div
          role="alert"
          className="mb-3 rounded-xl border border-clay/25 bg-clay-soft px-3.5 py-2.5 text-xs font-medium leading-relaxed text-clay"
        >
          {errorText}
        </div>
      )}
      {!hideMessages && state?.success && (
        <div
          role="status"
          className="mb-3 rounded-xl border border-pine/25 bg-pine-soft px-3.5 py-2.5 text-xs font-medium leading-relaxed text-pine"
        >
          {state.success}
        </div>
      )}
      {children}
    </form>
  );
}
