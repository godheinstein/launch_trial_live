import { motion } from "framer-motion";
import { Coffee, Play, AlertTriangle, X } from "lucide-react";
import { cn } from "../lib/cn";

interface Props {
  error: string;
  onSwitchToDemo: () => void;
  onDismiss?: () => void;
  className?: string;
}

const TOKEN_PATTERNS = [
  /401/,
  /403/,
  /429/,
  /api[_\s-]?key/i,
  /rate.?limit/i,
  /quota/i,
  /insufficient/i,
  /billing/i,
  /not\s+set/i,
];

function isTokenIssue(err: string): boolean {
  return TOKEN_PATTERNS.some((p) => p.test(err));
}

export function LiveModeFailureBanner({
  error,
  onSwitchToDemo,
  onDismiss,
  className,
}: Props) {
  const tokens = isTokenIssue(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="alert"
      className={cn(
        "relative overflow-hidden rounded-2xl border px-4 py-3",
        tokens
          ? "border-amber-400/40 bg-amber-500/5"
          : "border-risk-critical/40 bg-risk-critical/5",
        className,
      )}
    >
      {/* Soft glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: tokens
            ? "radial-gradient(ellipse 70% 60% at 0% 50%, rgba(245,158,11,0.12), transparent 60%)"
            : "radial-gradient(ellipse 70% 60% at 0% 50%, rgba(239,68,68,0.10), transparent 60%)",
        }}
      />

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl shrink-0",
            tokens
              ? "bg-amber-500/15 text-amber-300"
              : "bg-risk-critical/15 text-risk-critical",
          )}
        >
          {tokens ? (
            <Coffee className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {tokens ? (
            <>
              <p className="text-sm font-semibold text-amber-100">
                Looks like the jury popped out for a coffee ☕
              </p>
              <p className="mt-1 text-[12.5px] text-slate-300 leading-relaxed">
                Live mode just hiccupped — most likely the API tokens ran out
                or hit a rate limit. Don't sweat it: <span className="text-amber-200 font-medium">Demo Mode</span>{" "}
                has the full courtroom act ready to roll, no keys required.
                We'll have the agents back at the bench in no time.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-risk-critical">
                The trial hit a snag
              </p>
              <p className="mt-1 text-[12.5px] text-slate-300 leading-relaxed">
                Something went wrong while running the agents. You can retry,
                or hop into <span className="text-slate-200 font-medium">Demo Mode</span>{" "}
                to see the full performance.
              </p>
            </>
          )}
          <p className="mt-1.5 text-[10.5px] font-mono text-slate-500 break-words line-clamp-2">
            {error}
          </p>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onSwitchToDemo}
              className={cn(
                "btn-primary text-[12px]",
                tokens && "shadow-none",
              )}
            >
              <Play className="h-3.5 w-3.5" />
              {tokens ? "Switch to Demo Mode" : "Try Demo Mode"}
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="btn-ghost text-[11px]"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="grid h-6 w-6 place-items-center rounded-full text-slate-400 hover:text-white hover:bg-white/5 shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
