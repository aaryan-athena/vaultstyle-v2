import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { VIBES } from "../vault-data";

// Server-only: talks to Groq's OpenAI-compatible chat completions API to
// handle free-text vibe queries that don't map cleanly onto one of the 22
// catalog vibes ("something for a rooftop party in Dubai, feels expensive").
// The model is constrained to only ever choose from our real vibe catalog —
// we filter its picks against VALID_VIBE_NAMES before returning, so a
// hallucinated name can never reach the UI as a clickable link.

const GROQ_MODEL_DEFAULT = "llama-3.3-70b-versatile";

// Bounds are deliberately loose. The model treats "1-3 vibes" as guidance, not
// a contract — a live run returned four — and a strict cap would throw away an
// otherwise good answer over one extra array entry. Trimming happens below.
const AiSearchResult = z.object({
  matchedVibes: z.array(z.string()).max(20),
  customVibeName: z.string().min(1).max(200),
  styleNote: z.string().min(1).max(1500),
  suggestedColors: z.array(z.string()).max(20),
  confidence: z.enum(["high", "medium", "low"]),
});

export type AiVibeSearchResult = z.infer<typeof AiSearchResult>;

export type AiVibeSearchResponse =
  | { ok: true; result: AiVibeSearchResult }
  | { ok: false; reason: string };

const VIBE_CATALOG = VIBES.map(
  (v) => `- ${v.vibe} (${v.outfitType}): ${v.definition} Colors: ${v.colors.join(", ")}.`,
).join("\n");

const VALID_VIBE_NAMES = new Set(VIBES.map((v) => v.vibe));

const SYSTEM_PROMPT = `You are the style engine for The Vault, a men's accessories platform. You have exactly these 22 vibes to choose from — never invent a name outside this list for "matchedVibes":
${VIBE_CATALOG}

Given a free-text description of an outfit, mood, or occasion, respond ONLY with a JSON object matching this shape:
{
  "matchedVibes": string[] (1-3 names from the list above, best matches first),
  "customVibeName": string (a short, punchy name for this exact look — reuse a matched vibe's name if it's an exact fit, or coin a new blended name like "Rugged Old Money"),
  "styleNote": string (2-3 sentences, specific and useful — describe how to style this look and why the matched vibes fit),
  "suggestedColors": string[] (2-4 metal/jewellery colors that suit this look, e.g. Gold, Silver, Rose Gold, Black, Matte Black, Gunmetal, Brown, Chrome, White, Pearl),
  "confidence": "high" | "medium" | "low"
}
Respond with nothing except that JSON object.`;

export const aiVibeSearch = createServerFn({ method: "POST" })
  .inputValidator(z.object({ query: z.string().min(2).max(300) }))
  .handler(async ({ data }): Promise<AiVibeSearchResponse> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { ok: false, reason: "AI search isn't configured yet — add a GROQ_API_KEY to enable it." };
    }

    const model = process.env.GROQ_MODEL || GROQ_MODEL_DEFAULT;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 500,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: data.query },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("Groq API error", res.status, body);
        return { ok: false, reason: "AI search is temporarily unavailable — try again shortly." };
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        return { ok: false, reason: "AI search returned an unexpected response." };
      }

      let candidate: unknown;
      try {
        candidate = JSON.parse(content);
      } catch {
        return { ok: false, reason: "AI search returned an unexpected response." };
      }

      const parsed = AiSearchResult.safeParse(candidate);
      if (!parsed.success) {
        return { ok: false, reason: "AI search returned an unexpected response." };
      }

      const matchedVibes = parsed.data.matchedVibes.filter((v) => VALID_VIBE_NAMES.has(v)).slice(0, 3);
      if (matchedVibes.length === 0) {
        return { ok: false, reason: "AI couldn't confidently match a vibe — try rephrasing." };
      }

      // Trim on the way out, now that a loose schema lets long replies through.
      return {
        ok: true,
        result: {
          ...parsed.data,
          matchedVibes,
          customVibeName: parsed.data.customVibeName.slice(0, 60),
          styleNote: parsed.data.styleNote.slice(0, 600),
          suggestedColors: parsed.data.suggestedColors.slice(0, 5),
        },
      };
    } catch (error) {
      console.error("Groq request failed", error);
      return { ok: false, reason: "AI search is temporarily unavailable — try again shortly." };
    }
  });
