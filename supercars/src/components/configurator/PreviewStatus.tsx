import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/icons";
import type { PreviewState } from "./use-design-preview";

interface PreviewStatusProps {
  readonly preview: PreviewState;
  readonly onRetry: () => void;
}

/** One compact line while the design engine composes the poster, then a green "Preview ready". */
export function PreviewStatus({ preview, onRetry }: PreviewStatusProps) {
  const { status, job, stageIndex, error } = preview;
  const stages = job?.stages ?? [];
  const pct = status === "ready" ? 100 : stages.length ? Math.round((stageIndex / stages.length) * 100) : 4;
  const stageLabel = stages[Math.min(stageIndex, Math.max(0, stages.length - 1))]?.label;

  if (status === "error") {
    const copy =
      error === "network"
        ? { title: "Network error", body: "We couldn't reach the design engine. Check your connection and try again — your choices are saved." }
        : error === "rate_limited"
          ? { title: "One moment", body: "You've generated a lot of previews in a short time. Please wait a minute and try again — your choices are saved." }
          : { title: "Design unavailable", body: "We couldn't generate this design right now. Please try again in a moment." };
    return (
      <div className="rounded-2xl border border-red-text/50 bg-surface p-5" role="alert">
        <h3 className="h-display text-3xl">{copy.title}</h3>
        <p className="mt-2 text-muted">{copy.body}</p>
        <Button className="mt-4" variant="secondary" onClick={onRetry}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div role="status" aria-live="polite" className="flex items-center justify-between gap-4">
        {status === "ready" ? (
          <p className="flex items-center gap-2 font-semibold"><span className="flex size-5 items-center justify-center rounded-full bg-red text-on-red"><IconCheck size={12} /></span> Preview ready</p>
        ) : (
          <p className="text-sm text-muted">Composing your poster{stageLabel ? ` — ${stageLabel.toLowerCase()}` : ""}…</p>
        )}
        <p className="text-sm font-semibold tabular-nums" aria-hidden="true">{pct}%</p>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Preview generation progress">
        <div className="h-full bg-red transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
      {status === "ready" && <p className="mt-3 text-xs text-subtle">Live preview. Print-ready files are produced after you order. Demo pipeline: no AI model is called in this prototype.</p>}
    </div>
  );
}
