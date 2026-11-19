import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="verified"
      title="Identity, services, prices and photos reviewed by HOLYDO"
    >
      <BadgeCheck className="h-3 w-3" aria-hidden />
      {compact ? "Verified" : "Verified by HOLYDO"}
    </span>
  );
}
