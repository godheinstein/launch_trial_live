import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Sparkles, X } from "lucide-react";

interface Props {
  /** Hide entirely when already fullscreen or unsupported. */
  visible: boolean;
  onEnter: () => void;
}

const SESSION_KEY = "ltl_skip_fs_hint";

/**
 * A small, dismissible banner inside the chamber suggesting the user go
 * fullscreen for the cinematic six-agent experience. Auto-hides once
 * dismissed for the rest of the session.
 */
export function FullscreenHint({ visible, onEnter }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  });

  useEffect(() => {
    if (!visible) return;
    // No-op listener; the dismissed state is persisted by the close button.
  }, [visible]);

  const close = () => {
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  const enter = () => {
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
    onEnter();
  };

  if (!visible || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative flex items-center gap-3 rounded-xl border border-accent/30 px-3 py-2"
        style={{
          background:
            "linear-gradient(90deg, rgba(124,92,255,0.10) 0%, rgba(212,175,55,0.08) 100%)",
          boxShadow: "0 0 0 1px rgba(124,92,255,0.15)",
        }}
        role="status"
      >
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-lg shrink-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,92,255,0.3), rgba(212,175,55,0.2))",
            color: "#d4af37",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-slate-100 leading-snug">
            <span className="font-semibold text-white">
              Watch the full debate.
            </span>{" "}
            <span className="text-slate-300">
              Six agents are easier to follow with the chamber filling your
              screen.
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={enter}
          className="btn-secondary text-[11px] py-1 px-2.5 shrink-0"
        >
          <Maximize2 className="h-3 w-3" />
          Go fullscreen
        </button>
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss fullscreen hint"
          className="grid h-6 w-6 place-items-center rounded-full text-slate-400 hover:text-white hover:bg-white/5 shrink-0"
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
