"use node";

/*
 * ============================================================================
 *   SPONSOR INTEGRATION — OpenAI
 * ============================================================================
 *   Server-side OpenAI client. Used by `convex/runner.ts` to drive the
 *   six-agent debate (5 specialists + final judge). All calls use OpenAI's
 *   structured-output mode (`response_format: json_schema`) so model output
 *   conforms to the schemas in `convex/prompts.ts` before persistence.
 *
 *   Key:    process.env.OPENAI_API_KEY  (set in Convex dashboard)
 *   Model:  gpt-5.5  with automatic fallback to gpt-4o-2024-08-06 on 404.
 * ============================================================================
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-5.5";
const FALLBACK_MODEL = "gpt-4o-2024-08-06";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StructuredResponseOptions {
  schema: unknown;
  schemaName: string;
  model?: string;
  messages: ChatMessage[];
}

export async function callStructured<T>(
  opts: StructuredResponseOptions,
): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to Convex env or fall back to demo mode.",
    );
  }

  const model = opts.model ?? DEFAULT_MODEL;

  const body = {
    model,
    messages: opts.messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: opts.schemaName,
        strict: true,
        schema: opts.schema,
      },
    },
  };

  let res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok && res.status === 404) {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...body, model: FALLBACK_MODEL }),
    });
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 400)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response missing content");
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("OpenAI response was not valid JSON");
  }
}

export async function callPlainText(
  messages: ChatMessage[],
  model = DEFAULT_MODEL,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  let res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok && res.status === 404) {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: FALLBACK_MODEL, messages }),
    });
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}
