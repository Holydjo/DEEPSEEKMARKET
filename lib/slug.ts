import { randomBytes } from "node:crypto";

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function uniqueSlug(value: string): string {
  const base = slugify(value) || "provider";
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export function reference(): string {
  return `HD-${randomBytes(4).toString("hex").toUpperCase()}`;
}
