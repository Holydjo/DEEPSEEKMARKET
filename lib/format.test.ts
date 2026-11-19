import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dayName,
  formatDuration,
  formatMoney,
  formatServicePrice,
  initials,
  isOpenNow,
  todayInToronto,
  torontoNowParts,
} from "./format";

afterEach(() => {
  vi.useRealTimers();
});

describe("money and price formatting", () => {
  it("formats whole and fractional amounts", () => {
    expect(formatMoney(12000)).toBe("$120");
    expect(formatMoney(6550)).toBe("$65.50");
  });

  it("respects the price type", () => {
    expect(formatServicePrice(12000, "FROM")).toBe("From $120");
    expect(formatServicePrice(4000, "FIXED")).toBe("$40");
    expect(formatServicePrice(4500, "HOURLY")).toBe("$45/hr");
  });
});

describe("duration formatting", () => {
  it("formats hours, minutes, and a mix", () => {
    expect(formatDuration(240)).toBe("4 h");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(195)).toBe("3 h 15");
    expect(formatDuration(null)).toBe("");
  });
});

describe("opening hours", () => {
  const hours = [
    { dayOfWeek: 1, opensAt: "09:00", closesAt: "17:00", isClosed: true },
    { dayOfWeek: 2, opensAt: "09:00", closesAt: "17:00", isClosed: false },
    { dayOfWeek: 3, opensAt: "10:00", closesAt: "19:00", isClosed: false },
  ];

  it("reads local time in America/Toronto", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T17:00:00Z")); // Wed 12:00 in Montréal
    const now = torontoNowParts();
    expect(now.day).toBe(3);
    expect(now.minutes).toBe(12 * 60);
  });

  it("is open during a listed interval", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T17:00:00Z"));
    expect(isOpenNow(hours)).toBe(true);
  });

  it("is closed on a closed day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T17:00:00Z")); // Monday
    expect(isOpenNow(hours)).toBe(false);
  });

  it("is closed outside the interval", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-19T00:00:00Z")); // Wed 19:00, closing time
    expect(isOpenNow(hours)).toBe(false);
  });

  it("names weekdays", () => {
    expect(dayName(0)).toBe("Sunday");
    expect(dayName(3)).toBe("Wednesday");
  });
});

describe("initials", () => {
  it("uses the first two names", () => {
    expect(initials("Nadia Bélanger")).toBe("NB");
    expect(initials("Amina")).toBe("A");
    expect(initials("  Marc   Olivier  ")).toBe("MO");
  });
});


describe("market dates", () => {
  it("returns the Toronto date even when UTC has rolled over", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-19T04:30:00Z")); // 18 Nov, 23:30 in Montréal
    expect(todayInToronto()).toBe("2026-11-18");
    expect(todayInToronto(1)).toBe("2026-11-19");
  });

  it("offsets across a month boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-30T17:00:00Z")); // 30 Nov, 12:00 in Montréal
    expect(todayInToronto(2)).toBe("2026-12-02");
  });
});
