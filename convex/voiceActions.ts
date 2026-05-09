"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

/*
 * Voice synthesis actions.
 *
 * Two providers in priority order: Gemini (TODO), ElevenLabs (active).
 * Each returns base64-encoded audio + MIME type so the browser can decode
 * without exposing API keys client-side.
 *
 * The client should call `synthesizeVerdictVoice` and prefer this path when
 * `VITE_CONVEX_URL` is set. Demo-only deployments without Convex can fall
 * back to the browser-side path in `src/lib/voice.ts`.
 */

const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

interface SynthesisResult {
  provider: "gemini" | "elevenlabs";
  mimeType: string;
  audioBase64: string;
}

async function tryGemini(_text: string): Promise<SynthesisResult | null> {
  // TODO: wire google-genai once the simple TTS endpoint is GA.
  // For now, signal "not configured" by returning null.
  if (!process.env.GEMINI_API_KEY) return null;
  return null;
}

async function tryElevenLabs(text: string): Promise<SynthesisResult | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

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
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 200)}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    provider: "elevenlabs",
    mimeType: "audio/mpeg",
    audioBase64: buffer.toString("base64"),
  };
}

export const synthesizeVerdictVoice = action({
  args: { text: v.string() },
  handler: async (_ctx, args) => {
    const errors: string[] = [];

    try {
      const gemini = await tryGemini(args.text);
      if (gemini) return gemini;
    } catch (err) {
      errors.push(`gemini: ${err instanceof Error ? err.message : err}`);
    }

    try {
      const elevenlabs = await tryElevenLabs(args.text);
      if (elevenlabs) return elevenlabs;
    } catch (err) {
      errors.push(
        `elevenlabs: ${err instanceof Error ? err.message : err}`,
      );
    }

    throw new Error(
      errors.length > 0
        ? `No voice provider succeeded. ${errors.join("; ")}`
        : "No voice provider configured. Set GEMINI_API_KEY or ELEVENLABS_API_KEY in Convex env.",
    );
  },
});
