import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [providers, categories] = await Promise.all([
    db.provider.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({ where: { isActive: true }, select: { slug: true } }),
  ]);

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/for-providers`, changeFrequency: "monthly", priority: 0.6 },
    ...categories.map((category) => ({
      url: `${base}/search?category=${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...providers.map((provider) => ({
      url: `${base}/providers/${provider.slug}`,
      lastModified: provider.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
