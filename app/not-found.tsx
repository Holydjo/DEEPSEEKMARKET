import Link from "next/link";
import { Compass, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-hd flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">404 · Not found</span>
      <h1 className="display mt-3 text-[clamp(2.4rem,6vw,4.5rem)]">
        This door doesn’t open.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        The page may have moved, or the provider may no longer be approved and public.
        Try searching the neighbourhood instead.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary btn-sm">
          <Compass className="h-3.5 w-3.5" aria-hidden /> Back home
        </Link>
        <Link href="/search" className="btn btn-outline btn-sm">
          <Search className="h-3.5 w-3.5" aria-hidden /> Search providers
        </Link>
      </div>
    </div>
  );
}
