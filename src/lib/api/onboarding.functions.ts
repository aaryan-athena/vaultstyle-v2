import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGroqJson } from "./groq-client.server";

// The covering note for an intake brief.
//
// Deliberately narrow: the pieces were already chosen deterministically in
// lib/intake-brief.ts, and this call only writes the paragraph around them. The
// model is handed the decision and asked to explain it — it is not asked to
// make it. That keeps recommendations reproducible, keeps invented piece names
// out of the UI, and means a failed call costs the user a paragraph rather than
// the whole answer.

// Bounds are loose and trimmed after parsing: a model that runs six words over
// a stated limit has still done the job, and rejecting it would drop the whole
// note over a formatting quibble.
const IntakeNote = z.object({
  headline: z.string().min(1).max(300),
  note: z.string().min(1).max(2000),
  /** One thing to avoid, stated as a rule they can carry forward. */
  watchOut: z.string().min(1).max(800),
});

const trim = (s: string, max: number) =>
  s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;

export type IntakeNoteResult = z.infer<typeof IntakeNote>;

export type IntakeNoteResponse =
  | { ok: true; result: IntakeNoteResult }
  | { ok: false; reason: string };

const SYSTEM_PROMPT = `You write for The Vault, a men's accessories guide that points at small independent Indian jewellery labels rather than marketplace brands.

You are given a styling brief that has ALREADY been decided: an occasion, a lead piece, some alternates, and the constraint behind them. Your job is to explain that brief in plain, confident prose — not to change it.

Hard rules:
- Never name a piece, brand, metal or occasion that isn't in the brief you were given.
- Never invent prices.
- Address the reader as "you". No greetings, no sign-off, no emoji.
- Teach the rule, not just the pick: the reader should be able to apply it next time without the app.

Respond ONLY with a JSON object:
{
  "headline": string (under 10 words, names the look — not a sentence),
  "note": string (2-4 sentences: why the lead piece is right for this occasion and this wearer, and how to wear it),
  "watchOut": string (one sentence: the mistake most people make here)
}`;

export const intakeNote = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      occasion: z.string().min(1).max(80),
      constraint: z.string().min(1).max(400),
      lead: z.string().min(1).max(80),
      leadWhy: z.string().max(300).optional(),
      alternates: z.array(z.string().max(80)).max(8),
      palette: z.array(z.string().max(40)).max(6),
      ruledOut: z.array(z.string().max(80)).max(6),
    }),
  )
  .handler(async ({ data }): Promise<IntakeNoteResponse> => {
    const brief = [
      `Occasion: ${data.occasion}`,
      `Wearer and dress-code constraint: ${data.constraint}`,
      `Lead piece: ${data.lead}${data.leadWhy ? ` (${data.leadWhy})` : ""}`,
      data.alternates.length ? `Alternates: ${data.alternates.join(", ")}` : null,
      data.palette.length ? `Metals/palette: ${data.palette.join(", ")}` : null,
      data.ruledOut.length ? `Ruled out for this occasion: ${data.ruledOut.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await callGroqJson({
      feature: "intake-note",
      schema: IntakeNote,
      temperature: 0.5,
      maxTokens: 600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: brief },
      ],
    });

    if (!res.ok) return res;

    return {
      ok: true,
      result: {
        headline: trim(res.result.headline, 80),
        note: trim(res.result.note, 600),
        watchOut: trim(res.result.watchOut, 240),
      },
    };
  });
