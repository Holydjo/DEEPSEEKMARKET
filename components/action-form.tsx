"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/lib/types";

type ServerAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  className = "",
  id,
  hideMessages = false,
}: {
  action: ServerAction;
  children: ReactNode;
  className?: string;
  id?: string;
  hideMessages?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className={className} id={id}>
      {!hideMessages && state?.error && (
        <div
          role="alert"
          className="mb-3 rounded-xl border border-clay/25 bg-clay-soft px-3.5 py-2.5 text-xs font-medium leading-relaxed text-clay"
        >
          {state.error}
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
