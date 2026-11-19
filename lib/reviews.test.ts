import { describe, expect, it } from "vitest";
import { ratingAfterHide, ratingAfterPublish } from "./reviews";

describe("ratingAfterHide", () => {
  it("removes a rating from the weighted average", () => {
    const next = ratingAfterHide(4.9, 48, 5);
    expect(next.ratingCount).toBe(47);
    expect(next.ratingAvg).toBeCloseTo((4.9 * 48 - 5) / 47, 6);
  });

  it("returns a zero rating when the last review is hidden", () => {
    expect(ratingAfterHide(5, 1, 5)).toEqual({ ratingAvg: 0, ratingCount: 0 });
  });

  it("does not go below zero reviews", () => {
    expect(ratingAfterHide(0, 0, 5).ratingCount).toBe(0);
  });
});

describe("ratingAfterPublish", () => {
  it("adds a rating to the weighted average", () => {
    const next = ratingAfterPublish(4.5, 10, 5);
    expect(next.ratingCount).toBe(11);
    expect(next.ratingAvg).toBeCloseTo((4.5 * 10 + 5) / 11, 6);
  });

  it("handles the first review", () => {
    expect(ratingAfterPublish(0, 0, 4)).toEqual({ ratingAvg: 4, ratingCount: 1 });
  });

  it("round-trips a hide and publish", () => {
    const hidden = ratingAfterHide(4.9, 48, 5);
    const restored = ratingAfterPublish(hidden.ratingAvg, hidden.ratingCount, 5);
    expect(restored.ratingCount).toBe(48);
    expect(restored.ratingAvg).toBeCloseTo(4.9, 6);
  });

  it("stays inside the 0–5 range", () => {
    expect(ratingAfterPublish(5, 10, 5).ratingAvg).toBeLessThanOrEqual(5);
    expect(ratingAfterHide(1, 2, 5).ratingAvg).toBeGreaterThanOrEqual(0);
  });
});
