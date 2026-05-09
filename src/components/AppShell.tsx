import { Link, NavLink, Outlet } from "react-router-dom";
import { Gavel, Sparkles, Wifi, WifiOff } from "lucide-react";
import { cn } from "../lib/cn";
import { isLiveMode } from "../lib/convexClient";

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-glow shadow-glow">
              <Gavel className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                Launch Trial Live
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Put your AI on trial
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "text-white bg-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/new"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "text-white bg-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )
              }
            >
              New trial
            </NavLink>
            <span
              className={cn(
                "ml-2 chip text-[10px] uppercase tracking-wider",
                isLiveMode
                  ? "text-risk-low border-risk-low/40"
                  : "text-slate-400",
              )}
              title={isLiveMode ? "Convex live mode" : "Demo mode (no VITE_CONVEX_URL)"}
            >
              {isLiveMode ? (
                <>
                  <Wifi className="h-3 w-3" /> live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" /> demo
                </>
              )}
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span>Launch Trial Live · AIE Hackathon</span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            built in 7 hours
          </span>
        </div>
      </footer>
    </div>
  );
}
