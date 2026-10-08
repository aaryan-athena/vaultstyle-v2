import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { VIBES, resolveVibeNames } from "../vault-data";
import { callGroqJson, VISION_MODEL_DEFAULT } from "./groq-client.server";

// Read a wishlist screenshot and infer taste from it.
//
// WHY A SCREENSHOT AND NOT A URL
// A pasted Amazon/Flipkart wishlist link would have to be fetched and scraped,
// which their terms don't allow and their bot defences would block anyway. A
// screenshot the user chose to upload sidesteps both: it's their data, handed
// over deliberately, and one vision call reads it.
//
// WHAT THE MODEL IS AND ISN'T TRUSTED WITH
// It reads the image and picks vibes from our fixed catalog. It does not choose
// accessories — those resolve from the matched vibes through the same engine
// the rest of the app uses, so a misread can never invent a piece or a maker.
// Vibe names are filtered against the catalog before they leave this function.
//
// The image is held in memory for the length of the request and never written
// anywhere. Nothing about it is logged.

const MAX_DATA_URL_CHARS = 6_000_000; // ~4.4MB of image after base64 overhead

/**
 * Caps here are generous on purpose, and the trimming happens after parsing.
 *
 * The model does not treat "max 3 vibes" as a hard bound — a live run returned
 * four, which a strict `.max(3)` would have rejected outright, losing a
 * perfectly good read over one extra array entry. Be liberal in what's
 * accepted, strict in what's rendered.
 */
const WishlistRead = z.object({
  items: z.array(z.string().max(160)).max(40),
  styleSignals: z.array(z.string().max(60)).max(20),
  matchedVibes: z.array(z.string()).max(20),
  note: z.string().min(1).max(900),
  readable: z.boolean(),
});

const MAX_ITEMS_SHOWN = 12;
const MAX_SIGNALS_SHOWN = 5;

export type WishlistReadResult = {
  items: string[];
  styleSignals: string[];
  matchedVibes: string[];
  note: string;
};

export type WishlistResponse =
  | { ok: true; result: WishlistReadResult }
  | { ok: false; reason: string };

const VIBE_CATALOG = VIBES.map((v) => `- ${v.vibe}: ${v.definition}`).join("\n");

const SYSTEM_PROMPT = `You read shopping wishlist screenshots (Amazon, Flipkart, Myntra or similar) for The Vault, a men's accessories guide.

Your job: work out what this person's clothing taste is from what's in their wishlist, then match it to vibes from this fixed list. Never invent a vibe name outside it.

${VIBE_CATALOG}

Rules:
- "items" = the product names you can actually read in the image, cleaned up to short labels. If you cannot read a product clearly, leave it out rather than guessing.
- "readable" = false if the image is not a shopping wishlist or nothing legible can be extracted. In that case return empty arrays and explain in "note".
- "styleSignals" = 2-4 short adjectives for the taste you infer (e.g. "oversized", "monochrome", "techy", "classic").
- "matchedVibes" = 1-3 vibe names from the list above, best match first.
- "note" = 2-3 sentences on what their wishlist says about how they dress, and therefore what kind of accessories will actually sit with it. Do not name specific jewellery pieces or brands — that is decided elsewhere.
- Never mention prices.

Respond ONLY with a JSON object:
{ "items": string[], "styleSignals": string[], "matchedVibes": string[], "note": string, "readable": boolean }`;

export const readWishlist = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      /** A data: URL for the screenshot, downscaled client-side before upload. */
      image: z
        .string()
        .max(MAX_DATA_URL_CHARS, "That image is too large — try a smaller screenshot.")
        .refine(
          (v) => /^data:image\/(png|jpeg|jpg|webp);base64,/.test(v),
          "That doesn't look like a PNG, JPEG or WebP image.",
        ),
    }),
  )
  .handler(async ({ data }): Promise<WishlistResponse> => {
    const res = await callGroqJson({
      feature: "wishlist",
      schema: WishlistRead,
      model: process.env.GROQ_VISION_MODEL || VISION_MODEL_DEFAULT,
      temperature: 0.3,
      // Kept under the on-demand tier's 1000 output-tokens-per-minute ceiling.
      // Asking for more makes Groq reject the request before running it.
      maxTokens: 900,
      // With thinking off this model emits compact JSON — 247 output tokens for
      // a 9-item wishlist, against 1064 with thinking on — which both fits the
      // budget above and lets strict JSON mode work.
      reasoningEffort: "none",
      jsonMode: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Read this wishlist and match it to vibes from the list." },
            { type: "image_url", image_url: { url: data.image } },
          ],
        },
      ],
    });

    if (!res.ok) return res;

    const { readable, items, styleSignals, note } = res.result;
    if (!readable) {
      return {
        ok: false,
        reason:
          note ||
          "Couldn't read a wishlist in that image. A screenshot showing product names works best.",
      };
    }

    // Resolve rather than reject: the model returns near-misses like
    // "Minimalist" or "Old Money Aesthetic", and those are good reads that a
    // strict set-membership check would have thrown away. Anything that can't
    // be resolved to a real catalog vibe is still dropped.
    const matchedVibes = resolveVibeNames(res.result.matchedVibes, 3);
    if (matchedVibes.length === 0) {
      return {
        ok: false,
        reason: "Read the wishlist, but couldn't match it to a vibe confidently — try another screenshot.",
      };
    }

    return {
      ok: true,
      result: {
        items: items.slice(0, MAX_ITEMS_SHOWN),
        styleSignals: styleSignals.slice(0, MAX_SIGNALS_SHOWN),
        matchedVibes,
        note,
      },
    };
  });
