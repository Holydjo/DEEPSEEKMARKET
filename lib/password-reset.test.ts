import { describe, expect, it } from "vitest";
import { hashResetToken } from "./reset-token";

describe("password reset tokens", () => {
  it("hashes a token to a stable SHA-256 value", () => {
    const hash = hashResetToken("example-token");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashResetToken("example-token")).toBe(hash);
  });

  it("does not expose the raw token", () => {
    const raw = "super-secret-token";
    expect(hashResetToken(raw)).not.toContain(raw);
  });

  it("produces different hashes for different tokens", () => {
    expect(hashResetToken("a")).not.toBe(hashResetToken("b"));
  });
});
