import { describe, expect, it } from "vitest";
import {
  MONTREAL,
  formatDistance,
  getNeighbourhood,
  haversineKm,
  resolveOrigin,
} from "./location";

describe("haversineKm", () => {
  it("returns zero for the same point", () => {
    expect(haversineKm({ lat: 45.5, lng: -73.57 }, { lat: 45.5, lng: -73.57 })).toBe(0);
  });

  it("computes a plausible distance across Montréal", () => {
    const plateau = { lat: 45.5234, lng: -73.579 };
    const rosemont = { lat: 45.549, lng: -73.586 };
    const distance = haversineKm(plateau, rosemont);
    expect(distance).toBeGreaterThan(2.5);
    expect(distance).toBeLessThan(4);
  });

  it("is symmetric", () => {
    const a = { lat: 45.52, lng: -73.58 };
    const b = { lat: 45.49, lng: -73.57 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });
});

describe("resolveOrigin", () => {
  it("prefers explicit device coordinates and rounds them", () => {
    const origin = resolveOrigin({ lat: "45.523456", lng: "-73.579123" });
    expect(origin.kind).toBe("coordinates");
    expect(origin.lat).toBe(45.523);
    expect(origin.lng).toBe(-73.579);
    expect(origin.label).toBe("your location");
  });

  it("uses a selected neighbourhood", () => {
    const origin = resolveOrigin({ city: "montreal", hood: "rosemont" });
    expect(origin.kind).toBe("neighbourhood");
    expect(origin.label).toBe("Rosemont, Montréal");
    expect(origin.lat).toBe(45.549);
  });

  it("falls back to the city centre", () => {
    const origin = resolveOrigin({ city: "montreal" });
    expect(origin.kind).toBe("city");
    expect(origin.label).toBe("Montréal centre");
  });

  it("ignores invalid coordinates", () => {
    const origin = resolveOrigin({ lat: "999", lng: "abc", city: "montreal" });
    expect(origin.kind).toBe("city");
  });
});

describe("place helpers", () => {
  it("finds a neighbourhood by city and slug", () => {
    expect(getNeighbourhood("montreal", "le-plateau")?.name).toBe("Le Plateau");
    expect(getNeighbourhood("toronto", "le-plateau")).toBeUndefined();
  });

  it("has unique neighbourhood slugs", () => {
    const slugs = MONTREAL.neighbourhoods.map((hood) => hood.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("formats short and long distances", () => {
    expect(formatDistance(0.42)).toBe("400 m");
    expect(formatDistance(1.234)).toBe("1.2 km");
    expect(formatDistance(12.6)).toBe("13 km");
    expect(formatDistance(null)).toBe("");
  });
});
