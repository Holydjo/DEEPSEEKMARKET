import { join } from "node:path";

export const UPLOAD_URL_PREFIX = "/uploads/";

/**
 * Uploads live outside `public/`. Next.js only serves files that existed in
 * `public/` at build time, so runtime uploads must be streamed by a route.
 */
export function uploadDirectory(): string {
  return process.env.UPLOAD_DIR ?? join(process.cwd(), "storage", "uploads");
}

export function isSafeUploadName(name: string): boolean {
  return (
    name.length > 0 &&
    name.length <= 200 &&
    !name.includes("..") &&
    !name.includes("/") &&
    !name.includes("\\") &&
    /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)
  );
}

export function uploadFilePath(name: string): string {
  return join(uploadDirectory(), name);
}

/** Legacy location for files uploaded before v1.2.1. */
export function legacyUploadFilePath(name: string): string {
  return join(process.cwd(), "public", "uploads", name);
}

export function uploadContentType(name: string): string {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}
