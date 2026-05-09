import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Wand2,
  Play,
  Gavel,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SAMPLE_INPUTS } from "../demo/sampleInputs";
import type { AutonomyLevel, ProductInput } from "../types";
import { isLiveMode } from "../lib/convexClient";
import { cn } from "../lib/cn";
import { IntakeProgress } from "./IntakeProgress";
import { IntakeReview } from "./IntakeReview";
import { VoiceInputButton } from "./VoiceInputButton";

/* ---------- Step config ---------- */

type FieldKey = keyof ProductInput;

interface BaseStep {
  field: FieldKey;
  prompt: string;
  helper?: string;
  /** Validate the value; return null when valid or an error string. */
  validate: (value: string) => string | null;
}

interface TextStep extends BaseStep {
  kind: "text" | "textarea";
  placeholder: string;
  maxLength: number;
  voice: boolean;
  required: boolean;
}

interface ChoiceStep extends BaseStep {
  kind: "choice";
  options: { value: AutonomyLevel; label: string; hint: string }[];
  required: boolean;
}

type StepConfig = TextStep | ChoiceStep;

const MAX = {
  productName: 120,
  productDescription: 3000,
  targetUsers: 1000,
  aiActions: 1500,
  dataAccessed: 1500,
  additionalContext: 3000,
} as const;

function lengthValidator(max: number, required: boolean) {
  return (value: string): string | null => {
    const v = value.trim();
    if (required && v.length === 0) return "This field is required.";
    if (value.length > max) return `Keep it under ${max} characters.`;
    return null;
  };
}

const AUTONOMY_OPTIONS: ChoiceStep["options"] = [
  {
    value: "none",
    label: "None",
    hint: "It is mostly informational; users decide everything.",
  },
  {
    value: "suggests_only",
    label: "Suggests only",
    hint: "It proposes; users decide what to do.",
  },
  {
    value: "requires_approval",
    label: "Requires approval",
    hint: "It drafts; users approve before action happens.",
  },
  {
    value: "acts_automatically",
    label: "Acts automatically",
    hint: "It can take action without per-action approval.",
  },
];

const STEPS: StepConfig[] = [
  {
    field: "productName",
    prompt: "What are you putting on trial?",
    helper: "Project, app, product, startup idea, workflow — anything works.",
    kind: "text",
    placeholder: "e.g. AutoReply AI, MeetingMind, HireLens, Qage",
    maxLength: MAX.productName,
    required: true,
    voice: true,
    validate: lengthValidator(MAX.productName, true),
  },
  {
    field: "productDescription",
    prompt: "What does your product or idea do?",
    helper:
      "Describe it like you would explain it to a judge, customer, or teammate.",
    kind: "textarea",
    placeholder:
      "We built …  It connects to …  It decides …  It can …",
    maxLength: MAX.productDescription,
    required: true,
    voice: true,
    validate: lengthValidator(MAX.productDescription, true),
  },
  {
    field: "targetUsers",
    prompt: "Who is this for?",
    helper: "Tell us the main users, customers, or stakeholders.",
    kind: "text",
    placeholder: "Solo founders, sales teams, recruiters, …",
    maxLength: MAX.targetUsers,
    required: false,
    voice: true,
    validate: lengthValidator(MAX.targetUsers, false),
  },
  {
    field: "aiActions",
    prompt: "What actions does it perform?",
    helper:
      "If it uses AI or automation, include what it reads, writes, decides, generates, sends, recommends, or triggers.",
    kind: "textarea",
    placeholder:
      "Reads X, classifies Y, drafts Z, sends to recipients, …",
    maxLength: MAX.aiActions,
    required: false,
    voice: true,
    validate: lengthValidator(MAX.aiActions, false),
  },
  {
    field: "dataAccessed",
    prompt: "What data does it access?",
    helper:
      "Include user data, files, emails, messages, payments, health data, company data, or anything sensitive.",
    kind: "textarea",
    placeholder: "Gmail mailbox, calendar, resumes, payment metadata, …",
    maxLength: MAX.dataAccessed,
    required: false,
    voice: true,
    validate: lengthValidator(MAX.dataAccessed, false),
  },
  {
    field: "autonomyLevel",
    prompt: "How much can it act on its own?",
    helper: "Pick the level closest to today's behaviour.",
    kind: "choice",
    options: AUTONOMY_OPTIONS,
    required: true,
    validate: (value) =>
      AUTONOMY_OPTIONS.some((o) => o.value === value)
        ? null
        : "Pick one of the autonomy levels.",
  },
  {
    field: "additionalContext",
    prompt: "Anything else the trial should know?",
    helper:
      "Add business model, launch plan, technical constraints, risks you are worried about, or demo context. Optional.",
    kind: "textarea",
    placeholder:
      "Pricing, integration scope, brand voice, system prompt, regulatory context …",
    maxLength: MAX.additionalContext,
    required: false,
    voice: true,
    validate: lengthValidator(MAX.additionalContext, false),
  },
];

const TOTAL_STEPS = STEPS.length;

/* ---------- Component ---------- */

const DEFAULT_VALUES: ProductInput = {
  productName: "",
  productDescription: "",
  targetUsers: "",
  aiActions: "",
  dataAccessed: "",
  autonomyLevel: "requires_approval",
  additionalContext: "",
};

export function TrialSetupForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDemo = searchParams.get("demo") === "1";
  const createTrial = useMutation(api.trials.createTrial);

  const [values, setValues] = useState<ProductInput>(DEFAULT_VALUES);
  const [stepIndex, setStepIndex] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Auto-focus the field whenever the step changes
  useEffect(() => {
    if (reviewing) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [stepIndex, reviewing]);

  const currentStep = STEPS[stepIndex];

  const setField = (field: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  /* ---------- Sample / Demo shortcuts ---------- */

  const applySampleAndReview = (idx: number) => {
    const s = SAMPLE_INPUTS[idx];
    setValues({
      productName: s.productName,
      productDescription: s.productDescription,
      targetUsers: s.targetUsers,
      aiActions: s.aiActions,
      dataAccessed: s.dataAccessed,
      autonomyLevel: s.autonomyLevel,
      additionalContext: s.additionalContext ?? "",
    });
    setStepIndex(TOTAL_STEPS - 1);
    setReviewing(true);
    setError(null);
  };

  /* ---------- Trial submission ---------- */

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

  const buildInput = (): ProductInput => ({
    productName: values.productName.trim() || "Untitled product",
    productDescription:
      values.productDescription.trim() ||
      "We built an AI email assistant that connects to Gmail, reads important emails, and automatically replies on behalf of the user.",
    targetUsers: values.targetUsers.trim() || "Builders and product teams",
    aiActions:
      values.aiActions.trim() || "User-driven actions; no AI automation",
    dataAccessed: values.dataAccessed.trim() || "User-provided text",
    autonomyLevel: values.autonomyLevel,
    additionalContext: (values.additionalContext ?? "").trim() || undefined,
  });

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

  /* ---------- Step navigation ---------- */

  const validateCurrent = (): boolean => {
    const value =
      currentStep.kind === "choice"
        ? values.autonomyLevel
        : (values[currentStep.field] as string);
    const err = currentStep.validate(value ?? "");
    setError(err);
    return err === null;
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    if (stepIndex >= TOTAL_STEPS - 1) {
      setReviewing(true);
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const goBack = () => {
    setError(null);
    if (reviewing) {
      setReviewing(false);
      return;
    }
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
  };

  const jumpTo = (idx: number) => {
    setError(null);
    setReviewing(false);
    setStepIndex(idx);
  };

  /* ---------- Keyboard ---------- */

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Enter advances on inputs; Cmd/Ctrl+Enter advances on textareas.
    if (e.key === "Enter") {
      if (currentStep.kind === "textarea") {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          goNext();
        }
        return;
      }
      e.preventDefault();
      goNext();
    }
  };

  /* ---------- Render ---------- */

  const continueDisabled = useMemo(() => {
    if (currentStep.kind === "choice") {
      return !AUTONOMY_OPTIONS.some(
        (o) => o.value === values.autonomyLevel,
      );
    }
    if (currentStep.required) {
      const raw = values[currentStep.field as keyof ProductInput];
      return String(raw ?? "").trim() === "";
    }
    return false;
  }, [currentStep, values]);

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="chip mx-auto mb-4">
          <Gavel className="h-3 w-3" />
          Project intake
        </span>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          A guided seven-step intake. Answer at your own pace, edit anytime,
          or skip to the demo product.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <IntakeProgress
          current={stepIndex}
          total={TOTAL_STEPS}
          reviewing={reviewing}
          onJump={jumpTo}
        />
      </div>

      {/* Sample shortcut — only shown on the very first step */}
      {!reviewing && stepIndex === 0 && (
        <div className="panel p-2 mb-5">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Use a sample product
            </span>
            <Wand2 className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-2 pb-2">
            {SAMPLE_INPUTS.map((sample, idx) => (
              <button
                key={sample.productName}
                type="button"
                onClick={() => applySampleAndReview(idx)}
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
      )}

      {/* Step body */}
      <div className="panel p-6 md:p-8 min-h-[340px]">
        <AnimatePresence mode="wait" initial={false}>
          {reviewing ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <IntakeReview
                values={values}
                onEdit={jumpTo}
                onSubmit={() => void startTrial(initialDemo)}
                onUseDemo={() => void startTrial(true)}
                submitting={submitting}
                submitLabel={isLiveMode ? "Start the trial" : "Run demo trial"}
              />
              {submitError && (
                <div className="mt-4 rounded-xl border border-risk-critical/40 bg-risk-critical/5 px-3 py-2 text-xs text-risk-critical flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`step-${stepIndex}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
                {currentStep.prompt}
              </h2>
              {currentStep.helper && (
                <p className="mt-2 text-sm text-slate-400">
                  {currentStep.helper}
                </p>
              )}

              <div className="mt-5">
                <StepInput
                  step={currentStep}
                  values={values}
                  onChange={setField}
                  inputRef={inputRef}
                  onKeyDown={onKeyDown}
                  invalid={!!error}
                />

                {/* Voice input + character count */}
                <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                  {currentStep.kind !== "choice" && currentStep.voice ? (
                    <VoiceInputButton
                      value={values[currentStep.field] as string}
                      onChange={(next) => setField(currentStep.field, next)}
                    />
                  ) : (
                    <span />
                  )}
                  {currentStep.kind !== "choice" && (
                    <CharCount
                      value={(values[currentStep.field] as string) ?? ""}
                      max={(currentStep as TextStep).maxLength}
                    />
                  )}
                </div>

                {error && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/5 px-2.5 py-1 text-[11px] text-risk-medium">
                    <AlertTriangle className="h-3 w-3" />
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: Back / Continue / Demo */}
      <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={!reviewing && stepIndex === 0}
          className="btn-ghost text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
          <button
            type="button"
            onClick={() => void startTrial(true)}
            className="btn-secondary"
            disabled={submitting}
          >
            <Play className="h-3.5 w-3.5" />
            Use demo product
          </button>
          {!reviewing && (
            <button
              type="button"
              onClick={goNext}
              disabled={continueDisabled}
              className="btn-primary"
            >
              {stepIndex === TOTAL_STEPS - 1 ? "Review answers" : "Continue"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function CharCount({ value, max }: { value: string; max: number }) {
  const ratio = value.length / max;
  const tone =
    ratio > 0.95
      ? "text-risk-critical"
      : ratio > 0.8
        ? "text-risk-medium"
        : "text-slate-500";
  return (
    <span className={cn("text-[10px] tabular-nums", tone)}>
      {value.length}/{max}
    </span>
  );
}

interface StepInputProps {
  step: StepConfig;
  values: ProductInput;
  onChange: (field: FieldKey, value: string) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  invalid: boolean;
}

function StepInput({
  step,
  values,
  onChange,
  inputRef,
  onKeyDown,
  invalid,
}: StepInputProps) {
  if (step.kind === "choice") {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Autonomy level"
      >
        {step.options.map((opt) => {
          const selected = values.autonomyLevel === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange("autonomyLevel", opt.value)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                selected
                  ? "border-accent/60 bg-accent/10"
                  : "border-border bg-bg-elevated/60 hover:border-border-strong",
              )}
            >
              <div className="text-sm font-medium">{opt.label}</div>
              <div className="mt-1 text-[11.5px] text-slate-400 leading-relaxed">
                {opt.hint}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  const value = (values[step.field] as string) ?? "";
  if (step.kind === "textarea") {
    return (
      <textarea
        ref={(el) => {
          inputRef.current = el;
        }}
        rows={5}
        className={cn("input resize-y", invalid && "border-risk-medium/60")}
        placeholder={step.placeholder}
        value={value}
        maxLength={step.maxLength}
        onChange={(e) => onChange(step.field, e.target.value)}
        onKeyDown={onKeyDown}
        aria-label={step.prompt}
      />
    );
  }

  return (
    <input
      ref={(el) => {
        inputRef.current = el;
      }}
      type="text"
      className={cn("input", invalid && "border-risk-medium/60")}
      placeholder={step.placeholder}
      value={value}
      maxLength={step.maxLength}
      onChange={(e) => onChange(step.field, e.target.value)}
      onKeyDown={onKeyDown}
      aria-label={step.prompt}
    />
  );
}
