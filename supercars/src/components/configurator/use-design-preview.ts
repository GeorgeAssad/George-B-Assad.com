"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DesignJob, DesignRequest } from "@/domain/design";

export type PreviewStatus = "idle" | "running" | "ready" | "error";

export interface PreviewState {
  readonly status: PreviewStatus;
  /** Index of the pipeline stage currently animating (or stages.length when done). */
  readonly stageIndex: number;
  readonly job: DesignJob | null;
  readonly error: string | null;
}

const IDLE: PreviewState = { status: "idle", stageIndex: 0, job: null, error: null };
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/**
 * Calls the (mock) design engine through OUR endpoint and animates the returned
 * pipeline stages. Changing the request resets the preview; reduced-motion users
 * skip the animation.
 */
export function useDesignPreview(request: DesignRequest | null) {
  const [state, setState] = useState<PreviewState>(IDLE);
  const runId = useRef(0);
  const key = request ? JSON.stringify(request) : "";

  useEffect(() => {
    runId.current++;
    setState(IDLE);
  }, [key]);

  const run = useCallback(async () => {
    if (!request) return;
    const id = ++runId.current;
    const alive = () => runId.current === id;
    setState({ status: "running", stageIndex: 0, job: null, error: null });
    try {
      const res = await fetch("/api/design/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(request) });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message ?? "Design unavailable");
      }
      const job = (await res.json()) as DesignJob;
      if (!alive()) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      for (let i = 0; i < job.stages.length; i++) {
        if (!alive()) return;
        setState({ status: "running", stageIndex: i, job, error: null });
        if (!reduce) await sleep(job.stages[i]?.durationMs ?? 400);
      }
      if (!alive()) return;
      setState({ status: "ready", stageIndex: job.stages.length, job, error: null });
    } catch (err) {
      if (!alive()) return;
      const message = err instanceof TypeError ? "network" : err instanceof Error ? err.message : "Design unavailable";
      setState({ status: "error", stageIndex: 0, job: null, error: message });
    }
  }, [request]);

  return { ...state, run };
}
