import { describe, expect, it } from "vitest";
import { filtersToQuery, isCitywideSearch, parseSearchParams } from "./search-params";

describe("parseSearchParams", () => {
  it("applies sensible defaults", () => {
    const filters = parseSearchParams({});
    expect(filters.city).toBe("montreal");
    expect(filters.radius).toBe(5);
    expect(filters.sort).toBe("recommended");
    expect(filters.page).toBe(1);
    expect(filters.openNow).toBe(false);
    expect(filters.q).toBe("");
  });

  it("reads values and trims text", () => {
    const filters = parseSearchParams({
      q: "  braids ",
      category: "braids",
      hood: "le-plateau",
      radius: "10",
      type: "BUSINESS",
      place: "travel",
      priceMax: "90",
      rating: "4.5",
      openNow: "1",
      sort: "distance",
      page: "2",
      lat: "45.523",
      lng: "-73.579",
    });

    expect(filters.q).toBe("braids");
    expect(filters.radius).toBe(10);
    expect(filters.priceMax).toBe(90);
    expect(filters.rating).toBe(4.5);
    expect(filters.openNow).toBe(true);
    expect(filters.page).toBe(2);
    expect(filters.lat).toBe("45.523");
  });

  it("uses the first value for repeated params and falls back on invalid numbers", () => {
    const filters = parseSearchParams({
      q: ["first", "second"],
      radius: "nope",
      priceMax: "-5",
      page: "0",
    });
    expect(filters.q).toBe("first");
    expect(filters.radius).toBe(5);
    expect(filters.priceMax).toBeUndefined();
    expect(filters.page).toBe(1);
  });
});

describe("filtersToQuery", () => {
  const base = parseSearchParams({});

  it("omits defaults", () => {
    expect(filtersToQuery(base)).toBe("");
  });

  it("keeps non-default filters", () => {
    const filters = parseSearchParams({
      q: "braids",
      category: "braids",
      hood: "rosemont",
      radius: "10",
      openNow: "1",
    });
    const query = filtersToQuery(filters);
    expect(query).toContain("q=braids");
    expect(query).toContain("category=braids");
    expect(query).toContain("hood=rosemont");
    expect(query).toContain("radius=10");
    expect(query).toContain("openNow=1");
    expect(query).not.toContain("city=montreal");
    expect(query).not.toContain("sort=recommended");
  });

  it("removes a single filter through overrides", () => {
    const filters = parseSearchParams({ q: "braids", category: "braids" });
    const query = filtersToQuery(filters, { q: undefined });
    expect(query).not.toContain("q=");
    expect(query).toContain("category=braids");
  });

  it("adds pagination only when needed", () => {
    const filters = parseSearchParams({ page: "3" });
    expect(filtersToQuery(filters)).toContain("page=3");
    expect(filtersToQuery(filters, { page: 1 })).not.toContain("page=");
  });
});


describe("isCitywideSearch", () => {
  it("is citywide with no location and no explicit radius", () => {
    expect(isCitywideSearch({ category: "cleaning" })).toBe(true);
    expect(isCitywideSearch({ q: "braids" })).toBe(true);
  });

  it("is not citywide when a neighbourhood or position is chosen", () => {
    expect(isCitywideSearch({ hood: "le-plateau" })).toBe(false);
    expect(isCitywideSearch({ lat: "45.5", lng: "-73.6" })).toBe(false);
  });

  it("is not citywide when the visitor explicitly sets a radius", () => {
    expect(isCitywideSearch({ radius: "10" })).toBe(false);
  });
});
