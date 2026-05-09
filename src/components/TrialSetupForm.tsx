import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Wand2, Play, Gavel } from "lucide-react";
import { SAMPLE_INPUTS } from "../demo/sampleInputs";
import type { AutonomyLevel, ProductInput } from "../types";
import { cn } from "../lib/cn";

const AUTONOMY_OPTIONS: { value: AutonomyLevel; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "No AI actions, content only" },
  {
    value: "suggests_only",
    label: "Suggests only",
    hint: "AI proposes; user must execute",
  },
  {
    value: "requires_approval",
    label: "Requires approval",
    hint: "AI drafts; user approves before action",
  },
  {
    value: "acts_automatically",
    label: "Acts automatically",
    hint: "AI executes without per-action approval",
  },
];

export function TrialSetupForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDemo = searchParams.get("demo") === "1";

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [aiActions, setAiActions] = useState("");
  const [dataAccessed, setDataAccessed] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>(
    "requires_approval",
  );
  const [additionalContext, setAdditionalContext] = useState("");

  const applySample = (idx: number) => {
    const s = SAMPLE_INPUTS[idx];
    setProductName(s.productName);
    setProductDescription(s.productDescription);
    setTargetUsers(s.targetUsers);
    setAiActions(s.aiActions);
    setDataAccessed(s.dataAccessed);
    setAutonomyLevel(s.autonomyLevel);
    setAdditionalContext(s.additionalContext ?? "");
  };

  const startTrial = (demo: boolean) => {
    const input: ProductInput = {
      productName: productName || "Untitled product",
      productDescription:
        productDescription ||
        "We built an AI email assistant that connects to Gmail, reads important emails, and automatically replies on behalf of the user. It decides which emails are urgent, drafts replies, and can send them automatically.",
      targetUsers: targetUsers || "AI builders",
      aiActions: aiActions || "Reads input, generates output",
      dataAccessed: dataAccessed || "User-provided text",
      autonomyLevel,
      additionalContext: additionalContext || undefined,
    };

    const trialId = `trial-${Date.now().toString(36)}`;
    const params = new URLSearchParams();
    if (demo) params.set("demo", "1");
    params.set("productName", input.productName);
    params.set("productDescription", input.productDescription);
    params.set("targetUsers", input.targetUsers);
    params.set("aiActions", input.aiActions);
    params.set("dataAccessed", input.dataAccessed);
    params.set("autonomyLevel", input.autonomyLevel);
    if (input.additionalContext)
      params.set("additionalContext", input.additionalContext);
    navigate(`/trial/${trialId}?${params.toString()}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    startTrial(initialDemo);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-center mb-8">
        <span className="chip mx-auto mb-4">
          <Gavel className="h-3 w-3" /> Step 1 of 2
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Describe the product on trial
        </h1>
        <p className="mt-2 text-slate-400">
          Be specific about capabilities, autonomy, and data — sharper inputs
          mean sharper critique.
        </p>
      </div>

      <div className="panel p-2 mb-6">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Use a sample
          </span>
          <Wand2 className="h-3.5 w-3.5 text-slate-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-2 pb-2">
          {SAMPLE_INPUTS.map((sample, idx) => (
            <button
              key={sample.productName}
              type="button"
              onClick={() => applySample(idx)}
              className={cn(
                "rounded-xl border border-border bg-bg-elevated/60 p-3 text-left transition-all",
                "hover:border-accent/50 hover:bg-bg-elevated",
              )}
            >
              <div className="text-sm font-medium">{sample.productName}</div>
              <div className="mt-1 text-xs text-slate-400 line-clamp-2">
                {sample.productDescription}
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
        <div>
          <label className="label" htmlFor="productName">
            Product name
          </label>
          <input
            id="productName"
            className="input"
            placeholder="e.g. AutoReply AI"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="productDescription">
            Product description
          </label>
          <textarea
            id="productDescription"
            required
            rows={4}
            className="input resize-y"
            placeholder="What does the product do, end to end?"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="targetUsers">
              Target users
            </label>
            <input
              id="targetUsers"
              className="input"
              placeholder="Solo founders, sales teams, …"
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="dataAccessed">
              Data accessed
            </label>
            <input
              id="dataAccessed"
              className="input"
              placeholder="Gmail mailbox, calendar, resumes, …"
              value={dataAccessed}
              onChange={(e) => setDataAccessed(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="aiActions">
            AI actions
          </label>
          <input
            id="aiActions"
            className="input"
            placeholder="Reads emails, drafts replies, sends, …"
            value={aiActions}
            onChange={(e) => setAiActions(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Autonomy level</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {AUTONOMY_OPTIONS.map((opt) => {
              const selected = autonomyLevel === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setAutonomyLevel(opt.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    selected
                      ? "border-accent/60 bg-accent/10"
                      : "border-border bg-bg-elevated/60 hover:border-border-strong",
                  )}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {opt.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="additionalContext">
            Optional: prompt, landing copy, or README
          </label>
          <textarea
            id="additionalContext"
            rows={3}
            className="input resize-y"
            placeholder="Paste your system prompt, pricing, integration scope, etc."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => startTrial(true)}
            className="btn-secondary w-full sm:w-auto"
          >
            <Play className="h-3.5 w-3.5" />
            Run demo mode
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Start the trial
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
