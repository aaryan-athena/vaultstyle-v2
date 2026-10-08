// Shared Groq caller for the server functions.
//
// The .server.ts suffix keeps this out of the client bundle. Three features now
// talk to Groq (vibe search, intake note, wishlist parsing) and they all need
// the same five things: read the key per-request, POST to the OpenAI-compatible
// endpoint, insist on JSON, parse defensively, and turn every failure into a
// message a user can read. That belongs in one place.
//
// On Cloudflare Workers env binds at request time, so the key is read inside
// the function, never at module scope (see lib/config.server.ts).

import type { z } from "zod";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/** Text-only default. Override per-deploy with GROQ_MODEL. */
export const TEXT_MODEL_DEFAULT = "llama-3.3-70b-versatile";

/**
 * Vision-capable default, override with GROQ_VISION_MODEL.
 *
 * Groq's multimodal line-up moves faster than this repo will — it has already
 * been Llava, then Llama 4 Scout/Maverick, now the Qwen 3.x vision models. So
 * the id is env-configurable and a "model not found" reply is surfaced verbatim
 * rather than swallowed, which makes a rotation a config change, not a patch.
 */
export const VISION_MODEL_DEFAULT = "qwen/qwen3.6-27b";

export type GroqFailure = { ok: false; reason: string };
export type GroqSuccess<T> = { ok: true; result: T };
export type GroqResult<T> = GroqSuccess<T> | GroqFailure;

export type GroqTextPart = { type: "text"; text: string };
export type GroqImagePart = { type: "image_url"; image_url: { url: string } };
export type GroqContent = string | Array<GroqTextPart | GroqImagePart>;
export type GroqMessage = { role: "system" | "user"; content: GroqContent };

type CallOptions<T> = {
  messages: GroqMessage[];
  /** Shape the reply must satisfy. A reply that doesn't is treated as a failure. */
  schema: z.ZodType<T>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * Ask the API to guarantee JSON.
   *
   * Safe to leave on — but only in combination with `reasoningEffort: "none"`
   * on a reasoning model. A reasoning model left to think emits a <think>
   * block before the answer, and Groq then rejects the whole completion with
   * `json_validate_failed` and an empty body. Verified against the live API.
   */
  jsonMode?: boolean;
  /**
   * "none" suppresses the <think> block on reasoning models. Groq accepts only
   * "none" or "default" here — "low"/"medium" are rejected as invalid.
   *
   * This is not a style preference: on the vision model, reasoning took a
   * 9-item wishlist from 247 to 1064 output tokens, and this account's tier
   * caps output at 1000 tokens/minute, so thinking made the call fail outright.
   */
  reasoningEffort?: "none" | "default";
  /** Label used in log lines so a failure is traceable to a feature. */
  feature: string;
};

/**
 * Pull a JSON object out of a model reply that may be wrapped in reasoning.
 *
 * Reasoning models return `<think>…</think>` and sometimes a ```json fence
 * around the payload. Being liberal here is what lets the vision path work at
 * all, and costs nothing on replies that were already clean JSON.
 */
export function extractJsonObject(content: string): unknown {
  const stripped = content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```(?:json)?/gi, "")
    .trim();

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object in reply");

  return JSON.parse(stripped.slice(start, end + 1));
}

export function groqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY;
}

export const MISSING_KEY_REASON =
  "AI features aren't configured yet — add a GROQ_API_KEY to enable this.";

/**
 * Call Groq and validate the reply against `schema`.
 *
 * Never throws: every path returns a GroqResult, because these run behind a
 * server function whose caller is a UI that has to render something.
 */
export async function callGroqJson<T>({
  messages,
  schema,
  model,
  temperature = 0.4,
  maxTokens = 700,
  jsonMode = true,
  reasoningEffort,
  feature,
}: CallOptions<T>): Promise<GroqResult<T>> {
  const apiKey = groqApiKey();
  if (!apiKey) return { ok: false, reason: MISSING_KEY_REASON };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || process.env.GROQ_MODEL || TEXT_MODEL_DEFAULT,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[groq:${feature}] ${res.status}`, body);

      // A retired or misnamed model is the one failure worth naming precisely,
      // since the fix is an env var rather than anything the user can do.
      if (res.status === 404 || /model.*(not found|decommissioned|does not exist)/i.test(body)) {
        return {
          ok: false,
          reason:
            "That Groq model isn't available on this key. Set GROQ_MODEL (or GROQ_VISION_MODEL) to a current model id.",
        };
      }
      // Groq rejects a request whose *requested* max_tokens exceeds the
      // account's output-tokens-per-minute allowance, before running it. On
      // the free/on-demand tier that ceiling is low (1000 OTPM), so this fires
      // for a config mistake rather than for genuine traffic — say which knob.
      if (/tokens per minute|Request too large/i.test(body)) {
        console.error(`[groq:${feature}] output budget exceeds the account's per-minute limit`);
        return {
          ok: false,
          reason:
            "This request asked for more output than the Groq plan allows per minute. Lower the feature's token budget, or upgrade the Groq tier.",
        };
      }
      if (res.status === 429) {
        return { ok: false, reason: "Groq is rate-limiting right now — try again in a moment." };
      }
      if (res.status === 401 || res.status === 403) {
        return { ok: false, reason: "That GROQ_API_KEY was rejected. Check the key and try again." };
      }
      return { ok: false, reason: "The AI service is temporarily unavailable — try again shortly." };
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return { ok: false, reason: "The AI returned an unexpected response." };
    }

    let candidate: unknown;
    try {
      candidate = extractJsonObject(content);
    } catch {
      console.error(`[groq:${feature}] non-JSON reply`, content.slice(0, 400));
      return { ok: false, reason: "The AI returned an unexpected response." };
    }

    const parsed = schema.safeParse(candidate);
    if (!parsed.success) {
      console.error(`[groq:${feature}] schema mismatch`, parsed.error.issues.slice(0, 3));
      return { ok: false, reason: "The AI returned an unexpected response." };
    }

    return { ok: true, result: parsed.data };
  } catch (error) {
    console.error(`[groq:${feature}] request failed`, error);
    return { ok: false, reason: "The AI service is temporarily unavailable — try again shortly." };
  }
}
