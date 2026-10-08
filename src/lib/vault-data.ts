export type VibeEntry = {
  outfitType: "Casual" | "Formal";
  vibe: string;
  definition: string;
  colors: string[];
  recommended: string[];
  mostValuable: string[];
  addOns: string[];
};

const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

const raw: Array<[VibeEntry["outfitType"], string, string, string, string, string, string]> = [
  ["Casual", "Streetwear", "Trendy urban style focused on oversized fits, cargos, sneakers, hoodies, and bold accessories.", "Silver, Black", "Bracelet, chunky ring", "Cuban chain, sporty watch", "Layered chain, statement watch, hoop earring"],
  ["Casual", "Minimal", "Clean, simple outfits with neutral colors, few patterns, and subtle accessories.", "Matte Black, Silver", "Minimal bracelet, minimal ring", "Sleek watch, thin chain", "Clean bracelet, stud earring"],
  ["Formal", "Old Money", "Quiet luxury aesthetic with linen shirts, loafers, neutral tones, and elegant styling.", "Gold", "Thin bracelet, elegant ring", "Dress watch, signet ring", "Cufflinks, stud earring"],
  ["Formal", "Smart Casual", "Mix of formal and casual pieces like polos, trousers, clean sneakers, or loafers.", "Silver, Gold", "Subtle ring, leather bracelet", "Minimal watch", "Clean chain"],
  ["Formal", "Formal", "Professional or elegant dressing with suits, dress shirts, formal shoes, and refined accessories.", "Silver, Gold", "Cufflinks, elegant ring", "Dress watch", "Signet ring, thin bracelet"],
  ["Formal", "Luxury", "High-end, statement-focused styling using premium fabrics, designer silhouettes, and bold jewellery.", "Gold, Rose Gold", "Statement ring, elegant bracelet", "Luxury watch, Cuban chain", "Cufflinks, signet ring, drop earring"],
  ["Casual", "Edgy", "Darker, more aggressive aesthetic using black fits, layered accessories, boots, and statement pieces.", "Black, Silver", "Layered ring, black bracelet", "Thick chain", "Dark ring, cross earring"],
  ["Casual", "Casual", "Relaxed everyday wear like tees, jeans, sneakers, and light accessories.", "Silver", "Casual watch, leather bracelet", "Simple chain", "Casual ring"],
  ["Casual", "Monochrome", "Outfit built mainly around one color family (usually black, white, grey, beige).", "Silver, Matte Black", "Clean chain, minimal ring", "Sleek watch", "Clean bracelet, huggie earring"],
  ["Casual", "Sporty", "Athletic-inspired clothing such as joggers, jerseys, hoodies, and sneakers.", "Black, Silver", "Sporty bracelet, simple chain", "Smartwatch", "Casual watch"],
  ["Casual", "Rugged", "Masculine outdoor-inspired style using leather, boots, flannels, darker tones, and raw textures.", "Brown, Black, Silver", "Leather bracelet, textured ring", "Field watch", "Black bracelet"],
  ["Casual", "Vintage", "Retro-inspired fashion influenced by older decades, often including washed colors and classic cuts.", "Gold, Silver", "Classic ring, rope chain", "Retro watch", "Signet ring, stud earring"],
  ["Casual", "Techwear", "Futuristic utility-focused style with tactical clothing, layered black/grey outfits, and functional accessories.", "Black, Gunmetal", "Matte chain, utility ring", "Tactical watch", "Smartwatch, black bracelet, huggie earring"],
  ["Casual", "Grunge", "Messy layered aesthetic with oversized flannels, ripped jeans, darker tones, and rebellious styling.", "Silver, Black", "Chunky ring, distressed bracelet", "Layered chain", "Dark ring, hoop earring"],
  ["Formal", "Preppy", "Clean academic-inspired style using polos, sweaters, chinos, loafers, and structured fits.", "Gold, Silver", "Thin bracelet, elegant ring", "Dress watch", "Signet ring"],
  ["Casual", "Y2K", "Early-2000s inspired fashion with baggy silhouettes, flashy accessories, graphic elements, and bold styling.", "Silver, Chrome", "Chunky ring, statement watch", "Flashy chain", "Sporty watch, hoop earring"],
  ["Casual", "Goth", "Dark dramatic aesthetic using black clothing, silver jewellery, boots, and layered accessories.", "Silver, Black", "Layered chain, dark ring", "Cross pendant", "Black bracelet, cross earring"],
  ["Formal", "Business Casual", "Office-friendly outfits that are less formal than suits, often combining shirts, trousers, and clean shoes.", "Silver", "Subtle bracelet, clean ring", "Minimal watch", "Clean chain"],
  ["Casual", "Partywear", "Attention-grabbing outfits designed for nightlife/events, often involving layered accessories and stronger contrasts.", "Gold, Silver", "Statement ring, flashy chain", "Bold watch, layered chain", "Cuban chain, drop earring"],
  ["Formal", "Summer Linen", "Light breathable outfits with linen shirts, relaxed trousers, loafers, and warm neutral colors.", "Gold", "Elegant bracelet, casual ring", "Dress watch, thin chain", "Signet ring"],
  ["Formal", "Clean Fit", "Extremely polished and balanced outfits with coordinated colors, fitted silhouettes, and minimal clutter.", "Silver, Matte Black", "Thin chain, clean bracelet", "Minimal watch", "Minimal ring"],
  ["Casual", "Beachwear", "Relaxed vacation-style outfits designed for hot weather, typically including open shirts, linen pieces, shorts, slippers, and light breathable fabrics.", "Silver, White, Pearl, Light Gold", "Shell necklace, casual ring", "Beaded bracelet, thin chain", "Pearl necklace, minimal bracelet, pearl earring"],
];

export const VIBES: VibeEntry[] = raw.map(([outfitType, vibe, definition, colors, recommended, mostValuable, addOns]) => ({
  outfitType,
  vibe,
  definition,
  colors: split(colors),
  recommended: split(recommended),
  mostValuable: split(mostValuable),
  addOns: split(addOns),
}));

const COLOR_SWATCH: Record<string, string> = {
  Silver: "#c7ccd1",
  Black: "#0a0a0a",
  Gold: "#c9a84c",
  "Rose Gold": "#b76e79",
  "Matte Black": "#1c1c1c",
  Brown: "#5a3a22",
  Gunmetal: "#2a3439",
  Chrome: "#dbe2e9",
  White: "#f5f1ea",
  Pearl: "#eae3d2",
  "Light Gold": "#e6cf95",
};

export const colorToHex = (c: string) => COLOR_SWATCH[c] ?? "#9aa0a6";

// ── Accessory definitions ────────────────────────────────────────────────
export const ACCESSORY_DEFINITIONS: Record<string, string> = {
  "Cuban Chain": "A thick interlocking metal chain that serves as a bold statement piece and enhances the urban aesthetic.",
  "Sporty Watch": "A durable, casual watch with a larger design that complements sneakers and relaxed outfits.",
  "Bracelet": "A wrist accessory that adds texture and layering without overwhelming the outfit.",
  "Chunky Ring": "A thick, attention-grabbing ring that reinforces the bold and confident nature of streetwear.",
  "Sleek Watch": "A clean, slim watch with minimal detailing that maintains a refined appearance.",
  "Thin Chain": "A lightweight necklace that adds subtle detail while remaining understated.",
  "Minimal Bracelet": "A simple bracelet designed to complement rather than dominate the outfit.",
  "Dress Watch": "An elegant, slim watch intended for sophisticated and refined outfits.",
  "Signet Ring": "A classic ring with a flat face traditionally associated with heritage and prestige.",
  "Thin Bracelet": "A discreet bracelet that adds elegance without drawing attention.",
  "Minimal Watch": "A versatile watch suitable for both professional and relaxed settings.",
  "Subtle Ring": "A simple ring that adds sophistication without appearing flashy.",
  "Leather Bracelet": "A bracelet made from leather that introduces personality while remaining mature.",
  "Cufflinks": "Decorative fasteners used on dress shirts as a mark of refinement.",
  "Elegant Ring": "A refined ring with a clean design suitable for professional settings.",
  "Luxury Watch": "A premium watch that functions as a high-status statement piece.",
  "Statement Ring": "A ring intentionally designed to stand out and attract attention.",
  "Thick Chain": "A heavier chain that creates a bold and rebellious appearance.",
  "Layered Ring": "Multiple rings worn together to add visual complexity and attitude.",
  "Black Bracelet": "A dark-toned bracelet that strengthens the alternative aesthetic.",
  "Simple Chain": "A clean, everyday necklace that adds style without making the outfit feel overdressed.",
  "Casual Watch": "A versatile watch designed for regular daily wear.",
  "Clean Chain": "A simple chain with minimal detailing that maintains visual consistency.",
  "Minimal Ring": "A subtle ring that adds depth without disrupting the outfit's simplicity.",
  "Smartwatch": "A digital watch featuring fitness and activity-tracking functions that align with athletic styling.",
  "Sporty Bracelet": "A lightweight bracelet designed to complement activewear and casual outfits.",
  "Field Watch": "A durable military-inspired watch built for practicality and outdoor aesthetics.",
  "Textured Ring": "A ring featuring patterns or rugged detailing that adds character and depth.",
  "Retro Watch": "A watch inspired by older designs that evokes a timeless and nostalgic feel.",
  "Classic Ring": "A traditionally styled ring that complements heritage-inspired outfits.",
  "Rope Chain": "A twisted chain that offers a timeless appearance often associated with vintage styling.",
  "Tactical Watch": "A utility-focused watch with a functional and futuristic appearance.",
  "Matte Chain": "A non-reflective chain that complements sleek and technical outfits.",
  "Utility Ring": "A minimalist ring designed to match the practical and futuristic nature of techwear.",
  "Layered Chain": "Multiple chains worn together to create depth, drama, or a deliberately rebellious feel.",
  "Distressed Bracelet": "A bracelet with a worn or rugged appearance that complements grunge styling.",
  "Flashy Chain": "A bold chain designed to stand out and capture the maximalist spirit of early-2000s fashion.",
  "Statement Watch": "A large or visually striking watch that acts as a centerpiece accessory.",
  "Cross Pendant": "A necklace featuring a cross-shaped pendant commonly associated with gothic fashion.",
  "Dark Ring": "Rings with blackened or darker finishes that reinforce a mysterious aesthetic.",
  "Subtle Bracelet": "A simple bracelet that adds personality while maintaining professionalism.",
  "Clean Ring": "A refined ring with minimal detailing that complements workplace attire.",
  "Bold Watch": "A visually striking watch designed to attract attention in social settings.",
  "Elegant Bracelet": "A refined bracelet that enhances relaxed luxury styling.",
  "Clean Bracelet": "A minimal bracelet designed to complement rather than dominate the outfit.",
  "Beaded Bracelet": "A bracelet made from decorative beads that reflects a laid-back coastal vibe.",
  "Shell Necklace": "A necklace featuring natural shells commonly associated with beach and tropical fashion.",
  "Casual Ring": "Simple rings that add style without appearing overly formal.",
  "Pearl Necklace": "A necklace strung with pearls — light, summery, and tonally warm.",
  "Stud Earring": "A small fixed earring that sits flush to the lobe — the most understated way to wear metal on the face.",
  "Hoop Earring": "A circular earring that frames the jaw and adds movement, reading bolder the wider it gets.",
  "Huggie Earring": "A thick, small hoop that hugs the lobe closely — present without ever catching the eye first.",
  "Drop Earring": "An earring that hangs below the lobe, adding vertical length and a deliberate sense of occasion.",
  "Cross Earring": "A cross-shaped drop earring that carries the same symbolism as the pendant, worn higher.",
  "Pearl Earring": "A pearl set on a stud or short hook — soft, warm-toned, and quietly unexpected on men.",
};

// Normalize "Cuban chains" / "chunky rings" / "shell/pearl necklaces" → canonical keys.
const stripPlural = (w: string) => {
  if (/(ches|shes|sses)$/i.test(w)) return w.slice(0, -2);
  if (/ies$/i.test(w)) return w.slice(0, -3) + "y";
  if (/s$/i.test(w) && !/ss$/i.test(w)) return w.slice(0, -1);
  return w;
};

const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());

export function lookupAccessoryDefinition(label: string): { name: string; definition: string } {
  // handle "shell/pearl necklaces" by taking first slash-segment
  const cleaned = label.split("/")[0].trim();
  const words = cleaned.split(/\s+/).map(stripPlural);
  const key = titleCase(words.join(" "));
  if (ACCESSORY_DEFINITIONS[key]) return { name: key, definition: ACCESSORY_DEFINITIONS[key] };
  // try last-word swap (e.g. "Minimalist Bracelet")
  const fallback = Object.keys(ACCESSORY_DEFINITIONS).find(
    (k) => k.toLowerCase().split(" ").pop() === words[words.length - 1].toLowerCase()
  );
  if (fallback) return { name: key, definition: ACCESSORY_DEFINITIONS[fallback] };
  return { name: titleCase(cleaned), definition: "" };
}

export const vibeSlug = (vibe: string) =>
  vibe.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Map a loosely-worded vibe name onto a real catalog vibe, or null.
 *
 * Models asked to "pick from this list" reliably return near-misses —
 * "Minimalist" for Minimal, "Old Money Aesthetic" for Old Money — and dropping
 * those throws away an otherwise correct answer. This resolves the obvious
 * cases and refuses the rest, so nothing invented reaches the UI as a link.
 */
export function resolveVibeName(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  const exact = VIBES.find((v) => v.vibe === raw);
  if (exact) return exact.vibe;

  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const k = key(raw);

  const ci = VIBES.find((v) => key(v.vibe) === k);
  if (ci) return ci.vibe;

  // Trailing filler: "Old Money Aesthetic", "Streetwear Style", "Minimal Look".
  const stripped = key(raw.replace(/\b(aesthetic|vibe|style|look|inspired|core)\b/gi, ""));
  const trimmed = VIBES.find((v) => key(v.vibe) === stripped);
  if (trimmed) return trimmed.vibe;

  // Adjectival forms: "Minimalist" → "Minimal". Only accept when the catalog
  // name is a prefix of what came back, to avoid matching on a shared word.
  const prefixed = VIBES.filter((v) => k.startsWith(key(v.vibe)) || stripped.startsWith(key(v.vibe)));
  if (prefixed.length === 1) return prefixed[0].vibe;

  return null;
}

/** Resolve a model's vibe list to real catalog names, de-duplicated, in order. */
export function resolveVibeNames(inputs: string[], limit = 3): string[] {
  const out: string[] = [];
  for (const input of inputs) {
    const name = resolveVibeName(input);
    if (name && !out.includes(name)) out.push(name);
    if (out.length >= limit) break;
  }
  return out;
}

// Reverse lookup: canonical accessory name → every vibe that recommends it
// (as a hero piece, in the main edit, or as an add-on).
const ACCESSORY_TO_VIBES: Record<string, string[]> = (() => {
  const map: Record<string, Set<string>> = {};
  for (const v of VIBES) {
    const pieces = [...v.mostValuable, ...v.recommended, ...v.addOns];
    for (const p of pieces) {
      const { name } = lookupAccessoryDefinition(p);
      (map[name] ??= new Set()).add(v.vibe);
    }
  }
  const out: Record<string, string[]> = {};
  for (const [name, set] of Object.entries(map)) out[name] = [...set];
  return out;
})();

export const getVibesForAccessory = (name: string): string[] => ACCESSORY_TO_VIBES[name] ?? [];
