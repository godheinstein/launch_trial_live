import { useEffect, useState } from "react";
import type { AgentType } from "../types";
import { AgentSilhouette } from "./AgentSilhouette";
import { cn } from "../lib/cn";

interface Props {
  agentType: AgentType;
  className?: string;
}

const cache = new Map<AgentType, boolean>();

/**
 * Renders `/agents/{agentType}.png` if the file exists, otherwise falls back
 * to the CSS/SVG silhouette. The probe runs once per agent type and caches
 * the result for the rest of the session.
 *
 * The probe uses an off-screen `Image()` so a 404 doesn't paint a broken
 * image icon. While the probe is in flight the silhouette is shown — when
 * the image is confirmed available the standee swaps in the real asset.
 */
export function AgentImageOrSilhouette({ agentType, className }: Props) {
  const cached = cache.get(agentType);
  const [hasImage, setHasImage] = useState<boolean | null>(
    cached === undefined ? null : cached,
  );

  useEffect(() => {
    if (cache.has(agentType)) return;
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (cancelled) return;
      cache.set(agentType, true);
      setHasImage(true);
    };
    probe.onerror = () => {
      if (cancelled) return;
      cache.set(agentType, false);
      setHasImage(false);
    };
    probe.src = `/agents/${agentType}.png`;
    return () => {
      cancelled = true;
    };
  }, [agentType]);

  if (hasImage === true) {
    return (
      <img
        src={`/agents/${agentType}.png`}
        alt=""
        draggable={false}
        className={cn(
          "h-full w-auto max-w-full object-contain pointer-events-none select-none",
          className,
        )}
        style={{
          filter:
            "drop-shadow(0 12px 16px rgba(0,0,0,0.55)) drop-shadow(0 0 8px rgba(124,92,255,0.18))",
        }}
      />
    );
  }
  return (
    <AgentSilhouette
      agentType={agentType}
      className={cn("h-full w-auto max-w-full", className)}
    />
  );
}
