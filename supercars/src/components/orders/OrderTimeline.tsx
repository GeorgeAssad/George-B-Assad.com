import type { TimelineEntry } from "@/domain/order";
import { formatDate } from "@/lib/format";

const STATE_TEXT = { done: "Completed", active: "In progress", pending: "Upcoming" } as const;

function Node({ state, animate, index }: { state: TimelineEntry["state"]; animate: boolean; index: number }) {
  if (state === "done") {
    return (
      <span className={`relative z-10 flex size-9 flex-none items-center justify-center rounded-full bg-red text-on-red ${animate && index === 0 ? "[animation:pop_0.7s_var(--ease)_backwards]" : ""}`}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" strokeDasharray="24" strokeDashoffset={animate && index === 0 ? 24 : 0} style={animate && index === 0 ? { animation: "draw 0.6s 0.45s var(--ease) forwards" } : undefined} />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="relative z-10 flex size-9 flex-none items-center justify-center rounded-full bg-surface shadow-[inset_0_0_0_2px_var(--lg-tint-fill)] [animation:pulse-ring_1.6s_ease-out_infinite]">
        <span className="size-2.5 rounded-full bg-red" />
      </span>
    );
  }
  return <span className="relative z-10 size-9 flex-none rounded-full bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)]" />;
}

/** Vertical on mobile, horizontal from md. `animate` plays the entrance on the first stage. */
export function OrderTimeline({ entries, animate = false }: { entries: readonly TimelineEntry[]; animate?: boolean }) {
  return (
    <ol className="grid grid-cols-1 gap-0 md:grid-cols-5" aria-label="Order progress">
      {entries.map((e, i) => (
        <li key={e.stage} className="relative flex gap-4 pb-8 last:pb-0 md:flex-col md:gap-3 md:pb-0">
          {i < entries.length - 1 && (
            <>
              <span aria-hidden="true" className={`absolute left-[1.05rem] top-9 h-[calc(100%-2.25rem)] w-px md:hidden ${e.state === "done" ? "bg-red" : "bg-line-strong"}`} />
              <span aria-hidden="true" className={`absolute left-9 right-[-0.75rem] top-[1.05rem] hidden h-px md:block ${e.state === "done" ? "bg-red" : "bg-line-strong"}`} />
            </>
          )}
          <Node state={e.state} animate={animate} index={i} />
          <div className="min-w-0 md:pr-3">
            <p className={`text-[0.9375rem] font-semibold leading-snug ${e.state === "pending" ? "text-muted" : "text-fg"}`}>
              {e.label} <span className="sr-only">— {STATE_TEXT[e.state]}</span>
            </p>
            <p className="mt-0.5 text-sm text-muted">{e.detail}</p>
            {e.at && e.state === "done" && <p className="spec mt-1.5">{formatDate(e.at)}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
