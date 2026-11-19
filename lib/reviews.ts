/**
 * Pure rating aggregation helpers. The provider aggregate stores a lifetime
 * average/count, while review rows can be hidden or restored by moderation.
 * These functions keep the weighted average correct in both directions.
 */
export function ratingAfterHide(
  ratingAvg: number,
  ratingCount: number,
  hiddenRating: number,
): { ratingAvg: number; ratingCount: number } {
  const nextCount = Math.max(0, ratingCount - 1);
  if (nextCount === 0) return { ratingAvg: 0, ratingCount: 0 };

  const total = ratingAvg * ratingCount - hiddenRating;
  return {
    ratingAvg: Math.max(0, Math.min(5, total / nextCount)),
    ratingCount: nextCount,
  };
}

export function ratingAfterPublish(
  ratingAvg: number,
  ratingCount: number,
  restoredRating: number,
): { ratingAvg: number; ratingCount: number } {
  const nextCount = ratingCount + 1;
  const total = ratingAvg * ratingCount + restoredRating;
  return {
    ratingAvg: Math.max(0, Math.min(5, total / nextCount)),
    ratingCount: nextCount,
  };
}
