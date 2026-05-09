import { motion } from "framer-motion";
import { cn } from "../lib/cn";

interface Props {
  /** 0-based index of the current step. */
  current: number;
  /** Total number of steps (excluding the review). */
  total: number;
  /** Whether the review screen is currently active. */
  reviewing?: boolean;
  /** Click a step pip to jump back. Forward jumps are blocked. */
  onJump?: (index: number) => void;
}

export function IntakeProgress({
  current,
  total,
  reviewing,
  onJump,
}: Props) {
  const percent = reviewing
    ? 100
    : Math.min(100, Math.round(((current + 1) / total) * 100));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-2">
        <span>Build your launch trial</span>
        <span>
          {reviewing ? "Review" : `Step ${current + 1} of ${total}`}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-bg-elevated/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #7c5cff 0%, #a594ff 50%, #d4af37 100%)",
            boxShadow: "0 0 12px rgba(124,92,255,0.5)",
          }}
        />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const reached = i <= current || reviewing;
          const isCurrent = i === current && !reviewing;
          const clickable = !!onJump && i < current;
          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onJump?.(i) : undefined}
              aria-label={`Step ${i + 1}`}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                reached ? "bg-accent" : "bg-border",
                isCurrent && "ring-2 ring-accent/40",
                clickable && "cursor-pointer hover:bg-accent-soft",
                !clickable && "cursor-default",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
