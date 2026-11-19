"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { setLocaleAction } from "@/app/actions/locale";
import { translate } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function LocaleSwitcher({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-line bg-surface p-0.5 ${
        compact ? "text-[9px]" : "text-[10px]"
      }`}
      role="group"
      aria-label={translate(locale, "lang.label")}
    >
      <span className="px-1.5 text-muted" aria-hidden>
        <Languages className="h-3 w-3" />
      </span>
      {(["en", "fr"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => change(value)}
          disabled={pending}
          aria-pressed={locale === value}
          className={`rounded-full px-2 py-1 font-semibold uppercase transition-colors ${
            locale === value ? "bg-ink text-paper" : "text-muted hover:text-ink"
          }`}
          title={value === "en" ? "English" : "Français"}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
