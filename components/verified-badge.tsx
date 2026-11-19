import { BadgeCheck } from "lucide-react";
import { translate } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function VerifiedBadge({
  compact = false,
  locale = "en",
}: {
  compact?: boolean;
  locale?: Locale;
}) {
  return (
    <span className="verified" title={translate(locale, "badge.title")}>
      <BadgeCheck className="h-3 w-3" aria-hidden />
      {compact ? translate(locale, "badge.verified") : translate(locale, "badge.verifiedBy")}
    </span>
  );
}
