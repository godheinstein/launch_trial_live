"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const FAL_MODEL = "fal-ai/flux/schnell";
const FAL_URL = `https://fal.run/${FAL_MODEL}`;

type AgentTypeId =
  | "malicious_user"
  | "privacy_auditor"
  | "confused_customer"
  | "prompt_injection_attacker"
  | "skeptical_investor"
  | "final_judge";

const PROMPTS: Record<AgentTypeId, string> = {
  malicious_user:
    "Full-body cinematic character standee of a shadowy adversarial product tester, dark red accents, subtle hoodie silhouette, cyber-risk vibe, professional SaaS UI style, futuristic debate arena, premium lighting, transparent or dark background.",
  privacy_auditor:
    "Full-body cinematic character standee of a professional privacy auditor, blue and cyan accents, formal compliance expert, clipboard or data shield motif, futuristic debate arena, premium SaaS UI style, transparent or dark background.",
  confused_customer:
    "Full-body cinematic character standee of an ordinary customer looking uncertain but approachable, yellow accents, casual modern clothing, user feedback persona, futuristic debate arena, premium SaaS UI style, transparent or dark background.",
  prompt_injection_attacker:
    "Full-body cinematic character standee of a cyber prompt-injection attacker persona, orange and purple glitch accents, abstract hacker aesthetic, not criminally explicit, futuristic debate arena, premium SaaS UI style, transparent or dark background.",
  skeptical_investor:
    "Full-body cinematic character standee of a sharp skeptical investor, green accents, professional business attire, confident judging pose, futuristic debate arena, premium SaaS UI style, transparent or dark background.",
  final_judge:
    "Full-body cinematic character standee of a futuristic final judge, purple and gold accents, authoritative but professional, elevated tribunal presence, premium SaaS UI style, transparent or dark background.",
};

const AGENT_ORDER: AgentTypeId[] = [
  "malicious_user",
  "privacy_auditor",
  "confused_customer",
  "prompt_injection_attacker",
  "skeptical_investor",
  "final_judge",
];

interface FalImageResponse {
  images?: Array<{ url?: string; width?: number; height?: number }>;
  request_id?: string;
}

async function generateOne(
  prompt: string,
  apiKey: string,
): Promise<{ url: string; sourceRef?: string }> {
  const res = await fetch(FAL_URL, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      // Portrait aspect for full-body standees.
      image_size: "portrait_16_9",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fal ${res.status}: ${text.slice(0, 280)}`);
  }

  const json = (await res.json()) as FalImageResponse;
  const url = json?.images?.[0]?.url;
  if (!url) throw new Error("Fal response missing image url");
  return { url, sourceRef: json.request_id ?? FAL_MODEL };
}

export interface AgentGenerationResult {
  agentType: AgentTypeId;
  ok: boolean;
  error?: string;
}

/**
 * Generate one image per agent via Fal and persist URLs to Convex. Tolerates
 * partial failures: each agent is reported independently, and the action
 * returns the per-agent outcome rather than throwing on the first error.
 */
export const generateAll = action({
  args: {},
  handler: async (ctx): Promise<AgentGenerationResult[]> => {
    // Strict per-deployment rate limit: 6 full generations per hour. Six
    // images × generations × $/image is the most expensive flow in the app,
    // so be aggressive here. The client also has its own 30-min cooldown,
    // but this server check can't be bypassed.
    const allowed = await ctx.runMutation(internal.rateLimit.tryConsume, {
      key: "fal:generateAll:global",
      max: 6,
      windowMs: 60 * 60 * 1000,
    });
    if (!allowed) {
      throw new Error(
        "Agent visual generation is temporarily limited. Please try again later.",
      );
    }

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      throw new Error(
        "FAL_KEY is not set in the Convex deployment. Add it via the dashboard or `npx convex env set FAL_KEY ...`.",
      );
    }

    const results: AgentGenerationResult[] = [];
    for (const agentType of AGENT_ORDER) {
      const prompt = PROMPTS[agentType];
      try {
        const { url, sourceRef } = await generateOne(prompt, apiKey);
        await ctx.runMutation(internal.agentAssets.upsert, {
          agentType,
          imageUrl: url,
          prompt,
          sourceRef,
        });
        results.push({ agentType, ok: true });
      } catch (err) {
        results.push({
          agentType,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return results;
  },
});
