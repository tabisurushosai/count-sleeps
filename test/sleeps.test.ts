import { describe, expect, it } from "vitest";

import { calculateSleepsUntil } from "../src/core/sleeps";

describe("calculateSleepsUntil", () => {
  it("returns local-day difference for valid dates", () => {
    expect(calculateSleepsUntil("2026-05-25", new Date(2026, 4, 23))).toBe(2);
    expect(calculateSleepsUntil("2026-05-23", new Date(2026, 4, 23))).toBe(0);
    expect(calculateSleepsUntil("2026-05-22", new Date(2026, 4, 23))).toBe(-1);
  });

  it("returns null for invalid date inputs", () => {
    expect(calculateSleepsUntil("2026-02-30", new Date(2026, 4, 23))).toBeNull();
    expect(calculateSleepsUntil("", new Date(2026, 4, 23))).toBeNull();
  });
});
