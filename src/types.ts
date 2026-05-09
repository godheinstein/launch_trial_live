export type Severity = "low" | "medium" | "high" | "critical";

export type AutonomyLevel =
  | "none"
  | "suggests_only"
  | "requires_approval"
  | "acts_automatically";

export type AgentType =
  | "malicious_user"
  | "privacy_auditor"
  | "confused_customer"
  | "prompt_injection_attacker"
  | "skeptical_investor"
  | "final_judge";

export type RiskCategory =
  | "privacy"
  | "security"
  | "ux"
  | "business"
  | "trust"
  | "compliance"
  | "prompt_injection"
  | "safety";

export type VerdictLabel = "safe_to_demo" | "needs_fixes" | "high_risk";

export type TrialStatus =
  | "draft"
  | "running"
  | "completed"
  | "retrial_running"
  | "retrial_completed"
  | "error";

export type TrialPhase = "initial" | "retrial";

export type AgentRunStatus = "pending" | "running" | "complete" | "error";

export interface ProductInput {
  productName: string;
  productDescription: string;
  targetUsers: string;
  aiActions: string;
  dataAccessed: string;
  autonomyLevel: AutonomyLevel;
  additionalContext?: string;
}

export interface AgentMeta {
  type: AgentType;
  name: string;
  tagline: string;
  accent: string;
}

export interface RiskCard {
  id: string;
  trialId: string;
  phase: TrialPhase;
  title: string;
  category: RiskCategory;
  severity: Severity;
  description: string;
  impact: string;
  fix: string;
  agentType: AgentType;
  selectedForFix: boolean;
  createdAt: number;
}

export interface AgentMessage {
  id: string;
  trialId: string;
  phase: TrialPhase;
  agentType: AgentType;
  agentName: string;
  headline: string;
  critique: string;
  keyQuestion: string;
  suggestedFix: string;
  severity: Severity;
  createdAt: number;
}

export interface AgentRunState {
  agentType: AgentType;
  status: AgentRunStatus;
  message?: AgentMessage;
  riskIds: string[];
}

export interface Verdict {
  trialId: string;
  phase: TrialPhase;
  launchReadinessScore: number;
  verdictLabel: VerdictLabel;
  summary: string;
  topRisks: string[];
  recommendedFixes: string[];
  improvedPositioning: string;
  judgeClosingStatement: string;
  createdAt: number;
}

export interface Trial {
  id: string;
  productName: string;
  productDescription: string;
  targetUsers: string;
  aiActions: string;
  dataAccessed: string;
  autonomyLevel: AutonomyLevel;
  additionalContext?: string;
  status: TrialStatus;
  initialScore?: number;
  retrialScore?: number;
  createdAt: number;
  updatedAt: number;
}

export interface TrialResult {
  trial: Trial;
  initialMessages: AgentMessage[];
  initialRisks: RiskCard[];
  initialVerdict?: Verdict;
  retrialMessages: AgentMessage[];
  retrialRisks: RiskCard[];
  retrialVerdict?: Verdict;
}
