import { Mail, Send } from "lucide-react";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  const emails = await db.emailMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Admin · outbox</p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3.5vw,2.7rem)]">Email outbox.</h1>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted">
            Transactional emails are recorded here. No SMTP provider is configured in this
            environment, so messages stay <strong className="text-ink">queued</strong> until a
            delivery worker is connected.
          </p>
        </div>
        <span className="pill">
          <Mail className="h-3 w-3" aria-hidden /> {emails.length} messages
        </span>
      </div>

      {emails.length > 0 ? (
        <div className="mt-5 grid gap-2.5">
          {emails.map((email) => (
            <article key={email.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold">{email.subject}</p>
                  <p className="mt-0.5 text-[9px] text-muted">
                    To {email.to} · {formatDateTime(email.createdAt)} · {email.template}
                  </p>
                </div>
                <span className="pill !text-[8px]">
                  <Send className="h-2.5 w-2.5" aria-hidden /> {email.status.toLowerCase()}
                </span>
              </div>
              <details className="group mt-2">
                <summary className="cursor-pointer list-none text-[9px] font-medium text-muted underline decoration-line underline-offset-2 [&::-webkit-details-marker]:hidden">
                  View body
                </summary>
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3 font-mono text-[9px] leading-relaxed text-ink-soft">
                  {email.body}
                </pre>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <Mail className="mx-auto h-6 w-6 text-muted" aria-hidden />
          <p className="mt-3 text-sm font-semibold">No emails queued</p>
          <p className="mt-1 text-[10px] text-muted">
            Request activity and admin decisions will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
