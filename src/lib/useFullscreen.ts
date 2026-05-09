import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Toggle a target element in/out of native browser fullscreen.
 *
 * Browsers require a real user gesture to enter fullscreen, so this hook
 * exposes `enter` / `exit` / `toggle` for click handlers. Auto-enter without
 * a gesture is intentionally not supported.
 */
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === ref.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () =>
      document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(async () => {
    const el = ref.current;
    if (!el || !document.fullscreenEnabled) return false;
    try {
      await el.requestFullscreen();
      return true;
    } catch (err) {
      console.warn("Fullscreen request failed", err);
      return false;
    }
  }, []);

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn("Fullscreen exit failed", err);
      }
    }
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen) void exit();
    else void enter();
  }, [isFullscreen, enter, exit]);

  const supported =
    typeof document !== "undefined" && document.fullscreenEnabled === true;

  return { ref, isFullscreen, enter, exit, toggle, supported };
}
