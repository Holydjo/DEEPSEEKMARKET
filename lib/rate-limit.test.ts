import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "./rate-limit";

beforeEach(() => {
  resetRateLimits();
});

describe("rateLimit", () => {
  it("allows requests up to the limit", () => {
    const now = 1_000_000;
    expect(rateLimit("booking:1", 2, 60_000, now).allowed).toBe(true);
    expect(rateLimit("booking:1", 2, 60_000, now + 10).allowed).toBe(true);
    const denied = rateLimit("booking:1", 2, 60_000, now + 20);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
  });

  it("isolates different keys", () => {
    const now = 1_000_000;
    expect(rateLimit("booking:1", 1, 60_000, now).allowed).toBe(true);
    expect(rateLimit("booking:1", 1, 60_000, now).allowed).toBe(false);
    expect(rateLimit("booking:2", 1, 60_000, now).allowed).toBe(true);
  });

  it("resets after the window", () => {
    const now = 1_000_000;
    expect(rateLimit("review:1", 1, 60_000, now).allowed).toBe(true);
    expect(rateLimit("review:1", 1, 60_000, now + 59_999).allowed).toBe(false);
    expect(rateLimit("review:1", 1, 60_000, now + 60_000).allowed).toBe(true);
  });

  it("reports remaining requests", () => {
    const now = 1_000_000;
    expect(rateLimit("x", 3, 60_000, now).remaining).toBe(2);
    expect(rateLimit("x", 3, 60_000, now).remaining).toBe(1);
    expect(rateLimit("x", 3, 60_000, now).remaining).toBe(0);
  });

  it("can be reset for tests or a fresh login", () => {
    const now = 1_000_000;
    rateLimit("x", 1, 60_000, now);
    expect(rateLimit("x", 1, 60_000, now).allowed).toBe(false);
    resetRateLimits();
    expect(rateLimit("x", 1, 60_000, now).allowed).toBe(true);
  });
});
