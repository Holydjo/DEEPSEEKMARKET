"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toggleSavedProviderAction } from "@/app/actions/saved";

export function SaveButton({
  providerId,
  initialSaved,
  isAuthed,
  variant = "icon",
  className = "",
}: {
  providerId: string;
  initialSaved: boolean;
  isAuthed: boolean;
  variant?: "icon" | "button";
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;
  const base =
    variant === "icon"
      ? "flex h-8 w-8 items-center justify-center rounded-full border border-ink bg-surface/95 text-ink shadow-[1px_1px_0_rgba(23,19,15,.2)] backdrop-blur-sm transition-colors hover:bg-marigold-soft"
      : "btn btn-outline btn-sm";

  if (!isAuthed) {
    return (
      <Link
        href={loginHref}
        aria-label="Log in to save this provider"
        title="Log in to save"
        className={`${base} ${className}`}
      >
        <Heart className="h-3.5 w-3.5" aria-hidden />
        {variant === "button" && <span>Save</span>}
      </Link>
    );
  }

  function toggle() {
    startTransition(async () => {
      const result = await toggleSavedProviderAction(providerId);
      if (result.error === "AUTH") {
        router.push(loginHref);
        return;
      }
      if (typeof result.saved === "boolean") {
        setSaved(result.saved);
        // Unsaving from the shortlist should remove the card immediately.
        if (pathname === "/saved") router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved providers" : "Save this provider"}
      title={saved ? "Saved — remove" : "Save provider"}
      className={`${base} ${saved ? "border-clay/40 bg-clay-soft text-clay" : ""} ${className}`}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Heart
          className={`h-3.5 w-3.5 ${saved ? "fill-clay text-clay" : ""}`}
          aria-hidden
        />
      )}
      {variant === "button" && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
