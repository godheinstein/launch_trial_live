import { Pencil, Sparkles, Play } from "lucide-react";
import type { ProductInput } from "../types";

interface Field {
  key: keyof ProductInput;
  label: string;
}

const FIELDS: Field[] = [
  { key: "productName", label: "Project name" },
  { key: "productDescription", label: "What it does" },
  { key: "targetUsers", label: "Target users" },
  { key: "aiActions", label: "Actions performed" },
  { key: "dataAccessed", label: "Data accessed" },
  { key: "autonomyLevel", label: "Autonomy" },
  { key: "additionalContext", label: "Additional context" },
];

const AUTONOMY_LABEL: Record<ProductInput["autonomyLevel"], string> = {
  none: "None — mostly informational",
  suggests_only: "Suggests only — users decide",
  requires_approval: "Requires approval before action",
  acts_automatically: "Acts automatically without approval",
};

interface Props {
  values: ProductInput;
  onEdit: (stepIndex: number) => void;
  onSubmit: () => void;
  onUseDemo: () => void;
  submitting?: boolean;
  submitLabel?: string;
}

export function IntakeReview({
  values,
  onEdit,
  onSubmit,
  onUseDemo,
  submitting,
  submitLabel,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="chip text-[10px] uppercase tracking-[0.18em]">
          <Sparkles className="h-3 w-3" />
          Final review
        </span>
        <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
          Ready to put this on trial?
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Confirm what the jury will see, or jump back to edit any answer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FIELDS.map((f, idx) => {
          const raw = values[f.key];
          if (typeof raw === "undefined" || raw === "") {
            // Don't hide — explicitly show empty so the user can fill it.
          }
          const display =
            f.key === "autonomyLevel"
              ? AUTONOMY_LABEL[values.autonomyLevel]
              : (raw as string) || "—";
          return (
            <div
              key={f.key}
              className="rounded-xl border border-border bg-bg-elevated/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {f.label}
                </span>
                <button
                  type="button"
                  onClick={() => onEdit(idx)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
                  aria-label={`Edit ${f.label}`}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
              <p
                className={
                  "mt-1.5 text-sm leading-relaxed " +
                  (raw ? "text-slate-100" : "text-slate-500 italic")
                }
              >
                {display}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onUseDemo}
          className="btn-ghost text-xs"
        >
          <Play className="h-3.5 w-3.5" />
          Use demo product instead
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? "Creating trial…" : submitLabel ?? "Start the trial"}
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
