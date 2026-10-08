// Styling traits per accessory class — the attributes the pairing rules and the
// occasion filter reason over. Authored, not derived: "does this piece read as
// heavy" is a judgement, not something inferable from its name.
//
// `metal` uses the same vocabulary as COLOR_SWATCH in vault-data.ts so palettes
// and traits speak one language. "None" means the piece carries no dominant
// metal (leather, beads, shell, pearl, textile) and is therefore exempt from the
// metal-mixing rule.
//
// `formality` is a 1–5 dress-code scale: 1 = gym/street, 3 = smart casual,
// 5 = black tie / boardroom.

import { ACCESSORY_DEFINITIONS } from "./vault-data";
import { slotFor, type Slot } from "./accessory-category";

export type Metal = "Silver" | "Gold" | "Rose Gold" | "Gunmetal" | "Chrome" | "None";
export type Material = "metal" | "leather" | "bead" | "shell" | "pearl" | "textile";
export type Weight = "delicate" | "moderate" | "statement";
export type Formality = 1 | 2 | 3 | 4 | 5;

export type AccessoryTraits = {
  slot: Slot;
  metal: Metal;
  material: Material;
  weight: Weight;
  formality: Formality;
};

/** Authored traits, minus `slot` — which is derived from the piece's category. */
type AuthoredTraits = Omit<AccessoryTraits, "slot">;

const AUTHORED: Record<string, AuthoredTraits> = {
  "Cuban Chain": { metal: "Gold", material: "metal", weight: "statement", formality: 2 },
  "Sporty Watch": { metal: "Gunmetal", material: "metal", weight: "statement", formality: 1 },
  "Bracelet": { metal: "Silver", material: "metal", weight: "moderate", formality: 2 },
  "Chunky Ring": { metal: "Silver", material: "metal", weight: "statement", formality: 2 },
  "Sleek Watch": { metal: "Silver", material: "metal", weight: "delicate", formality: 4 },
  "Thin Chain": { metal: "Gold", material: "metal", weight: "delicate", formality: 3 },
  "Minimal Bracelet": { metal: "Silver", material: "metal", weight: "delicate", formality: 3 },
  "Dress Watch": { metal: "Silver", material: "metal", weight: "delicate", formality: 5 },
  "Signet Ring": { metal: "Gold", material: "metal", weight: "moderate", formality: 4 },
  "Thin Bracelet": { metal: "Gold", material: "metal", weight: "delicate", formality: 4 },
  "Minimal Watch": { metal: "Silver", material: "metal", weight: "delicate", formality: 4 },
  "Subtle Ring": { metal: "Silver", material: "metal", weight: "delicate", formality: 4 },
  "Leather Bracelet": { metal: "None", material: "leather", weight: "moderate", formality: 2 },
  "Cufflinks": { metal: "Silver", material: "metal", weight: "delicate", formality: 5 },
  "Elegant Ring": { metal: "Gold", material: "metal", weight: "delicate", formality: 5 },
  "Luxury Watch": { metal: "Gold", material: "metal", weight: "statement", formality: 5 },
  "Statement Ring": { metal: "Silver", material: "metal", weight: "statement", formality: 3 },
  "Thick Chain": { metal: "Silver", material: "metal", weight: "statement", formality: 1 },
  "Layered Ring": { metal: "Silver", material: "metal", weight: "moderate", formality: 2 },
  "Black Bracelet": { metal: "None", material: "bead", weight: "moderate", formality: 2 },
  "Simple Chain": { metal: "Silver", material: "metal", weight: "delicate", formality: 3 },
  "Casual Watch": { metal: "Silver", material: "metal", weight: "moderate", formality: 2 },
  "Clean Chain": { metal: "Silver", material: "metal", weight: "delicate", formality: 3 },
  "Minimal Ring": { metal: "Silver", material: "metal", weight: "delicate", formality: 3 },
  "Smartwatch": { metal: "Gunmetal", material: "metal", weight: "statement", formality: 2 },
  "Sporty Bracelet": { metal: "None", material: "textile", weight: "delicate", formality: 1 },
  "Field Watch": { metal: "Silver", material: "metal", weight: "moderate", formality: 2 },
  "Textured Ring": { metal: "Gunmetal", material: "metal", weight: "moderate", formality: 3 },
  "Retro Watch": { metal: "Gold", material: "metal", weight: "delicate", formality: 4 },
  "Classic Ring": { metal: "Silver", material: "metal", weight: "delicate", formality: 4 },
  "Rope Chain": { metal: "Gold", material: "metal", weight: "moderate", formality: 2 },
  "Tactical Watch": { metal: "Gunmetal", material: "metal", weight: "statement", formality: 1 },
  "Matte Chain": { metal: "Gunmetal", material: "metal", weight: "moderate", formality: 2 },
  "Utility Ring": { metal: "Gunmetal", material: "metal", weight: "moderate", formality: 2 },
  "Layered Chain": { metal: "Silver", material: "metal", weight: "statement", formality: 2 },
  "Distressed Bracelet": { metal: "None", material: "leather", weight: "moderate", formality: 1 },
  "Flashy Chain": { metal: "Chrome", material: "metal", weight: "statement", formality: 2 },
  "Statement Watch": { metal: "Silver", material: "metal", weight: "statement", formality: 4 },
  "Cross Pendant": { metal: "Silver", material: "metal", weight: "moderate", formality: 2 },
  "Dark Ring": { metal: "Gunmetal", material: "metal", weight: "moderate", formality: 2 },
  "Subtle Bracelet": { metal: "Silver", material: "metal", weight: "delicate", formality: 4 },
  "Clean Ring": { metal: "Silver", material: "metal", weight: "delicate", formality: 4 },
  "Bold Watch": { metal: "Gunmetal", material: "metal", weight: "statement", formality: 3 },
  "Elegant Bracelet": { metal: "Silver", material: "metal", weight: "moderate", formality: 4 },
  "Clean Bracelet": { metal: "Silver", material: "metal", weight: "delicate", formality: 3 },
  "Beaded Bracelet": { metal: "None", material: "bead", weight: "moderate", formality: 1 },
  "Shell Necklace": { metal: "None", material: "shell", weight: "moderate", formality: 1 },
  "Casual Ring": { metal: "Silver", material: "metal", weight: "delicate", formality: 2 },
  "Pearl Necklace": { metal: "None", material: "pearl", weight: "moderate", formality: 2 },
  "Stud Earring": { metal: "Silver", material: "metal", weight: "delicate", formality: 4 },
  "Hoop Earring": { metal: "Silver", material: "metal", weight: "moderate", formality: 2 },
  "Huggie Earring": { metal: "Gunmetal", material: "metal", weight: "delicate", formality: 2 },
  "Drop Earring": { metal: "Gold", material: "metal", weight: "statement", formality: 3 },
  "Cross Earring": { metal: "Silver", material: "metal", weight: "moderate", formality: 2 },
  "Pearl Earring": { metal: "Gold", material: "pearl", weight: "delicate", formality: 3 },
};

export const ACCESSORY_TRAITS: Record<string, AccessoryTraits> = Object.fromEntries(
  Object.entries(AUTHORED).map(([name, t]) => [name, { ...t, slot: slotFor(name) }]),
);

/**
 * Traits for a piece, with the same terminal-noun fallback as getAccessoryMeta —
 * so an unseen variant ("Minimalist Bracelet") still resolves to its family.
 */
export function getTraits(name: string): AccessoryTraits | undefined {
  if (ACCESSORY_TRAITS[name]) return ACCESSORY_TRAITS[name];
  const last = name.toLowerCase().split(" ").pop();
  const key = Object.keys(ACCESSORY_TRAITS).find(
    (k) => k.toLowerCase().split(" ").pop() === last,
  );
  return key ? ACCESSORY_TRAITS[key] : undefined;
}

// Dev-only drift guard: the traits table is hand-authored against the catalog,
// so a new accessory added to ACCESSORY_DEFINITIONS must not silently arrive
// here with no traits — it would drop out of every pairing rule unnoticed.
if (import.meta.env.DEV) {
  const missing = Object.keys(ACCESSORY_DEFINITIONS).filter((k) => !ACCESSORY_TRAITS[k]);
  const orphaned = Object.keys(ACCESSORY_TRAITS).filter((k) => !ACCESSORY_DEFINITIONS[k]);
  if (missing.length) console.warn("[traits] accessories with no traits:", missing);
  if (orphaned.length) console.warn("[traits] traits with no accessory:", orphaned);
}

/** Cool vs warm metal families — the basis of the metal-mixing rule. */
export const METAL_FAMILY: Record<Metal, "cool" | "warm" | "neutral"> = {
  Silver: "cool",
  Gunmetal: "cool",
  Chrome: "cool",
  Gold: "warm",
  "Rose Gold": "warm",
  None: "neutral",
};

export const FORMALITY_LABEL: Record<Formality, string> = {
  1: "Street / athletic",
  2: "Casual",
  3: "Smart casual",
  4: "Formal",
  5: "Black tie / boardroom",
};
