import { Star } from "lucide-react";
import { translate } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function Rating({
  value,
  count,
  size = "sm",
  showEmpty = false,
  locale = "en",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  showEmpty?: boolean;
  locale?: Locale;
}) {
  if (!value && count === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
        <Star className="h-3 w-3" aria-hidden /> {translate(locale, "rating.new")}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${
        size === "md" ? "text-sm" : "text-[11px]"
      }`}
    >
      <Star
        className={`${size === "md" ? "h-4 w-4" : "h-3 w-3"} fill-ink text-ink`}
        aria-hidden
      />
      {value.toFixed(1).replace(".", locale === "fr" ? "," : ".")}
      {typeof count === "number" && count > 0 && (
        <span className="font-normal text-muted">
          {showEmpty ? "" : `(${count})`}
        </span>
      )}
    </span>
  );
}

export function StarRow({
  value,
  className = "",
  locale = "en",
}: {
  value: number;
  className?: string;
  locale?: Locale;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={translate(locale, "rating.outOf", {
        value: value.toFixed(1).replace(".", locale === "fr" ? "," : "."),
      })}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(value) ? "fill-ink text-ink" : "fill-transparent text-line"
          }`}
          aria-hidden
        />
      ))}
    </span>
  );
}
