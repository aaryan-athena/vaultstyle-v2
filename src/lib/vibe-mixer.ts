// Blends 2–3 existing vibes into one custom, shoppable edit — reuses the
// same accessory + clothing data, just recombines it.

import { VIBES, type VibeEntry } from "./vault-data";
import { getVibeClothing, type ClothingItem } from "./clothing-data";

export type BlendedVibe = {
  vibe: string;
  outfitLabel: string;
  definition: string;
  colors: string[];
  mostValuable: string[];
  recommended: string[];
  addOns: string[];
  clothing: ClothingItem[];
  sourceVibes: string[];
};

export const MAX_MIX = 3;
export const MIN_MIX = 2;

const dedupeStrings = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((i) => {
    const key = i.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export function blendVibes(names: string[]): BlendedVibe | null {
  const entries = names
    .map((n) => VIBES.find((v) => v.vibe === n))
    .filter((v): v is VibeEntry => Boolean(v));
  if (entries.length < MIN_MIX) return null;

  const outfitTypes = new Set(entries.map((e) => e.outfitType));
  const outfitLabel = outfitTypes.size === 1 ? entries[0].outfitType : [...outfitTypes].join(" + ");

  const colors = dedupeStrings(entries.flatMap((e) => e.colors)).slice(0, 5);

  // Hero piece from each source vibe first, so every blended vibe stays represented up top.
  const mostValuable = dedupeStrings(entries.map((e) => e.mostValuable[0]).filter(Boolean));
  const heroKeys = new Set(mostValuable.map((x) => x.toLowerCase()));

  const recommended = dedupeStrings(entries.flatMap((e) => [...e.mostValuable.slice(1), ...e.recommended]))
    .filter((x) => !heroKeys.has(x.toLowerCase()))
    .slice(0, 6);
  const recKeys = new Set([...heroKeys, ...recommended.map((x) => x.toLowerCase())]);

  const addOns = dedupeStrings(entries.flatMap((e) => e.addOns))
    .filter((x) => !recKeys.has(x.toLowerCase()))
    .slice(0, 6);

  const clothing: ClothingItem[] = [];
  const seenClothing = new Set<string>();
  for (const e of entries) {
    for (const c of getVibeClothing(e.vibe)) {
      const key = c.item.toLowerCase();
      if (seenClothing.has(key)) continue;
      seenClothing.add(key);
      clothing.push(c);
    }
  }

  const definition = entries.map((e) => `${e.vibe} — ${e.definition.split(".")[0]}.`).join(" ");

  return {
    vibe: entries.map((e) => e.vibe).join(" × "),
    outfitLabel,
    definition,
    colors,
    mostValuable,
    recommended,
    addOns,
    clothing,
    sourceVibes: entries.map((e) => e.vibe),
  };
}
