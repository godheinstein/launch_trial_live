import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "../lib/cn";

interface Props {
  isFullscreen: boolean;
  onToggle: () => void;
  supported?: boolean;
  className?: string;
}

export function FullscreenButton({
  isFullscreen,
  onToggle,
  supported = true,
  className,
}: Props) {
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn("btn-secondary", className)}
      title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter cinematic fullscreen"}
      aria-pressed={isFullscreen}
    >
      {isFullscreen ? (
        <>
          <Minimize2 className="h-3.5 w-3.5" />
          Exit fullscreen
        </>
      ) : (
        <>
          <Maximize2 className="h-3.5 w-3.5" />
          Fullscreen
        </>
      )}
    </button>
  );
}
