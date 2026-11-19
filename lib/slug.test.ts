import { describe, expect, it } from "vitest";
import { reference, slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("builds a url-safe slug", () => {
    expect(slugify("Nadia Braids Studio")).toBe("nadia-braids-studio");
  });

  it("strips accents and apostrophes", () => {
    expect(slugify("Beauté Aïcha")).toBe("beaute-aicha");
    expect(slugify("Awa’s Hair Atelier")).toBe("awas-hair-atelier");
  });

  it("collapses separators and trims dashes", () => {
    expect(slugify("  --Hello   World--  ")).toBe("hello-world");
  });

  it("limits the length", () => {
    expect(slugify("a".repeat(120)).length).toBeLessThanOrEqual(50);
  });
});

describe("uniqueSlug", () => {
  it("adds a short random suffix", () => {
    const slug = uniqueSlug("Atelier Rose");
    expect(slug).toMatch(/^atelier-rose-[a-f0-9]{6}$/);
    expect(uniqueSlug("Atelier Rose")).not.toBe(slug);
  });

  it("has a fallback for empty names", () => {
    expect(uniqueSlug("")).toMatch(/^provider-[a-f0-9]{6}$/);
  });
});

describe("reference", () => {
  it("creates a readable, unguessable reference", () => {
    expect(reference()).toMatch(/^HD-[A-F0-9]{8}$/);
  });
});
