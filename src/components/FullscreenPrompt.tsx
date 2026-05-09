import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Gavel, X } from "lucide-react";

interface Props {
  open: boolean;
  onEnter: () => void;
  onSkip: () => void;
}

export function FullscreenPrompt({ open, onEnter, onSkip }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="fs-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-bg/80 backdrop-blur-sm px-4"
          onClick={onSkip}
        >
          <motion.div
            key="fs-modal"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="panel-elevated w-full max-w-md overflow-hidden"
          >
            <div className="relative px-6 pt-6 pb-5">
              <button
                type="button"
                onClick={onSkip}
                aria-label="Close"
                className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full border border-border bg-bg-elevated/80 text-slate-400 hover:text-white hover:border-border-strong transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,0.25), rgba(212,175,55,0.18))",
                  color: "#d4af37",
                }}
              >
                <Gavel className="h-4 w-4" />
              </div>

              <h2 className="mt-4 text-lg font-semibold tracking-tight">
                Step into the Trial Chamber
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Six agents — privacy auditor, malicious user, prompt-injection
                attacker, skeptical investor, confused customer, and the Final
                Judge — are about to put your product on trial. The courtroom
                lands best in fullscreen, with the whole jury visible at once.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Press{" "}
                <kbd className="rounded bg-bg-elevated/80 border border-border px-1 py-0.5 text-[11px]">
                  Esc
                </kbd>{" "}
                any time to exit. You can also toggle fullscreen from the
                chamber header.
              </p>

              <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={onSkip}
                  className="btn-ghost text-xs"
                >
                  Watch in window
                </button>
                <button
                  type="button"
                  onClick={onEnter}
                  className="btn-primary"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Enter the chamber
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
