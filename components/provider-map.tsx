"use client";

import { useEffect, useRef, useState } from "react";
import type { MapPoint } from "@/lib/search";
import { formatMoney } from "@/lib/format";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function ProviderMap({
  points,
  origin,
  radiusKm,
  heightClass = "h-[430px]",
  activeSlug,
}: {
  points: MapPoint[];
  origin: { lat: number; lng: number };
  radiusKm: number;
  heightClass?: string;
  activeSlug?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void; invalidateSize: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const pointsKey = JSON.stringify(points);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: false,
      }).setView([origin.lat, origin.lng], radiusKm <= 2 ? 13 : radiusKm <= 5 ? 12 : radiusKm <= 10 ? 11 : 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.circle([origin.lat, origin.lng], {
        radius: radiusKm * 1000,
        color: "#c9502e",
        weight: 1,
        dashArray: "4 6",
        fillColor: "#f2b33d",
        fillOpacity: 0.12,
      }).addTo(map);

      L.circleMarker([origin.lat, origin.lng], {
        radius: 4,
        color: "#17130f",
        weight: 1,
        fillColor: "#17130f",
        fillOpacity: 1,
      }).addTo(map);

      // Two providers in the same block would otherwise render on top of each
      // other. Nudge overlapping pins apart while keeping the true area clear.
      const placed: Array<{ point: MapPoint; lat: number; lng: number }> = [];
      for (const point of points) {
        const nearCount = placed.filter(
          (item) =>
            Math.abs(item.point.lat - point.lat) < 0.006 &&
            Math.abs(item.point.lng - point.lng) < 0.006,
        ).length;
        const angle = nearCount * 2.4 + 0.6;
        const shift = nearCount === 0 ? 0 : 0.0022;
        placed.push({
          point,
          lat: point.lat + Math.cos(angle) * shift,
          lng: point.lng + Math.sin(angle) * shift,
        });
      }

      for (const { point, lat, lng } of placed) {
        const label = point.minPriceCents !== null ? formatMoney(point.minPriceCents) : "•";
        const icon = L.divIcon({
          className: "",
          html: `<div class="provider-pin${activeSlug === point.slug ? " active" : ""}">${escapeHtml(label)}</div>`,
          iconSize: [44, 28],
          iconAnchor: [22, 27],
        });

        L.marker([lat, lng], { icon, title: point.name })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:Inter,system-ui,sans-serif;min-width:150px">
              <strong style="font-size:12px;display:block;margin-bottom:2px">${escapeHtml(point.name)}</strong>
              <span style="font-size:10px;color:#6f665a">${point.minPriceCents !== null ? `From ${escapeHtml(formatMoney(point.minPriceCents))}` : "Ask for pricing"}</span>
              <a href="/providers/${encodeURIComponent(point.slug)}" style="display:inline-block;margin-top:6px;font-size:10px;font-weight:600;color:#17130f;text-decoration:underline">View profile →</a>
            </div>`,
          );
      }

      mapRef.current = map;
      setReady(true);
      window.setTimeout(() => map.invalidateSize(), 160);
    }

    init().catch(() => setReady(false));

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, origin.lat, origin.lng, radiusKm, activeSlug]);

  return (
    <div className={`relative w-full overflow-hidden rounded-card border border-line bg-[#e8e6df] ${heightClass}`}>
      <div ref={containerRef} className="absolute inset-0 z-0" aria-label="Map of nearby providers" />
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-2/70">
          <span className="pill">Loading map…</span>
        </div>
      )}
    </div>
  );
}
