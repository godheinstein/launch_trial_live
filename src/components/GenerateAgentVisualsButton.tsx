import { useEffect, useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isLiveMode } from "../lib/convexClient";
import { cn } from "../lib/cn";

type Status =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "rate-limited"; resetAt: number }
  | { kind: "success"; ok: number; failed: number }
  | { kind: "error"; message: string };

const RATE_KEY = "ltl_last_agent_gen";
const RATE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes per browser session

interface AgentGenerationResult {
  agentType: string;
  ok: boolean;
  error?: string;
}

function readLastRun(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(RATE_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function GenerateAgentVisualsButton() {
  const generate = useAction(api.falActions.generateAll);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // On mount, check whether a recent generation should keep us rate-limited.
  useEffect(() => {
    const last = readLastRun();
    if (!last) return;
    const since = Date.now() - last;
    if (since < RATE_LIMIT_MS) {
      setStatus({ kind: "rate-limited", resetAt: last + RATE_LIMIT_MS });
    }
  }, []);

  if (!isLiveMode) {
    // Live mode (and therefore Convex actions) is required for generation.
    return null;
  }

  const handleClick = async () => {
    if (status.kind === "running") return;
    const last = readLastRun();
    if (last && Date.now() - last < RATE_LIMIT_MS) {
      setStatus({ kind: "rate-limited", resetAt: last + RATE_LIMIT_MS });
      return;
    }

    setStatus({ kind: "running" });
    try {
      const result = (await generate({})) as AgentGenerationResult[];
      window.localStorage.setItem(RATE_KEY, String(Date.now()));
      const ok = result.filter((r) => r.ok).length;
      const failed = result.length - ok;
      setStatus({ kind: "success", ok, failed });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message });
    }
  };

  // Build the button label / icon for the current state.
  const isRateLimited = status.kind === "rate-limited";
  const isRunning = status.kind === "running";

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleClick}
        disabled={isRunning || isRateLimited}
        className={cn(
          "btn-secondary",
          status.kind === "success" &&
            "border-risk-low/40 text-risk-low",
          status.kind === "error" &&
            "border-risk-critical/40 text-risk-critical",
        )}
        title="Generate cinematic agent character art via Fal"
      >
        {isRunning ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating agent visuals…
          </>
        ) : status.kind === "success" ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Visuals ready
          </>
        ) : status.kind === "error" ? (
          <>
            <AlertTriangle className="h-3.5 w-3.5" />
            Retry visuals
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Generate agent visuals
          </>
        )}
      </button>

      {status.kind === "success" && (
        <span className="text-[11px] text-slate-400">
          {status.ok}/{status.ok + status.failed} characters rendered
          {status.failed > 0 ? " · others kept defaults" : ""}
        </span>
      )}
      {status.kind === "rate-limited" && (
        <span className="text-[11px] text-slate-500">
          Agent visual generation is temporarily limited. Try again later.
        </span>
      )}
      {status.kind === "error" && (
        <span className="text-[11px] text-risk-critical max-w-xs truncate">
          {status.message}
        </span>
      )}
    </div>
  );
}
