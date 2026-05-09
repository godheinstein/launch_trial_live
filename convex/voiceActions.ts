"use node";

/*
 * ============================================================================
 *   SPONSOR INTEGRATION — Gemini Voice (primary) + ElevenLabs (fallback)
 * ============================================================================
 *   Voice-verdict TTS, called from `<VoiceVerdictButton />`. Gemini's
 *   gemini-2.5-flash-preview-tts is tried first; PCM bytes are wrapped in a
 *   WAV header server-side so the browser <audio> can play them directly.
 *   On Gemini failure or missing key, falls back to ElevenLabs
 *   (eleven_multilingual_v2). Returns base64 audio so keys never reach the
 *   browser.
 *
 *   Keys:   process.env.GEMINI_API_KEY      (primary)
 *           process.env.ELEVENLABS_API_KEY  (fallback)
 *           Both set in Convex dashboard env.
 * ============================================================================
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/** Hard cap on how long a single TTS request can be. Both providers can
 *  handle longer, but the verdict closing statement is at most a few
 *  sentences, so anything beyond this is suspicious. */
const MAX_VOICE_TEXT_CHARS = 2000;

/*
 * Voice synthesis actions.
 *
 * Two providers in priority order: Gemini (active), ElevenLabs (active).
 * Each returns base64-encoded audio + MIME type so the browser can decode
 * without exposing API keys client-side.
 *
 * The client should call `synthesizeVerdictVoice` and prefer this path when
 * `VITE_CONVEX_URL` is set. Demo-only deployments without Convex can fall
 * back to the browser-side path in `src/lib/voice.ts`.
 */

const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";
const GEMINI_VOICE_NAME = "Kore"; // calm, judge-like

interface SynthesisResult {
  provider: "gemini" | "elevenlabs";
  mimeType: string;
  audioBase64: string;
}

/**
 * Wrap raw PCM (16-bit, mono) returned by Gemini in a minimal WAV header so
 * the browser's <audio> element can play it. Gemini's mimeType looks like
 * `audio/L16;codec=pcm;rate=24000`.
 */
function pcmToWav(pcmBase64: string, sampleRate: number): string {
  const pcm = Buffer.from(pcmBase64, "base64");
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // format = PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate (mono * 16-bit)
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]).toString("base64");
}

function parseSampleRate(mimeType: string | undefined): number {
  if (!mimeType) return 24000;
  const match = mimeType.match(/rate=(\d+)/);
  return match ? Number(match[1]) : 24000;
}

async function tryGemini(text: string): Promise<SynthesisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        parts: [{ text }],
      },
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: GEMINI_VOICE_NAME,
          },
        },
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string; mimeType?: string };
        }>;
      };
    }>;
  };

  const part = json.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.data,
  );
  const inline = part?.inlineData;
  if (!inline?.data) {
    throw new Error("Gemini response missing audio data");
  }

  const sampleRate = parseSampleRate(inline.mimeType);
  const wavBase64 = pcmToWav(inline.data, sampleRate);
  return {
    provider: "gemini",
    mimeType: "audio/wav",
    audioBase64: wavBase64,
  };
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
  handler: async (ctx, args) => {
    if (typeof args.text !== "string" || args.text.trim().length === 0) {
      throw new Error("Voice synthesis requires non-empty text.");
    }
    if (args.text.length > MAX_VOICE_TEXT_CHARS) {
      throw new Error(
        `Voice text is too long (${args.text.length} chars, max ${MAX_VOICE_TEXT_CHARS}).`,
      );
    }

    // Per-deployment rate limit: 60 voice synth calls per hour. Gemini /
    // ElevenLabs are paid per request, so cap before calling out.
    const allowed = await ctx.runMutation(internal.rateLimit.tryConsume, {
      key: "voice:synthesize:global",
      max: 60,
      windowMs: 60 * 60 * 1000,
    });
    if (!allowed) {
      throw new Error(
        "Voice synthesis is temporarily limited. Please wait a moment and try again.",
      );
    }

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
