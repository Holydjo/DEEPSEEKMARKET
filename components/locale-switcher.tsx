"use client";

import { Languages } from "lucide-react";
import { translate } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function LocaleSwitcher({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
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
        <a
          key={value}
          href={`/locale/${value}`}
          aria-current={locale === value ? "page" : undefined}
          className={`rounded-full px-2.5 py-1.5 font-semibold uppercase transition-colors ${
            locale === value ? "bg-ink text-paper" : "text-muted hover:text-ink"
          }`}
          title={value === "en" ? "English" : "Français"}
        >
          {value}
        </a>
      ))}
    </div>
  );
}
