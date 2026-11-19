"use client";

import { useEffect } from "react";
import { RotateCcw, Search } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-hd flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        Something went wrong
      </span>
      <h1 className="display mt-3 text-[clamp(2.2rem,5vw,4rem)]">
        That didn’t load as planned.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Your details have not been lost. Try the page again, or head back to search.
        If it keeps happening, email hello@holydo.market with the time and what you were doing.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button onClick={reset} className="btn btn-primary btn-sm">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Try again
        </button>
        <Link href="/search" className="btn btn-outline btn-sm">
          <Search className="h-3.5 w-3.5" aria-hidden /> Search providers
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 font-mono text-[9px] text-muted">Reference: {error.digest}</p>
      )}
    </div>
  );
}
