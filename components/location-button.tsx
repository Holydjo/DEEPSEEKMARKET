"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, Loader2 } from "lucide-react";
import { translate } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function LocationButton({
  locale,
  query = "",
  radius = 5,
  className = "",
}: {
  locale: Locale;
  query?: string;
  radius?: number;
  className?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");

  function locate() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("lat", position.coords.latitude.toFixed(3));
        params.set("lng", position.coords.longitude.toFixed(3));
        params.set("radius", String(radius));
        router.push(`/search?${params.toString()}`);
      },
      () => setStatus("error"),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={locate}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
      >
        {status === "locating" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <LocateFixed className="h-3.5 w-3.5" aria-hidden />
        )}
        {status === "locating"
          ? translate(locale, "location.finding")
          : translate(locale, "location.use")}
      </button>
      {status === "error" && (
        <span role="status" className="text-[10px] text-clay">
          {translate(locale, "location.error")}
        </span>
      )}
    </span>
  );
}
