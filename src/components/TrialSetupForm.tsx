import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Wand2, Play, Gavel, AlertTriangle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SAMPLE_INPUTS } from "../demo/sampleInputs";
import type { AutonomyLevel, ProductInput } from "../types";
import { isLiveMode } from "../lib/convexClient";
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
  const createTrial = useMutation(api.trials.createTrial);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [aiActions, setAiActions] = useState("");
  const [dataAccessed, setDataAccessed] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>(
    "requires_approval",
  );
  const [additionalContext, setAdditionalContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const buildInput = (): ProductInput => ({
    productName: productName || "Untitled product",
    productDescription:
      productDescription ||
      "We built an AI email assistant that connects to Gmail, reads important emails, and automatically replies on behalf of the user. It decides which emails are urgent, drafts replies, and can send them automatically.",
    targetUsers: targetUsers || "Builders and product teams",
    aiActions: aiActions || "User-driven actions; no AI automation",
    dataAccessed: dataAccessed || "User-provided text",
    autonomyLevel,
    additionalContext: additionalContext || undefined,
  });

  const navigateToDemoTrial = (input: ProductInput) => {
    const trialId = `trial-${Date.now().toString(36)}`;
    const params = new URLSearchParams();
    params.set("demo", "1");
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

  const startTrial = async (demo: boolean) => {
    const input = buildInput();
    setSubmitError(null);

    if (demo || !isLiveMode) {
      navigateToDemoTrial(input);
      return;
    }

    setSubmitting(true);
    try {
      const { trialId } = await createTrial({
        productName: input.productName,
        productDescription: input.productDescription,
        targetUsers: input.targetUsers,
        aiActions: input.aiActions,
        dataAccessed: input.dataAccessed,
        autonomyLevel: input.autonomyLevel,
        additionalContext: input.additionalContext,
      });
      navigate(`/trial/${trialId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void startTrial(initialDemo);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-center mb-8">
        <span className="chip mx-auto mb-4">
          <Gavel className="h-3 w-3" /> Step 1 of 2
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Describe the product or idea on trial
        </h1>
        <p className="mt-2 text-slate-400">
          App, product, startup idea, workflow, feature — be specific about
          what it does, who it's for, and what data it touches. Sharper inputs
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
            Product or idea name
          </label>
          <input
            id="productName"
            className="input"
            placeholder="e.g. AutoReply AI, Local Coffee Map, Inventory Tracker"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="productDescription">
            What does it do?
          </label>
          <textarea
            id="productDescription"
            required
            rows={4}
            className="input resize-y"
            placeholder="Describe the product, app, idea, or workflow end to end."
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
            What it does on the user's behalf
          </label>
          <input
            id="aiActions"
            className="input"
            placeholder="e.g. reads emails and drafts replies, charges a card, posts publicly, none"
            value={aiActions}
            onChange={(e) => setAiActions(e.target.value)}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            If this isn't an AI product, describe the actions your product
            takes for the user (or "none — user-driven").
          </p>
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
            Optional: landing copy, README, pricing, system prompt
          </label>
          <textarea
            id="additionalContext"
            rows={3}
            className="input resize-y"
            placeholder="Anything else worth knowing — pricing, integrations, scope, brand voice, system prompt, etc."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </div>

        {submitError && (
          <div className="rounded-xl border border-risk-critical/40 bg-risk-critical/5 px-3 py-2 text-xs text-risk-critical flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-500">
            {isLiveMode
              ? "Live mode active · trials persist in Convex and call OpenAI"
              : "Demo mode · trials replay from sample data, no API keys needed"}
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => void startTrial(true)}
              disabled={submitting}
              className="btn-secondary w-full sm:w-auto"
            >
              <Play className="h-3.5 w-3.5" />
              Run demo mode
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto"
            >
              {submitting ? "Creating trial…" : "Start the trial"}
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
