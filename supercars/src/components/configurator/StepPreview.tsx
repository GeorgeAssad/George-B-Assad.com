import type { DesignAsset } from "@/domain/design";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/icons";
import type { PreviewState } from "./use-design-preview";

const KIND_LABEL: Record<DesignAsset["kind"], string> = {
  web_preview: "Web preview",
  social_image: "Social image",
  print_image: "Print image",
  print_pdf: "Print PDF",
  master_source: "Master source",
};

interface StepPreviewProps {
  readonly preview: PreviewState;
  readonly onRetry: () => void;
}

export function StepPreview({ preview, onRetry }: StepPreviewProps) {
  const { status, job, stageIndex, error } = preview;
  const stages = job?.stages ?? [];
  const pct = status === "ready" ? 100 : stages.length ? Math.round((stageIndex / stages.length) * 100) : 4;

  if (status === "error") {
    const copy =
      error === "network"
        ? { title: "Network error", body: "We couldn't reach the design engine. Check your connection and try again — your choices are saved." }
        : error === "rate_limited"
          ? { title: "One moment", body: "You've generated a lot of previews in a short time. Please wait a minute and try again — your choices are saved." }
          : { title: "Design unavailable", body: "We couldn't generate this design right now. Please try again in a moment." };
    return (
      <div className="rounded-2xl border border-red-text/50 bg-surface p-6" role="alert">
        <h3 className="h-display text-3xl">{copy.title}</h3>
        <p className="mt-2 text-muted">{copy.body}</p>
        <Button className="mt-5" variant="secondary" onClick={onRetry}>Try again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="spec">Design pipeline · demo</p>
        <p className="text-sm font-semibold tabular-nums" aria-hidden="true">{pct}%</p>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Preview generation progress">
        <div className="h-full bg-red transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>

      <ol className="mt-6 space-y-3" aria-label="Pipeline stages">
        {(stages.length ? stages : Array.from({ length: 6 }, (_, i) => ({ id: `s${i}`, label: "…" }))).map((s, i) => {
          const done = status === "ready" || i < stageIndex;
          const active = status === "running" && i === stageIndex;
          return (
            <li key={s.id} className={`flex items-center gap-3 text-sm transition-colors ${done ? "text-fg" : active ? "text-fg" : "text-subtle"}`}>
              <span className={`flex size-6 flex-none items-center justify-center rounded-full border text-[0.65rem] ${done ? "border-red bg-red text-on-red" : active ? "border-red text-red-text [animation:pulse-ring_1.2s_ease-out_infinite]" : "border-line-strong"}`}>
                {done ? <IconCheck size={13} /> : i + 1}
              </span>
              <span>{s.label}</span>
            </li>
          );
        })}
      </ol>

      <div role="status" aria-live="polite" className="mt-6">
        {status === "running" && <p className="text-sm text-muted">Composing your poster…</p>}
        {status === "ready" && job && (
          <div className="rounded-2xl border border-line bg-surface p-5 [animation:page-in_0.5s_var(--ease)_both]">
            <p className="flex items-center gap-2 font-semibold"><span className="flex size-5 items-center justify-center rounded-full bg-red text-on-red"><IconCheck size={12} /></span> Preview ready</p>
            <p className="mt-2 text-sm text-muted">This is a live preview. After purchase, separate print-ready files are produced at exact print dimensions — these are the planned deliverables:</p>
            <table className="mt-4 w-full text-left text-sm">
              <caption className="sr-only">Planned deliverables</caption>
              <thead><tr className="spec"><th className="pb-2 font-medium">Asset</th><th className="pb-2 font-medium">Pixels</th><th className="pb-2 text-right font-medium">DPI</th></tr></thead>
              <tbody className="tabular-nums">
                {job.assets.map((a) => (
                  <tr key={a.kind} className="border-t border-line"><td className="py-2">{KIND_LABEL[a.kind]}</td><td className="py-2 text-muted">{a.widthPx.toLocaleString("en-GB")} × {a.heightPx.toLocaleString("en-GB")}</td><td className="py-2 text-right text-muted">{a.dpi ?? "—"}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-subtle">Demo pipeline: no AI model is called in this prototype.</p>
          </div>
        )}
      </div>
    </div>
  );
}
