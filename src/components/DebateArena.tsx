import type {
  AgentMessage,
  AgentRunState,
  AgentType,
  RiskCard,
  TrialStatus,
  Verdict,
} from "../types";
import { AgentTile } from "./AgentTile";
import { ProductOnTrialCenter } from "./ProductOnTrialCenter";

interface Props {
  productName: string;
  productDescription: string;
  agents: AgentRunState[];
  risks: RiskCard[];
  status: TrialStatus;
  verdict?: Verdict;
  activeAgent: AgentType | null;
  judgeSpotlight: boolean;
  focusMessage: AgentMessage | null;
  onSelectAgent: (agentType: AgentType) => void;
  /** Currently-narrating agent (drives the progress bar / paused pip). */
  narratingAgent?: AgentType | null;
  narrationProgress?: number;
  narrationPaused?: boolean;
}

const stateOf = (
  agents: AgentRunState[],
  agentType: AgentType,
): AgentRunState | undefined =>
  agents.find((a) => a.agentType === agentType);

/**
 * Strict 3×3 debate-arena grid.
 *
 *   Row 1:    .                Final Judge          .
 *   Row 2:    Privacy Auditor  Product on Trial     Skeptical Investor
 *   Row 3:    Malicious User   Confused Customer    Prompt Injection Attacker
 *
 * Each cell is a hard-bounded grid track; tiles never escape, bubbles live
 * inside their tile, evidence chips live inside the product card.
 */
export function DebateArena({
  productName,
  productDescription,
  agents,
  risks,
  status,
  verdict,
  activeAgent,
  judgeSpotlight,
  focusMessage,
  onSelectAgent,
  narratingAgent,
  narrationProgress,
  narrationPaused,
}: Props) {
  const judgeOnStand = judgeSpotlight && !!verdict;
  const currentAccusation = focusMessage?.keyQuestion ?? null;

  // Final Judge takes bubble priority once a verdict is in.
  const bubbleFor: AgentType | null = judgeOnStand ? "final_judge" : activeAgent;
  const showBubbleFor = (t: AgentType): boolean => bubbleFor === t;

  const tileNarrationProps = (t: AgentType) => {
    if (narratingAgent !== t) return {};
    return {
      narrationProgress,
      narrationPaused,
    };
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Subtle stage glow — purely decorative, no layout impact */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background: judgeOnStand
            ? "radial-gradient(70% 50% at 50% 0%, rgba(212,175,55,0.15), transparent 60%), radial-gradient(80% 60% at 50% 100%, rgba(165,148,255,0.10), transparent 60%)"
            : "radial-gradient(60% 50% at 50% 0%, rgba(124,92,255,0.12), transparent 60%), radial-gradient(70% 60% at 50% 100%, rgba(165,148,255,0.06), transparent 60%)",
        }}
      />

      {/* ===== Desktop 3×3 grid ===== */}
      <div
        className="relative hidden md:grid flex-1 min-h-0"
        style={{
          gridTemplateColumns:
            "minmax(180px, 1fr) minmax(260px, 1.2fr) minmax(180px, 1fr)",
          gridTemplateRows:
            "minmax(120px, 0.8fr) minmax(180px, 1.1fr) minmax(160px, 1fr)",
          gap: "clamp(10px, 1.4vw, 22px)",
          padding: "clamp(10px, 1.4vw, 22px)",
        }}
      >
        {/* Row 1: Final Judge centered */}
        <div className="col-start-2 row-start-1 h-full min-h-0 max-w-[260px] mx-auto w-full">
          <AgentTile
            agentType="final_judge"
            state={stateOf(agents, "final_judge")}
            judgeSpotlight={judgeSpotlight}
            variant="judge"
            showBubble={showBubbleFor("final_judge")}
            verdict={verdict}
            onClick={() => onSelectAgent("final_judge")}
            {...tileNarrationProps("final_judge")}
          />
        </div>

        {/* Row 2: Privacy | Product | Skeptical */}
        <div className="col-start-1 row-start-2 h-full min-h-0">
          <AgentTile
            agentType="privacy_auditor"
            state={stateOf(agents, "privacy_auditor")}
            active={activeAgent === "privacy_auditor"}
            showBubble={showBubbleFor("privacy_auditor")}
            onClick={() => onSelectAgent("privacy_auditor")}
            {...tileNarrationProps("privacy_auditor")}
          />
        </div>
        <div className="col-start-2 row-start-2 h-full min-h-0">
          <ProductOnTrialCenter
            productName={productName}
            productDescription={productDescription}
            status={status}
            activeAgent={activeAgent}
            judgeOnStand={judgeOnStand}
            verdict={verdict}
            currentAccusation={currentAccusation}
            risks={risks}
          />
        </div>
        <div className="col-start-3 row-start-2 h-full min-h-0">
          <AgentTile
            agentType="skeptical_investor"
            state={stateOf(agents, "skeptical_investor")}
            active={activeAgent === "skeptical_investor"}
            showBubble={showBubbleFor("skeptical_investor")}
            onClick={() => onSelectAgent("skeptical_investor")}
            {...tileNarrationProps("skeptical_investor")}
          />
        </div>

        {/* Row 3: Malicious | Confused Customer | Prompt Injection */}
        <div className="col-start-1 row-start-3 h-full min-h-0">
          <AgentTile
            agentType="malicious_user"
            state={stateOf(agents, "malicious_user")}
            active={activeAgent === "malicious_user"}
            showBubble={showBubbleFor("malicious_user")}
            onClick={() => onSelectAgent("malicious_user")}
            {...tileNarrationProps("malicious_user")}
          />
        </div>
        <div className="col-start-2 row-start-3 h-full min-h-0">
          <AgentTile
            agentType="confused_customer"
            state={stateOf(agents, "confused_customer")}
            active={activeAgent === "confused_customer"}
            showBubble={showBubbleFor("confused_customer")}
            onClick={() => onSelectAgent("confused_customer")}
            {...tileNarrationProps("confused_customer")}
          />
        </div>
        <div className="col-start-3 row-start-3 h-full min-h-0">
          <AgentTile
            agentType="prompt_injection_attacker"
            state={stateOf(agents, "prompt_injection_attacker")}
            active={activeAgent === "prompt_injection_attacker"}
            showBubble={showBubbleFor("prompt_injection_attacker")}
            onClick={() => onSelectAgent("prompt_injection_attacker")}
            {...tileNarrationProps("prompt_injection_attacker")}
          />
        </div>
      </div>

      {/* ===== Tablet / mobile stacked layout ===== */}
      <div className="md:hidden relative space-y-3 p-2">
        <ProductOnTrialCenter
          productName={productName}
          productDescription={productDescription}
          status={status}
          activeAgent={activeAgent}
          judgeOnStand={judgeOnStand}
          verdict={verdict}
          currentAccusation={currentAccusation}
          risks={risks}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <AgentTile
              agentType="final_judge"
              state={stateOf(agents, "final_judge")}
              judgeSpotlight={judgeSpotlight}
              variant="judge"
              showBubble={showBubbleFor("final_judge")}
              verdict={verdict}
              onClick={() => onSelectAgent("final_judge")}
            />
          </div>
          <AgentTile
            agentType="privacy_auditor"
            state={stateOf(agents, "privacy_auditor")}
            active={activeAgent === "privacy_auditor"}
            showBubble={showBubbleFor("privacy_auditor")}
            onClick={() => onSelectAgent("privacy_auditor")}
            {...tileNarrationProps("privacy_auditor")}
          />
          <AgentTile
            agentType="skeptical_investor"
            state={stateOf(agents, "skeptical_investor")}
            active={activeAgent === "skeptical_investor"}
            showBubble={showBubbleFor("skeptical_investor")}
            onClick={() => onSelectAgent("skeptical_investor")}
            {...tileNarrationProps("skeptical_investor")}
          />
          <AgentTile
            agentType="malicious_user"
            state={stateOf(agents, "malicious_user")}
            active={activeAgent === "malicious_user"}
            showBubble={showBubbleFor("malicious_user")}
            onClick={() => onSelectAgent("malicious_user")}
            {...tileNarrationProps("malicious_user")}
          />
          <AgentTile
            agentType="prompt_injection_attacker"
            state={stateOf(agents, "prompt_injection_attacker")}
            active={activeAgent === "prompt_injection_attacker"}
            showBubble={showBubbleFor("prompt_injection_attacker")}
            onClick={() => onSelectAgent("prompt_injection_attacker")}
            {...tileNarrationProps("prompt_injection_attacker")}
          />
          <div className="col-span-2">
            <AgentTile
              agentType="confused_customer"
              state={stateOf(agents, "confused_customer")}
              active={activeAgent === "confused_customer"}
              showBubble={showBubbleFor("confused_customer")}
              onClick={() => onSelectAgent("confused_customer")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
