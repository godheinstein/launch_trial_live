/*
 * Voice provider abstraction.
 *
 * In live mode the button calls the Convex action `voiceActions.synthesizeVerdictVoice`
 * which keeps API keys server-side. In demo-only mode (no Convex) the button
 * falls back to the browser-side providers below — Gemini (TODO) then ElevenLabs.
 * The trial flow never blocks on voice.
 */

export type VoiceProviderId = "gemini" | "elevenlabs";

export interface VoiceProviderResult {
  provider: VoiceProviderId;
  audioUrl: string;
  cleanup: () => void;
  source: "convex" | "browser";
}

export interface VoiceProvider {
  id: VoiceProviderId;
  label: string;
  isConfigured: () => boolean;
  synthesize: (text: string) => Promise<VoiceProviderResult>;
}

/**
 * Gemini provider — TODO.
 *
 * Gemini's TTS / Live audio APIs are not yet exposed as a simple browser-side
 * REST endpoint comparable to ElevenLabs. The right integration is via Convex
 * action that calls google-genai server-side, then returns the audio bytes.
 * Until that's wired, this provider reports "not configured" so the chain
 * falls through to ElevenLabs.
 *
 * To enable later:
 *   1. Add `GEMINI_API_KEY` to Convex env vars.
 *   2. Add a Convex action that calls Gemini's `generateContent` with
 *      `responseModalities: ["AUDIO"]` and returns the audio bytes.
 *   3. Replace `isConfigured` to return true when `import.meta.env.VITE_CONVEX_URL`
 *      is set, and `synthesize` to call the Convex action via convexClient.action.
 */
const geminiProvider: VoiceProvider = {
  id: "gemini",
  label: "Gemini Voice",
  isConfigured: () => false,
  synthesize: async () => {
    throw new Error("Gemini voice provider not yet implemented");
  },
};

const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah — public default ElevenLabs voice

const elevenLabsProvider: VoiceProvider = {
  id: "elevenlabs",
  label: "ElevenLabs",
  isConfigured: () => {
    const key = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
    return !!key && key.length > 0;
  },
  synthesize: async (text: string) => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
    if (!apiKey) throw new Error("VITE_ELEVENLABS_API_KEY not set");

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `ElevenLabs ${res.status}: ${body.slice(0, 200) || "unknown"}`,
      );
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return {
      provider: "elevenlabs",
      audioUrl: url,
      cleanup: () => URL.revokeObjectURL(url),
      source: "browser",
    };
  },
};

const PROVIDERS: VoiceProvider[] = [geminiProvider, elevenLabsProvider];

export function getConfiguredVoiceProviders(): VoiceProvider[] {
  return PROVIDERS.filter((p) => p.isConfigured());
}

export function hasAnyVoiceProvider(): boolean {
  return getConfiguredVoiceProviders().length > 0;
}

export interface SynthesizeWithFallbackOutcome {
  result?: VoiceProviderResult;
  attempts: Array<{ provider: VoiceProviderId; ok: boolean; error?: string }>;
}

export async function synthesizeWithFallback(
  text: string,
): Promise<SynthesizeWithFallbackOutcome> {
  const attempts: SynthesizeWithFallbackOutcome["attempts"] = [];
  for (const provider of PROVIDERS) {
    if (!provider.isConfigured()) {
      attempts.push({
        provider: provider.id,
        ok: false,
        error: "not configured",
      });
      continue;
    }
    try {
      const result = await provider.synthesize(text);
      attempts.push({ provider: provider.id, ok: true });
      return { result, attempts };
    } catch (err) {
      attempts.push({
        provider: provider.id,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { attempts };
}

function base64ToObjectUrl(base64: string, mimeType: string): string {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

export interface ConvexVoiceResponse {
  provider: VoiceProviderId;
  mimeType: string;
  audioBase64: string;
}

/**
 * Wrap a Convex action result into a VoiceProviderResult so the button can
 * play it the same way as a browser-side provider response.
 */
export function convexVoiceResultToProviderResult(
  payload: ConvexVoiceResponse,
): VoiceProviderResult {
  const url = base64ToObjectUrl(payload.audioBase64, payload.mimeType);
  return {
    provider: payload.provider,
    audioUrl: url,
    cleanup: () => URL.revokeObjectURL(url),
    source: "convex",
  };
}
