import { describe, expect, it } from "vitest";
import {
  isSafeUploadName,
  uploadContentType,
  uploadDirectory,
} from "./uploads";

describe("upload storage", () => {
  it("stores uploads outside public by default", () => {
    expect(uploadDirectory()).toContain("storage");
    expect(uploadDirectory()).not.toContain("public");
  });

  it("accepts generated image names", () => {
    expect(isSafeUploadName("provider-abc-123.png")).toBe(true);
    expect(isSafeUploadName("a.webp")).toBe(true);
  });

  it("rejects path traversal and nested paths", () => {
    expect(isSafeUploadName("../secret.png")).toBe(false);
    expect(isSafeUploadName("..%2Fsecret.png")).toBe(false);
    expect(isSafeUploadName("folder/file.png")).toBe(false);
    expect(isSafeUploadName("file\\..\\x.png")).toBe(false);
    expect(isSafeUploadName("")).toBe(false);
  });

  it("maps allowed image extensions", () => {
    expect(uploadContentType("a.jpg")).toBe("image/jpeg");
    expect(uploadContentType("a.png")).toBe("image/png");
    expect(uploadContentType("a.webp")).toBe("image/webp");
    expect(uploadContentType("a.txt")).toBe("application/octet-stream");
  });
});
