"use client";

import { useState } from "react";
import { ChevronDown, Map as MapIcon } from "lucide-react";
import type { MapPoint } from "@/lib/search";
import { ProviderMap } from "./provider-map";

/**
 * Mobile keeps the map behind an explicit toggle so the list of providers is
 * not pushed below the fold. Desktop always shows the map beside the list.
 */
export function MapToggle({
  points,
  origin,
  radiusKm,
}: {
  points: MapPoint[];
  origin: { lat: number; lng: number };
  radiusKm: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="btn btn-outline btn-sm w-full justify-between lg:hidden"
      >
        <span className="flex items-center gap-1.5">
          <MapIcon className="h-3.5 w-3.5" aria-hidden /> Map view
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-muted">
          {points.length} pins
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </span>
      </button>
      {open && (
        <div className="mt-2 lg:hidden">
          <ProviderMap
            points={points}
            origin={origin}
            radiusKm={radiusKm}
            heightClass="h-[260px]"
          />
        </div>
      )}
      <div className="hidden lg:block">
        <ProviderMap
          points={points}
          origin={origin}
          radiusKm={radiusKm}
          heightClass="h-[540px]"
        />
      </div>
    </>
  );
}
